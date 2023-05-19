import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';
import { replaceAll } from './RPBTStrategy';

export class PygStrategy implements ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    const { persona, attributes, sampleChat, scenario, botSubject } = parts;

    const formattedAttributes = attributes
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    let prompt = '';
    prompt += `${botSubject}'s persona: ${persona}. ${formattedAttributes}\n`;
    prompt += `<START>\n`;
    prompt += `${replaceAll(sampleChat.join('\n'), 'You:', 'Anon:')}\n`;
    prompt += `<START>\n`;
    prompt += `${scenario}`;
    
    return prompt
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { greeting } = parts;
    return greeting;
  }

  getBotSubject(parts: ContextPromptParts): string {
    return parts.botSubject;
  }
}
