import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';
import * as MikuCore from '@mikugg/core';

import { replaceAll } from './utils';

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

  getResponseAskLine(): string {
    return '{{char}}: '
  }

  getMemoryLinePrompt(memoryLine: MikuCore.Memory.MemoryLine, isBot: boolean): string {
    return isBot ? `{{char}}: ${memoryLine.text}\n` : `{{user}}: ${memoryLine.text}\n`
  }
}