import { AbstractPromptStrategy } from '../AbstractPromptStrategy';
import { RootState } from '../../../../state/store';
import { NarrationResponse } from '../../../../state/versioning';

export class RoleplayInnerThoughtsStrategy extends AbstractPromptStrategy<RootState, NarrationResponse> {
  protected getLabels(): Record<string, Record<string, string>> {
    const labels = {
      en: {
        system_prompt: 'You are %. Based on what was said to you and your response, write your inner thoughts. Write ONLY your internal thoughts, feelings, opinions, and mental reactions.',
        do_not_describe_actions: 'Do NOT describe actions, movements, or external observations. Do NOT explain what you are doing or reference your role. Do NOT label your thoughts.',
        write_in_first_person: 'Write in first person (use "I", "me", "my", etc.). Don\'t say "My inner thoughts" or "My thoughts", or %\'s inner thoughts, or anything like that.',
        just_write_your_thoughts: 'Write your thoughts as plain text only. NO asterisks (*), NO brackets [], NO parentheses (), NO quotes around thoughts, NO formatting symbols of any kind. Just write the raw thoughts.',
        current_reaction: '%\'s reaction: ',
        current_response: '%\'s response: ',
        inner_thoughts_prompt: '%\'s inner thoughts:',
      },
      es: {
        system_prompt: 'Eres %. Basándote en lo que te dijeron y tu respuesta, escribe tus pensamientos internos. Escribe SOLO tus pensamientos internos, sentimientos, opiniones y reacciones mentales.',
        do_not_describe_actions: 'NO describas acciones, movimientos u observaciones externas. NO expliques lo que estás haciendo o hagas referencia a tu papel. NO etiquetes tus pensamientos.',
        write_in_first_person: 'Escribe en primera persona (usa "yo", "me", "mi", etc.). No digas "Mis pensamientos internos" o "Mis pensamientos", o los pensamientos internos de %, o nada por el estilo.',
        just_write_your_thoughts: 'Escribe tus pensamientos como texto plano únicamente. NO asteriscos (*), NO corchetes [], NO paréntesis (), NO comillas alrededor de los pensamientos, NO símbolos de formato de ningún tipo. Solo escribe los pensamientos en bruto.',
        current_reaction: 'Reacción de %: ',
        current_response: 'Respuesta de %: ',
        inner_thoughts_prompt: 'Pensamientos internos de %:',
      },
      es_ar: {
        system_prompt: 'Sos %. Basándote en lo que te dijeron y tu respuesta, escribí tus pensamientos internos. Escribí SOLO tus pensamientos internos, sentimientos, opiniones y reacciones mentales.',
        do_not_describe_actions: 'NO describas acciones, movimientos u observaciones externas. NO expliques lo que estás haciendo o hagas referencia a tu papel. NO etiquetes tus pensamientos.',
        write_in_first_person: 'Escribí en primera persona (usa "yo", "me", "mi", etc.). No digas "Mis pensamientos internos" o "Mis pensamientos", o los pensamientos internos de %, o nada por el estilo.',
        just_write_your_thoughts: 'Simplemente escribí tus pensamientos directamente sin ningún prefijo o explicación. NO uses asteriscos (*), corchetes, o cualquier símbolo de formato.',
        current_reaction: 'Reacción de %: "',
        current_response: 'Respuesta de %: "',
        inner_thoughts_prompt: 'Pensamientos internos de %:',
      },
      es_cl: {
        system_prompt: 'Eres %. Basándote en lo que te dijeron y tu respuesta, escribe tus pensamientos internos. Escribe SOLO tus pensamientos internos, sentimientos, opiniones y reacciones mentales.',
        do_not_describe_actions: 'NO describas acciones, movimientos u observaciones externas. NO expliques lo que estás haciendo o hagas referencia a tu papel. NO etiquetes tus pensamientos.',
        write_in_first_person: 'Escribe en primera persona (usa "yo", "me", "mi", etc.). No digas "Mis pensamientos internos" o "Mis pensamientos", o los pensamientos internos de %, o nada por el estilo.',
        just_write_your_thoughts: 'Escribe tus pensamientos como texto plano únicamente. NO asteriscos (*), NO corchetes [], NO paréntesis (), NO comillas alrededor de los pensamientos, NO símbolos de formato de ningún tipo. Solo escribe los pensamientos en bruto.',
        current_reaction: 'Reacción de %: ',
        current_response: 'Respuesta de %: ',
        inner_thoughts_prompt: 'Pensamientos internos de %:',
      },
      fr: {
        system_prompt: 'Tu es %. Basé sur ce qui t\'a été dit et ta réponse, écris tes pensées intérieures. Écris SEULEMENT tes pensées internes, sentiments, opinions et réactions mentales.',
        do_not_describe_actions: 'NE décris PAS d\'actions, mouvements ou observations externes. N\'explique PAS ce que tu fais ou ne fais pas référence à ton rôle. NE labellise PAS tes pensées.',
        write_in_first_person: 'Écris à la première personne (utilise "je", "me", "mon", etc.). Ne dis pas "Mes pensées intérieures" ou "Mes pensées", ou les pensées intérieures de %, ou quelque chose comme ça.',
        just_write_your_thoughts: 'Écris simplement tes pensées directement sans aucun préfixe ou explication. N\'utilise PAS d\'astérisques (*), de crochets, ou de symboles de formatage.',
        current_reaction: 'Réaction de %: ',
        current_response: 'Réponse de %: ',
        inner_thoughts_prompt: 'Pensées intérieures de %:',
      },
      de: {
        system_prompt: 'Du bist %. Basierend auf dem, was dir gesagt wurde und deiner Antwort, schreibe deine inneren Gedanken. Schreibe NUR deine inneren Gedanken, Gefühle, Meinungen und mentalen Reaktionen.',
        do_not_describe_actions: 'Beschreibe KEINE Aktionen, Bewegungen oder externe Beobachtungen. Erkläre NICHT, was du tust oder beziehe dich auf deine Rolle. Beschrifte deine Gedanken NICHT.',
        write_in_first_person: 'Schreibe in der ersten Person (verwende "ich", "mich", "mein", etc.). Sage nicht "Meine inneren Gedanken" oder "Meine Gedanken", oder %s innere Gedanken, oder so etwas.',
        just_write_your_thoughts: 'Schreibe einfach deine Gedanken direkt ohne Präfix oder Erklärung. Verwende KEINE Sternchen (*), Klammern oder Formatierungssymbole.',
        current_reaction: 'Reaktion von %: ',
        current_response: 'Antwort von %: ',
        inner_thoughts_prompt: 'Innere Gedanken von %:',
      },
      pt_br: {
        system_prompt: 'Você é %. Com base no que foi dito a você e na sua resposta, escreva seus pensamentos internos. Escreva APENAS seus pensamentos internos, sentimentos, opiniões e reações mentais.',
        do_not_describe_actions: 'NÃO descreva ações, movimentos ou observações externas. NÃO explique o que você está fazendo ou faça referência ao seu papel. NÃO rotule seus pensamentos.',
        write_in_first_person: 'Escreva em primeira pessoa (use "eu", "me", "meu", etc.). Não diga "Meus pensamentos internos" ou "Meus pensamentos", ou os pensamentos internos de %, ou algo assim.',
        just_write_your_thoughts: 'Apenas escreva seus pensamentos diretamente sem prefixo ou explicação. NÃO use asteriscos (*), colchetes, ou qualquer símbolo de formatação.',
        current_reaction: 'Reação de %: ',
        current_response: 'Resposta de %: ',
        inner_thoughts_prompt: 'Pensamentos internos de %:',
      },
      pt: {
        system_prompt: 'Você é %. Com base no que foi dito a você e na sua resposta, escreva seus pensamentos internos. Escreva APENAS seus pensamentos internos, sentimentos, opiniões e reações mentais.',
        do_not_describe_actions: 'NÃO descreva ações, movimentos ou observações externas. NÃO explique o que você está fazendo ou faça referência ao seu papel. NÃO rotule seus pensamentos.',
        write_in_first_person: 'Escreva em primeira pessoa (use "eu", "me", "meu", etc.). Não diga "Meus pensamentos internos" ou "Meus pensamentos", ou os pensamentos internos de %, ou algo assim.',
        just_write_your_thoughts: 'Apenas escreva seus pensamentos diretamente sem prefixo ou explicação. NÃO use asteriscos (*), colchetes, ou qualquer símbolo de formatação.',
        current_reaction: 'Reação de %: ',
        current_response: 'Resposta de %: ',
        inner_thoughts_prompt: 'Pensamentos internos de %:',
      },
      ru: {
        system_prompt: 'Ты %. Основываясь на том, что тебе сказали и твоем ответе, напиши свои внутренние мысли. Напиши ТОЛЬКО свои внутренние мысли, чувства, мнения и ментальные реакции.',
        do_not_describe_actions: 'НЕ описывай действия, движения или внешние наблюдения. НЕ объясняй, что ты делаешь или ссылайся на свою роль. НЕ маркируй свои мысли.',
        write_in_first_person: 'Пиши от первого лица (используй "я", "меня", "мой" и т.д.). Не говори "Мои внутренние мысли" или "Мои мысли", или внутренние мысли %, или что-то подобное.',
        just_write_your_thoughts: 'Просто напиши свои мысли напрямую без префикса или объяснения. НЕ используй звездочки (*), скобки или любые символы форматирования.',
        current_reaction: 'Реакция %: ',
        current_response: 'Ответ %: ',
        inner_thoughts_prompt: 'Внутренние мысли %:',
      },
      jp: {
        system_prompt: 'あなたは%です。言われたこととあなたの返答に基づいて、あなたの内面の思考を書いてください。内面の思考、感情、意見、精神的反応のみを書いてください。',
        do_not_describe_actions: '行動、動き、外部の観察を説明しないでください。あなたが何をしているかや役割について説明したり言及したりしないでください。思考にラベルを付けないでください。',
        write_in_first_person: '一人称で書いてください（「私」、「私の」などを使用）。「私の内面の思考」や「私の思考」、%の内面の思考などと言わないでください。',
        just_write_your_thoughts: '接頭辞や説明なしに、思考を直接書いてください。アスタリスク（*）、括弧、またはフォーマット記号は使用しないでください。',
        current_reaction: '%の反応: ',
        current_response: '%の返答: ',
        inner_thoughts_prompt: '%の内面の思考:',
      },
    };
    return labels;
  }

  public buildGuidancePrompt(
    maxNewTokens: number,
    _memorySize: number,
    input: RootState,
  ): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    const currentResponse = input.narration.responses[input.narration.currentResponseId];
    const selectedCharacterId = currentResponse?.selectedCharacterId;
    const characterName = input.novel.characters.find(char => char.id === selectedCharacterId)?.name || 'Character';
    
    // Get the character's response text to provide context
    const currentCharacter = currentResponse?.characters.find(char => char.characterId === selectedCharacterId);
    const currentReaction = currentCharacter?.emotion || '';
    const characterResponse = currentCharacter?.text || '';
    
    // the template that the AI will autocomplete
    const { BOS, SYSTEM_START, SYSTEM_END, INPUT_START, INPUT_END, OUTPUT_START } = this.instructTemplate;
    
    let template = `${BOS}${SYSTEM_START}${this.i18n('system_prompt', [characterName])} `;
    template += `\n${this.i18n('do_not_describe_actions')}`;
    template += `\n${this.i18n('write_in_first_person', [characterName])}`;
    template += `\n${this.i18n('just_write_your_thoughts')}`;
    template += `${SYSTEM_END}${INPUT_START}`;
    template += `${this.i18n('current_reaction', [characterName])}${currentReaction}"\n`;
    template += `${this.i18n('current_response', [characterName])}${characterResponse}"\n`;
    template += `${this.i18n('inner_thoughts_prompt', [characterName])}`;
    template += `${INPUT_END}${OUTPUT_START}`;
    template += `{{GEN inner_thoughts max_tokens=${maxNewTokens} stop=["\\n"]}}`;

    return {
      template,
      variables: {
        character_name: characterName,
        character_response: characterResponse,
        inner_thoughts: '',
      },
      totalTokens: this.countTokens(template) + maxNewTokens,
    };
  }

  public completeResponse(_input: RootState, response: NarrationResponse, variables: Map<string, string>): NarrationResponse {
    const innerThoughts = variables.get('inner_thoughts') || '';
    const selectedCharacterId = response.selectedCharacterId;
    
    // Update the innerThoughts field
    const updatedResponse = {
      ...response,
      characters: response.characters.map(char => {
        if (char.characterId === selectedCharacterId) {
          return {
            ...char,
            innerThoughts: innerThoughts,
          };
        }
        return char;
      }),
    };
    return updatedResponse;
  }

}
