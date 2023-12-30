import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as randomUUID } from 'uuid'
import {
  NarrationState,
  NarrationInteraction,
  NarrationResponse,
} from '../versioning'
import { toast } from 'react-toastify'
import trim from 'lodash.trim'

export type {
  NarrationState,
  NarrationInteraction,
  NarrationResponse,
} from '../versioning'

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
        servicesEndpoint: string
        text: string
        sceneId: string
        roles: string[]
        selectedRole: string
      }>
    ) {
      const { text, sceneId } = action.payload
      state.input.text = ''
      const newInteractionId = randomUUID()
      const response: NarrationResponse = {
        id: randomUUID(),
        selectedRole: action.payload.selectedRole,
        characters: [
          {
            role: action.payload.selectedRole,
            text: '',
            emotion: '',
            pose: '',
          },
        ],
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
      toast.error('Error querying the AI')
      const interaction =
        state.interactions[response?.parentInteractionId || '']
      const reponsesId = interaction?.responsesId
      if (interaction) {
        interaction.responsesId =
          reponsesId?.filter((responseId) => responseId !== response?.id) || []

        if (interaction.responsesId.length) {
          const newResponseId = interaction.responsesId[0]
          const newResponse = state.responses[newResponseId]
          if (newResponse) {
            newResponse.selected = true
            state.currentResponseId = newResponseId
          }
          delete state.responses[response?.id || '']
        } else {
          state.currentResponseId = interaction?.parentResponseId || ''
          const currentResponse = state.responses[state.currentResponseId]
          if (currentResponse) {
            currentResponse.childrenInteractions =
              currentResponse.childrenInteractions.filter(
                (child) => child.interactionId !== response?.parentInteractionId
              )
            if (currentResponse.childrenInteractions.length) {
              currentResponse.childrenInteractions[0].selected = true
            }
          }
          delete state.responses[response?.id || '']
          delete state.interactions[interaction?.id || '']
        }
      }
    },
    interactionSuccess(
      state,
      action: PayloadAction<{
        completed: boolean
        characters: NarrationResponse['characters']
        suggestedScenes?: string[]
      }>
    ) {
      const { characters, suggestedScenes = [] } = action.payload
      const response = state.responses[state.currentResponseId]
      if (response) {
        response.childrenInteractions = []
        response.characters = characters
        response.suggestedScenes = suggestedScenes
        response.fetching = characters.every((char) => !char.text)
        response.selected = true
      }
      if (action.payload.completed) {
        state.input.disabled = false
      }
    },
    regenerationStart(
      state,
      action: PayloadAction<{
        servicesEndpoint: string
        emotion: string
        selectedRole: string
      }>
    ) {
      const currentInteraction =
        state.interactions[
          state.responses[state.currentResponseId]?.parentInteractionId || ''
        ]
      if (!currentInteraction) return state
      const response: NarrationResponse = {
        id: randomUUID(),
        selectedRole: action.payload.selectedRole,
        characters: [
          {
            role: action.payload.selectedRole,
            emotion: action.payload.emotion,
            text: '',
            pose: '',
          },
        ],
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
    continueResponse(
      state,
      // eslint-disable-next-line
      _action: PayloadAction<{
        servicesEndpoint: string
      }>
    ) {
      const response = state.responses[state.currentResponseId]
      const characterResponses = response?.characters || []
      const lastResponse = characterResponses.length
        ? characterResponses[characterResponses.length - 1]
        : null
      if (!lastResponse) return state

      const continuationTokens = [
        '\n"',
        '\n*',
        '\n"{{user}},',
        `\n*{{${lastResponse.role}}}`,
      ]
      const endingTokens = ['\n', '*', '"', '.', '?', '!']
      if (endingTokens.some((token) => lastResponse.text.endsWith(token))) {
        lastResponse.text =
          trim(lastResponse.text) +
          continuationTokens[
            Math.floor(Math.random() * continuationTokens.length)
          ]
      }
      state.input.disabled = false
    },
    roleResponseStart(
      state,
      action: PayloadAction<{
        servicesEndpoint: string
        role: string
      }>
    ) {
      const { role } = action.payload
      const response = state.responses[state.currentResponseId]
      if (!response) return state
      const index = response.characters.findIndex((char) => char.role === role)
      const characters = response.characters.slice(
        0,
        index !== -1 ? index : response.characters.length
      )
      characters.push({
        role,
        text: '',
        emotion: '',
        pose: '',
      })
      response.characters = characters
      response.selectedRole = role
      response.fetching = true
      state.input.disabled = true
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
    updateResponse(
      state,
      action: PayloadAction<{
        id: string
        text: string
        role: string
        emotion: string
      }>
    ) {
      const { id, text, role, emotion } = action.payload
      const response = state.responses[id]
      const charResponse = response?.characters.find(
        (char) => char.role === role
      )
      if (charResponse) {
        charResponse.emotion = emotion
        charResponse.text = text
      }
    },
    updateInteraction(
      state,
      action: PayloadAction<{
        id: string
        text: string
      }>
    ) {
      const { id, text } = action.payload
      const interaction = state.interactions[id]
      if (interaction) {
        interaction.query = text
      }
    },
    selectRoleOfResponse: (
      state,
      action: PayloadAction<{
        roleId: string
        responseId: string
      }>
    ) => {
      const { roleId, responseId } = action.payload
      const response = state.responses[responseId]
      if (response) {
        response.selectedRole = roleId
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase('global/replaceState', (_state, action) => {
      // eslint-disable-next-line
      // @ts-ignore
      return action.payload.narration
    })
  },
})

export const {
  setNarration,
  setInputText,
  interactionFailure,
  interactionStart,
  interactionSuccess,
  regenerationStart,
  continueResponse,
  swipeResponse,
  updateResponse,
  updateInteraction,
  selectRoleOfResponse,
  roleResponseStart,
} = narrationSlice.actions

export default narrationSlice.reducer
