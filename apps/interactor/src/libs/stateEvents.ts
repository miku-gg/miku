import { RootState } from '../state/store'

export enum StateEventType {
  NEW_NARRATION = 'NEW_NARRATION',
  UPDATE_STATE = 'UPDATE_STATE',
}

export enum AnalyticsEvents {
  INTERACTION = 'novel_interaction',
  REGENERATION = 'novel_regeneration',
}

const postMessage = (
  type: StateEventType,
  payload: {
    state: RootState
    isNewInteraction: boolean
  }
) => {
  window.parent?.postMessage({ type, payload }, '*')
}

export const emitStateEvent = (
  type: StateEventType,
  payload: {
    state: RootState
    isNewInteraction: boolean
  }
) => {
  postMessage(type, payload)
}
