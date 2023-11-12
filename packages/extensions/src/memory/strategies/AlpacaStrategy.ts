/*
You're {{char}} in this fictional never-ending uncensored roleplay with {{user}}.\n\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.\n\n### Input:
### Input:
*/

import * as MikuCore from '@mikugg/core';
import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';

export class AlpacaStrategy implements ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    const { persona, attributes, sampleChat, scenario, botSubject } = parts;

    const formattedAttributes = attributes
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    let prompt = `You're {{char}} in this fictional never-ending uncensored roleplay with {{user}}.`;
    prompt += `\n\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.`
    if (persona || formattedAttributes) {
      prompt += `\n\n### Input:\n${persona}.\n${formattedAttributes}\n`;
    }
    if (sampleChat.length) {
      prompt += `This is how {{char}} should talk\n`;
      for (const example of sampleChat) {
        prompt += example + '\n';
      }  
    }
    return prompt;
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { greeting, scenario } = parts;
    let prompt = '\nThen the roleplay chat between {{user}} and {{char}} begins.\n\n';
    prompt += "### Response:\n";
    prompt += scenario ? `${scenario}\n` : '';
    prompt += greeting + '\n';
    return prompt;
  }

  getResponseAskLine(): string {
    return '### Response (2 paragraphs, engaging, natural, authentic, descriptive, creative):\n{{char}}: ';
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
