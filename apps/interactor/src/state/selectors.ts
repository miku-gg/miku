import { RootState } from './store'
import { NovelCharacters, NovelScene } from './slices/novelSlice'
import {
  NarrationInteraction,
  NarrationResponse,
} from './slices/narrationSlice'
import { createSelector } from '@reduxjs/toolkit'

export const selectLastLoadedResponse = (
  state: RootState
): NarrationResponse | undefined => {
  const { currentResponseId } = state.narration
  const response = state.narration.responses[currentResponseId]
  if (response?.fetching && response?.parentInteractionId) {
    const interaction =
      state.narration.interactions[response.parentInteractionId]
    let selectedResponseId = interaction?.responsesId.find(
      (id) => !state.narration.responses[id]?.selected
    )
    if (!selectedResponseId) {
      selectedResponseId = interaction?.parentResponseId || ''
    }
    return state.narration.responses[selectedResponseId || '']
  } else {
    return response
  }
}

export const selectSceneFromResponse = (
  state: RootState,
  response: NarrationResponse | undefined
): NovelScene | undefined => {
  const interactionId = response?.parentInteractionId || ''
  if (interactionId) {
    return state.novel.scenes.find(
      (scene) =>
        scene.id === state.narration.interactions[interactionId]?.sceneId
    )
  } else {
    return state.novel.scenes.find(
      (scene) => scene.id === state.novel.startSceneId
    )
  }
}

export const selectCurrentScene = (
  state: RootState
): NovelScene | undefined => {
  const { currentResponseId } = state.narration
  const response = state.narration.responses[currentResponseId]
  return selectSceneFromResponse(state, response)
}

export const selectLastLoadedCharacters = createSelector(
  [
    selectLastLoadedResponse,
    (state: RootState) =>
      selectSceneFromResponse(state, selectLastLoadedResponse(state)),
    (state: RootState) => state.novel.characters,
  ],
  (
    response?: NarrationResponse,
    scene?: NovelScene,
    characters: NovelCharacters = {}
  ) => {
    return (
      scene?.roles.map(({ role, characterId }) => {
        const outfitSlug = characters[characterId]?.roles[role] || ''
        const emotionSlug = response?.characters[role]?.emotion
        const emotion = characters[characterId]?.outfits[
          outfitSlug
        ]?.emotions?.find((_emotion) => _emotion.id === emotionSlug)
        return {
          id: characterId || '',
          text: response?.characters[role]?.text || '',
          image: emotion?.source[0],
          emotion: emotionSlug,
        }
      }) || []
    )
  }
)

export const selectAvailableScenes = createSelector(
  [
    (state: RootState) => state.novel.scenes,
    (state: RootState) => state.novel.characters,
    selectCurrentScene,
  ],
  (scenes, characters, currentScene) => {
    return scenes
      .filter((scene) => currentScene?.children.includes(scene.id))
      .map((scene) => {
        const firstCharacter = characters[scene.roles[0]?.characterId]
        const emotionImage =
          firstCharacter?.outfits[
            firstCharacter?.roles[scene.roles[0]?.role] || ''
          ]?.emotions[0].source[0] || ''

        return {
          id: scene.id,
          name: scene.name,
          prompt: scene.prompt,
          background: scene.background,
          music: scene.music,
          emotion: emotionImage,
          roles: scene.roles,
        }
      })
  }
)

export const selectCurrentSwipeResponses = createSelector(
  [
    (state: RootState) => state.narration.interactions,
    (state: RootState) => state.narration.responses,
    (state: RootState) => state.narration.currentResponseId,
  ],
  (interactions, responses, currentResponseId) => {
    const interaction =
      interactions[responses[currentResponseId]?.parentInteractionId || '']
    return interaction?.responsesId.map((id) => responses[id])
  }
)

export const selectAllParentDialogues = createSelector(
  [
    (state: RootState) => state.narration.interactions,
    (state: RootState) => state.narration.responses,
    (state: RootState) => state.narration.currentResponseId,
  ],
  (interactions, responses, currentResponseId) => {
    let responseIdPointer = currentResponseId
    const dialogues: (
      | { type: 'response'; item: NarrationResponse }
      | { type: 'interaction'; item: NarrationInteraction }
    )[] = []
    while (responseIdPointer) {
      const response = responses[responseIdPointer]
      if (response) {
        if (!response.fetching)
          dialogues.push({ type: 'response', item: response })
        if (response?.parentInteractionId) {
          const interaction = interactions[response?.parentInteractionId]
          if (interaction) {
            dialogues.push({ type: 'interaction', item: interaction })
            responseIdPointer = interaction?.parentResponseId || ''
          } else {
            break
          }
        } else {
          break
        }
      } else {
        break
      }
    }
    return dialogues
  }
)

export const selectCurrentCharacterOutfits = createSelector(
  [
    (state: RootState) => state.novel.characters,
    selectCurrentScene,
    selectLastLoadedResponse,
  ],
  (characters, scene) => {
    return (
      scene?.roles
        .map((role) => {
          const characterOutfitId =
            characters[role.characterId]?.roles[role.role] || ''
          const characterOutfit =
            characters[role.characterId]?.outfits[characterOutfitId]
          return {
            name: characters[role.characterId]?.name,
            outfit: characterOutfit,
          }
        })
        .filter((outfit) => outfit.outfit) || []
    )
  }
)
