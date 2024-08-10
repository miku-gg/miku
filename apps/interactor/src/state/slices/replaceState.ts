import { createAction, Middleware } from '@reduxjs/toolkit';
import { State } from '../versioning';

// Define the action with a specific payload structure
export const replaceState = createAction<object>('global/replaceState');

// Now, define the middleware with types
export const stateReplacementMiddleware: Middleware<object, State> = () => (next) => (action) => {
  if (replaceState.match(action)) {
    // Replace the entire state
    // Directly return the action with the new state as payload
    return next({ ...action, payload: action.payload });
  }
  return next(action);
};
