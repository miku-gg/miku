
import * as Strategies from './strategies';
import { GPTShortTermMemory, GPTShortTermMemoryConfig } from './GPTMemory';

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
}

export interface GPTShortTermMemoryV2Config extends GPTShortTermMemoryConfig {
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
    default:
      throw new Error(`Invalid strategy slug: ${slug}`);
  }
}

export class GPTShortTermMemoryV2 extends GPTShortTermMemory {
  private promptbuildStrategy: ContextPromptBuildStrategy;
  private promptParts: ContextPromptParts;

  constructor(config: GPTShortTermMemoryV2Config, memorySize = 25) {
    super(config, memorySize);
    this.promptParts = config.parts;
    this.promptbuildStrategy = getStrategyFromSlug(config.buildStrategySlug);
  }

  public setPromptBuildStrategy(slug: Strategies.StrategySlug) {
    this.promptbuildStrategy = getStrategyFromSlug(slug);
  }

  public override getContextPrompt(): string {
    return this.promptbuildStrategy.buildContextPrompt(this.promptParts);
  }

  public override getInitiatorPrompt(): string {
    return this.promptbuildStrategy.buildInitiatorPrompt(this.promptParts);
  }

  public override getBotSubject(): string {
    return this.promptbuildStrategy.getBotSubject(this.promptParts);
  }
}