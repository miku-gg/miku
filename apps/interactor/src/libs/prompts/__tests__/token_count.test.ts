import { AbstractPromptStrategy } from '../strategies';

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

describe('Token Count', () => {
  test('should build a roleplay prompt', async () => {
    const strategy = new TestStrategy();
    expect(strategy.countTokens('this is a random tests for counting tokens')).toBe(20);
    expect(strategy.countTokens('this is a random{{GEN sa max_tokens=150}} tests for counting tokens')).toBe(20 + 150);
    expect(
      strategy.countTokens(
        'this is a random{{GEN ab max_tokens=20}} tests for coun{{GEN ba max_tokens=20}}ting tokens',
      ),
    ).toBe(20 + 20 + 20);
    expect(
      strategy.countTokens('this is a random{{GEN max_tokens=15 stop=[]}} tests for coun{{test}}ting tokens'),
    ).toBe(20 + 15);
  });
});
