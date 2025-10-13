/**
 * Module-level abort controller for managing ongoing AI interactions
 */
let currentInteractionAbortController: AbortController | null = null;

export const setCurrentInteractionAbortController = (controller: AbortController | null) => {
  currentInteractionAbortController = controller;
};

export const getCurrentInteractionAbortController = (): AbortController | null => {
  return currentInteractionAbortController;
};

export const abortCurrentInteraction = (): void => {
  if (currentInteractionAbortController) {
    currentInteractionAbortController.abort();
    currentInteractionAbortController = null;
  }
};
