import { Dispatch } from '@reduxjs/toolkit';
import { navigateToScene } from '../state/slices/narrationSlice';
import { RootState } from '../state/store';

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
