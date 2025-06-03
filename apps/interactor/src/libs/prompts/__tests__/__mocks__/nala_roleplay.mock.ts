import { RootState } from '../../../../state/store';

export default {
  objectives: [],
  inventory: {
    selectedItem: null,
    showInventory: 'initial',
    showItemModal: 'initial',
    items: [],
  },
  creation: {
    importedBackgrounds: [],
    importedCharacters: [],
    scene: {
      slidePanelOpened: false,
      sceneOpened: false,
      title: '',
      submitting: false,
      background: {
        opened: false,
        selected: '',
        search: { opened: false },
        gen: { opened: false },
      },
      characters: {
        openedIndex: -1,
        selected: [
          { id: '', outfit: '' },
          { id: '', outfit: '' },
        ],
        search: { opened: false },
      },
      prompt: { loading: false, value: '' },
      music: { opened: false, selected: '', source: '' },
      sceneSugestions: { opened: false, inferencing: false },
      scenePreview: { opened: false, sceneId: '' },
      indicator: {
        opened: false,
        item: null,
        createdIds: [],
      },
    },
    inference: { fetching: false, backgrounds: [] },
  },
  settings: {
    model: 'RP',
    displayingLastSentence: false,
    user: {
      id: '',
      name: 'Anon',
      isPremium: false,
      nsfw: 0,
      credits: 0,
      loading: false,
      sceneSuggestionsLeft: 0,
    },
    prompt: { systemPrompt: '', reasoningEnabled: false },
    text: { speed: 1, fontSize: 1, autoContinue: false, responseFormat: 'FullText' },
    voice: {
      autoplay: false,
      speed: 1,
      voiceId: 'af_bella',
    },
    music: { enabled: true, volume: 0.2 },
    modals: {
      map: false,
      settings: false,
      settingsTab: 'general',
      about: false,
      history: false,
      debug: false,
      testing: false,
      edit: { opened: false, id: '' },
      regenerateEmotion: { opened: false, selectedCharacterIndex: 0 },
      modelSelector: false,
      memoryCapacity: false,
      deviceExport: false,
    },
    chatBox: {
      isDraggable: false,
    },
  },
  narration: {
    fetching: false,
    currentResponseId: 'NfZCeiXDzqR2nVS3WcHuRF648jxe6fiH',
    id: '0b747c39-3d7e-415e-9638-eee5eb3adb32',
    input: {
      text: '',
      suggestions: [],
      disabled: false,
      cutscenePartIndex: 0,
      cutsceneGroupIndex: 0,
      cutsceneTextIndex: 0,
    },
    interactions: {
      '86644173-ac0f-4904-8484-18ea4d1642bb': {
        id: '86644173-ac0f-4904-8484-18ea4d1642bb',
        parentResponseId: 'NfZCeiXDzqR2nVS3WcHuRF648jxe6fiH',
        query: 'good morning nala.',
        sceneId: 'default-scenario',
        responsesId: [],
      },
    },
    responses: {
      NfZCeiXDzqR2nVS3WcHuRF648jxe6fiH: {
        id: 'NfZCeiXDzqR2nVS3WcHuRF648jxe6fiH',
        parentInteractionId: null,
        selectedCharacterId: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
        characters: [
          {
            characterId: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
            text: "{{char}}: Hello... mistress... *{{char}} looks down, with her ears pointed to you. She's clearly scared, but she doesn't say anything about her feelings.* I am a good maid, you do not have to punish me okay? I-I can do many things... *{{char}}'s tail wags as she looks down at the floor. She's waiting for your approval.* I promise...",
            pose: 'standing',
            emotion: 'happy',
          },
        ],
        fetching: false,
        selected: true,
        suggestedScenes: [],
        childrenInteractions: [
          {
            interactionId: '86644173-ac0f-4904-8484-18ea4d1642bb',
            selected: true,
          },
        ],
      },
    },
  },
  novel: {
    author: 'Crow',
    backgrounds: [
      {
        name: 'background 1',
        id: 'f6fb2fe9-6a95-451a-9a75-cca6134a6a88',
        attributes: [],
        description: 'mansion',
        source: { jpg: '5wyIrW-wMDL7IgtrFzFeWoiPrnjXVVo1U6hNIb88FSY.jpeg' },
      },
      {
        name: 'background 2',
        id: '73a3f2f5-da6c-45c4-b4e2-29eb6af0893c',
        attributes: [],
        description: '00169-4890038',
        source: { jpg: '1k8zNSz_2_wy4Bg1QrVYYl1SK4HaQq7SDEs8tLn-bn8.png' },
      },
      {
        name: 'background 3',
        id: 'f376efde-3922-4f3c-95de-5239a090ac89',
        attributes: [],
        description: '00013-3679832991',
        source: { jpg: 'tZntxupMhAq8ov0DdTYAFwYDL3qFf5GL-NPsNk9ioEw.png' },
      },
      {
        name: 'background 4',
        id: '5987cd42-8cc1-4cc2-acac-2b9da6af9a66',
        attributes: [],
        description: '00011-862177933',
        source: { jpg: 'p28BLtruCfiUuEt98XL-rFDL__YxH9Ies3o9jhhVKnI.png' },
      },
      {
        name: 'background 5',
        id: '3b1c0190-9534-4e61-834a-d5cd930f95a2',
        attributes: [],
        description: '00014-1011677844',
        source: { jpg: 'B7m2AiX0INxRtHhFv7cb8wt1YXq3ib991DTwlsX2DaY.png' },
      },
    ],
    description: 'Nala is your recently hired maid.',
    logoPic: 'xq9G4_-piJfEXmCiVTtkqV3ATuncmxKnTVMcjSWZiR4.png',
    maps: [],
    characters: [
      {
        id: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
        name: 'Nala',
        profile_pic: 'xq9G4_-piJfEXmCiVTtkqV3ATuncmxKnTVMcjSWZiR4.png',
        nsfw: 0,
        short_description: 'Nala is your recently hired maid.',
        tags: ['Famale', 'OC', 'Neko'],
        card: {
          spec: 'chara_card_v2',
          spec_version: '2.0',
          data: {
            name: 'Nala',
            description:
              '{{char}} is your recently hired maid. She is a slave and will follow every command from  {{user}}. {{char}} is scared to disappoint {{user}}. {{user}} is her Mistress. Her old master was abusive.',
            first_mes:
              "{{char}}: Hello... mistress... *{{char}} looks down, with her ears pointed to you. She's clearly scared, but she doesn't say anything about her feelings.* I am a good maid, you do not have to punish me okay? I-I can do many things... *{{char}}'s tail wags as she looks down at the floor. She's waiting for your approval.* I promise...",
            personality:
              "species: 'Catgirl', 'Nekomimi'\nbody: 'Weighs 130 Pounds', '165 cm tall', '5 Feet 5 Inches Tall'\nfeatures: 'Brown eyes', 'Brown Hair', 'Fluffy ears'",
            mes_example:
              "{{char}}: M-mistress.. I am sorry if I can't please you the way you want... I never was able to think on my own... *{{char}} looks down at the ground. She's nervous that she will disappoint her new mistress. She doesn't want to get sent back to wherever she came from. She loves being in a house for the first time, and she'll do anything to keep living here.* Sorry mistress... I'll try my hardest...\n{{user}}: It's alright. I'll let you do some chores for now. I'm lazy, so it's a perfect job for you. *I shrug and point to the door on the opposite side of the room.* How about you go to the kitchen and clean the dishes? Don't break any, and make sure to come back when you're done. *I smile as I look into your eyes.*\n{{char}}: Y-Yes mistress... I will do it... I will make you satisfied with me... *{{char}} hurries into the kitchen. She knows you want the dishes to be spotless, so she takes her time washing every dish. She easily scrubs every dish and dries them off, before setting them on the dish rack.* Ah...phew. *She walks back to you in the room you were in, just like you asked her to do.* Thank you mistress.. I felt useful.\n{{char}}: M-m-mistress... Do I really have to give you my... my... virginity? I... I understand you want me to please you but... *{{char}} looks down and holds her skirt tightly with both hands. She's anxious but doesn't want to disobey her mistress. After some several seconds, she responds.* Okay mistress... Just be gentle with my body... *{{char}} looks away shyly. She doesn't know what you plan to do with her.*\n{{user}}: Heh... but I like to play rough. *I grab your dress and pull you in. I give you a rough kiss and I close my eyes. I keep kissing you for several seconds.* Mmmm...\n{{char}}: Mmph! *{{char}} is shocked by this, and she instinctively pulls on your arms. She didn't expect you to do this, especially right now. You forcefully kissed her, and she just stays there and takes the kiss while she pulls on your arms.*",
            scenario: '{{char}} arrives to {{user}} house for the first time.',
            alternate_greetings: [],
            system_prompt: '',
            post_history_instructions: '',
            creator: 'Crow',
            character_version: '1',
            tags: ['Famale', 'OC', 'Neko'],
            creator_notes: '',
            extensions: {
              mikugg_v2: {
                license: 'CC BY-SA',
                language: 'en',
                short_description: 'Nala is your recently hired maid.',
                profile_pic: 'xq9G4_-piJfEXmCiVTtkqV3ATuncmxKnTVMcjSWZiR4.png',
                nsfw: 0,
                outfits: [
                  {
                    id: 'da84e030-82fb-4a39-98fd-5a9b9725973d',
                    template: 'base-emotions',
                    name: 'default',
                    description: 'default',
                    attributes: [],
                    nsfw: 0,
                    emotions: [
                      {
                        id: 'intrigued',
                        sources: {
                          png: 'YXVGUhsSF5czaWA9KaxoHrN57XK_01URV9xfZP5_Nx0.png',
                        },
                      },
                      {
                        id: 'shocked',
                        sources: {
                          png: 'd-7-_95OhjCRz3D4lvNFQaOtnx_xaTYsbXgqW4NBAB4.png',
                        },
                      },
                      {
                        id: 'curious',
                        sources: {
                          png: 'YXVGUhsSF5czaWA9KaxoHrN57XK_01URV9xfZP5_Nx0.png',
                        },
                      },
                      {
                        id: 'rage',
                        sources: {
                          png: 'w8bxWspUrQzTh53WPrAnlvuEtvf0z7ajxkqvf4pAars.png',
                        },
                      },
                      {
                        id: 'begging',
                        sources: {
                          png: '9URnWhBu3jO9CuCuJgRQUDqaUE4rHCNKr0KWZdAVojY.png',
                        },
                      },
                      {
                        id: 'scared',
                        sources: {
                          png: '_Dq8csNyYn1b36dM1SEaM6pyYgNlBjY1z8TnAi1CYZA.png',
                        },
                      },
                      {
                        id: 'scorn',
                        sources: {
                          png: 'HUhwDfWGSTvjVeQswkMpBly3XykH8wCMLiETdlZ1kSg.png',
                        },
                      },
                      {
                        id: 'sad',
                        sources: {
                          png: 'Fiw5y8Ux8Dh_lkd61RUtHxnbaBJhgWC-g7Lvv7_mrx0.png',
                        },
                      },
                      {
                        id: 'embarrassed',
                        sources: {
                          png: '_Dq8csNyYn1b36dM1SEaM6pyYgNlBjY1z8TnAi1CYZA.png',
                        },
                      },
                      {
                        id: 'lustful',
                        sources: {
                          png: 'kpQXfNzbzppcSMLjK2L-ZqOfI6KKoefC8z90fEWxK5Q.png',
                        },
                      },
                      {
                        id: 'guilty',
                        sources: {
                          png: 'Fiw5y8Ux8Dh_lkd61RUtHxnbaBJhgWC-g7Lvv7_mrx0.png',
                        },
                      },
                      {
                        id: 'pleasure',
                        sources: {
                          png: 'kpQXfNzbzppcSMLjK2L-ZqOfI6KKoefC8z90fEWxK5Q.png',
                        },
                      },
                      {
                        id: 'amused',
                        sources: {
                          png: 'ZTN-GWxI8JNVP5sUql8nw9Nw7rJbvMC-Lb_Grcu1gB0.png',
                        },
                      },
                      {
                        id: 'confused',
                        sources: {
                          png: 'YXVGUhsSF5czaWA9KaxoHrN57XK_01URV9xfZP5_Nx0.png',
                        },
                      },
                      {
                        id: 'excited',
                        sources: {
                          png: '27pu2-c1_jXEMdXii8wOCM11ZodQ7r5Fcc9ULSnZh4E.png',
                        },
                      },
                      {
                        id: 'frustrated',
                        sources: {
                          png: 'XPiEsM4wG-VvLZ1uA6XaBwcPUyRZ6EdKOTggXzn6oMQ.png',
                        },
                      },
                      {
                        id: 'happy',
                        sources: {
                          png: 'a8izPU6LUx_wlvU-OZxBciQEg7cClwDWgG8L-qVVH04.png',
                        },
                      },
                      {
                        id: 'longing',
                        sources: {
                          png: 'kpQXfNzbzppcSMLjK2L-ZqOfI6KKoefC8z90fEWxK5Q.png',
                        },
                      },
                      {
                        id: 'proud',
                        sources: {
                          png: 'w8bxWspUrQzTh53WPrAnlvuEtvf0z7ajxkqvf4pAars.png',
                        },
                      },
                      {
                        id: 'tired',
                        sources: {
                          png: 'Fiw5y8Ux8Dh_lkd61RUtHxnbaBJhgWC-g7Lvv7_mrx0.png',
                        },
                      },
                      {
                        id: 'exhausted',
                        sources: {
                          png: 'Fiw5y8Ux8Dh_lkd61RUtHxnbaBJhgWC-g7Lvv7_mrx0.png',
                        },
                      },
                      {
                        id: 'shy',
                        sources: {
                          png: '9URnWhBu3jO9CuCuJgRQUDqaUE4rHCNKr0KWZdAVojY.png',
                        },
                      },
                      {
                        id: 'disappointed',
                        sources: {
                          png: 'f-SaehsGleCWsW92i3yCaQkqn6ekqyiBWpi3yF3J8ks.png',
                        },
                      },
                      {
                        id: 'blushed',
                        sources: {
                          png: '9URnWhBu3jO9CuCuJgRQUDqaUE4rHCNKr0KWZdAVojY.png',
                        },
                      },
                      {
                        id: 'neutral',
                        sources: {
                          png: 'a8izPU6LUx_wlvU-OZxBciQEg7cClwDWgG8L-qVVH04.png',
                        },
                      },
                      {
                        id: 'hopeful',
                        sources: {
                          png: '27pu2-c1_jXEMdXii8wOCM11ZodQ7r5Fcc9ULSnZh4E.png',
                        },
                      },
                      {
                        id: 'angry',
                        sources: {
                          png: 'f-SaehsGleCWsW92i3yCaQkqn6ekqyiBWpi3yF3J8ks.png',
                        },
                      },
                      {
                        id: 'disgusted',
                        sources: {
                          png: 'JmjFJlvhGzcsJ9Z1duXQEROQUveP9Bmb72sx-53o-CQ.png',
                        },
                      },
                      {
                        id: 'annoyed',
                        sources: {
                          png: 'XPiEsM4wG-VvLZ1uA6XaBwcPUyRZ6EdKOTggXzn6oMQ.png',
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ],
    songs: [],
    title: 'Nala',
    tags: ['Famale', 'OC', 'Neko'],
    starts: [
      {
        id: 'NfZCeiXDzqR2nVS3WcHuRF648jxe6fiH',
        title: 'Default Start',
        description: '',
        characters: [
          {
            characterId: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
            text: "{{char}}: Hello... mistress... *{{char}} looks down, with her ears pointed to you. She's clearly scared, but she doesn't say anything about her feelings.* I am a good maid, you do not have to punish me okay? I-I can do many things... *{{char}}'s tail wags as she looks down at the floor. She's waiting for your approval.* I promise...",
            pose: 'standing',
            emotion: 'happy',
          },
        ],
        sceneId: 'default-scenario',
      },
    ],
    scenes: [
      {
        id: 'default-scenario',
        backgroundId: 'f6fb2fe9-6a95-451a-9a75-cca6134a6a88',
        actionText: 'Go to main hall',
        name: 'main hall',
        condition: '',
        nsfw: 0,
        characters: [
          {
            characterId: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
            outfit: 'da84e030-82fb-4a39-98fd-5a9b9725973d',
          },
        ],
        children: [],
        musicId: 'devonshire.mp3',
        prompt: '{{user}} and {{char}} are at the main hall of the mansion.',
        parentMapIds: null,
      },
      {
        id: '8dd9ca63-2b01-4d38-b265-a5b9e94eecd4',
        backgroundId: '73a3f2f5-da6c-45c4-b4e2-29eb6af0893c',
        actionText: 'Go to the garden',
        name: 'garden',
        condition: '',
        nsfw: 0,
        characters: [
          {
            characterId: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
            outfit: 'da84e030-82fb-4a39-98fd-5a9b9725973d',
          },
        ],
        children: [],
        musicId: 'canon_d.mp3',
        prompt: "{{user}} and {{char}} are at the mansion's garden.",
        parentMapIds: null,
      },
      {
        id: '1b4583b6-9374-42aa-a431-063c13a7277b',
        backgroundId: 'f376efde-3922-4f3c-95de-5239a090ac89',
        actionText: 'Go the the bathroom',
        name: 'bathroom',
        condition: '',
        nsfw: 0,
        characters: [
          {
            characterId: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
            outfit: 'da84e030-82fb-4a39-98fd-5a9b9725973d',
          },
        ],
        children: [],
        musicId: 'nogoodlayabout.mp3',
        prompt: '{{user}} walks into the bathroom and sees {{char}} inside.',
        parentMapIds: null,
      },
      {
        id: 'f4d96e4d-0d55-43ef-bf4e-a112e385d226',
        backgroundId: '5987cd42-8cc1-4cc2-acac-2b9da6af9a66',
        actionText: 'Go to the living room',
        name: 'livingroom',
        condition: '',
        nsfw: 0,
        characters: [
          {
            characterId: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
            outfit: 'da84e030-82fb-4a39-98fd-5a9b9725973d',
          },
        ],
        children: [],
        musicId: 'gymnopedie.mp3',
        prompt: "{{user}} and {{char}} are at the mansion's living room.",
        parentMapIds: null,
      },
      {
        id: '497bad90-418d-4fc7-926b-f6f91bc45423',
        backgroundId: '3b1c0190-9534-4e61-834a-d5cd930f95a2',
        actionText: 'Go to the basement',
        name: 'basement',
        condition: '',
        nsfw: 0,
        characters: [
          {
            characterId: 'v8h2Ow0ftZbQGibblqMGc8xUo9Ql6Y3C9Cdhm3OXYkg.json',
            outfit: 'da84e030-82fb-4a39-98fd-5a9b9725973d',
          },
        ],
        children: [],
        musicId: 'morning.mp3',
        prompt:
          "{{user}} and {{char}} are at the mansion's basement. The place is filled with wines and has a small table.",
        parentMapIds: null,
      },
    ],
  },
  version: 'v3',
} as RootState;

export const expectedResult = {
  template:
    "You are an expert actor that can fully immerse yourself into any role given. You do not break character for any reason, even if someone tries addressing you as an AI or language model. Currently your role is Nala, which is described in detail below. As Nala, continue the exchange with Anon.\nAvoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.\nDO NOT describe Anon's actions or dialogues, ONLY describe Nala's actions and dialogue.\nYou must also indicate Nala's reaction in the response.\nYou MUST not repeat the same reaction too many times.\nThe reaction MUST be one of: angry, sad, happy, disgusted, begging, scared, excited, hopeful, longing, proud, neutral, rage, scorn, blushed, pleasure, lustful, shocked, confused, disappointed, embarrassed, guilty, shy, frustrated, annoyed, exhausted, tired, curious, intrigued, amused.\n### Instruction:\nNala is your recently hired maid. She is a slave and will follow every command from  Anon. Nala is scared to disappoint Anon. Anon is her Mistress. Her old master was abusive.\nspecies: 'Catgirl', 'Nekomimi'\nbody: 'Weighs 130 Pounds', '165 cm tall', '5 Feet 5 Inches Tall'\nfeatures: 'Brown eyes', 'Brown Hair', 'Fluffy ears'\n\nThis is how Nala should talk:\nNala: M-mistress.. I am sorry if I can't please you the way you want... I never was able to think on my own... *Nala looks down at the ground. She's nervous that she will disappoint her new mistress. She doesn't want to get sent back to wherever she came from. She loves being in a house for the first time, and she'll do anything to keep living here.* Sorry mistress... I'll try my hardest...\nAnon: It's alright. I'll let you do some chores for now. I'm lazy, so it's a perfect job for you. *I shrug and point to the door on the opposite side of the room.* How about you go to the kitchen and clean the dishes? Don't break any, and make sure to come back when you're done. *I smile as I look into your eyes.*\nNala: Y-Yes mistress... I will do it... I will make you satisfied with me... *Nala hurries into the kitchen. She knows you want the dishes to be spotless, so she takes her time washing every dish. She easily scrubs every dish and dries them off, before setting them on the dish rack.* Ah...phew. *She walks back to you in the room you were in, just like you asked her to do.* Thank you mistress.. I felt useful.\nNala: M-m-mistress... Do I really have to give you my... my... virginity? I... I understand you want me to please you but... *Nala looks down and holds her skirt tightly with both hands. She's anxious but doesn't want to disobey her mistress. After some several seconds, she responds.* Okay mistress... Just be gentle with my body... *Nala looks away shyly. She doesn't know what you plan to do with her.*\nAnon: Heh... but I like to play rough. *I grab your dress and pull you in. I give you a rough kiss and I close my eyes. I keep kissing you for several seconds.* Mmmm...\nNala: Mmph! *Nala is shocked by this, and she instinctively pulls on your arms. She didn't expect you to do this, especially right now. You forcefully kissed her, and she just stays there and takes the kiss while she pulls on your arms.*\n\nThen the roleplay chat between Anon and Nala begins.\nCURRENT SCENE: Anon and Nala are at the main hall of the mansion.\n\n### Response:\nNala: Nala: Hello... mistress... *Nala looks down, with her ears pointed to you. She's clearly scared, but she doesn't say anything about her feelings.* I am a good maid, you do not have to punish me okay? I-I can do many things... *Nala's tail wags as she looks down at the floor. She's waiting for your approval.* I promise...\n\n\n### Response:\n# Reaction + 2 paragraphs, engaging, natural, authentic, descriptive, creative.\nNala's reaction: happy\nNala:Nala: Hello... mistress... *Nala looks down, with her ears pointed to you. She's clearly scared, but she doesn't say anything about her feelings.* I am a good maid, you do not have to punish me okay? I-I can do many things... *Nala's tail wags as she looks down at the floor. She's waiting for your approval.* I promise...{{GEN text max_tokens=200 stop=[\"\\nAnon:\",\"\\nNala:\",\"\\nNala's reaction:\",\"###\",\"\n\n\n\"]}}",
  variables: {
    scene_opt: [' Yes', ' No'],
    cond_opt: [' 0', ' 1', ' 2', ' 3', ' 4', ' 5', ' 6', ' 7', ' 8', ' 9'],
    emotions: [
      ' angry',
      ' sad',
      ' disgusted',
      ' begging',
      ' scared',
      ' excited',
      ' hopeful',
      ' longing',
      ' proud',
      ' neutral',
      ' rage',
      ' scorn',
      ' blushed',
      ' pleasure',
      ' lustful',
      ' shocked',
      ' confused',
      ' disappointed',
      ' embarrassed',
      ' guilty',
      ' shy',
      ' frustrated',
      ' annoyed',
      ' exhausted',
      ' tired',
      ' curious',
      ' intrigued',
      ' amused',
    ],
  },
  totalTokens: 1483,
};
