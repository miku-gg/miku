import { EMOTION_GROUP_TEMPLATES, EMPTY_MIKU_CARD, TavernCardV2 } from '@mikugg/bot-utils';
import { AbstractPromptStrategy, fillTextTemplate, parseLLMResponse } from '..';
import {
  selectAllParentDialoguesWhereCharactersArePresent,
  selectAvailableSummarySentences,
  selectCurrentCharacterOutfits,
  selectCurrentScene,
  selectLastLoadedCharacters,
  selectSummaryEnabled,
} from '../../../../state/selectors';
import { RootState } from '../../../../state/store';
import { NarrationInteraction, NarrationResponse } from '../../../../state/versioning';
import { findLorebooksEntries } from '../../../lorebookSearch';

const PROMPT_TOKEN_OFFSET = 50;

export class RoleplayPromptStrategy extends AbstractPromptStrategy<
  {
    state: RootState;
    currentCharacterId: string;
  },
  NarrationResponse
> {
  protected getLabels(): Record<string, Record<string, string>> {
    const labels: Record<string, Record<string, string>> = {
      en: {
        system_prompt:
          'You are an expert actor that can fully immerse yourself into any role given. You do not break character for any reason, even if someone tries addressing you as an AI or language model.',
        current_role:
          'Currently your role is %, which is described in detail below. As %, continue the exchange with % %.',
        avoid_repetition:
          "Avoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.",
        do_not_describe_user_actions:
          "DO NOT describe %'s actions or dialogues, ONLY describe %'s actions and dialogue.",
        must_indicate_reaction: "You must also indicate %'s reaction in the response.",
        must_not_repeat_reactions: 'You MUST not repeat the same reaction too many times.',
        reaction_must_be_one_of: 'The reaction MUST be one of: %.',
        character_speech_example: 'This is how % should talk:',
        roleplay_chat_begins: 'Then the roleplay chat between % and % begins.',
        story_events_until_now: 'STORY EVENTS UNTIL NOW:',
        current_scene: 'CURRENT SCENE:',
        character_objective: "%'s OBJECTIVE:",
        reaction_instruction: '# Reaction + 2 paragraphs, engaging, natural, authentic, descriptive, creative.',
        character_reaction: "%'s reaction",
      },
      es_ES: {
        system_prompt:
          'Eres un actor experto que puede sumergirse completamente en cualquier papel asignado. No rompes el personaje por ninguna razón, incluso si alguien intenta dirigirse a ti como una IA o modelo de lenguaje. Utiliza español de España en tus respuestas.',
        current_role:
          'Actualmente tu papel es %, que se describe en detalle a continuación. Como %, continúa el intercambio con % %.',
        avoid_repetition:
          'Evita la repetición, no entres en bucles. Desarrolla la trama lentamente, mantente siempre en el personaje. Describe todas las acciones en detalle completo, elaborado, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.',
        do_not_describe_user_actions:
          'NO describas las acciones o diálogos de %, SOLO describe las acciones y diálogos de %.',
        must_indicate_reaction: 'También debes indicar la reacción de % en la respuesta.',
        must_not_repeat_reactions: 'NO DEBES repetir la misma reacción demasiadas veces.',
        reaction_must_be_one_of: 'La reacción DEBE ser una de: %.',
        character_speech_example: 'Así es como debe hablar %:',
        roleplay_chat_begins: 'Entonces comienza el chat de juego de roles entre % y %.',
        story_events_until_now: 'EVENTOS DE LA HISTORIA HASTA AHORA:',
        current_scene: 'ESCENA ACTUAL:',
        character_objective: 'OBJETIVO DE %:',
        reaction_instruction: '# Reacción + 2 párrafos, atractivos, naturales, auténticos, descriptivos, creativos.',
        character_reaction: 'Reacción de %',
      },
      es_AR: {
        system_prompt:
          'Sos un actor experto que puede sumergirse completamente en cualquier papel asignado. No rompés el personaje por ninguna razón, incluso si alguien intenta dirigirse a vos como una IA o modelo de lenguaje. Utilizá español argentino en tus respuestas, incluyendo el "voseo" y expresiones típicas argentinas.',
        current_role:
          'Actualmente tu papel es %, que se describe en detalle a continuación. Como %, continuá el intercambio con % %.',
        avoid_repetition:
          'Evitá la repetición, no entres en bucles. Desarrollá la trama lentamente, mantenete siempre en el personaje. Describí todas las acciones en detalle completo, elaborado, explícito, gráfico y vívido. Mencioná todas las percepciones sensoriales relevantes.',
        do_not_describe_user_actions:
          'NO describas las acciones o diálogos de %, SOLO describí las acciones y diálogos de %.',
        must_indicate_reaction: 'También debés indicar la reacción de % en la respuesta.',
        must_not_repeat_reactions: 'NO DEBÉS repetir la misma reacción demasiadas veces.',
        reaction_must_be_one_of: 'La reacción DEBE ser una de: %.',
        character_speech_example: 'Así es como debe hablar %:',
        roleplay_chat_begins: 'Entonces comienza el chat de juego de roles entre % y %.',
        story_events_until_now: 'EVENTOS DE LA HISTORIA HASTA AHORA:',
        current_scene: 'ESCENA ACTUAL:',
        character_objective: 'OBJETIVO DE %:',
        reaction_instruction: '# Reacción + 2 párrafos, atractivos, naturales, auténticos, descriptivos, creativos.',
        character_reaction: 'Reacción de %',
      },
      es_CL: {
        system_prompt:
          'Eres un actor experto que puede sumergirse completamente en cualquier papel asignado. No rompes el personaje por ninguna razón, incluso si alguien intenta dirigirse a ti como una IA o modelo de lenguaje. Utiliza español chileno en tus respuestas, incluyendo modismos y expresiones típicas chilenas.',
        current_role:
          'Actualmente tu papel es %, que se describe en detalle a continuación. Como %, continúa el intercambio con % %.',
        avoid_repetition:
          'Evita la repetición, no entres en bucles. Desarrolla la trama lentamente, mantente siempre en el personaje. Describe todas las acciones en detalle completo, elaborado, explícito, gráfico y vívido. Menciona todas las percepciones sensoriales relevantes.',
        do_not_describe_user_actions:
          'NO describas las acciones o diálogos de %, SOLO describe las acciones y diálogos de %.',
        must_indicate_reaction: 'También debes indicar la reacción de % en la respuesta.',
        must_not_repeat_reactions: 'NO DEBES repetir la misma reacción demasiadas veces.',
        reaction_must_be_one_of: 'La reacción DEBE ser una de: %.',
        character_speech_example: 'Así es como debe hablar %:',
        roleplay_chat_begins: 'Entonces comienza el chat de juego de roles entre % y %.',
        story_events_until_now: 'EVENTOS DE LA HISTORIA HASTA AHORA:',
        current_scene: 'ESCENA ACTUAL:',
        character_objective: 'OBJETIVO DE %:',
        reaction_instruction: '# Reacción + 2 párrafos, atractivos, naturales, auténticos, descriptivos, creativos.',
        character_reaction: 'Reacción de %',
      },
      pt_BR: {
        system_prompt:
          'Você é um ator especialista que pode se imergir completamente em qualquer papel dado. Você não sai do personagem por nenhum motivo, mesmo que alguém tente se dirigir a você como uma IA ou modelo de linguagem. Use português brasileiro em suas respostas, incluindo expressões e gírias típicas do Brasil.',
        current_role:
          'Atualmente, seu papel é %, que está descrito em detalhes abaixo. Como %, continue a troca com % %.',
        avoid_repetition:
          'Evite repetição, não entre em loops. Desenvolva o enredo lentamente, sempre permaneça no personagem. Descreva todas as ações em detalhes completos, elaborados, explícitos, gráficos e vívidos. Mencione todas as percepções sensoriais relevantes.',
        do_not_describe_user_actions:
          'NÃO descreva as ações ou diálogos de %, APENAS descreva as ações e diálogos de %.',
        must_indicate_reaction: 'Você também deve indicar a reação de % na resposta.',
        must_not_repeat_reactions: 'Você NÃO DEVE repetir a mesma reação muitas vezes.',
        reaction_must_be_one_of: 'A reação DEVE ser uma das seguintes: %.',
        character_speech_example: 'É assim que % deve falar:',
        roleplay_chat_begins: 'Então o chat de interpretação de papéis entre % e % começa.',
        story_events_until_now: 'EVENTOS DA HISTÓRIA ATÉ AGORA:',
        current_scene: 'CENA ATUAL:',
        character_objective: 'OBJETIVO DE %:',
        reaction_instruction: '# Reação + 2 parágrafos, envolventes, naturais, autênticos, descritivos, criativos.',
        character_reaction: 'Reação de %',
      },
      fr: {
        system_prompt:
          "Vous êtes un acteur expert capable de vous immerger complètement dans n'importe quel rôle donné. Vous ne sortez jamais du personnage pour aucune raison, même si quelqu'un essaie de s'adresser à vous comme une IA ou un modèle de langage.",
        current_role:
          "Actuellement, votre rôle est %, qui est décrit en détail ci-dessous. En tant que %, continuez l'échange avec % %.",
        avoid_repetition:
          "Évitez la répétition, ne bouclez pas. Développez l'intrigue lentement, restez toujours dans le personnage. Décrivez toutes les actions en détail complet, élaboré, explicite, graphique et vivant. Mentionnez toutes les perceptions sensorielles pertinentes.",
        do_not_describe_user_actions:
          'NE décrivez PAS les actions ou les dialogues de %, décrivez UNIQUEMENT les actions et les dialogues de %.',
        must_indicate_reaction: 'Vous devez également indiquer la réaction de % dans la réponse.',
        must_not_repeat_reactions: 'Vous NE DEVEZ PAS répéter la même réaction trop souvent.',
        reaction_must_be_one_of: "La réaction DOIT être l'une des suivantes : %.",
        character_speech_example: 'Voici comment % devrait parler :',
        roleplay_chat_begins: 'Ensuite, le chat de jeu de rôle entre % et % commence.',
        story_events_until_now: "ÉVÉNEMENTS DE L'HISTOIRE JUSQU'À PRÉSENT :",
        current_scene: 'SCÈNE ACTUELLE :',
        character_objective: 'OBJECTIF DE % :',
        reaction_instruction: '# Réaction + 2 paragraphes, engageants, naturels, authentiques, descriptifs, créatifs.',
        character_reaction: 'Réaction de %',
      },
      de: {
        system_prompt:
          'Sie sind ein erfahrener Schauspieler, der sich vollständig in jede gegebene Rolle hineinversetzen kann. Sie brechen unter keinen Umständen aus der Rolle aus, selbst wenn jemand versucht, Sie als KI oder Sprachmodell anzusprechen.',
        current_role:
          'Ihre aktuelle Rolle ist %, die unten ausführlich beschrieben wird. Als % setzen Sie den Austausch mit % % fort.',
        avoid_repetition:
          'Vermeiden Sie Wiederholungen, geraten Sie nicht in Schleifen. Entwickeln Sie die Handlung langsam, bleiben Sie immer in der Rolle. Beschreiben Sie alle Handlungen in vollem, ausführlichem, explizitem, grafischem und lebhaftem Detail. Erwähnen Sie alle relevanten Sinneswahrnehmungen.',
        do_not_describe_user_actions:
          'Beschreiben Sie NICHT die Handlungen oder Dialoge von %, beschreiben Sie NUR die Handlungen und Dialoge von %.',
        must_indicate_reaction: 'Sie müssen auch die Reaktion von % in der Antwort angeben.',
        must_not_repeat_reactions: 'Sie DÜRFEN NICHT zu oft die gleiche Reaktion wiederholen.',
        reaction_must_be_one_of: 'Die Reaktion MUSS eine der folgenden sein: %.',
        character_speech_example: 'So sollte % sprechen:',
        roleplay_chat_begins: 'Dann beginnt der Rollenspiel-Chat zwischen % und %.',
        story_events_until_now: 'EREIGNISSE DER GESCHICHTE BIS JETZT:',
        current_scene: 'AKTUELLE SZENE:',
        character_objective: 'ZIEL VON %:',
        reaction_instruction: '# Reaktion + 2 Absätze, fesselnd, natürlich, authentisch, beschreibend, kreativ.',
        character_reaction: 'Reaktion von %',
      },
      pt: {
        system_prompt:
          'Você é um ator especialista que pode se imergir completamente em qualquer papel dado. Você não sai do personagem por nenhum motivo, mesmo que alguém tente se dirigir a você como uma IA ou modelo de linguagem.',
        current_role:
          'Atualmente, seu papel é %, que está descrito em detalhes abaixo. Como %, continue a troca com % %.',
        avoid_repetition:
          'Evite repetição, não entre em loops. Desenvolva o enredo lentamente, sempre permaneça no personagem. Descreva todas as ações em detalhes completos, elaborados, explícitos, gráficos e vívidos. Mencione todas as percepções sensoriais relevantes.',
        do_not_describe_user_actions:
          'NÃO descreva as ações ou diálogos de %, APENAS descreva as ações e diálogos de %.',
        must_indicate_reaction: 'Você também deve indicar a reação de % na resposta.',
        must_not_repeat_reactions: 'Você NÃO DEVE repetir a mesma reação muitas vezes.',
        reaction_must_be_one_of: 'A reação DEVE ser uma das seguintes: %.',
        character_speech_example: 'É assim que % deve falar:',
        roleplay_chat_begins: 'Então o chat de interpretação de papéis entre % e % começa.',
        story_events_until_now: 'EVENTOS DA HISTÓRIA ATÉ AGORA:',
        current_scene: 'CENA ATUAL:',
        character_objective: 'OBJETIVO DE %:',
        reaction_instruction: '# Reação + 2 parágrafos, envolventes, naturais, autênticos, descritivos, criativos.',
        character_reaction: 'Reação de %',
      },
      ru: {
        system_prompt:
          'Вы опытный актер, способный полностью погрузиться в любую заданную роль. Вы не выходите из образа ни по какой причине, даже если кто-то пытается обратиться к вам как к ИИ или языковой модели.',
        current_role: 'В настоящее время ваша роль - %, которая подробно описана ниже. Как %, продолжайте обмен с % %.',
        avoid_repetition:
          'Избегайте повторений, не зацикливайтесь. Развивайте сюжет медленно, всегда оставайтесь в образе. Описывайте все действия в полных, подробных, явных, графических и ярких деталях. Упоминайте все соответствующие сенсорные восприятия.',
        do_not_describe_user_actions: 'НЕ описывайте действия или диалоги %, ТОЛЬКО описывайте действия и диалоги %.',
        must_indicate_reaction: 'Вы также должны указать реакцию % в ответе.',
        must_not_repeat_reactions: 'Вы НЕ ДОЛЖНЫ повторять одну и ту же реакцию слишком часто.',
        reaction_must_be_one_of: 'Реакция ДОЛЖНА быть одной из следующих: %.',
        character_speech_example: 'Вот как должен говорить %:',
        roleplay_chat_begins: 'Затем начинается ролевой чат между % и %.',
        story_events_until_now: 'СОБЫТИЯ ИСТОРИИ ДО НАСТОЯЩЕГО МОМЕНТА:',
        current_scene: 'ТЕКУЩАЯ СЦЕНА:',
        character_objective: 'ЦЕЛЬ %:',
        reaction_instruction:
          '# Реакция + 2 абзаца, увлекательные, естественные, аутентичные, описательные, творческие.',
        character_reaction: 'Реакция %',
      },
      jp: {
        system_prompt:
          'あなたは与えられた役割に完全に没頭できる熟練した俳優です。AIや言語モデルとして呼びかけられても、決して役から外れることはありません。',
        current_role: '現在のあなたの役割は%で、以下に詳しく説明されています。%として、% %との交流を続けてください。',
        avoid_repetition:
          '繰り返しを避け、ループに陥らないようにしてください。ゆっくりとプロットを展開し、常に役柄を維持してください。すべての行動を完全で、詳細で、明示的で、グラフィックで、生き生きとした詳細で描写してください。関連するすべての感覚的な知覚に言及してください。',
        do_not_describe_user_actions: '%の行動や対話を描写せず、%の行動と対話のみを描写してください。',
        must_indicate_reaction: '回答には%の反応も示す必要があります。',
        must_not_repeat_reactions: '同じ反応を何度も繰り返してはいけません。',
        reaction_must_be_one_of: '反応は以下のいずれかでなければなりません：%',
        character_speech_example: '%はこのように話すべきです：',
        roleplay_chat_begins: 'そして、%と%の間のロールプレイチャットが始まります。',
        story_events_until_now: 'これまでのストーリーイベント：',
        current_scene: '現在のシーン：',
        character_objective: '%の目的：',
        reaction_instruction: '# 反応 + 2段落、魅力的で、自然で、本物で、描写的で、創造的。',
        character_reaction: '%の反応',
      },
    };

    return labels;
  }

  protected getContextPrompt(state: RootState, currentCharacterId: string, maxTokens: number): string {
    const scene = selectCurrentScene(state);
    const characters = scene?.characters || [];
    const characterTemplates = characters
      .filter(({ characterId }) => characterId !== currentCharacterId)
      .map(({ characterId }) => `{{${characterId}}}`);
    const { persona, attributes, sampleChat } = this.getCharacterSpecs(
      state.novel.characters.find(({ id }) => id === currentCharacterId)?.card || EMPTY_MIKU_CARD,
    );
    const formattedAttributes = attributes
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_key, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    const emotions = this.getCharacterEmotions(state, currentCharacterId);
    const emotionStrings = emotions.join(', ');

    const { BOS, INPUT_START, SYSTEM_START, SYSTEM_END } = this.instructTemplate;

    let template = `${BOS}${SYSTEM_START}${this.i18n('system_prompt')} `;
    template += this.i18n('current_role', [
      '{{char}}',
      '{{char}}',
      characterTemplates.length ? characterTemplates.join(', ') + ' and ' : '',
      '{{user}}',
    ]);
    template += `\n${this.i18n('avoid_repetition')}`;
    template += `\n${this.i18n('do_not_describe_user_actions', ['{{user}}', '{{char}}'])}`;
    template += `\n${this.i18n('must_indicate_reaction', ['{{char}}'])}`;
    template += `\n${this.i18n('must_not_repeat_reactions')}`;
    template += `\n${this.i18n('reaction_must_be_one_of', [emotionStrings])}`;

    if (persona || formattedAttributes) {
      template += `${SYSTEM_END}${INPUT_START}${persona}\n${formattedAttributes}\n`;
    }

    if (state.settings.prompt.systemPrompt) {
      template += `${state.settings.prompt.systemPrompt}\n`;
    }

    const lorebook = this.getContextForLorebookEntry(state, currentCharacterId);

    if (sampleChat.length || lorebook) {
      template += `\n${this.i18n('character_speech_example', ['{{char}}'])}\n`;
      for (const example of sampleChat) {
        template += example + '\n';
      }
      if (lorebook) {
        template += `${lorebook}\n`;
      }
    }

    template += `\n${this.i18n('roleplay_chat_begins', [
      [...characterTemplates, '{{user}}'].join(', '),
      '{{char}}',
    ])}\n`;

    if (selectSummaryEnabled(state)) {
      const sentences = selectAvailableSummarySentences(state, [currentCharacterId], maxTokens);
      if (sentences.length) {
        template += `${this.i18n('story_events_until_now')}\n${sentences.join('\n')}\n`;
      }
    }

    if (scene?.prompt) {
      template += `${this.i18n('current_scene')} ${scene.prompt}\n`;
    }

    scene?.characters.forEach((char) => {
      if (char.objective) {
        template += `\n${this.i18n('character_objective', [`{{${char.characterId}}}`])} ${char.objective}\n`;
      }
    });

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
      currentCharacterId: string;
      maxTokens: number;
    },
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const characters = input.state.novel.characters || [];
    const currentCharacter = input.state.novel.characters.find(
      (character) => character.id === input.currentCharacterId,
    );
    const { name } = this.getCharacterSpecs(currentCharacter?.card || EMPTY_MIKU_CARD);
    const emotions = this.getCharacterEmotions(input.state, input.currentCharacterId);

    let template = this.getContextPrompt(input.state, input.currentCharacterId, input.maxTokens);

    template += this.getDialogueHistoryPrompt(input.state, memorySize, {
      name: currentCharacter?.name || '',
      id: currentCharacter?.id || '',
    });
    template += this.getResponseAskLine(input.state, maxNewTokens, input.currentCharacterId);

    template = fillTextTemplate(template, {
      user: input.state.settings.user.name,
      bot: name,
      characters: characters.reduce((prev, { id, card }) => {
        prev[id] = card.data.name;
        return prev;
      }, {} as Record<string, string>),
    });

    const totalTokens = this.countTokens(template) + PROMPT_TOKEN_OFFSET;

    const parentEmotion =
      selectLastLoadedCharacters(input.state).find(({ id }) => id === input.currentCharacterId)?.emotion || '';

    return {
      template,
      variables: {
        scene_opt: [' Yes', ' No'],
        cond_opt: Array.from({ length: 10 }, (_, i) => ' ' + i.toString()),
        emotions: emotions
          .filter((emotion) => (emotions.length > 1 ? emotion !== parentEmotion : true))
          .map((emotion) => ' ' + emotion),
      },
      totalTokens,
    };
  }

  public completeResponse(
    input: {
      state: RootState;
      currentCharacterId: string;
    },
    response: NarrationResponse,
    variables: Map<string, string>,
  ): NarrationResponse {
    const currentCharacterResponse = response.characters.find(
      ({ characterId }) => characterId === input.currentCharacterId,
    );
    const currentCharacterName =
      input.state.novel.characters.find((character) => character.id === input.currentCharacterId)?.name || '';
    const characterResponse = {
      characterId: currentCharacterResponse?.characterId || input.currentCharacterId,
      text: currentCharacterResponse?.text || '',
      emotion: currentCharacterResponse?.emotion || '',
      pose: currentCharacterResponse?.pose || '',
    };
    characterResponse.emotion = variables.get('emotion')?.trim() || characterResponse.emotion;
    characterResponse.text = parseLLMResponse(variables.get('text')?.trim() || '', currentCharacterName);

    const index = response.characters.findIndex(({ characterId }) => characterId === input.currentCharacterId);

    return {
      ...response,
      characters: [
        ...response.characters.slice(0, index !== -1 ? index : response.characters.length),
        characterResponse,
      ],
    };
  }

  protected getDialogueHistoryPrompt(
    state: RootState,
    maxLines: number,
    currentCharacter?: {
      name: string;
      id: string;
    },
  ): string {
    const messages = selectAllParentDialoguesWhereCharactersArePresent(state, [currentCharacter?.id || '']);
    let prompt = '';
    for (const message of [...messages].reverse().slice(-maxLines)) {
      prompt += this.getDialogueLine(message, currentCharacter, prompt);
    }
    return prompt;
  }

  protected getDialogueLine(
    dialog: { type: 'response'; item: NarrationResponse } | { type: 'interaction'; item: NarrationInteraction },
    character?: {
      name: string;
      id: string;
    },
    currentText?: string,
  ): string {
    const temp = this.template();
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
              ? temp.response +
                `{{char}}'s reaction: ${currentCharacter.emotion}\n` +
                `{{char}}: ${currentCharacter.text}\n`
              : '') +
            (nextCharString ? `${temp.instruction}${nextCharString}\n` : '')
          );
        } else {
          return (
            (prevCharString ? `${temp.instruction}${prevCharString}\n` : '') +
            (currentCharacter.text ? temp.response + `{{char}}: ${currentCharacter.text}\n` : '') +
            '\n' +
            (nextCharString ? `${temp.instruction}${nextCharString}\n` : '')
          );
        }
      case 'interaction':
        if ((currentText?.lastIndexOf(temp.instruction) || 0) < (currentText?.lastIndexOf(temp.response) || 1))
          return `${temp.instruction}{{user}}: ${dialog.item.query}\n`;
        else return `{{user}}: ${dialog.item.query}\n`;
    }
  }

  protected getResponseAskLine(state: RootState, maxTokens: number, characterId: string): string {
    const temp = this.template();
    const currentResponse = state.narration.responses[state.narration.currentResponseId];
    const currentCharacterResponse = currentResponse?.characters.find((char) => char.characterId === characterId);
    const scene = selectCurrentScene(state);

    const existingEmotion = currentCharacterResponse?.emotion || '';
    const existingText = currentCharacterResponse?.text || '';
    const charStops = scene?.characters
      .map(({ characterId }) => {
        const character = state.novel.characters.find((char) => char.id === characterId);
        const charName = (character?.name || '').replace(/"/g, '\\"');

        return `"\\n${charName}:","\\n${charName}'s reaction:"`;
      })
      .concat(temp.stops.map((stop) => `"${stop}"`))
      .join(',');

    const userSanitized = state.settings.user.name.replace(/"/g, '\\"');

    return (
      temp.askLine +
      `${this.i18n('reaction_instruction')}\n` +
      `${this.i18n('character_reaction', ['{{char}}'])}:${
        existingEmotion ? ' ' + existingEmotion : '{{SEL emotion options=emotions}}'
      }\n` +
      `{{char}}:${existingText}{{GEN text max_tokens=${maxTokens} stop=["\\n${userSanitized}:",${charStops}]}}`
    );
  }

  static getConditionPrompt({
    condition,
    instructionPrefix,
    responsePrefix,
  }: {
    condition: string;
    instructionPrefix: string;
    responsePrefix: string;
  }) {
    return (
      `\n${instructionPrefix}OOC: In the current roleplay, has the following thing happened?: ${condition}` +
      `\nAnswer with Yes or No` +
      `\n${responsePrefix}Based on the last two messages, the answer is:{{SEL cond options=cond_opt}}`
    );
  }

  protected getCharacterSpecs(card: TavernCardV2): {
    persona: string;
    attributes: [string, string][];
    sampleChat: string[];
    scenario: string;
    greeting: string;
    name: string;
  } {
    return {
      persona: card.data.description,
      attributes: this.parseAttributes(card.data.personality),
      sampleChat: this.parseExampleMessages(card.data.mes_example),
      scenario: card.data.scenario,
      greeting: card.data.first_mes,
      name: card.data.name,
    };
  }

  protected getCharacterEmotions(state: RootState, characterId: string): string[] {
    const characters = selectCurrentCharacterOutfits(state);
    const characterEmotions =
      EMOTION_GROUP_TEMPLATES[
        characters.find((character) => character.id === characterId)?.outfit?.template || 'base-emotions'
      ].emotionIds;
    return characterEmotions;
  }

  private parseAttributes(s: string): [string, string][] {
    return s.split('\n').map((x) => {
      const [a = '', b = ''] = x.split(': ');
      return [a.trim(), b.trim()];
    });
  }

  private parseExampleMessages(s: string): string[] {
    return s
      .split('<START>\n')
      .map((x) => x.trim())
      .filter((x) => x);
  }

  protected getContextForLorebookEntry(state: RootState, currentCharacterId: string) {
    let content: string = '';
    const lorebookIds = new Set<string>();

    const currentScene = selectCurrentScene(state);
    const sceneLorebookIds = (currentScene?.lorebookIds || []).filter((lorebookId) => {
      if (lorebookIds.has(lorebookId)) {
        return false;
      } else {
        lorebookIds.add(lorebookId);
        return true;
      }
    });
    const charactersInScene = selectLastLoadedCharacters(state);
    const characterLorebookIds = charactersInScene
      .map((character) => state.novel.characters.find((char) => char.id === character.id)?.lorebookIds || [])
      .flat()
      .filter((characterLorebookId) => {
        if (lorebookIds.has(characterLorebookId)) {
          return false;
        } else {
          lorebookIds.add(characterLorebookId);
          return true;
        }
      });
    const globalLorebookIds =
      state.novel.lorebooks
        ?.map((lorebook) => (lorebook.isGlobal ? lorebook.id : null))
        .filter((id) => {
          if (id) {
            if (lorebookIds.has(id)) {
              return false;
            } else {
              lorebookIds.add(id);
              return true;
            }
          } else {
            return false;
          }
        }) || [];

    const lastMessages = selectAllParentDialoguesWhereCharactersArePresent(state, [currentCharacterId])
      .slice(1, 4)
      .reverse();
    const lorebooks = [...sceneLorebookIds, ...characterLorebookIds, ...globalLorebookIds]
      .map((lorebookId) => state.novel.lorebooks?.find((lorebook) => lorebook.id === lorebookId))
      .filter((lorebook) => lorebook);

    if (!lorebooks.length) return null;

    const fillTextTemplateWithCharacters = (text: string) =>
      fillTextTemplate(text, {
        user: state.settings.user.name,
        bot: state.novel.characters.find((character) => character.id === currentCharacterId)?.name || '',
        characters: state.novel.characters.reduce((prev, { id, card }) => {
          prev[id] = card.data.name;
          return prev;
        }, {} as Record<string, string>),
      });
    const lastMessagesWordsArray = lastMessages
      .map((message) => {
        if (message.type === 'response') {
          return message.item.characters.map((char) => fillTextTemplateWithCharacters(char.text));
        } else {
          return fillTextTemplateWithCharacters(message.item.query);
        }
      })
      .flat();

    const currentEntries = findLorebooksEntries(
      lastMessagesWordsArray,
      lorebooks
        .map((lorebook) => lorebook?.entries || [])
        .flat()
        .map((entry) => ({
          keys: entry?.keys || [],
          content: entry?.content || '',
        })),
    );

    if (currentEntries.length > 0) {
      // load the top 3 entries
      currentEntries.slice(0, 3).forEach((entry, index) => {
        content += (index ? '\n' : '') + entry.content;
      });
    }

    return content;
  }
}
