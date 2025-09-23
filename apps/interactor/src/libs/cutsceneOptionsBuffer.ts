import { Dispatch } from '@reduxjs/toolkit';
import { navigateToScene, stopAiQueryAndMarkDisposable } from '../state/slices/narrationSlice';
import { abortCurrentInteraction, getCurrentInteractionAbortController } from './interactionAbortController';
import { store } from '../state/store';
import { NovelV3 } from '@mikugg/bot-utils';

class CutsceneOptionsBuffer {
  private needsInteractionStart: boolean = false;
  private seenCutsceneParts: NovelV3.CutScenePart[] = [];

  /**
   * Change scene using navigateToScene and optionally buffer for AI query
   */
  changeScene(
    dispatch: Dispatch,
    params: {
      sceneId: string;
      isNewScene: boolean;
      bufferInteraction: boolean;
    }
  ) {
    const { sceneId, isNewScene, bufferInteraction } = params;

    // Always dispatch navigateToScene to change the scene
    dispatch(navigateToScene({
      sceneId,
      isNewScene,
    }));

    // Set the flag if AI query is needed
    this.needsInteractionStart = bufferInteraction
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

  /**
   * Append the provided part to the seen list preserving order.
   * Avoids pushing the same instance twice in a row.
   */
  addSeenPart(part: NovelV3.CutScenePart) {
    if (!part) return;
    const last = this.seenCutsceneParts[this.seenCutsceneParts.length - 1];
    if (last === part) return;
    this.seenCutsceneParts.push(part);
  }

  /**
   * Get the seen cutscene parts in the order encountered
   */
  getSeenParts(): NovelV3.CutScenePart[] {
    return this.seenCutsceneParts;
  }

  /**
   * Clear the seen parts buffer
   */
  clearSeenParts() {
    this.seenCutsceneParts = [];
  }
}

export const cutsceneOptionsBuffer = new CutsceneOptionsBuffer();
