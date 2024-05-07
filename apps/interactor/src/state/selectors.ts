import { RootState } from './store'
import { NovelCharacterOutfit, NovelScene } from './slices/novelSlice'
import {
  NarrationInteraction,
  NarrationResponse,
} from './slices/narrationSlice'
import { createSelector } from '@reduxjs/toolkit'
import { EmotionTemplateSlug } from '@mikugg/bot-utils'
import { NovelNSFW } from './versioning'

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
    const start = state.novel.starts.find((start) => start.id === response?.id)
    return state.novel.scenes.find((scene) => scene.id === start?.sceneId)
  }
}

export const selectCurrentScene = (
  state: RootState
): NovelScene | undefined => {
  const { currentResponseId } = state.narration
  const response = state.narration.responses[currentResponseId]
  return selectSceneFromResponse(state, response)
}

export const selectCharacterOutfits = (
  state: RootState,
  characterId: string
): NovelCharacterOutfit[] => {
  return (
    state.novel.characters
      .find((character) => character.id === characterId)
      ?.card.data.extensions.mikugg_v2.outfits.map((outfit) => ({
        ...outfit,
        nsfw: outfit.nsfw as NovelNSFW,
        template: outfit.template as EmotionTemplateSlug,
      })) || []
  )
}

export const selectLastImageOfCharacter = (
  state: RootState,
  characterId: string,
  responseId?: string
): string => {
  const { currentResponseId } = state.narration
  responseId = responseId || currentResponseId
  const response = state.narration.responses[responseId]
  const scene = selectSceneFromResponse(state, response)
  const characterResponse = response?.characters.find(
    (character) => character.characterId === characterId
  )
  if (characterResponse?.text) {
    const characterOutfitId = scene?.characters.find(
      (character) => character.characterId === characterId
    )?.outfit
    const outfits = selectCharacterOutfits(state, characterId)
    const outfit = outfits.find((outfit) => outfit.id === characterOutfitId)
    const emotions = outfit?.emotions.find(
      (emotion) => emotion.id === characterResponse.emotion
    )
    return emotions?.sources.webm || emotions?.sources.png || ''
  } else if (response?.parentInteractionId) {
    const interaction =
      state.narration.interactions[response?.parentInteractionId]
    const oldResponseId = interaction?.parentResponseId
    if (!oldResponseId) return ''
    else
      return selectLastImageOfCharacter(state, characterId, oldResponseId || '')
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
      scene?.characters.map(({ characterId, outfit }) => {
        const characterResponse = response?.characters.find(
          (character) => character.characterId === characterId
        )
        const emotionSlug = characterResponse?.emotion || ''
        return {
          id: characterId || '',
          outfit: outfit || '',
          text: characterResponse?.text || '',
          image: selectLastImageOfCharacter(state, characterId, response?.id),
          emotion: emotionSlug,
          selected: characterId === response?.selectedCharacterId,
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
    (state: RootState) => state.settings.user.nsfw,
    selectCurrentScene,
  ],
  (scenes, characters, nsfw, currentScene) => {
    if (scenes.length === 1) return []
    return scenes
      .filter(
        (scene) =>
          !currentScene?.children.length ||
          currentScene?.children.includes(scene.id)
      )
      .filter((scene) => {
        return nsfw >= scene.nsfw
      })
      .map((scene) => {
        const outfits = selectCharacterOutfits(
          { novel: { characters } } as RootState,
          scene.characters[0]?.characterId || ''
        )
        const outfit = outfits.find(
          (outfit) => outfit.id === scene.characters[0]?.outfit
        )
        const emotionImage = outfit?.emotions[0].sources.png || ''

        return {
          id: scene.id,
          name: scene.name,
          prompt: scene.prompt,
          backgroundId: scene.backgroundId,
          musicId: scene.musicId,
          emotion: emotionImage,
          characters: scene.characters,
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
    if (responses[currentResponseId]?.parentInteractionId) {
      const interaction =
        interactions[responses[currentResponseId]?.parentInteractionId || '']
      return interaction?.responsesId.map((id) => responses[id])
    } else {
      return Object.values(responses).filter(
        (responses) => responses?.parentInteractionId === null
      )
    }
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
      scene?.characters
        .map(({ characterId, outfit: outfitId }) => {
          const character = characters.find(
            (character) => character.id === characterId
          )
          const outfits = selectCharacterOutfits(
            { novel: { characters } } as RootState,
            characterId
          )
          const outfit = outfits.find((outfit) => outfit.id === outfitId)
          return {
            id: characterId,
            name: character?.name,
            outfit,
          }
        })
        .filter((char) => char.outfit) || []
    )
  }
)

export const selectChatHistory = createSelector(
  [
    selectAllParentDialogues,
    (state: RootState) => state.novel.characters,
    (state: RootState) => state,
  ],
  (
    dialogues,
    characters,
    state
  ): {
    name: string
    text: string
    type: 'response' | 'interaction'
  }[] => {
    return dialogues
      .map(
        (
          dialogue
        ): {
          name: string
          text: string
          type: 'response' | 'interaction'
        }[] => {
          const interaction = state.narration.interactions[dialogue.item.id]
          if (interaction) {
            const character = state.settings.user.name
            return [
              {
                name: character,
                text: interaction.query,
                type: 'interaction',
              },
            ]
          }

          const response = state.narration.responses[dialogue.item.id]
          if (response) {
            return response.characters.map(
              ({
                characterId,
                text,
              }): {
                name: string
                text: string
                type: 'response' | 'interaction'
              } => {
                const char = characters.find(
                  (character) => character.id === characterId
                )
                return {
                  name: char?.name || '',
                  text,
                  type: 'response',
                }
              }
            )
          } else {
            return []
          }
        }
      )
      .flat()
  }
)

export const selectCharactersInCurrentScene = createSelector(
  [(state: RootState) => state.novel.characters, selectCurrentScene],
  (characters, scene) => {
    return scene?.characters.map(({ characterId, outfit: outfitId }) => {
      const character = characters.find(
        (character) => character.id === characterId
      )
      const outfits = selectCharacterOutfits(
        { novel: { characters } } as RootState,
        characterId
      )
      const outfit = outfits.find((outfit) => outfit.id === outfitId)
      return {
        ...character,
        outfit,
      }
    })
  }
)

export const selectCurrentNextScene = createSelector(
  [selectAllParentDialogues, selectCurrentScene],
  (dialogues, scene) => {
    if (scene?.id && dialogues.length) {
      const findFirstCurrentSceneIndex =
        dialogues.findIndex(
          (d) => d.type == 'interaction' && d.item.sceneId !== scene.id
        ) - 1

      const currentDialogues = dialogues.slice(
        0,
        findFirstCurrentSceneIndex < 0
          ? dialogues.length
          : findFirstCurrentSceneIndex
      )
      const _responseOfSuggestion = currentDialogues.find(
        (d) => d.type === 'response' && d.item.nextScene
      )
      return _responseOfSuggestion?.type === 'response'
        ? _responseOfSuggestion.item.nextScene || null
        : null
    }
    return null
  }
)

export const selectCurrentMap = createSelector(
  [selectCurrentScene, (state: RootState) => state.novel.maps],
  (scene, maps) => {
    const currentMap = scene?.parentMapId
      ? maps.find((map) => map.id === scene?.parentMapId)
      : null
    if (!currentMap) return null
    return {
      ...currentMap,
      places: currentMap.places.map((place) => ({
        ...place,
        isCurrentPlace: place.sceneId === scene?.id,
      })),
    }
  }
)

export const selectCurrentSceneObjectives = createSelector(
  [(state: RootState) => state.objectives, selectCurrentScene],
  (objectives, scene) => {
    return objectives.filter(
      (objective) => objective.sceneId === scene?.id || !objective.sceneId
    )
  }
)
