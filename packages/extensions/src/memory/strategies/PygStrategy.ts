import * as MikuCore from '@mikugg/core';
import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';

export class PygStrategy implements ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    const { persona, attributes, sampleChat, scenario, botSubject } = parts;

    const formattedAttributes = attributes
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    let prompt = '';
    prompt += `${botSubject}'s persona: ${persona}. ${formattedAttributes}\n`;
    prompt += `Scenario: ${scenario}\n`;
    for (const example of sampleChat) {
      prompt += `<START>\n` + example + '\n';
    }
    prompt += `<START>\n`;
    return prompt;
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
    return isBot ? `{{char}}: ${memoryLine.text}` : `{{user}}: ${memoryLine.text}`
  }
}
