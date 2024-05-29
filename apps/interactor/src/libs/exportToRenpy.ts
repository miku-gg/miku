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

const fetchClearProject = async () => {
  try {
    const response = await fetch(clearProjectUrl)
    const blob = await response.blob()
    return blob
  } catch (error) {
    console.error(error)
    return null
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
  script += '\n\nlabel start:\n'

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
  script += `    scene bg ${currentScene.background}\n`

  for (const { item, type } of history) {
    if (type === 'interaction') {
      if (item.sceneId !== currentSceneId) {
        currentSceneId = item.sceneId
        currentScene = getSceneData(currentSceneId)
        script += `    scene bg ${currentScene.background}\n`
      } else {
        script += `    m "${item.query}"\n`
      }
    } else {
      item.characters.forEach((characterResponse, index) => {
        const character = currentScene.characters.find(
          (char) => char.id === characterResponse.characterId
        )
        script += `    show ${character?.slug} ${character?.outfitSlug} ${characterResponse.emotion}`
        script +=
          item.characters.length > 1
            ? index === 0
              ? ' at left'
              : ' at right'
            : ''
        script += '\n'
        script += `    ${character?.slug} "${fillTextTemplate(
          characterResponse.text,
          {
            user: state.settings.user.name,
            bot: character?.name || '',
            characters: currentScene.characters.reduce((acc, char) => {
              acc[char.id || ''] = char.name
              return acc
            }, {} as { [key: string]: string }),
          }
        )}"\n`
      })
    }
  }

  script += '    return\n'

  // return {
  //   script,
  // }
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
    const response = await fetch(clearProjectUrl)
    const buffer = await response.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)
    const blob = new Blob([script], { type: 'text/plain' })

    // Add a new file to the ZIP
    const folder = zip
      .folder('test-renpy')
      ?.folder('renpyexport')
      ?.folder('game')
    folder?.file(`script.rpy`, blob)

    // Generate the updated ZIP file
    const updatedZipBlob = await zip.generateAsync({ type: 'blob' })
    if (!updatedZipBlob) {
      throw new Error('Failed to generate the updated ZIP file')
    } else {
      const a = document.createElement('a')
      const url = URL.createObjectURL(updatedZipBlob)
      a.href = url
      a.download = `${state.novel.title.split(' ').join('-')}_script.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    // Do something with the updated ZIP file (e.g., send it back to the backend)
    console.log('Updated ZIP file:', updatedZipBlob)
  } catch (err) {
    console.error('Error:', err)
  }
}
