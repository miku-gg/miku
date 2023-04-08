import { ContextPromptBuildStrategy, ContextPromptParts } from '../MemoryV2';

export class WppStrategy extends ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    // Implementation for WppStrategy
    // Here you can customize how the context prompt is built for WppStrategy
    const { persona, attributes, sampleChat, scenario, greeting, botSubject } = parts;

    const formattedAttributes = attributes
    .map(([key, value]) =>  `${key}(${value.replaceAll(',', ' + ')})})`)
    .join(', ');

    return `[character("${botSubject}")] {\n${formattedAttributes}\nDescription(${persona})\n}\n[EXAMPLE DIALOGE]${sampleChat.join(' ')}\n[Roleplay Start]\n${scenario}`;
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { greeting } = parts;
    return greeting;
  }
}