import { AbstractPromptStrategy } from '../AbstractPromptStrategy'
import {
  selectChatHistory,
  selectCurrentScene,
} from '../../../../state/selectors'
import { RootState } from '../../../../state/store'

export class AlpacaSceneSuggestionStrategy extends AbstractPromptStrategy<
  RootState,
  {
    actionText: string
    probability: string
    prompt: string
    sdPrompt: string
  }[]
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
    const scene = selectCurrentScene(input)
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
    template +=
      '### Response:' +
      '\nSCENE 1:\n' +
      '  ACTION: Plan the party together.\n' +
      '  PROBABILITY: 90%\n' +
      '  DESCRIPTION: *Anon and Nala sit down together at a large table in the study, spreading out papers and notes. They begin to discuss the details of the party, including the guest list, menu, decorations, and music.*\n' +
      '  PLACE: A hall with a long table filled with various papers, books, and party supplies.\n' +
      '\nSCENE 2:\n' +
      '  ACTION:  Have a heart-to-heart moment.\n' +
      '  PROBABILITY: 50%\n' +
      '  DESCRIPTION: *As they work together, Nala begins to open up to Anon about her past experiences with her previous master. Anon listens empathetically, and assures Nala that she will never be treated like that again.*\n' +
      '  PLACE:  A hall with a long table filled with various papers, books, and party supplies.\n' +
      '\nSCENE 3:\n' +
      '  ACTION: Practice serving skills.\n' +
      '  PROBABILITY: 70%\n' +
      "  DESCRIPTION: *With the party fast approaching, Anon decides to test Nala's serving skills. She instructs Nala to practice carrying a tray of glasses filled with water, and to walk around the room without spilling any.*\n" +
      '  PLACE: A mansion room with tables and chairs with no people.\n'
    template += `\n### Input:\n`
    template += `${personas}\n`
    if (scene?.prompt) template += `SCENE:\n${scene.prompt}\n`
    template += `CONVERSATION:\n${messages}\n`
    template += `### Response:\n`
    template += `SCENE 1:\n`
    template += `  ACTION:{{GEN action_1 max_tokens=10 stop=["\\n", "\\""]}}"\n`
    template += `  PROBABILITY:{{GEN prob_1 max_tokens=3 stop=["\\n", "\\"", "%"]}}"\n`
    template += `  DESCRIPTION:{{GEN desc_1 max_tokens=50 stop=["\\n", "\\""]}}"\n`
    template += `  PLACE:{{GEN place_1 max_tokens=20 stop=["\\n", "\\""]}}"\n`

    template += `SCENE 2:\n`
    template += `  ACTION:{{GEN action_2 max_tokens=10 stop=["\\n", "\\""]}}"\n`
    template += `  PROBABILITY:{{GEN prob_2 max_tokens=3 stop=["\\n", "\\"", "%"]}}"\n`
    template += `  DESCRIPTION:{{GEN desc_2 max_tokens=50 stop=["\\n", "\\""]}}"\n`
    template += `  PLACE:{{GEN place_2 max_tokens=20 stop=["\\n", "\\""]}}"\n`

    template += `SCENE 3:\n`
    template += `  ACTION:{{GEN action_3 max_tokens=10 stop=["\\n", "\\""]}}"\n`
    template += `  PROBABILITY:{{GEN prob_3 max_tokens=3 stop=["\\n", "\\"", "%"]}}"\n`
    template += `  DESCRIPTION:{{GEN desc_3 max_tokens=50 stop=["\\n", "\\""]}}"\n`
    template += `  PLACE:{{GEN place_3 max_tokens=20 stop=["\\n", "\\""]}}"\n`

    return {
      template,
      variables: {},
      totalTokens: this.countTokens(template) + maxNewTokens * 3,
    }
  }

  public completeResponse(
    _input: RootState,
    response: {
      actionText: string
      probability: string
      prompt: string
      sdPrompt: string
    }[],
    variables: Map<string, string>
  ): {
    actionText: string
    probability: string
    prompt: string
    sdPrompt: string
  }[] {
    return [
      {
        actionText: variables.get('action_1') || '',
        probability: variables.get('prob_1') || '',
        prompt: variables.get('desc_1') || '',
        sdPrompt: variables.get('place_1') || '',
      },
      {
        actionText: variables.get('action_2') || '',
        probability: variables.get('prob_2') || '',
        prompt: variables.get('desc_2') || '',
        sdPrompt: variables.get('place_2') || '',
      },
      {
        actionText: variables.get('action_3') || '',
        probability: variables.get('prob_3') || '',
        prompt: variables.get('desc_3') || '',
        sdPrompt: variables.get('place_3') || '',
      },
    ]
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
