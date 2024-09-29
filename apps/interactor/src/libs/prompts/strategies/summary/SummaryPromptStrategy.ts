import { EMOTION_GROUP_TEMPLATES } from '@mikugg/bot-utils';
import { AbstractPromptStrategy, fillTextTemplate } from '..';
import {
  selectAllParentDialoguesWhereCharactersArePresent,
  selectCurrentCharacterOutfits,
} from '../../../../state/selectors';
import { RootState } from '../../../../state/store';
import { NarrationInteraction, NarrationResponse } from '../../../../state/versioning';
import { NarrationSummarySentence } from '../../../../state/versioning/v3.state';

const PROMPT_TOKEN_OFFSET = 50;

export class SummaryPromptStrategy extends AbstractPromptStrategy<
  {
    state: RootState;
    characterIds: string[];
  },
  NarrationResponse
> {
  protected getContextPrompt(): string {
    const { BOS, INPUT_START, INPUT_END, OUTPUT_START, OUTPUT_END, SYSTEM_START, SYSTEM_END } = this.instructTemplate;

    let template = `${BOS}${SYSTEM_START}You are an expert expert screenwritter. You task is to summarize a story into sentences extracting the most valuable information to remember.`;
    template += `\nResponse only with CHRONOLOGICAL set of sentences that summarize the story. Include important details, but keep it concise.`;
    template += `\nColorful and intersting details about characters should also be a single sentence.`;
    template += `\nInclude each sentence IMPORTANCE from 1 to 5 in parentheses.`;
    template += `\nExamples: "Chaiki likes to play football (importance=3)" or "Anon and Chaiki visited the park together (importance=2)"`;
    template += `\nONLY give no more than 10 short sentences."`;

    // Shots
    template += `${SYSTEM_END}${INPUT_START}`;
    template += `Nino: *As Nino approaches and see you, blushing slightly, she returns his smile.* Hey, Anon! I'm glad we could have this date today. You're looking great, by the way. *With a mischievous smirk, she leads him towards their destination.* You just wait and see, Anon. I've planned something special for us today. But first, let's enjoy each other's company and make this date unforgettable.\nAnon: what's the plan\nNino's reaction: excited\nNino: *Her eyes sparkle with anticipation as she reveals her plans.* Well, Anon, since you love Japanese culture and cuisine, I thought we'd start at this traditional tea ceremony house nearby. We'll learn the art of preparing matcha tea while dressed in kimonos - it'll be such a romantic setting!\n*She continues enthusiastically,* After that, we'll take a stroll through the picturesque bamboo forest trail. Imagine the rustling leaves and dappled sunlight creating a magical ambiance as we walk hand-in-hand. Then, for dinner, I've reserved a private room at a renowned tempura restaurant overlooking the city lights. We can savor delicious seafood tempura and sake while enjoying the breathtaking view.\n*Nino moves closer, her voice softening.* And finally...if you're up for it, we could end the night at my place for some late-night snacks and cuddles under the stars on my balcony.\nAnon: alright, let go then...\nNino's reaction: happy\nNino: *Beaming with joy, Nino links arms with Anon.* Perfect! I knew you'd appreciate the cultural experiences I planned. Let's begin our adventure!\n*They arrive at the tea ceremony house, where a friendly hostess greets them and helps them change into elegant kimonos. Nino feels giddy wearing the flowing silk garment, its vibrant colors complementing her features.*\n*The hostess guides them to a cozy tatami mat room adorned with delicate flower arrangements. As they sit cross-legged facing each other, Nino watches intently as Anon learns the graceful motions of whisking the green powder into hot water. His concentration is adorable!*\n*After sipping the frothy matcha, Nino leans in close, her breath tickling Anon's ear.* See? Isn't this romantic? Sitting here in these beautiful robes, sharing a moment of tranquility together.\nAnon: what is this unconfortable shit, i don't like it\nNino's reaction: confused\nNino: *Nino tilts her head quizzically, unsure why Anon seems uncomfortable.* What do you mean, Anon? Is everything okay? I thought you would enjoy experiencing a traditional Japanese tea ceremony. The kimono feels a bit strange at first, but it grows on you after a while.\n*She reaches out to gently touch his arm, her brow furrowed with concern.* If you're feeling genuinely uncomfortable though, we don't have to continue. Your comfort is important to me above all else. Perhaps we could try something else instead? There are plenty of other activities we could explore together during our date.\nAnon: nah it's fine. let's go to a grocery store first, i want some water\nNino's reaction: disappointed\nNino: *Nino's face falls slightly, disappointment evident in her expressive features. She takes a deep breath, trying to mask her feelings behind a polite smile.*\nOf course, Anon. Whatever makes you comfortable. A quick trip to the grocery store sounds nice actually. Some refreshments will probably hit the spot after sitting still for the tea ceremony.\n*She gracefully rises from the floor, smoothing down her colorful kimono. With practiced ease, she slips off the wooden geta sandals provided earlier and slides back into her regular shoes. Nino pauses briefly to adjust her obi belt, ensuring the traditional outfit remains neat despite the unexpected detour.*\nLead the way, Anon. I trust you know a good local market. And please, don't hesitate to speak up if anything doesn't suit you. My goal is for us to share a wonderful day together, whatever form that may take.`;
    template += `${INPUT_END}${OUTPUT_START}Summary of the story, in chronologial order, in 4 sentences:\nCHARACTERS: Nino and Anon.\n`;
    template += `Nino and Anon meet up for a pre-planned date in Japan. (importance=3)\nNino and Anon visit a traditional tea ceremony house where they wear kimonos. (importance=2)\nAnon expresses discomfort with kimonos. (importance=2)\nAnon suggests visiting a grocery store. (importance=1)\nNino is disappointed but agrees to go the grocery store. (importance=1)`;
    template += `${OUTPUT_END}${INPUT_START}`;

    return template;
  }

  public template() {
    const { INPUT_START, INPUT_END, OUTPUT_START, OUTPUT_END, STOPS } = this.instructTemplate;
    return {
      askLine: `${INPUT_END}${OUTPUT_START}`,
      instruction: `${OUTPUT_END}${INPUT_START}`,
      response: `${INPUT_END}${OUTPUT_START}`,
      stops: STOPS,
    };
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: {
      state: RootState;
      characterIds: string[];
    },
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const { INPUT_END, OUTPUT_START } = this.instructTemplate;
    const characters = input.state.novel.characters || [];
    const currentCharacters = characters
      .filter((character) => input.characterIds.includes(character.id))
      .map((character) => {
        return {
          id: character.id,
          name: character.name,
        };
      });

    let template = this.getContextPrompt();
    template += this.getDialogueHistoryPrompt(input.state, memorySize, currentCharacters);
    template += `${INPUT_END}${OUTPUT_START}Summary of the story, in chronologial order, in 10 sentences:\nCHARACTERS: ${currentCharacters
      .map((c) => c.name)
      .join(', ')} and ${input.state.settings.user.name}.`;
    for (let i = 0; i < 10; i++) {
      template += `\n{{GEN text_${i} max_tokens=${maxNewTokens} stop=[".","\\n","("]}} (importance={{GEN importance_${i} max_tokens=1 stop=")"}})`;
    }

    template = fillTextTemplate(template, {
      user: input.state.settings.user.name,
      bot: currentCharacters[0].name,
      characters: characters.reduce((prev, { id, card }) => {
        prev[id] = card.data.name;
        return prev;
      }, {} as Record<string, string>),
    });

    const totalTokens = this.countTokens(template) + PROMPT_TOKEN_OFFSET;

    return {
      template,
      variables: {},
      totalTokens,
    };
  }

  public completeResponse(
    _input: {
      state: RootState;
      characterIds: string[];
    },
    response: NarrationResponse,
    variables: Map<string, string>,
  ): NarrationResponse {
    const sentences: NarrationSummarySentence[] = [];
    for (let i = 0; i < 10; i++) {
      const text = variables.get(`text_${i}`);
      const importance = variables.get(`importance_${i}`);
      if (text) {
        sentences.push({
          sentence: text.replace('- ', '').replace('-', ''),
          importance: parseInt(importance || '0', 10),
        });
      }
    }
    return {
      ...response,
      summary: {
        sentences,
      },
    };
  }

  protected getDialogueHistoryPrompt(
    state: RootState,
    maxLines: number,
    currentCharacters?: {
      name: string;
      id: string;
    }[],
  ): string {
    const messages = selectAllParentDialoguesWhereCharactersArePresent(
      state,
      currentCharacters?.map(({ id }) => id) || [],
    );
    let prompt = '';
    for (const message of [...messages].reverse().slice(-maxLines)) {
      prompt += this.getDialogueLine(message);
    }
    return prompt;
  }

  protected getDialogueLine(
    dialog: { type: 'response'; item: NarrationResponse } | { type: 'interaction'; item: NarrationInteraction },
    character?: {
      name: string;
      id: string;
    },
  ): string {
    let prevCharString = '';
    let nextCharString = '';
    let currentCharacterIndex;
    let currentCharacter;
    switch (dialog.type) {
      case 'response':
        currentCharacterIndex = dialog.item.characters.findIndex(({ characterId }) => {
          return character?.id === characterId;
        });
        currentCharacter =
          currentCharacterIndex !== -1
            ? dialog.item.characters[currentCharacterIndex]
            : {
                text: '',
                emotion: '',
                pose: '',
              };
        if (currentCharacterIndex !== -1) {
          prevCharString = dialog.item.characters
            .slice(0, currentCharacterIndex)
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
          nextCharString = dialog.item.characters
            .slice(currentCharacterIndex + 1)
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
        } else {
          prevCharString = dialog.item.characters
            .map(({ text, characterId }) => `{{${characterId}}}: ${text}`)
            .join('\n');
        }
        if (dialog.item.parentInteractionId) {
          return (
            (prevCharString ? prevCharString + '\n' : '') +
            (currentCharacter.text
              ? `{{char}}'s reaction: ${currentCharacter.emotion}\n` + `{{char}}: ${currentCharacter.text}\n`
              : '') +
            (nextCharString ? `${nextCharString}\n` : '')
          );
        } else {
          return (
            (prevCharString ? `${prevCharString}\n` : '') +
            (currentCharacter.text ? `{{char}}: ${currentCharacter.text}\n` : '') +
            '\n' +
            (nextCharString ? `${nextCharString}\n` : '')
          );
        }
      case 'interaction':
        return `{{user}}: ${dialog.item.query}\n`;
    }
  }

  protected getCharacterEmotions(state: RootState, characterId: string): string[] {
    const characters = selectCurrentCharacterOutfits(state);
    const characterEmotions =
      EMOTION_GROUP_TEMPLATES[
        characters.find((character) => character.id === characterId)?.outfit?.template || 'base-emotions'
      ].emotionIds;
    return characterEmotions;
  }
}
