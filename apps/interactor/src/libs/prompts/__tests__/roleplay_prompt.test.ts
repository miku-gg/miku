import PromptBuilder from '../PromptBuilder';
import { AbstractPromptStrategy } from '../strategies';
import { RoleplayPromptStrategy } from '../strategies/roleplay/RoleplayPromptStrategy';
import _nalaRPMock, { expectedResult as _nalaRPMock_expected } from './__mocks__/nala_roleplay.mock';
import _nalaRPLongMock from './__mocks__/nala_roleplay_long.mock';

class TestStrategy extends AbstractPromptStrategy<boolean, boolean> {
  protected getLabels(): Record<string, Record<string, string>> {
    return {
      en: {
        roleplay: 'Roleplay',
      },
    };
  }
  protected i18n(labelKey: string): string {
    return labelKey;
  }
  public buildGuidancePrompt(): {
    template: string;
    variables: Record<string, string | string[]>;
    totalTokens: number;
  } {
    return {
      template: 'test',
      variables: {},
      totalTokens: 0,
    };
  }

  public completeResponse(): boolean {
    return false;
  }

  public countTokens(template: string): number {
    return super.countTokens(template);
  }
}
const testStrategy = new TestStrategy();

describe('RoleplayPrompt', () => {
  test('should build a roleplay prompt', async () => {
    const promptBuilder = new PromptBuilder<RoleplayPromptStrategy>({
      maxNewTokens: 200,
      strategy: new RoleplayPromptStrategy('alpaca'),
      truncationLength: 4096,
    });
    const completionQuery = promptBuilder.buildPrompt(
      {
        state: _nalaRPMock,
        currentCharacterId: _nalaRPMock.novel.characters[0].id,
      },
      1000,
    );
    expect(completionQuery).toEqual(_nalaRPMock_expected);
  });

  test('should build a roleplay prompt and respect the trucation length', async () => {
    for (let i = 2099; i < 4096; i += 100) {
      const promptBuilder = new PromptBuilder<RoleplayPromptStrategy>({
        maxNewTokens: 200,
        strategy: new RoleplayPromptStrategy('alpaca'),
        truncationLength: i,
      });
      const completionQuery = promptBuilder.buildPrompt(
        {
          state: _nalaRPLongMock,
          currentCharacterId: _nalaRPLongMock.novel.characters[0].id,
        },
        100,
      );
      const result = testStrategy.countTokens(completionQuery.template);
      expect(result).toBeLessThanOrEqual(i - 200);
    }
  });
});
