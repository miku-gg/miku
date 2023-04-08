import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';

export class SbfStrategy implements ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    const { persona, attributes, sampleChat, scenario, botSubject } = parts;

    const formattedAttributes = attributes
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    return `[ character: "${botSubject}"; ${formattedAttributes}; Description: ${persona} ]\n[EXAMPLE DIALOGE]${sampleChat.join(' ')}\n[Roleplay Start]\n${scenario}`;
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { greeting } = parts;
    return greeting;
  }

  getBotSubject(parts: ContextPromptParts): string {
    return parts.botSubject;
  }
}
