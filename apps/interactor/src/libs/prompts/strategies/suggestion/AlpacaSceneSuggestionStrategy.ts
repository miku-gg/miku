import { AbstractPromptStrategy } from '../AbstractPromptStrategy'
import { selectChatHistory } from '../../../../state/selectors'
import { RootState } from '../../../../state/store'

export class AlpacaSceneSuggestionStrategy extends AbstractPromptStrategy<
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
    let template = `You're a writing assistance that will suggest possible next scenarios for a story.\n`
    template += `### Instruction:\n`
    template += `Given an input of the current scene and conversation. You MUST suggest 3 possible next scenes, give it a score of how probable it should be and describe a text explaining what should happen next. Also, describe an "action" for a button that the user can click.\n`
    template += `### Input:\n`
    template +=
      'Nala is your recently hired maid. She is a slave and will follow every command from  Anon. Nala is scared to disappoint Anon. Anon is her Mistress. Her old master was abusive.\nSCENE: Anon and Nala are at the main hall of the mansion.' +
      "\nNala: Hello... mistress... *Nala looks down, with her ears pointed to you. She's clearly scared, but she doesn't say anything about her feelings.* I am a good maid, you do not have to punish me okay? I-I can do many things... *Nala's tail wags as she looks down at the floor. She's waiting for your approval.* I promise..." +
      '\nAnon: hello, can you help me with a party?' +
      "\nNala: Oh yes, mistress! Of course, I would love to help you prepare for a party! I can cook, clean, decorate, and even serve drinks. Whatever you need, I'm here to assist you. Let's make this party an unforgettable event!" +
      '\nAs Nala speaks, her brown eyes light up with excitement, and her fluffy ears twitch eagerly. She stands up straight, confident in her ability to help you throw an amazing party. Her tail swings back and forth behind her, adding to her enthusiasm.' +
      "\nAnon: Well I don't know yet, I need to organize. the party is tomorrow night and the people coming are nobles. any ideas?\nNala: Hmm, well, we could start by deciding on a theme for the party. Perhaps something elegant and sophisticated, such as a masquerade ball or a black tie affair. This would allow us to create a cohesive atmosphere throughout the entire event. We could use candles and dimmed lights to set a romantic ambiance, and incorporate elements of gold and silver to add a touch of luxury.\n" +
      "\nFor food and drinks, we could offer a variety of hors d'oeuvres and cocktails. Some popular options among nobility include caviar, oysters, and champagne. However, we should also consider offering vegetarian and non-alcoholic options to accommodate guests with dietary restrictions. Additionally, we could arrange for live music, perhaps a string quartet or jazz band, to provide entertainment throughout the evening." +
      '\nAnon: very good.'
    template += `\n### Response:\n`
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
