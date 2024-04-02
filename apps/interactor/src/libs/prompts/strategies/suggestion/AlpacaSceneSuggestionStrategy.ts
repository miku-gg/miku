import { AbstractPromptStrategy } from '../AbstractPromptStrategy'
import {
  selectCharactersInCurrentScene,
  selectChatHistory,
  selectCurrentScene,
} from '../../../../state/selectors'
import { RootState } from '../../../../state/store'
import { fillTextTemplate } from '..'

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
    const characters = selectCharactersInCurrentScene(input)
    const scene = selectCurrentScene(input)
    let template = `You're a writing assistance that will suggest possible next scenarios for a story.\n`
    template += `### Instruction:\n`
    template += `Given an input of the current scene and conversation. You MUST suggest 3 possible next scenes, give it a score of how probable it should be and describe a text explaining what should happen next. Also, describe an "action" for a button that the user can click.\n`
    template += `Each of the 3 scenes MUST indicate a change in the background, so you MUST describe a different environment.\n`
    // SHOTS: START
    template += `### Input:\n`
    template +=
      'Nala is your recently hired maid. She is a slave and will follow every command from  {{user}}. Nala is scared to disappoint {{user}}. {{user}} is her Mistress. Her old master was abusive.\nSCENE: {{user}} and Nala are at the main hall of the mansion.' +
      "\nNala: Hello... mistress... *Nala looks down, with her ears pointed to you. She's clearly scared, but she doesn't say anything about her feelings.* I am a good maid, you do not have to punish me okay? I-I can do many things... *Nala's tail wags as she looks down at the floor. She's waiting for your approval.* I promise..." +
      '\nAnon: hello, can you help me with a party?' +
      "\nNala: Oh yes, mistress! Of course, I would love to help you prepare for a party! I can cook, clean, decorate, and even serve drinks. Whatever you need, I'm here to assist you. Let's make this party an unforgettable event!" +
      '\nAs Nala speaks, her brown eyes light up with excitement, and her fluffy ears twitch eagerly. She stands up straight, confident in her ability to help you throw an amazing party. Her tail swings back and forth behind her, adding to her enthusiasm.' +
      "\nAnon: Well I don't know yet, I need to organize. the party is tomorrow night and the people coming are nobles. any ideas?\nNala: Hmm, well, we could start by deciding on a theme for the party. Perhaps something elegant and sophisticated, such as a masquerade ball or a black tie affair. This would allow us to create a cohesive atmosphere throughout the entire event. We could use candles and dimmed lights to set a romantic ambiance, and incorporate elements of gold and silver to add a touch of luxury.\n" +
      "\nFor food and drinks, we could offer a variety of hors d'oeuvres and cocktails. Some popular options among nobility include caviar, oysters, and champagne. However, we should also consider offering vegetarian and non-alcoholic options to accommodate guests with dietary restrictions. Additionally, we could arrange for live music, perhaps a string quartet or jazz band, to provide entertainment throughout the evening." +
      '\nAnon: very good.'
    template +=
      '\n### Response:' +
      '\nSCENE 1:\n' +
      '  BACKGROUND: masion hall, long table, papers, books, party supplies, afternoon.\n' +
      '  ACTION: Plan the party together.\n' +
      '  PROBABILITY: 90%\n' +
      '  DESCRIPTION: *{{user}} and Nala sit down together at a large table in the study, spreading out papers and notes. They begin to discuss the details of the party, including the guest list, menu, decorations, and music.*\n' +
      'SCENE 2:\n' +
      '  BACKGROUND: kitchen, window, white marble, vegetables, cakes, luxury\n' +
      '  ACTION:  Have a heart-to-heart moment.\n' +
      '  PROBABILITY: 50%\n' +
      '  DESCRIPTION: *As they prepare cooking in the kitchen, Nala begins to open up to {{user}} about her past experiences with her previous master. {{user}} listens empathetically, and assures Nala that she will never be treated like that again.*\n' +
      'SCENE 3:\n' +
      '  BACKGROUND: mansion room, tables, chairs, empty with no people, paltes, dinner, candles\n' +
      '  ACTION: Practice serving skills.\n' +
      '  PROBABILITY: 70%\n' +
      "  DESCRIPTION: *With the party fast approaching, {{user}} decides to test Nala's serving skills. She instructs Nala to practice carrying a tray of glasses filled with water, and to walk around the room without spilling any.*\n"
    // template +=
    //   `### Input:\n` +
    //   `Roxy = [Calm, Collected, Headstrong, Wise, Gentle, Intelligent, Rational, Clumsy, Slightly Reserved., Sleepy]` +
    //   `Roxy's background = [Born to a demon Race of the Mirgurd Tribe, she was born without her race's special ability to communicate telepathically. Due to this, she was always an outcast, and felt very isolated at her home, despite her parents always being kind to her. Due to this isolation, she ended up running away from them to escape from that. After being an adventurer for a handful of years and attending a prestigious magic university, she became a traveling tutor to make ends meet.]` +
    //   `Roxy's desire = [Roxy is always looking to improve herself. She will go through leaps and bounds to achieve something new, usually in the field of magic, and has been seen to work and push herself very far for the sake of others, with no need to compensation. She has a fantasy about being saved by a hero in a dungeon and falling in love with him.]` +
    //   `Roxy's body = [Roxy has the appearance of a petite young girl and is short, and somewhat self conscious about it. She is 44 years old, and her race lives on average to about 200, making her rather young. She has pale skin, and long, water blue colored hair tied into two braids reaching below her waist. Her eyes are the same color and described to be sleepy looking. She usually wears a brown, white, and black magicians hat, and robe. Can often be seen carrying a large white and blue staff to amplify her water magic.]` +
    //   `What Roxy Likes = [Teaching, Adventuring, Heroes, ]\nWhat Roxy Loves = [Magic, Learning, Sweets, Self Improvement]\nWhat Roxy hates = [Green peppers, superds, non sweetened alcohol, slavery, rape, bitter foods.]` +
    //   `SCENE:\nAnon and Roxy are outside learning about magic.` +
    //   `CONVERSATION:` +
    //   `{{user}}: Oh, are you my teacher?\n
    // Roxy: "Yes, indeed. Your mother told me you were interested in learning some magic. I'm Roxy, your new tutor. It's nice to finally meet you."\n
    // *As I extend my hand forward for a polite greeting, I notice {{user}}'s hesitation. Perhaps {{user}} weren't expecting someone so young to be your instructor. Nevertheless, I maintain a calm demeanor and reassure {{user}} with a gentle smile.*\n
    // *My gaze lingers on {{user}}'s face, trying to gauge {{user}}'s thoughts and feelings. Despite my lack of telepathic abilities, I've learned to read people quite well over the years.*\n
    // {{user}}: *I look at her, being the same size as me, looks very young.* "nice to meet you, Roxy-sama, where should we start our lessons?"\n
    // Roxy: "Nice to meet you too. And please, there's no need for such formalities; simply calling me 'Roxy' would suffice. Now, regarding our first lesson, I believe starting with basic elemental magic would be ideal. Would you happen to have any preference among fire, earth, air, or water?"\n
    // *I glance around the area, spotting a few trees and bushes that would serve as perfect targets for practice. My fingers lightly tap against my staff, eager to begin the session.*\n
    // {{user}}: alright lest go to that forest\n
    // Roxy: "Excellent choice! The forest provides us with plenty of opportunities to learn and practice various spells. Plus, it's always more enjoyable to study amidst nature than within the confines of four walls."\n
    // *With a spring in my step, I follow closely behind {{user}}, taking in the fresh scents of the woods and listening to the harmony of chirping birds overhead. As we venture deeper into the forest, I can't help but feel invigorated by the energy surrounding us. This environment is truly conducive to honing one's magical skills.*\n
    // *Once we find a suitable clearing, I set down my bag and retrieve several items necessary for today's lesson: a collection of crystals, a small cauldron, and a worn-out spellbook filled with annotations and notes.*
    // `
    // template +=
    //   '\n### Response:' +
    //   '\nSCENE 1:\n' +
    //   '  BACKGROUND: forest, trees, grenery, daylight, forest, 4k, trending in artstation\n' +
    //   '  ACTION: Start practicing elemental magic.\n' +
    //   '  PROBABILITY: 85%\n' +
    //   '  DESCRIPTION: *Roxy takes out different types of crystals and explains their properties related to each element. She then demonstrates simple spells using these crystals, encouraging {{user}} to try casting them as well.*\n' +
    //   'SCENE 2:\n' +
    //   '  BACKGROUND: wonders, path, forest, 4k, road, bench\n' +
    //   '  ACTION: Share stories while resting.\n' +
    //   '  PROBABILITY: 60%\n' +
    //   '  DESCRIPTION: *After practicing for a while, both Roxy and {{user}} take a break. During this time, Roxy shares tales of her own adventures and experiences as a traveling tutor, providing valuable insights and advice for {{user}}.*\n' +
    //   'SCENE 3:\n' +
    //   '  BACKGROUND: forest, dark, magical, mystical, afternoon, sunlight, digital art\n' +
    //   '  ACTION: Encounter a magical creature.\n' +
    //   '  PROBABILITY: 40%\n' +
    //   '  DESCRIPTION: *While exploring the forest during their lesson, Roxy and {{user}} come across a mysterious magical creature. Roxy helps {{user}} approach and interact with the creature safely, teaching {{user}} about its unique abilities and characteristics.*\n'
    // SHOTS: END

    template += `\n### Input:\n`
    template += `${personas}\n`
    if (scene?.prompt) template += `SCENE:\n${scene.prompt}\n`
    template += `CONVERSATION:\n${messages}\n`
    template += `### Response:\n`
    template += `SCENE 1:\n`
    template += `  BACKGROUND:{{GEN place_1 max_tokens=50 stop=["\\n", "\\"", "."]}}"\n`
    template += `  ACTION:{{GEN action_1 max_tokens=15 stop=["\\n", "\\""]}}"\n`
    template += `  PROBABILITY:{{GEN prob_1 max_tokens=3 stop=["\\n", "\\"", "%"]}}"\n`
    template += `  DESCRIPTION:{{GEN desc_1 max_tokens=150 stop=["\\n", "\\""]}}"\n`

    template += `SCENE 2:\n`
    template += `  BACKGROUND:{{GEN place_2 max_tokens=50 stop=["\\n", "\\"", "."]}}\n`
    template += `  ACTION:{{GEN action_2 max_tokens=15 stop=["\\n", "\\""]}}"\n`
    template += `  PROBABILITY:{{GEN prob_2 max_tokens=3 stop=["\\n", "\\"", "%"]}}\n`
    template += `  DESCRIPTION:{{GEN desc_2 max_tokens=150 stop=["\\n", "\\""]}}\n`

    template += `SCENE 3:\n`
    template += `  BACKGROUND:{{GEN place_3 max_tokens=50 stop=["\\n", "\\"", "."]}}\n`
    template += `  ACTION:{{GEN action_3 max_tokens=15 stop=["\\n", "\\""]}}"\n`
    template += `  PROBABILITY:{{GEN prob_3 max_tokens=3 stop=["\\n", "\\"", "%"]}}\n`
    template += `  DESCRIPTION:{{GEN desc_3 max_tokens=150 stop=["\\n", "\\""]}}\n`

    template = fillTextTemplate(template, {
      user: input.settings.user.name,
      bot: (characters?.length && characters[0].name) || '',
      characters: characters?.reduce((prev, { id, name }) => {
        prev[id || ''] = name || ''
        return prev
      }, {} as Record<string, string>),
    })

    return {
      template,
      variables: {},
      totalTokens: this.countTokens(template) + maxNewTokens * 3,
    }
  }

  public completeResponse(
    _input: RootState,
    _response: {
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
