import { RootState } from '../state/store'

export enum StateEventType {
  NEW_NARRATION = 'NEW_NARRATION',
  UPDATE_STATE = 'UPDATE_STATE',
}

export enum CustomEventType {
  OPEN_PREMIUM = 'OPEN_PREMIUM',
  SHARE_CONVERSATION = 'SHARE_CONVERSATION',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  NOVEL_PROFILE_CLICK = 'NOVEL_PROFILE_CLICK',
  ITEM_USE = 'ITEM_USE',
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
