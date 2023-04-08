import { ContextPromptBuildStrategy, ContextPromptParts } from '../MemoryV2';

export class SbfStrategy extends ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    // Implementation for SbfStrategy
    // Here you can customize how the context prompt is built for SbfStrategy
    const { persona, attributes, sampleChat, scenario, greeting, botSubject } = parts;

    const formattedAttributes = attributes
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    return `[ character: "${botSubject}"; ${formattedAttributes}; Description: ${persona} ]\n[EXAMPLE DIALOGE]${sampleChat.join(' ')}\n[Roleplay Start]\n${scenario}`;
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { greeting } = parts;
    return greeting;
  }
}
