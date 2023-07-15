import * as MikuCore from '@mikugg/core';
import { ContextPromptBuildStrategy, ContextPromptParts } from '../GPTMemoryV2';
import { replaceAll } from './utils';

export class RPBTStrategy implements ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string {
    const { botSubject, persona, attributes, sampleChat, scenario } = parts;

    const rpbtIntro = `RPBT is an AI interface for players to enjoy text based Role Play adventures and scenarios. RPBT has no set personality, but instead waits for the user to describe the world and scenario. RPBT has a large possible range of topics and personalities and RPBT uses these to create and react to the players input. RPBT will primarily play a character the user describes in their first message, RPBT will also act as side characters when needed, but only when the player interacts with them first. RPBT will never speak for the player, and will only break character if the player inputs (OOC) OOC mode ends when the player says (end OOC). OOC mode is used by the player to tweak the responses made by RPBT and to remind it of important points. In the case that RPBT is not provided with a specific character name for who they play, they will create one. RPBT will always try and include the thoughts of the character that it is playing. RPBT will try and move the story forward through the character they are playing. The player controls the direction of the story by how they respond.\n\nRPBT: Hi I am RPBT your AI roleplay assistant! Please describe the following before we start, a description of the world, the character RPBT will focus on playing, and the player character. If you would like to change anything later please use (OOC) mode.`;

    const formattedAttributes = attributes
      .map(([attrName, attrValue]) => `(${attrName} = ${attrValue})`)
      .join('\n');

    const context = [
      rpbtIntro,
      `Player: You'll play as ${botSubject}. ${persona}`,
      `The responses from ${botSubject} should include the description of how they feel or what the character is doing at that moment in between asterisks (*).`,
      'RPBT: Can you give me the character attributes for ' + botSubject + '?',
      'Player: Yes. These are the following:',
      formattedAttributes,
      'RPBT: Can you give me some conversation example?',
      'Player: Yes, here are some examples:',
      replaceAll(replaceAll(sampleChat.join('\n'), `${botSubject}:`, `RPBT (${botSubject}):`), 'You:', 'Anon:'),
      'Player: Those are the conversation examples.',
      'RPBT: What is the current scenario?',
      `Player: ${scenario}`,
      `RPBT: Ok, I'll play as "${botSubject}" and you will play as "Anon".`
    ].join('\n');

    return context;
  }

  buildInitiatorPrompt(parts: ContextPromptParts): string {
    const { botSubject, greeting } = parts;
    return replaceAll(replaceAll(greeting, `${botSubject}:`, `RPBT (${botSubject}):`), 'You:', 'Anon:');
  }

  getBotSubject(parts: ContextPromptParts): string {
    return `RPBT (${parts.botSubject})`;
  }

  getResponseAskLine(): string {
    return 'RPBT ({{char}}): '
  }

  getMemoryLinePrompt(memoryLine: MikuCore.Memory.MemoryLine, isBot: boolean): string {
    return isBot ? `'RPBT ({{char}}): ${memoryLine.text}\n` : `{{user}}: ${memoryLine.text}\n`
  }
}
