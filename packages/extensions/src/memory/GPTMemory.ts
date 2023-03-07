
import * as MikuCore from '@mikugg/core';

export interface GPTShortTermMemoryConfig extends MikuCore.Memory.MemoryPromptConfig {
  language: MikuCore.ChatPromptCompleters.Language;
}

export class GPTShortTermMemory extends MikuCore.Memory.ShortTermMemory {

  constructor({prompt_context, prompt_initiator, subjects, botSubject}: GPTShortTermMemoryConfig, memorySize = 15) {
    super({
      prompt_context: prompt_context,
      prompt_initiator: prompt_initiator,
      subjects,
      botSubject
    }, memorySize);
    
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

  public buildMemoryPrompt() {
    let prompt = this.basePrompt;

    for (let i = Math.max(this.memory.length - this.memorySize, 0); i < this.memory.length; i++) {
      const memoryText = this.memory[i].text.replace(/\n\n/g, '\n').replace(/\n/g, ' ');
      switch (this.memory[i].type) {
        case MikuCore.Commands.CommandType.DIALOG:
          prompt += '\n' + this.memory[i].subject + ': ' + memoryText;
          break;
        case MikuCore.Commands.CommandType.CONTEXT:
          prompt += '\n' + memoryText;
          break;
      }
    }
    prompt += `\n${this.botSubject}:`;
    for(let i = 0; i < 10; i++) prompt = prompt.replace(/\n\n/g, '\n');

    return prompt;
  }

  public getContextPrompt(): string {
    return this.contextPrompt;
  }

  public getInitiatorPrompt(): string {
    return this.initiatorPrompt;
  }

  public getBasePrompt(): string {
    return this.contextPrompt;
  }
}