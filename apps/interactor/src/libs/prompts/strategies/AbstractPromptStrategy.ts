export abstract class AbstractPromptStrategy<Input, Output> {
  public abstract buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: Input
  ): {
    template: string
    variables: Record<string, string | string[]>
    totalTokens: number
  }

  public abstract completeResponse(
    input: Input,
    response: Output,
    variables: Map<string, string>
  ): Output
}
