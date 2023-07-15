
import * as Strategies from './strategies';
import * as MikuCore from '@mikugg/core';
export * as Strategies from './strategies';
import GPT3Tokenizer from 'gpt3-tokenizer';

const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

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

  constructor(config: GPTShortTermMemoryV2Config, memorySize = 25) {
    super({
      prompt_context: config.prompt_context,
      prompt_initiator: config.prompt_initiator,
      subjects: config.subjects,
      botSubject: config.botSubject
    }, memorySize);
    this.promptParts = config.parts;
    this.promptbuildStrategy = getStrategyFromSlug(config.buildStrategySlug);
  }

  public setPromptBuildStrategy(slug: Strategies.StrategySlug) {
    this.promptbuildStrategy = getStrategyFromSlug(slug);
  }

  public override getContextPrompt(): string {
    let prompt = this.promptbuildStrategy.buildContextPrompt(this.promptParts);
    prompt = Strategies.fillTextTemplate(prompt, {
      bot: this.promptParts.botSubject,
      user: 'Anon'
    });
    return prompt;    
  }

  public override getInitiatorPrompt(): string {
    let prompt = this.promptbuildStrategy.buildInitiatorPrompt(this.promptParts);
    prompt = Strategies.fillTextTemplate(prompt, {
      bot: this.promptParts.botSubject,
      user: 'Anon'
    })
    return prompt;
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

  public buildMemoryLinesPrompt(memorySize = this.memorySize): string {
    let prompt = this.getInitiatorPrompt();
    for (let i = Math.max(this.memory.length - memorySize, 0); i < this.memory.length; i++) {
      prompt += '\n';
      prompt += this.promptbuildStrategy.getMemoryLinePrompt(this.memory[i], this.memory[i].subject === this.getBotSubject());
    }
    return prompt;
  }

  public buildMemoryPrompt() {
    let prompt = this.getContextPrompt();
    let memorySize = this.memorySize;
    let memoryLinesPrompt = '';

    // Entire prompt under 2048 tokens
    const MAX_PROMPT_TOKENS = 1800;
    do {
      memoryLinesPrompt = this.buildMemoryLinesPrompt(memorySize--);
    } while (
      memorySize &&
      memoryLinesPrompt.length > this.getInitiatorPrompt().length &&
      tokenizer.encode(prompt + memoryLinesPrompt).bpe.length > MAX_PROMPT_TOKENS
    );

    prompt += memoryLinesPrompt;
    prompt += `\n${this.promptbuildStrategy.getResponseAskLine()}`;
    // for(let i = 0; i < 10; i++) prompt = prompt.replace(/\n\n/g, '\n');

    prompt = Strategies.fillTextTemplate(prompt, {
      bot: this.promptParts.botSubject,
      user: 'Anon'
    });

    return prompt;
  }
}