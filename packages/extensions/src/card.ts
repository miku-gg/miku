export type CharacterBook = {
  name?: string
  description?: string
  scan_depth?: number // agnai: "Memory: Chat History Depth"
  token_budget?: number // agnai: "Memory: Context Limit"
  recursive_scanning?: boolean // no agnai equivalent. whether entry content can trigger other entries
  extensions: Record<string, any>
  entries: Array<{
    keys: Array<string>
    content: string
    extensions: Record<string, any>
    enabled: boolean
    insertion_order: number // if two entries inserted, lower "insertion order" = inserted higher
    case_sensitive?: boolean

    // FIELDS WITH NO CURRENT EQUIVALENT IN SILLY
    name?: string // not used in prompt engineering
    priority?: number // if token budget reached, lower priority value = discarded first

    // FIELDS WITH NO CURRENT EQUIVALENT IN AGNAI
    id?: number // not used in prompt engineering
    comment?: string // not used in prompt engineering
    selective?: boolean // if `true`, require a key from both `keys` and `secondary_keys` to trigger the entry
    secondary_keys?: Array<string> // see field `selective`. ignored if selective == false
    constant?: boolean // if true, always inserted in the prompt (within budget limit)
    position?: 'before_char' | 'after_char' // whether the entry is placed before or after the character defs
  }>
}

export type TavernCardV2 = {
  spec: 'chara_card_v2'
  spec_version: '2.0' // May 8th addition
  data: {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    mes_example: string

    // New fields start here
    creator_notes: string
    system_prompt: string
    post_history_instructions: string
    alternate_greetings: Array<string>

    // May 8th additions
    tags: Array<string>
    creator: string
    character_version: string
    extensions: Record<string, any>
  }
}

export type MikuCard = TavernCardV2 & {
  data: {
    extensions: {
      mikugg: {
        license: string // LICENSE of the bot, set by the bot author
        language: string // Indicates the language of the bot, NOT used in the prompt
        short_description: string // Small description of the bot, NOT used in the prompt
        profile_pic: string // profile pic of the bot
        start_scenario: string // id of the first scenario
        scenarios: { // scenarios of the bot conversation
          id: string // id of the scenario
          name: string; // name of the scenario, only of labels in editor
          children_scenarios: string[] // ids of the scenarios that can be triggered from this scenario
          context: string // value to be inserted in the prompt when the scenario is triggered
          trigger_suggestion_similarity: string // keywords that can trigger this scenario, NOT in prompt
          trigger_action: string // text of the button that triggers this scenario, NOT in prompt
          background: string // id of the background to be used in this scenario
          emotion_group: string // id of the bot's emotion group to be used in this scenario
          voice: string // id of the bot's voice to be used in this scenario
          music?: string // id of the music to be used in this scenario
        }[]
        emotion_groups: {
          id: string, // id of the emotion group
          name: string, // name of the emotion group, NOT used in the prompt
          template: string, // template of group of emotions to be used
          emotions: { // list of emotions of the group, derived from the template
            id: string, // id of the emotion
            source: string[] // [idleImg, talkingImg, ...], can be png or webm
            sound?: string // id of the sound to be used when the emotion is triggered
          }[]
        }[]
        backgrounds: {
          id: string // id of the background
          description: string // description of the background, NOT used in the prompt
          source: string // hash of the background image, can be jpg, png or webm
        }[]
        voices: {
          id: string // id of the voice
          provider: string // provider of the voice (elevenlabs or azure)
          provider_voice_id: string // id of the voice in the provider
          provider_emotion?: string // emotion of the voice in the provider (optional)
          training_sample?: string // text sample used to train the voice (optional)
        }[]
        sounds?: {
          id: string // id of the music
          name: string // name of the music, NOT used in the prompt
          source: string // hash of the music file, can be mp3 or ogg
        }[]
      }
    }
  }
}
