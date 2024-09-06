import { RoleplayStrategyMistral } from './RoleplayStrategyMistral';

export class RoleplayStrategyLyra extends RoleplayStrategyMistral {
  protected override startSystem(): string {
    return `[INST]system\n`;
  }
  public override template() {
    return {
      askLine:
        '[/INST]\n[INST]assistant\nOOC: I WILL roleplay as {{char}} with two paragraphs, actions and descriptions between asterisks, and dialogue between quotes.\n',
      instruction: '[/INST]\n[INST]user\n',
      response: '[/INST]\n[/INST]assistant\n',
      stops: ['INST', '/INST', '<|im_end|>', '</s>'],
    };
  }
}
