import { MikuCard } from '@mikugg/bot-utils'
import { RootState } from '../../../state/store'
import { NarrationResponse } from '../../../state/versioning'
import llamaTokenizer from '../_llama-tokenizer'

export abstract class AbstractPromptStrategy {
  public abstract buildPrompt(
    state: RootState,
    maxNewTokens: number,
    memorySize: number,
    continueResponse?: boolean
  ): {
    template: string
    variables: Record<string, string | string[]>
    totalTokens: number
  }

  public abstract completeResponse(
    response: NarrationResponse,
    variables: Map<string, string>
  ): NarrationResponse

  protected getCharacterSpecs(card: MikuCard): {
    persona: string
    attributes: [string, string][]
    sampleChat: string[]
    scenario: string
    greeting: string
    name: string
  } {
    return {
      persona: card.data.description,
      attributes: this.parseAttributes(card.data.personality),
      sampleChat: this.parseExampleMessages(card.data.mes_example),
      scenario: card.data.scenario,
      greeting: card.data.first_mes,
      name: card.data.name,
    }
  }

  protected countTokens(template: string): number {
    const _template = template.replace(/{{.*?}}/g, '')
    return llamaTokenizer.encode(_template).length
  }

  private parseAttributes(s: string): [string, string][] {
    return s.split('\n').map((x) => {
      const [a = '', b = ''] = x.split(': ')
      return [a.trim(), b.trim()]
    })
  }

  private parseExampleMessages(s: string): string[] {
    return s
      .split('<START>\n')
      .map((x) => x.trim())
      .filter((x) => x)
  }
}
