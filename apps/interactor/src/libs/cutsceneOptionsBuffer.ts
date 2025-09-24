import { Dispatch } from '@reduxjs/toolkit';
import { navigateToScene, stopAiQueryAndMarkDisposable } from '../state/slices/narrationSlice';
import { abortCurrentInteraction, getCurrentInteractionAbortController } from './interactionAbortController';
import { store } from '../state/store';
import { NovelV3 } from '@mikugg/bot-utils';

class CutsceneOptionsBuffer {
  private needsInteractionStart: boolean = false;
  private cutsceneBuffer: string[] = [];

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
   * Save the cutscene parts data in a buffer and player's selection for prompting
   */
  addToCutsceneBuffer(part: NovelV3.CutScenePart, index: number) {
    if(!part || !part.text || part.text.length - 1 < index) return;
    const textPart = part.text[index];
    let promptText: string = '';
    switch (textPart.type) {
      case 'description':
        promptText = `*${textPart.content}*`;
        break;
      case 'dialogue':
        promptText = `"${textPart.content}"`;
        break;
    }
    this.cutsceneBuffer.push(promptText);
  }

  /**
   * Add the player's option choice in the cutscene buffer
   */
  addPlayerChoice(option: NovelV3.CutSceneOption) {
    if(!option || !option.prompt) return;
    this.cutsceneBuffer.push(option.prompt);
  }

  /**
   * Get the cutscene buffer
   */
  getCutsceneBuffer() {
    return this.cutsceneBuffer;
  }

  /**
   * Clear the cutscene buffer
   */
  clearCutsceneBuffer() {

  }
}

export const cutsceneOptionsBuffer = new CutsceneOptionsBuffer();
