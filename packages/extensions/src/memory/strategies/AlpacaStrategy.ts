/*
Below is an instruction that describes a task. Write a response that appropriately completes the request.

Write Ayumi's next reply in a fictional roleplay chat between You and Ayumi.

Ayumi's Persona: (character card here)

This is how Ayumi should talk:
(example conversation here)

Then the roleplay chat between You and Ayumi begins.
### Response:
Ayumi: (conversation setting described here)

### Instruction:
You: *you do ...* Can you...?

### Response:
Ayumi:
*/

import * as MikuCore from '@mikugg/core';
import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';

export class AlpacaStrategy implements ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    const { persona, attributes, sampleChat, scenario, botSubject } = parts;

    const formattedAttributes = attributes
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    let prompt = 'Below is an instruction that describes a task. Write a response that appropriately completes the request.\n\n';
    prompt += `Write {{char}}'s next reply in a fictional roleplay chat between {{user}} and {{char}}.\n\n`;
    prompt += `{{char}}'s persona: ${persona}. ${formattedAttributes}\n`;
    prompt += `This is how {{char}} should talk:\n`;
    for (const example of sampleChat) {
      prompt += example + '\n';
    }
    prompt += `${scenario}\n`;
    // prompt += `<START>\n`;
    return prompt;
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { greeting } = parts;
    let prompt = '\nThen the roleplay chat between {{user}} and {{char}} begins.\n';
    prompt += "### Response\n";
    prompt += greeting + '\n';
    return prompt;
  }

  getResponseAskLine(): string {
    return '### Response\n{{char}}: ';
  }

  getBotSubject(parts: ContextPromptParts): string {
    return parts.botSubject;
  }

  getMemoryLinePrompt(memoryLine: MikuCore.Memory.MemoryLine, isBot: boolean): string {
    return isBot ?
      `### Response:\n{{char}}: ${memoryLine.text}\n` :
      memoryLine.type === MikuCore.Commands.CommandType.CONTEXT ?
        `### Instruction:\n${memoryLine.text}\n` :
        `### Instruction:\n{{user}}: ${memoryLine.text}\n`;
  }
}
