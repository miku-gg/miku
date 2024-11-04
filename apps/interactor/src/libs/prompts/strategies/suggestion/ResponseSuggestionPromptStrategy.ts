import { AbstractPromptStrategy } from '../AbstractPromptStrategy';
import { selectChatHistory } from '../../../../state/selectors';
import { RootState } from '../../../../state/store';

export class ResponseSuggestionPromptStrategy extends AbstractPromptStrategy<RootState, string[]> {
  protected getLabels(): Record<string, Record<string, string>> {
    const labels = {
      en: {
        writing_assistant_intro:
          'You are a writing assistant that will help you write a story. You suggest replies to a conversation.',
        conversation: 'Conversation:',
        suggest_replies:
          'Suggest 3 possible Smart/Funny/Flirty replies from % to continue the conversation. They MUST BE ONE SENTENCE EACH.',
        smart_reply: 'Smart Reply: %: "%"',
        funny_reply: 'Funny Reply: %: "%"',
        flirty_reply: 'Flirty Reply: %: "%"',
      },
      es: {
        writing_assistant_intro:
          'Eres un asistente de escritura que ayudará a escribir una historia. Sugieres respuestas a una conversación. Las respuestas deben estar en español argentino.',
        conversation: 'Conversación:',
        suggest_replies:
          'Sugiere 3 posibles respuestas Inteligentes/Divertidas/Coquetas de % para continuar la conversación. DEBEN SER DE UNA SOLA FRASE CADA UNA.',
        smart_reply: 'Respuesta Inteligente: %: "%"',
        funny_reply: 'Respuesta Divertida: %: "%"',
        flirty_reply: 'Respuesta Coqueta: %: "%"',
      },
      es_es: {
        writing_assistant_intro:
          'Eres un asistente de escritura que ayudará a escribir una historia. Sugieres respuestas a una conversación.',
        conversation: 'Conversación:',
        suggest_replies:
          'Sugiere 3 posibles respuestas Inteligentes/Divertidas/Coquetas de % para continuar la conversación. DEBEN SER DE UNA SOLA FRASE CADA UNA.',
        smart_reply: 'Respuesta Inteligente: %: "%"',
        funny_reply: 'Respuesta Divertida: %: "%"',
        flirty_reply: 'Respuesta Coqueta: %: "%"',
      },
      es_ar: {
        writing_assistant_intro:
          'Sos un asistente de escritura que va a ayudar a escribir una historia. Sugerís respuestas a una conversación.',
        conversation: 'Conversación:',
        suggest_replies:
          'Sugerí 3 posibles respuestas Inteligentes/Divertidas/Coquetas de % para continuar la conversación. TIENEN QUE SER DE UNA SOLA FRASE CADA UNA.',
        smart_reply: 'Respuesta Inteligente: %: "%"',
        funny_reply: 'Respuesta Divertida: %: "%"',
        flirty_reply: 'Respuesta Coqueta: %: "%"',
      },
      es_cl: {
        writing_assistant_intro:
          'Eres un asistente de escritura que ayudará a escribir una historia. Sugieres respuestas a una conversación.',
        conversation: 'Conversación:',
        suggest_replies:
          'Sugiere 3 posibles respuestas Inteligentes/Divertidas/Coquetas de % para continuar la conversación. DEBEN SER DE UNA SOLA FRASE CADA UNA.',
        smart_reply: 'Respuesta Inteligente: %: "%"',
        funny_reply: 'Respuesta Divertida: %: "%"',
        flirty_reply: 'Respuesta Coqueta: %: "%"',
      },
      pt: {
        writing_assistant_intro:
          'Você é um assistente de escrita que ajudará a escrever uma história. Você sugere respostas para uma conversa.',
        conversation: 'Conversa:',
        suggest_replies:
          'Sugira 3 possíveis respostas Inteligentes/Engraçadas/Flertantes de % para continuar a conversa. DEVEM SER DE UMA ÚNICA FRASE CADA.',
        smart_reply: 'Resposta Inteligente: %: "%"',
        funny_reply: 'Resposta Engraçada: %: "%"',
        flirty_reply: 'Resposta Flertante: %: "%"',
      },
      pt_br: {
        writing_assistant_intro:
          'Você é um assistente de escrita que ajudará a escrever uma história. Você sugere respostas para uma conversa.',
        conversation: 'Conversa:',
        suggest_replies:
          'Sugira 3 possíveis respostas Inteligentes/Engraçadas/Flertantes de % para continuar a conversa. DEVEM SER DE UMA ÚNICA FRASE CADA.',
        smart_reply: 'Resposta Inteligente: %: "%"',
        funny_reply: 'Resposta Engraçada: %: "%"',
        flirty_reply: 'Resposta Flertante: %: "%"',
      },
      fr: {
        writing_assistant_intro:
          "Vous êtes un assistant d'écriture qui aidera à écrire une histoire. Vous suggérez des réponses à une conversation.",
        conversation: 'Conversation :',
        suggest_replies:
          "Suggérez 3 réponses possibles Intelligentes/Drôles/Séduisantes de % pour continuer la conversation. ELLES DOIVENT ÊTRE D'UNE SEULE PHRASE CHACUNE.",
        smart_reply: 'Réponse Intelligente : %: "%"',
        funny_reply: 'Réponse Drôle : %: "%"',
        flirty_reply: 'Réponse Séduisante : %: "%"',
      },
      de: {
        writing_assistant_intro:
          'Sie sind ein Schreibassistent, der beim Schreiben einer Geschichte hilft. Sie schlagen Antworten für ein Gespräch vor.',
        conversation: 'Gespräch:',
        suggest_replies:
          'Schlagen Sie 3 mögliche Intelligente/Lustige/Flirtende Antworten von % vor, um das Gespräch fortzusetzen. SIE MÜSSEN JEWEILS AUS EINEM EINZIGEN SATZ BESTEHEN.',
        smart_reply: 'Intelligente Antwort: %: "%"',
        funny_reply: 'Lustige Antwort: %: "%"',
        flirty_reply: 'Flirtende Antwort: %: "%"',
      },
      ru: {
        writing_assistant_intro:
          'Вы - помощник по написанию, который поможет написать историю. Вы предлагаете ответы на разговор.',
        conversation: 'Разговор:',
        suggest_replies:
          'Предложите 3 возможных Умных/Забавных/Флиртующих ответа от %, чтобы продолжить разговор. ОНИ ДОЛЖНЫ БЫТЬ ПО ОДНОМУ ПРЕДЛОЖЕНИЮ КАЖДЫЙ.',
        smart_reply: 'Умный ответ: %: "%"',
        funny_reply: 'Забавный ответ: %: "%"',
        flirty_reply: 'Флиртующий ответ: %: "%"',
      },
      jp: {
        writing_assistant_intro: 'あなたは物語を書くのを助ける執筆アシスタントです。会話への返答を提案します。',
        conversation: '会話：',
        suggest_replies:
          '%からの賢い/面白い/フリートな返答を3つ提案して会話を続けてください。それぞれ1文でなければなりません。',
        smart_reply: '賢い返答：%："%"',
        funny_reply: '面白い返答：%："%"',
        flirty_reply: 'フリートな返答：%："%"',
      },
    };

    return labels;
  }

  // Removed the i18n method since it's now inherited from AbstractPromptStrategy.

  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: RootState,
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const personas = Object.values(input.novel.characters)
      .map((character) => character?.card?.data?.description || '')
      .filter(Boolean)
      .join('\n');
    const messages = this.getMessagesPrompt(input, memorySize);
    const { BOS, SYSTEM_START, SYSTEM_END, INPUT_START, INPUT_END, OUTPUT_START } = this.instructTemplate;

    let template = `${BOS}${SYSTEM_START}${this.i18n('writing_assistant_intro')}\n`;
    template += `\n${personas}\n${this.i18n('conversation')}\n${messages}`;
    template += `${SYSTEM_END}${INPUT_START}`;
    template += `${this.i18n('suggest_replies', [input.settings.user.name])}\n`;
    template += `${INPUT_END}${OUTPUT_START}`;
    template += `${this.i18n('smart_reply', [
      input.settings.user.name,
      `{{GEN smart max_tokens=${maxNewTokens} stop=["\\"", "\\n"]}}`,
    ])}\n`;
    template += `${this.i18n('funny_reply', [
      input.settings.user.name,
      `{{GEN funny max_tokens=${maxNewTokens} stop=["\\"", "\\n"]}}`,
    ])}\n`;
    template += `${this.i18n('flirty_reply', [
      input.settings.user.name,
      `{{GEN flirt max_tokens=${maxNewTokens} stop=["\\"", "\\n"]}}`,
    ])}\n`;

    return {
      template,
      variables: {},
      totalTokens: this.countTokens(template) + maxNewTokens * 3,
    };
  }

  public completeResponse(_input: RootState, response: string[], variables: Map<string, string>): string[] {
    response[0] = variables.get('smart') || '';
    response[1] = variables.get('funny') || '';
    response[2] = variables.get('flirt') || '';
    return response;
  }

  public getMessagesPrompt(state: RootState, memorySize: number): string {
    const messages = selectChatHistory(state)
      .filter((_, index) => index < memorySize)
      .map((message) => `${message.name}: ${message.text}`)
      .reverse()
      .join('\n');

    return messages;
  }
}
