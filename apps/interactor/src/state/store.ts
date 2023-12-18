import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import settings from './settingsSlice'
import narration from './narrationSlice'
import novel from './novelSlice'
import { interactionListenerMiddleware } from './listeners'

export const store = configureStore({
  reducer: {
    settings,
    narration,
    novel,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(interactionListenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
