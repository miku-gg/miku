import { Dispatch } from '@reduxjs/toolkit';
import { navigateToScene, stopAiQueryAndMarkDisposable } from '../state/slices/narrationSlice';
import { abortCurrentInteraction, getCurrentInteractionAbortController } from './interactionAbortController';
import { RootState, store } from '../state/store';

class CutsceneOptionsBuffer {
  private needsInteractionStart: boolean = false;

  /**
   * Change scene using navigateToScene and optionally buffer for AI query
   */
  changeScene(
    dispatch: Dispatch,
    _state: RootState,
    params: {
      sceneId: string;
      isNewScene: boolean;
      bufferInteraction: boolean;
    }
  ) {
    const { sceneId, isNewScene, bufferInteraction: buffer } = params;

    // Always dispatch navigateToScene to change the scene
    dispatch(navigateToScene({
      sceneId,
      isNewScene,
    }));

    // Set the flag if AI query is needed
    this.needsInteractionStart = buffer;
  }

  /**
   * Stop any ongoing AI query and abort ongoing interactions.
   */
  stopAiQuery() {
    const state = store.getState();
    const narration = state.narration;
    const currentResponse = narration.responses[narration.currentResponseId];
    const hadActiveFetch = Boolean(currentResponse?.fetching);
    const hadActiveAbortController = Boolean(getCurrentInteractionAbortController());

    if (hadActiveFetch) {
      store.dispatch(stopAiQueryAndMarkDisposable());
    }
    if (hadActiveAbortController) {
      abortCurrentInteraction();
    }
    this.needsInteractionStart = hadActiveFetch || hadActiveAbortController;
  }
 
  /**
   * Check if AI query is needed
   */
  needsAiQueryAfterSceneChange(): boolean {
    return this.needsInteractionStart;
  }

  /**
   * Clear the AI query flag
   */
  clearAiQueryFlag() {
    this.needsInteractionStart = false;
  }
}

export const cutsceneOptionsBuffer = new CutsceneOptionsBuffer();
