import JSZip from 'jszip'
import { selectAllParentDialogues } from '../state/selectors'
import { RootState } from '../state/store'
import { NovelCharacterOutfit } from '../state/versioning'
import { fillTextTemplate } from './prompts/strategies'

const assert = console.assert

// sanitaze name, remove special characters, spaces and make it lowercase
const sanitizeName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}

const clearProjectUrl = 'https://assets.miku.gg/RenPyExport.zip'

function removeFileExtension(filename: string): string {
  return filename.replace(/\.(png|jpeg)$/i, '')
}

const sanitizeId = (inputString: string): string => {
  return inputString.includes('-')
    ? inputString.replace(/-/g, '_')
    : inputString
}

function getSlicedStrings(str: string): string[] {
  const slices: string[] = []
  let startIndex = 0
  let endIndex = 0
  const formattedText = str.replace(/\n/g, ' ')

  while (startIndex < formattedText.length) {
    const nextAsteriskIndex = formattedText.indexOf('*', startIndex)
    const nextQuoteIndex = formattedText.indexOf('"', startIndex)

    // Check if a quote or asterisk was found
    if (nextAsteriskIndex === -1 && nextQuoteIndex === -1) {
      // If neither was found, add the remaining text and break
      const remainingText = formattedText.slice(startIndex)
      addTextToSlices(remainingText, slices)
      break
    }

    // Find the nearest delimiter (quote or asterisk)
    const nearestDelimiterIndex = Math.min(
      nextAsteriskIndex !== -1 ? nextAsteriskIndex : Infinity,
      nextQuoteIndex !== -1 ? nextQuoteIndex : Infinity
    )

    if (nearestDelimiterIndex > startIndex) {
      // Add the text before the delimiter
      const textBeforeDelimiter = formattedText
        .slice(startIndex, nearestDelimiterIndex)
        .trim()
      if (textBeforeDelimiter.length > 0) {
        addTextToSlices(textBeforeDelimiter, slices)
      }
    }

    // If the nearest delimiter is an asterisk
    if (nearestDelimiterIndex === nextAsteriskIndex) {
      endIndex = formattedText.indexOf('*', nearestDelimiterIndex + 1)
      if (endIndex === -1) {
        endIndex = formattedText.length
      } else {
        endIndex += 1
      }
      slices.push(formattedText.slice(nearestDelimiterIndex, endIndex))
      startIndex = endIndex
    } else {
      // If the nearest delimiter is a quote
      endIndex = formattedText.indexOf('"', nearestDelimiterIndex + 1)
      if (endIndex === -1) {
        endIndex = formattedText.length
      }
      slices.push(formattedText.slice(nearestDelimiterIndex + 1, endIndex))
      startIndex = endIndex + 1
    }
  }

  // Split slices longer than 50 words into two parts
  return slices.flatMap((slice) => {
    const words = slice.split(' ')
    if (words.length >= 40) {
      const midIndex = Math.ceil(words.length / 2)
      return [
        words.slice(0, midIndex).join(' '),
        words.slice(midIndex).join(' '),
      ]
    }
    return [slice]
  })
}

function addTextToSlices(text: string, slices: string[]) {
  const words = text.split(' ')
  if (words.length > 30) {
    for (let i = 0; i < words.length; i += 30) {
      slices.push(words.slice(i, i + 30).join(' '))
    }
  } else {
    slices.push(text)
  }
}

export const exportToRenPy = (state: RootState) => {
  let script = ''
  script += `define m = Character("${state.settings.user.name}")\n`
  // define all characters
  script += state.novel.characters
    .map((character) => {
      return `define ${sanitizeName(character.name)} = Character("${
        character.name
      }")`
    })
    .join('\n')

  // get all history and separate it in scenes
  const history = selectAllParentDialogues(state).reverse()
  const allInteractions = state.narration.interactions
  const allResponses = state.narration.responses

  const getSceneData = (sceneId: string) => {
    const scene = state.novel.scenes.find((scene) => scene.id === sceneId)
    assert(scene, `Scene ${scene} not found`)
    const background = state.novel.backgrounds.find(
      (background) => background.id === scene?.backgroundId
    )
    assert(background, 'Background not found')
    // eslint-disable-next-line
    // @ts-ignore
    const characters: {
      id: string
      name: string
      slug: string
      outfitSlug: string
      outfit: NovelCharacterOutfit
    }[] = scene?.characters.map((character) => {
      const characterData = state.novel.characters.find(
        (char) => char.id === character.characterId
      )
      assert(characterData, 'Character not found')
      const outfit = characterData?.card.data.extensions.mikugg_v2.outfits.find(
        (outfit) => outfit.id === character.outfit
      )
      assert(outfit, 'Outfit not found')
      return {
        id: character.characterId,
        name: characterData?.name,
        slug: sanitizeName(characterData?.name || ''),
        outfitSlug: sanitizeName(outfit?.name || ''),
        outfit,
      }
    })

    return {
      background: background?.id,
      characters,
      music: scene?.musicId,
    }
  }

  assert(history[0].type === 'response', 'First dialogue should be a response')
  let currentSceneId =
    state.novel.starts.find((start) => start.id === history[0].item.id)
      ?.sceneId || 'INVALID_SCENE_ID'
  let currentScene = getSceneData(currentSceneId)
  let currentBackgroundSrc = state.novel.backgrounds.find(
    (background) => background.id === currentScene.background
  )?.source.jpg

  script += `\ntransform yoffset:
    yalign 1.0
    xalign 0.5`

  script += `\ntransform scale:
    xysize(1920,1080)`

  script += `\nimage logo = "logo.png"
  \nlabel splashscreen:
    scene black
    with Pause(1)\n
    show logo with dissolve
    with Pause(2)\n
    scene black with dissolve
    with Pause(1)\n
    return`

  script += '\n\nlabel start:\n'

  script += `    image bg ${removeFileExtension(
    currentBackgroundSrc || ''
  )} = "${currentBackgroundSrc}"\n`

  script += `    scene bg ${removeFileExtension(
    currentBackgroundSrc || ''
  )}  at scale\n`

  script += `    jump ${history[0].type}_${history[0].item.id}\n
    return\n`

  for (const interactionID of Object.keys(allInteractions)) {
    const interaction = allInteractions[interactionID]
    if (interaction) {
      const sceneId = interaction.sceneId
      const scene = getSceneData(sceneId)
      const backgroundSrc = state.novel.backgrounds.find(
        (background) => background.id === scene.background
      )?.source.jpg
      script += `\n\nlabel interaction_${sanitizeId(interaction.id)}:\n`
      script += `    image bg ${removeFileExtension(
        backgroundSrc || ''
      )} = "${backgroundSrc}"\n`

      script += `    scene bg ${removeFileExtension(
        backgroundSrc || ''
      )} at scale\n`

      script += `    m "${interaction.query}"\n`
      script += `    jump response_${sanitizeId(interaction.responsesId[0])}\n`
      script += `    return\n`
    }
  }

  for (const responseID of Object.keys(allResponses)) {
    const response = allResponses[responseID]
    if (response) {
      const sceneID =
        allInteractions[response.parentInteractionId || 0]?.sceneId

      const scene = getSceneData(sceneID ? sceneID : currentSceneId)
      const backgroundSrc = state.novel.backgrounds.find(
        (background) => background.id === scene.background
      )?.source.jpg
      script += `\n\nlabel response_${sanitizeId(response.id)}:\n`
      script += `    image bg ${removeFileExtension(
        backgroundSrc || ''
      )} = "${backgroundSrc}"\n`

      script += `    scene bg ${removeFileExtension(
        backgroundSrc || ''
      )} at scale\n`

      response.characters.forEach((characterResponse, index) => {
        const character = scene.characters.find(
          (char) => char.id === characterResponse.characterId
        )
        const currentOutfitSrc = character?.outfit.emotions.find(
          (emotion) => emotion.id === characterResponse.emotion
        )?.sources.png
        script += `    image ${character?.slug} ${character?.outfitSlug} ${characterResponse.emotion} = "${currentOutfitSrc}"\n`
        script += `    show ${character?.slug} ${character?.outfitSlug} ${characterResponse.emotion} at yoffset`
        script +=
          response.characters.length > 1
            ? index === 0
              ? ' at left'
              : ' at right'
            : ''
        script += '\n'
        const slicedTexts = getSlicedStrings(characterResponse.text)
        slicedTexts.forEach((text) => {
          script += `    ${character?.slug} "${fillTextTemplate(text, {
            user: state.settings.user.name,
            bot: character?.name || '',
            characters: scene.characters.reduce((acc, char) => {
              acc[char.id || ''] = char.name
              return acc
            }, {} as { [key: string]: string }),
          })}"\n`
        })
      })
      if (response.childrenInteractions.length > 1) {
        script += `    menu:\n`
        for (const interactionID of response.childrenInteractions) {
          const interaction = allInteractions[interactionID.interactionId]
          script += `        "${interaction?.query}":\n`
          script += `            jump interaction_${sanitizeId(
            interaction?.id!
          )}\n`
        }
      } else {
        script += `    jump ${
          response.childrenInteractions.length > 0
            ? `interaction_${sanitizeId(
                response.childrenInteractions[0].interactionId
              )}`
            : 'splashscreen'
        }\n`
      }
      script += `    return\n`
    }
  }

  script += '    return\n'
  return script
}

export const downloadRenPyProject = async (
  script: string,
  state: RootState
) => {
  try {
    const AssetsUrl = 'https://assets.miku.gg/'
    const allBackgroundAssets = state.novel.backgrounds.map(
      (background) => background.source.jpg
    )
    const allCharactersImages = state.novel.characters
      .map((character) => {
        return character.card.data.extensions.mikugg_v2.outfits.map(
          (outfit) => {
            return outfit.emotions.map((emotion) => {
              return emotion.sources.png
            })
          }
        )
      })
      .flat(2)

    const response = await fetch(clearProjectUrl)
    const buffer = await response.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)
    const blob = new Blob([script], { type: 'text/plain' })

    const folder = zip?.folder('game')
    folder?.file(`script.rpy`, blob)

    const imagesFolder = folder?.folder('images')

    for (const backgroundAsset of allBackgroundAssets) {
      const assetResponse = await fetch(`${AssetsUrl}${backgroundAsset}`)
      const assetBlob = await assetResponse.blob()
      imagesFolder?.file(backgroundAsset, assetBlob)
    }

    for (const characterAsset of allCharactersImages) {
      const assetResponse = await fetch(`${AssetsUrl}${characterAsset}`)
      const assetBlob = await assetResponse.blob()
      imagesFolder?.file(characterAsset, assetBlob)
    }

    const updatedZipBlob = await zip.generateAsync({ type: 'blob' })
    if (!updatedZipBlob) {
      throw new Error('Failed to generate the updated ZIP file')
    } else {
      const a = document.createElement('a')
      const url = URL.createObjectURL(updatedZipBlob)
      a.href = url
      a.download = `${state.novel.title.split(' ').join('-')}-RenPyExport.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('Error:', err)
  }
}
