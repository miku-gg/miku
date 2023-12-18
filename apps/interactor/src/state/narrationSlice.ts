import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as randomUUID } from 'uuid'

export interface NarrationInteraction {
  id: string
  parentResponseId: string | null
  query: string
  sceneId: string
  responsesId: string[]
}

export interface NarrationResponse {
  id: string
  selected: boolean
  fetching: boolean
  parentInteractionId: string | null
  suggestedScenes: string[]
  characters: {
    [role: string]:
      | {
          emotion: string
          audio: string
          pose: string
          text: string
        }
      | undefined
  }
  childrenInteractions: {
    interactionId: string
    selected: boolean
  }[]
}

export interface NarrationState {
  id: string
  fetching: boolean
  currentResponseId: string
  input: {
    text: string
    suggestions: string[]
    disabled: boolean
  }
  interactions: {
    [id: string]: NarrationInteraction | undefined
  }
  responses: {
    [id: string]: NarrationResponse | undefined
  }
}

const initialState: NarrationState = {
  id: '',
  fetching: true,
  currentResponseId: '',
  input: {
    text: '',
    suggestions: [],
    disabled: false,
  },
  interactions: {},
  responses: {},
}

const narrationSlice = createSlice({
  name: 'narration',
  initialState,
  reducers: {
    setNarration(_state, action: PayloadAction<NarrationState>) {
      return action.payload
    },
    setInputText(state, action: PayloadAction<string>) {
      state.input.text = action.payload
    },
    interactionStart(
      state,
      action: PayloadAction<{
        text: string
        sceneId: string
      }>
    ) {
      const { text, sceneId } = action.payload
      state.input.text = ''
      const newInteractionId = randomUUID()
      const response: NarrationResponse = {
        id: randomUUID(),
        characters: {},
        childrenInteractions: [],
        fetching: true,
        parentInteractionId: newInteractionId,
        selected: true,
        suggestedScenes: [],
      }
      const interaction: NarrationInteraction = {
        id: newInteractionId,
        parentResponseId: state.currentResponseId,
        query: text,
        sceneId,
        responsesId: [response.id],
      }
      const currentResponse = state.responses[state.currentResponseId]
      currentResponse?.childrenInteractions.forEach((child) => {
        child.selected = false
      })
      currentResponse?.childrenInteractions.push({
        interactionId: newInteractionId,
        selected: true,
      })
      state.interactions[newInteractionId] = interaction
      state.responses[response.id] = response
      state.currentResponseId = response.id
      state.input.disabled = true
    },
    interactionFailure(state) {
      state.input.disabled = false
      const response = state.responses[state.currentResponseId]
      if (!response?.fetching) return state
      const interaction =
        state.interactions[response?.parentInteractionId || '']
      state.currentResponseId = interaction?.parentResponseId || ''
      const currentResponse = state.responses[state.currentResponseId]
      if (currentResponse) {
        currentResponse.childrenInteractions =
          currentResponse.childrenInteractions.filter(
            (child) => child.interactionId === response?.parentInteractionId
          )
        if (currentResponse.childrenInteractions.length) {
          currentResponse.childrenInteractions[0].selected = true
        }
      }
      delete state.responses[response?.id || '']
      delete state.interactions[interaction?.id || '']
    },
    interactionSuccess(
      state,
      action: PayloadAction<{
        completed: boolean
        characters: NarrationResponse['characters']
        suggestedScenes: string[]
      }>
    ) {
      const { characters, suggestedScenes } = action.payload
      const response = state.responses[state.currentResponseId]
      if (response) {
        response.childrenInteractions = []
        response.characters = characters
        response.suggestedScenes = suggestedScenes
        response.fetching = false
        response.selected = true
      }
      if (action.payload.completed) {
        state.input.disabled = false
      }
    },
    regenerationStart(state) {
      const currentInteraction =
        state.interactions[
          state.responses[state.currentResponseId]?.parentInteractionId || ''
        ]
      if (!currentInteraction) return state
      const response: NarrationResponse = {
        id: randomUUID(),
        characters: {},
        childrenInteractions: [],
        fetching: true,
        parentInteractionId: currentInteraction.id,
        selected: true,
        suggestedScenes: [],
      }
      currentInteraction.responsesId.forEach((responseId) => {
        const response = state.responses[responseId]
        if (response) {
          response.selected = false
        }
      })
      currentInteraction.responsesId.push(response.id)
      state.responses[response.id] = response

      state.input.disabled = true
      state.currentResponseId = response.id
    },
    swipeResponse(state, action: PayloadAction<string>) {
      const response = state.responses[action.payload]
      if (response) {
        const interaction =
          state.interactions[response.parentInteractionId || '']
        if (interaction) {
          interaction.responsesId.forEach((responseId) => {
            const response = state.responses[responseId]
            if (response) {
              response.selected = false
            }
          })
        }
        response.selected = true
        state.currentResponseId = response.id
      }
    },
  },
})

export const {
  setNarration,
  setInputText,
  interactionFailure,
  interactionStart,
  interactionSuccess,
  regenerationStart,
  swipeResponse,
} = narrationSlice.actions

export default narrationSlice.reducer
