import { RootState } from './store'
import { NovelScene } from './slices/novelSlice'
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

export const selectLastImageOfRole = (
  state: RootState,
  role: string,
  responseId?: string
): string => {
  const { currentResponseId } = state.narration
  responseId = responseId || currentResponseId
  const response = state.narration.responses[responseId]
  const scene = selectSceneFromResponse(state, response)
  const roleResponse = response?.characters.find(
    (character) => character.role === role
  )
  if (roleResponse?.text) {
    const character =
      state.novel.characters[
        scene?.roles.find(({ role: _role }) => _role === role)?.characterId ||
          ''
      ]
    const outfit = character?.outfits[character?.roles[role] || '']
    return (
      outfit?.emotions.find((emotion) => emotion.id === roleResponse.emotion)
        ?.source[0] || ''
    )
  } else if (response?.parentInteractionId) {
    const interaction =
      state.narration.interactions[response?.parentInteractionId]
    const oldResponseId = interaction?.parentResponseId
    if (!oldResponseId) return ''
    else return selectLastImageOfRole(state, role, oldResponseId || '')
  } else {
    return ''
  }
}

export const selectLastLoadedCharacters = createSelector(
  [
    (state) => state,
    selectLastLoadedResponse,
    (state: RootState) =>
      selectSceneFromResponse(state, selectLastLoadedResponse(state)),
    (state: RootState) => state.novel.characters,
    (state) => state,
  ],
  (state: RootState, response?: NarrationResponse, scene?: NovelScene) => {
    return (
      scene?.roles.map(({ role, characterId }) => {
        const characterResponse = response?.characters.find(
          (character) => character.role === role
        )
        const emotionSlug = characterResponse?.emotion || ''
        return {
          id: characterId || '',
          role: role || '',
          text: characterResponse?.text || '',
          image: selectLastImageOfRole(state, role, response?.id),
          emotion: emotionSlug,
          selected: role === response?.selectedRole,
        }
      }) || []
    )
  }
)

export const selectLastSelectedCharacter = createSelector(
  [selectLastLoadedCharacters],
  (characters) => {
    return characters.find((character) => character.selected) || characters[0]
  }
)

export const selectAvailableScenes = createSelector(
  [
    (state: RootState) => state.novel.scenes,
    (state: RootState) => state.novel.characters,
    selectCurrentScene,
  ],
  (scenes, characters, currentScene) => {
    if (scenes.length === 1) return []
    return scenes
      .filter(
        (scene) =>
          !currentScene?.children.length ||
          currentScene?.children.includes(scene.id)
      )
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
            id: role.characterId,
            role: role.role,
            name: characters[role.characterId]?.name,
            outfit: characterOutfit,
          }
        })
        .filter((outfit) => outfit.outfit) || []
    )
  }
)
