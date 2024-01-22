import { AbstractPromptStrategy } from '../AbstractPromptStrategy'
import { selectChatHistory } from '../../../../state/selectors'
import { RootState } from '../../../../state/store'

export class AlpacaSuggestionStrategy extends AbstractPromptStrategy<
  RootState,
  string[]
> {
  public buildGuidancePrompt(
    maxNewTokens: number,
    memorySize: number,
    input: RootState
  ): {
    template: string
    variables: Record<string, string | string[]>
    totalTokens: number
  } {
    const personas = Object.values(input.novel.characters)
      .map((character) => character?.card?.data?.description || '')
      .filter(Boolean)
      .join('\n')
    const messages = this.getMessagesPrompt(input, memorySize)
    let template = `You are a writing assistant that will help you write a story. By suggestion cotinuations to a narration.\n`
    template += `### Input:\n`
    template += `${personas}\n${messages}`
    template += `### Instruction:\n`
    template += `Suggest 3 possible reply dialogs from ${input.settings.user.name} to continue the conversation. They MUST BE ONE SENTENCE EACH.\n`
    template += `### Response:\n`
    template += `Smart Reply: ${input.settings.user.name}: "{{GEN smart max_tokens=${maxNewTokens} stop=["\\n", "\\""]}}"\n`
    template += `Funny Reply: ${input.settings.user.name}: "{{GEN funny max_tokens=${maxNewTokens} stop=["\\n", "\\""]}}"\n`
    template += `Flirty Reply: ${input.settings.user.name}: "{{GEN flirt max_tokens=${maxNewTokens} stop=["\\n", "\\""]}}"\n`

    return {
      template,
      variables: {},
      totalTokens: this.countTokens(template) + maxNewTokens * 3,
    }
  }

  public completeResponse(
    _input: RootState,
    response: string[],
    variables: Map<string, string>
  ): string[] {
    response[0] = variables.get('funny') || ''
    response[1] = variables.get('smart') || ''
    response[2] = variables.get('flirt') || ''
    return response
  }

  public getMessagesPrompt(state: RootState, memorySize: number): string {
    const messages = selectChatHistory(state)
      .filter((_, index) => index < memorySize)
      .map((message) => `${message.name}: ${message.text}`)
      .reverse()
      .join('\n')

    return messages
  }
}
