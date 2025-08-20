import { AbstractPromptStrategy } from '../AbstractPromptStrategy';
import { selectCurrentScene, selectLastLoadedCharacters, selectChatHistory } from '../../../../state/selectors';
import { RootState } from '../../../../state/store';

export class ImageGenerationPromptStrategy extends AbstractPromptStrategy<RootState, string> {
  protected getLabels(): Record<string, Record<string, string>> {
    const labels = {
      en: {
        image_generation_intro:
          'You are an expert visual storyteller that creates detailed, cinematic image prompts for AI image generation.',
        current_scene: 'Current Scene:',
        characters_present: 'Characters Present:',
        recent_dialogue: 'Recent Dialogue:',
        generate_prompt:
          'Create a single, detailed visual description for the current moment in the story. Make it cinematic, descriptive, and suitable for 16:9 format image generation. Focus on the setting, character positions, emotions, and atmosphere.',
        format_instruction:
          'Format the image as 16:9, be cinematic. Include detailed descriptions of lighting, mood, and visual composition.',
        // Example shots
        shot_1_scene: 'A cozy coffee shop in the evening',
        shot_1_characters: 'Emma (cheerful, barista) and Alex (tired, customer)',
        shot_1_dialogue:
          'Emma: "Long day? The usual coffee?" Alex: "Yeah, make it extra strong tonight." Emma: *smiles warmly* "Coming right up! You look like you could use some good news too."',
        shot_1_result:
          'A warm coffee shop interior at golden hour, soft amber lighting streaming through large windows. Emma behind the espresso machine with a genuine smile, wearing a cream apron, steam rising from the coffee cups. Alex sitting at the wooden counter looking tired but grateful, warm lighting casting soft shadows. Cozy atmosphere with books on shelves, plants, and the golden glow of evening light. Format the image as 16:9, be cinematic.',

        shot_2_scene: 'Abandoned warehouse during a thunderstorm',
        shot_2_characters: 'Marcus (determined, detective) and Sarah (frightened, witness)',
        shot_2_dialogue:
          'Marcus: "We need to get out of here, now!" Sarah: "I can\'t... what if they find us?" Marcus: *grabs her hand* "Trust me, I won\'t let anything happen to you."',
        shot_2_result:
          'Dark abandoned warehouse interior during a storm, dramatic lightning flashing through broken windows. Marcus in the foreground reaching protectively toward Sarah, his determined expression lit by intermittent lightning. Sarah in shadow looking scared but trusting, rain visible through damaged roof. Moody atmosphere with deep shadows, wet concrete floors reflecting the lightning, and an sense of urgency. Format the image as 16:9, be cinematic.',

        shot_3_scene: 'School rooftop at sunset',
        shot_3_characters: 'Yuki (melancholic, student)',
        shot_3_dialogue:
          'Yuki: *sits alone with lunch* "Another day... I wonder if anyone would notice if I just disappeared." *looks out at the city* "Everything seems so small from up here."',
        shot_3_result:
          'Lone student sitting on school rooftop edge at sunset, overlooking a sprawling city bathed in golden light. Yuki in school uniform with an untouched lunch beside her, silhouetted against the orange sky. Wind gently moving her hair, city lights beginning to twinkle below. Melancholic atmosphere with warm sunset colors contrasting the loneliness, birds flying in the distance. Format the image as 16:9, be cinematic.',
      },
    };

    return labels;
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: RootState,
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const currentScene = selectCurrentScene(input);
    const currentCharacters = selectLastLoadedCharacters(input);
    const recentMessages = this.getRecentMessages(input, Math.min(memorySize, 10));

    const sceneDescription = currentScene?.prompt || 'Unknown location';
    const charactersInfo = currentCharacters
      .map((char) => {
        const character = input.novel.characters.find((c) => c.id === char.id);
        return character ? `${character.name} (${char.emotion || 'neutral'})` : '';
      })
      .filter(Boolean)
      .join(', ');

    const { BOS, SYSTEM_START, SYSTEM_END, INPUT_START, INPUT_END, OUTPUT_START } = this.instructTemplate;

    let template = `${BOS}${SYSTEM_START}${this.i18n('image_generation_intro')}\n`;
    template += `${SYSTEM_END}`;

    // Add example shots
    template += `${INPUT_START}${this.i18n('current_scene')} ${this.i18n('shot_1_scene')}\n`;
    template += `${this.i18n('characters_present')} ${this.i18n('shot_1_characters')}\n`;
    template += `${this.i18n('recent_dialogue')}\n${this.i18n('shot_1_dialogue')}\n`;
    template += `\n${this.i18n('generate_prompt')}\n`;
    template += `${this.i18n('format_instruction')}\n`;
    template += `${INPUT_END}${OUTPUT_START}${this.i18n('shot_1_result')}\n`;

    template += `${INPUT_START}${this.i18n('current_scene')} ${this.i18n('shot_2_scene')}\n`;
    template += `${this.i18n('characters_present')} ${this.i18n('shot_2_characters')}\n`;
    template += `${this.i18n('recent_dialogue')}\n${this.i18n('shot_2_dialogue')}\n`;
    template += `\n${this.i18n('generate_prompt')}\n`;
    template += `${this.i18n('format_instruction')}\n`;
    template += `${INPUT_END}${OUTPUT_START}${this.i18n('shot_2_result')}\n`;

    template += `${INPUT_START}${this.i18n('current_scene')} ${this.i18n('shot_3_scene')}\n`;
    template += `${this.i18n('characters_present')} ${this.i18n('shot_3_characters')}\n`;
    template += `${this.i18n('recent_dialogue')}\n${this.i18n('shot_3_dialogue')}\n`;
    template += `\n${this.i18n('generate_prompt')}\n`;
    template += `${this.i18n('format_instruction')}\n`;
    template += `${INPUT_END}${OUTPUT_START}${this.i18n('shot_3_result')}\n`;

    // Add the actual current context
    template += `${INPUT_START}${this.i18n('current_scene')} ${sceneDescription}\n`;
    if (charactersInfo) {
      template += `${this.i18n('characters_present')} ${charactersInfo}\n`;
    }
    if (recentMessages) {
      template += `${this.i18n('recent_dialogue')}\n${recentMessages}\n`;
    }
    template += `\n${this.i18n('generate_prompt')}\n`;
    template += `${this.i18n('format_instruction')}\n`;
    template += `${INPUT_END}${OUTPUT_START}`;
    template += `{{GEN image_prompt max_tokens=${maxNewTokens} stop=["\\n\\n", "Format:"]}}`;

    return {
      template,
      variables: {},
      totalTokens: this.countTokens(template) + maxNewTokens,
    };
  }

  public completeResponse(_input: RootState, response: string, variables: Map<string, string>): string {
    return variables.get('image_prompt') || '';
  }

  private getRecentMessages(state: RootState, count: number): string {
    const messages = selectChatHistory(state)
      .slice(-count)
      .map((message) => `${message.name}: ${message.text}`)
      .join('\n');

    return messages;
  }
}
