
import { TokenizerType, tokenCount } from '../tokenizers/Tokenizers';
import * as Strategies from './strategies';
import * as MikuCore from '@mikugg/core';
export * as Strategies from './strategies';

export interface ContextPromptParts {
  persona: string
  attributes: [string, string][]
  sampleChat: string[]
  scenario: string
  greeting: string
  botSubject: string;
}

export interface ContextPromptBuildStrategy {
  buildContextPrompt(parts: ContextPromptParts): string
  buildInitiatorPrompt(parts: ContextPromptParts): string
  getBotSubject(parts: ContextPromptParts): string
  getMemoryLinePrompt(memoryLine: MikuCore.Memory.MemoryLine, isBot: boolean): string
  getResponseAskLine(): string
}

export interface GPTShortTermMemoryV2Config extends MikuCore.Memory.MemoryPromptConfig  {
  language: MikuCore.ChatPromptCompleters.Language;
  parts: ContextPromptParts;
  buildStrategySlug: Strategies.StrategySlug;
  tokenizerType?: TokenizerType;
}

function getStrategyFromSlug(slug: Strategies.StrategySlug): ContextPromptBuildStrategy {
  switch (slug) {
    case 'wpp':
      return new Strategies.WppStrategy();
    case 'sbf':
      return new Strategies.SbfStrategy();
    case 'rpbt':
      return new Strategies.RPBTStrategy();
    case 'pyg':
      return new Strategies.PygStrategy();
    case 'alpaca':
      return new Strategies.AlpacaStrategy();
    case 'vicuna11':
      return new Strategies.Vicuna11Strategy();
    default:
      throw new Error(`Invalid strategy slug: ${slug}`);
  }
}

export class GPTShortTermMemoryV2 extends MikuCore.Memory.ShortTermMemory {
  private promptbuildStrategy: ContextPromptBuildStrategy;
  private promptParts: ContextPromptParts;
  private tokenizerType: TokenizerType;

  constructor(config: GPTShortTermMemoryV2Config) {
    super({
      prompt_context: config.prompt_context,
      prompt_initiator: config.prompt_initiator,
      subjects: config.subjects,
      botSubject: config.botSubject
    });
    this.promptParts = config.parts;
    this.promptbuildStrategy = getStrategyFromSlug(config.buildStrategySlug);
    this.tokenizerType = config.tokenizerType || TokenizerType.LLAMA;
  }

  public setPromptBuildStrategy(slug: Strategies.StrategySlug) {
    this.promptbuildStrategy = getStrategyFromSlug(slug);
  }

  public override getContextPrompt(): string {
    const prompt = this.promptbuildStrategy.buildContextPrompt(this.promptParts);
    return this.fillText(prompt);    
  }

  public override getInitiatorPrompt(): string {
    const prompt = this.promptbuildStrategy.buildInitiatorPrompt(this.promptParts);
    return this.fillText(prompt);
  }

  public override getBotSubject(): string {
    return this.promptbuildStrategy.getBotSubject(this.promptParts);
  }

  public pushMemory(memory: MikuCore.Memory.MemoryLine): void {
    this.memory.push(memory);
  }

  public getMemory(): MikuCore.Memory.MemoryLine[] {
      return this.memory;
  }

  clearMemories(): void {
    this.memory = [];
  }

  public buildMemoryLinesPrompt(memorySize: number): string {
    let prompt = this.getInitiatorPrompt();
    for (let i = Math.max(this.memory.length - memorySize, 0); i < this.memory.length; i++) {
      prompt += '\n';
      prompt += this.promptbuildStrategy.getMemoryLinePrompt(this.memory[i], this.memory[i].subject === this.getBotSubject());
    }
    return prompt;
  }

  public buildMemoryPrompt(maxTokens: number): string {
    const contextPrompt = this.fillText(this.getContextPrompt());
    const askResponsePrompt = this.fillText(`\n${this.promptbuildStrategy.getResponseAskLine()}`);
    let memoryLinesPrompt = '';

    const allMemoryLines: MikuCore.Memory.MemoryLine[] = [
      {
        subject: '',
        text: this.getInitiatorPrompt(),
        type: MikuCore.Commands.CommandType.DIALOG
      },
      ...this.memory
    ];

    // build memory lines prompt from last to maxTokens
    for (let i = allMemoryLines.length - 1; i >= 0; i--) {
      let memoryLineResult = i > 0 ? '\n' + this.promptbuildStrategy.getMemoryLinePrompt(allMemoryLines[i], allMemoryLines[i].subject === this.getBotSubject()) : allMemoryLines[i].text;
      
      memoryLineResult = this.fillText(memoryLineResult)

      if (tokenCount(contextPrompt + memoryLineResult + memoryLinesPrompt + askResponsePrompt, this.tokenizerType) > maxTokens) {
        break;
      } else {
        memoryLinesPrompt = memoryLineResult + memoryLinesPrompt;
      }
    }

    return contextPrompt + memoryLinesPrompt + askResponsePrompt;
  }

  public fillText(text: string): string {
    return Strategies.fillTextTemplate(text, {
      bot: this.promptParts.botSubject,
      user: this.subjects.length ? this.subjects[0] : 'Anon'
    });
  }
}