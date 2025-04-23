import debounce from 'lodash.debounce';
import { StateEventType, emitStateEvent } from '../libs/stateEvents';
import { RootState } from './store';

// Create a debounced version of emitStateEvent that will emit at most once every 10 seconds
// and will always use the most recent state when it does emit
const debouncedEmitStateEvent = debounce(
  (state: RootState, isNewInteraction: boolean) => {
    emitStateEvent(StateEventType.UPDATE_STATE, {
      state,
      isNewInteraction,
    });
  },
  10000, // 10 seconds in milliseconds
  { leading: true, trailing: true, maxWait: 10000 },
);

// eslint-disable-next-line
// @ts-ignore
const updateStateMiddleware = (store) => (next) => (action) => {
  // Call next(action) first to let the action go through the reducer
  const result = next(action);

  // Check if it is the specific action after the state is updated
  if (
    (action.type === 'narration/interactionSuccess' && action.payload.completed === true) ||
    action.type === 'objectives/removeObjective'
  ) {
    // Get the updated state
    const updatedState = store.getState();

    // Use the debounced version to emit the state event
    debouncedEmitStateEvent(
      updatedState as RootState,
      action.type === 'narration/interactionSuccess' && action.payload.completed === true,
    );
  }

  // Return the result of next(action) to complete the middleware chain
  return result;
};

export default updateStateMiddleware;
