import { StateEventType, emitStateEvent } from '../libs/stateEvents';
import { RootState } from './store';

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

    // Emit the state event with the updated state
    emitStateEvent(StateEventType.UPDATE_STATE, {
      state: updatedState as RootState,
      isNewInteraction: true,
    });
  }

  // Return the result of next(action) to complete the middleware chain
  return result;
};

export default updateStateMiddleware;
