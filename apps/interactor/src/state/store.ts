import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import settings from './slices/settingsSlice'
import narration from './slices/narrationSlice'
import novel from './slices/novelSlice'
import version from './slices/versionSlice'
import creation from './slices/creationSlice'
import {
  continueListenerMiddleware,
  interactionListenerMiddleware,
  regenerationListenerMiddleware,
  roleResponseListenerMiddleware,
} from './listeners'
import { stateReplacementMiddleware } from './slices/replaceState'
import updateStateMiddleware from './updateState.middleware'

export const store = configureStore({
  reducer: {
    creation,
    settings,
    narration,
    novel,
    version,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend([
      updateStateMiddleware,
      interactionListenerMiddleware.middleware,
      regenerationListenerMiddleware.middleware,
      continueListenerMiddleware.middleware,
      roleResponseListenerMiddleware.middleware,
      stateReplacementMiddleware,
    ]),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
