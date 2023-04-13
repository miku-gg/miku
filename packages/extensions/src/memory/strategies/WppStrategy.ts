import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';

import { replaceAll } from './RPBTStrategy';

export class WppStrategy implements ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    const { persona, attributes, sampleChat, scenario, botSubject } = parts;

    const formattedAttributes = attributes
    .map(([key, value]) =>  `${key}(${replaceAll(value, ',', ' + ')})})`)
    .join(', ');

    return `[character("${botSubject}")] {\n${formattedAttributes}\nDescription(${persona})\n}\n[EXAMPLE DIALOGE]${sampleChat.join(' ')}\n[Roleplay Start]\n${scenario}`;
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { greeting } = parts;
    return greeting;
  }

  getBotSubject(parts: ContextPromptParts): string {
    return parts.botSubject;
  }
}