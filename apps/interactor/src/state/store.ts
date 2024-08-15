import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settings from './slices/settingsSlice';
import narration from './slices/narrationSlice';
import novel from './slices/novelSlice';
import version from './slices/versionSlice';
import creation from './slices/creationSlice';
import inventory from './slices/inventorySlice';
import objectives from './slices/objectivesSlice';
import {
  continueListenerMiddleware,
  interactionListenerMiddleware,
  regenerationListenerMiddleware,
  characterResponseListenerMiddleware,
} from './listeners/interaction';
import { stateReplacementMiddleware } from './slices/replaceState';
import updateStateMiddleware from './updateState.middleware';
import { inferenceListenerMiddleware } from './listeners/inference';
import { sceneSugestionMiddleware } from './listeners/scene-suggestion';
import { userDataMiddleware } from './listeners/user-data';

export const store = configureStore({
  reducer: {
    creation,
    settings,
    narration,
    novel,
    version,
    inventory,
    objectives,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend([
      updateStateMiddleware,
      userDataMiddleware.middleware,
      sceneSugestionMiddleware.middleware,
      interactionListenerMiddleware.middleware,
      regenerationListenerMiddleware.middleware,
      continueListenerMiddleware.middleware,
      characterResponseListenerMiddleware.middleware,
      inferenceListenerMiddleware.middleware,
      stateReplacementMiddleware,
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
