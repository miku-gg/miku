import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import settings from './slices/settingsSlice'
import narration from './slices/narrationSlice'
import novel from './slices/novelSlice'
import version from './slices/versionSlice'
import {
  interactionListenerMiddleware,
  regenerationListenerMiddleware,
} from './listeners'
import { stateReplacementMiddleware } from './slices/replaceState'

export const store = configureStore({
  reducer: {
    settings,
    narration,
    novel,
    version,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend([
      interactionListenerMiddleware.middleware,
      regenerationListenerMiddleware.middleware,
      stateReplacementMiddleware,
    ]),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
