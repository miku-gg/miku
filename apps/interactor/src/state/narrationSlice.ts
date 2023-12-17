import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Interaction {
  id: string
  parentResponseId: string | null
  query: string
  sceneId: string
  responsesId: string[]
}

interface Response {
  id: string
  selected: boolean
  fetching: boolean
  suggestedScenes: string[]
  characters: {
    [role: string]: {
      emotion: string
      audio: string
      pose: string
      text: string
    }
  }
  childrenInteractions: {
    interactionId: string
    selected: boolean
  }[]
}

export interface NarrationState {
  id: string
  fetching: boolean
  currentSceneId: string
  currentResponseId: string
  input: {
    text: string
    suggestions: string[]
  }
  interactions: {
    [id: string]: Interaction
  }
  responses: {
    [id: string]: Response
  }
}

const initialState: NarrationState = {
  id: '',
  fetching: true,
  currentSceneId: '',
  currentResponseId: '',
  input: {
    text: '',
    suggestions: [],
  },
  interactions: {},
  responses: {},
}

const narrationSlice = createSlice({
  name: 'narration',
  initialState,
  reducers: {
    setFetching(state, action: PayloadAction<boolean>) {
      state.fetching = action.payload
    },
    setNarration(_state, action: PayloadAction<NarrationState>) {
      return action.payload
    },
    setInteractions(
      state,
      action: PayloadAction<NarrationState['interactions']>
    ) {
      state.interactions = action.payload
    },
    setResponses(state, action: PayloadAction<NarrationState['responses']>) {
      state.responses = action.payload
    },
  },
})

export const { setFetching, setNarration, setInteractions, setResponses } =
  narrationSlice.actions

export default narrationSlice.reducer
