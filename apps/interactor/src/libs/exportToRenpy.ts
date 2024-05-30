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

const clearProjectUrl = 'https://assets.miku.gg/renpy-project.zip'
const localClearProjectUrl = 'http://localhost:8585/s3/assets/RenPyExport.zip'
const AssetsUrl = 'http://localhost:8585/s3/assets/'

function removeFileExtension(filename: string): string {
  return filename.replace(/\.(png|jpeg)$/i, '')
}
function getSlicedStrings(str: string): string[] {
  const slices = []
  let startIndex = 0
  let endIndex = 0

  while (startIndex < str.length) {
    endIndex = str.indexOf('*', startIndex)
    if (endIndex === -1) {
      slices.push(str.slice(startIndex) + '*')
      break
    }

    slices.push(str.slice(startIndex, endIndex + 1))

    startIndex = endIndex
    endIndex = str.indexOf('*', startIndex + 1)
    if (endIndex === -1) {
      slices.push(str.slice(startIndex) + '*')
      break
    }

    slices.push(str.slice(startIndex, endIndex + 1))

    startIndex = endIndex + 1 // Move start index past the closing asterisk
  }

  return slices
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
    zoom 0.5
    yalign 1.0
    xalign 0.5`

  script += `\ntransform scale:
    zoom 1.25`

  script += '\n\nlabel start:\n'

  script += `    image bg ${removeFileExtension(
    currentBackgroundSrc || ''
  )} = "${currentBackgroundSrc}"\n`

  script += `    scene bg ${removeFileExtension(
    currentBackgroundSrc || ''
  )}  at scale\n`

  for (const { item, type } of history) {
    if (type === 'interaction') {
      if (item.sceneId !== currentSceneId) {
        currentSceneId = item.sceneId
        currentScene = getSceneData(currentSceneId)
        let currentBackgroundSrc = state.novel.backgrounds.find(
          (background) => background.id === currentScene.background
        )?.source.jpg
        script += `    scene bg ${removeFileExtension(
          currentBackgroundSrc || ''
        )} at scale\n`
      } else {
        script += `    m "${item.query}"\n`
      }
    } else {
      item.characters.forEach((characterResponse, index) => {
        const character = currentScene.characters.find(
          (char) => char.id === characterResponse.characterId
        )
        const currentOutfitSrc = character?.outfit.emotions.find(
          (emotion) => emotion.id === characterResponse.emotion
        )?.sources.png
        script += `    image ${character?.slug} ${character?.outfitSlug} ${characterResponse.emotion} = "${currentOutfitSrc}"\n`
        script += `    show ${character?.slug} ${character?.outfitSlug} ${characterResponse.emotion} at yoffset`
        script +=
          item.characters.length > 1
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
            characters: currentScene.characters.reduce((acc, char) => {
              acc[char.id || ''] = char.name
              return acc
            }, {} as { [key: string]: string }),
          })}"\n`
        })
      })
    }
  }

  script += '    return\n'

  downloadRenPyProject(script, state)
  // return {
  //   script,
  // }
}

export const downloadRenPyProject = async (
  script: string,
  state: RootState
) => {
  try {
    const AssetsUrl = 'http://localhost:8585/s3/assets/'
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

    // const currentMusic = state.novel.scenes.map((scene) => {
    //   return scene.musicId
    // })

    const response = await fetch(localClearProjectUrl)
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
      a.download = `${state.novel.title.split(' ').join('-')}RenPyExport.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    console.error('Error:', err)
  }
}
