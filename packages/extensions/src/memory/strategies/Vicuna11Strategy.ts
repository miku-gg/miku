/*
BEGINNING OF CONVERSATION: A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed and
 fitting answers to the user's questions.

Write Ayumi's next reply in a fictional roleplay chat between You and Ayumi.
Ayumi's Persona: (character card here)

This is how Ayumi should talk:
(example conversation here)

USER: Then the roleplay chat between You and Ayumi begins.
ASSISTANT: Ayumi: (conversation setting described here)
USER: You: *you do ...* Can you...?
ASSISTANT: Ayumi:
*/

import * as MikuCore from '@mikugg/core';
import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';

export class Vicuna11Strategy implements ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    const { persona, attributes, sampleChat, scenario, botSubject } = parts;

    const formattedAttributes = attributes
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    let prompt = 'BEGINNING OF CONVERSATION: A chat between a curious user and an artificial intelligence assistant. The assistant gives helpful, detailed and fitting answers to the user\'s questions.\n\n';
    prompt += `Write {{char}}'s next reply in a fictional roleplay chat between {{user}} and {{char}}.\n\n`;
    prompt += `{{char}}'s persona: ${persona}. ${formattedAttributes}\n\n`;
    prompt += `This is how {{char}} should talk:\n`;
    for (const example of sampleChat) {
      prompt += example + '\n';
    }
    prompt += `\n`;
    return prompt;
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { greeting, scenario } = parts;
    let prompt = 'USER: Then the roleplay chat between {{user}} and {{char}} begins.\n';
    prompt += `ASSISTANT: *${scenario}* ${greeting}`;
    return prompt;
  }

  getResponseAskLine(): string {
    return 'ASSISTANT: {{char}}: ';
  }

  getBotSubject(parts: ContextPromptParts): string {
    return parts.botSubject;
  }

  getMemoryLinePrompt(memoryLine: MikuCore.Memory.MemoryLine, isBot: boolean): string {
    return isBot ?
      `ASSISTANT: {{char}}: ${memoryLine.text}` :
      memoryLine.type === MikuCore.Commands.CommandType.CONTEXT ?
        `USER: ${memoryLine.text}` :
        `USER: {{user}}: ${memoryLine.text}`;
  }
}
