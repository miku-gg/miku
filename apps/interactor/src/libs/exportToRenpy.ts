import { selectAllParentDialogues } from '../state/selectors'
import { RootState } from '../state/store'
import { NovelCharacterOutfit } from '../state/versioning'
import { fillTextTemplate } from './prompts/strategies'

const assert = console.assert

// sanitaze name, remove special characters, spaces and make it lowercase
const sanitizeName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}

export const exportToRenPy = (
  state: RootState
): {
  script: string
  // images: {
  //   source: string
  //   target: string
  // }[]
  // audio: {
  //   source: string
  //   target: string
  // }[]
} => {
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

  return {
    script,
  }
}
