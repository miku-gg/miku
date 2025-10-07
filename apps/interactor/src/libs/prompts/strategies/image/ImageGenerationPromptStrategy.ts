import { AbstractPromptStrategy } from '..';
import { RootState } from '../../../../state/store';
import { InstructTemplateSlug } from '../instructTemplates';
import {
  selectAvailableSummarySentences,
  selectCurrentScene,
  selectLastLoadedCharacters,
} from '../../../../state/selectors';

const PROMPT_TOKEN_OFFSET = 30;

export class ImageGenerationPromptStrategy extends AbstractPromptStrategy<{ state: RootState }, string> {
  protected getLabels(): Record<string, Record<string, string>> {
    return {
      en: {
        system_intro:
          'You are an expert visual director. Produce a precise, concise image generation description capturing the current story scene.',
        include_scene: 'Current scene setting:',
        include_characters: 'Characters and visible emotions:',
        include_progress: 'Recent story context:',
        style_rules:
          'Avoid text overlays. Keep it coherent with emotions and setting. Use consistent character appearance.',
      },
    };
  }

  constructor(_instructTemplate: InstructTemplateSlug = 'chatml', language: string = 'en') {
    super(_instructTemplate, language, false);
  }

  public buildGuidancePrompt(
    _maxNewTokens: number,
    memorySize: number,
    input: { state: RootState },
  ): { template: string; variables: Record<string, string | string[]>; totalTokens: number } {
    const state = input.state;
    const scene = selectCurrentScene(state);
    const lastCharacters = selectLastLoadedCharacters(state);

    const { BOS, SYSTEM_START, SYSTEM_END, INPUT_START, INPUT_END, OUTPUT_START } = this.instructTemplate;

    let template = `${BOS}${SYSTEM_START}${this.i18n('system_intro')}`;
    template += `\n${this.i18n('style_rules')}`;
    template += `${SYSTEM_END}${INPUT_START}`;

    if (scene) {
      // Prefer inferred scene description if available; fallback to configured prompt
      const sceneDescription = scene.description || scene.prompt || '';
      if (sceneDescription) {
        template += `\n${this.i18n('include_scene')} ${sceneDescription}`;
      }
    }

    if (lastCharacters.length) {
      const charactersLine = lastCharacters
        .map((c) => {
          const name = state.novel.characters.find((ch) => ch.id === c.id)?.name || c.id;
          const emotion = c.emotion ? ` (${c.emotion})` : '';
          return `${name}${emotion}`;
        })
        .join(', ');
      if (charactersLine) {
        template += `\n${this.i18n('include_characters')} ${charactersLine}`;
      }
    }

    // Use summaries to reflect story progression, fitting within memorySize lines
    const characterIds = lastCharacters.map((c) => c.id);
    const summarySentences = selectAvailableSummarySentences(state, characterIds, memorySize);
    if (summarySentences.length) {
      template += `\n${this.i18n('include_progress')}\n- ${summarySentences.join('\n- ')}`;
    }

    template += `${INPUT_END}${OUTPUT_START}`;

    const totalTokens = this.countTokens(template) + PROMPT_TOKEN_OFFSET;

    return { template, variables: {}, totalTokens };
  }

  public completeResponse(_input: { state: RootState }, response: string): string {
    return response;
  }
}
