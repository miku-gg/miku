import { RootState } from './store'
import { NovelCharacters, NovelScene } from './novelSlice'
import { NarrationResponse } from './narrationSlice'
import { createSelector } from '@reduxjs/toolkit'

export const selectLastLoadedResponse = (
  state: RootState
): NarrationResponse | undefined => {
  const { currentResponseId } = state.narration
  const response = state.narration.responses[currentResponseId]
  if (response?.fetching && response?.parentInteractionId) {
    const interaction =
      state.narration.interactions[response.parentInteractionId]
    const selectedResponse = interaction?.responsesId.find(
      (id) => !state.narration.responses[id]?.selected
    )
    return state.narration.responses[selectedResponse || '']
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
    // Your logic here
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
        }
      }) || []
    )
  }
)
