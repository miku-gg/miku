import { RootState } from '../state/store'

export enum StateEventType {
  NEW_NARRATION = 'NEW_NARRATION',
  UPDATE_STATE = 'UPDATE_STATE',
}

export enum CustomEventType {
  OPEN_PREMIUM = 'OPEN_PREMIUM',
}

export const postMessage = (
  type: StateEventType | CustomEventType,
  payload?: unknown
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
