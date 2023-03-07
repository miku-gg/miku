import { Commands } from "..";

export interface MemoryLine {
  text: string;
  subject: string;
  type: Commands.CommandType;
}

/**
 * MemoryPromptConfig is an interface that represents the configuration for the ShortTermMemory.
 * 
 * contextPrompt: string - The context prompt.
 * initiatorPrompt: string - The initiator prompt.
 * subjects: string[] - The subjects of the conversation.
 * botSubject: string - The subject of the bot.
 */
export interface MemoryPromptConfig {
  prompt_context: string;
  prompt_initiator: string;
  subjects: string[];
  botSubject: string;
};


/**
 * ShortTermMemory is an abstract class that represents a short term memory.
 * It is used to save the conversation history and build a prompt for the chatbot.
 * It is used by the ChatPromptCompleter to build the prompt.
 */
export abstract class ShortTermMemory {
  public memorySize: number;
  protected memory: MemoryLine[] = [];
  protected contextPrompt: string;
  protected initiatorPrompt: string;
  protected basePrompt: string;
  protected subjects: string[];
  protected botSubject: string;

  constructor({prompt_context, prompt_initiator, subjects, botSubject}: MemoryPromptConfig, memorySize = 30, selectedResponseIndex = 0) {
    this.contextPrompt = prompt_context;
    this.initiatorPrompt = prompt_initiator;
    this.basePrompt = prompt_context + prompt_initiator;
    this.memorySize = memorySize;
    this.subjects = subjects;
    this.botSubject = botSubject;
  }

  public abstract pushMemory(memory: MemoryLine): void;
  public abstract clearMemories(): void;
  public abstract getMemory(): MemoryLine[];
  public abstract buildMemoryPrompt(): string;
  public abstract getContextPrompt(): string;
  public abstract getInitiatorPrompt(): string;

  public getBotSubject(): string {
    return this.botSubject;
  }

  public getSubjects(): string[] {
    return this.subjects;
  }
}