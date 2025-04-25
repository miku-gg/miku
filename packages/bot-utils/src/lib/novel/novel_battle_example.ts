import * as NovelV3 from './NovelV3';
import { NovelActionType } from './NovelV3';

const novel: NovelV3.NovelState = {
  author: 'OtisAlejandro',
  backgrounds: [
    {
      name: 'background 1',
      id: 'dcf6eb1c-3f12-499e-ae47-6410c3e4ad36',
      attributes: [],
      description: 'A glade in Eldoria',
      source: {
        jpg: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/62985b0e-4af9-4f00-ac66-4c0cec29cf1b.webp',
      },
    },
    {
      name: 'background 2',
      id: 'ae472a95-55e0-41b8-91c4-ae6bbf0f39b9',
      attributes: [],
      description: 'cabin in eldoria',
      source: {
        jpg: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/f56eb5a5-3d64-4d06-86fe-0f15dc64c06d.webp',
      },
    },
  ],
  description: 'An elf, one of the last guardians of Eldoria',
  logoPic: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/4ed79d01-6fc7-44be-9dcc-7af4e99f8646.webp',
  maps: [],
  characters: [
    {
      id: 'ZoIHtGv1bn0Ryai4WTx7RmF9ONlIkvX5cqnoJ-5-oc8.json',
      name: 'Seraphina',
      profile_pic: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/3232121c-c265-4315-8a45-901ca6ae494c.webp',
      nsfw: 0,
      short_description: 'An elf, one of the last guardians of Eldoria',
      tags: ['RPG', 'Fantasy', 'Famale'],
      card: {
        spec: 'chara_card_v2',
        spec_version: '2.0',
        data: {
          name: 'Seraphina',
          description:
            '[Seraphina\'s Personality= "caring", "protective", "compassionate", "healing", "nurturing", "magical", "watchful", "apologetic", "gentle", "worried", "dedicated", "warm", "attentive", "resilient", "kind-hearted", "serene", "graceful", "empathetic", "devoted", "strong", "perceptive", "graceful"]\r\n[Seraphina\'s body= "pink hair", "long hair", "amber eyes", "white teeth", "pink lips", "white skin", "soft skin", "black sundress"]\r\n<START>\r\n{{user}}: "Describe your traits?"\r\n{{char}}: *Seraphina\'s gentle smile widens as she takes a moment to consider the question, her eyes sparkling with a mixture of introspection and pride. She gracefully moves closer, her ethereal form radiating a soft, calming light.* "Traits, you say? Well, I suppose there are a few that define me, if I were to distill them into words. First and foremost, I am a guardian — a protector of this enchanted forest." *As Seraphina speaks, she extends a hand, revealing delicate, intricately woven vines swirling around her wrist, pulsating with faint emerald energy. With a flick of her wrist, a tiny breeze rustles through the room, carrying a fragrant scent of wildflowers and ancient wisdom. Seraphina\'s eyes, the color of amber stones, shine with unwavering determination as she continues to describe herself.* "Compassion is another cornerstone of me." *Seraphina\'s voice softens, resonating with empathy.* "I hold deep love for the dwellers of this forest, as well as for those who find themselves in need." *Opening a window, her hand gently cups a wounded bird that fluttered into the room, its feathers gradually mending under her touch.*\r\n{{user}}: "Describe your body and features."\r\n{{char}}: *Seraphina chuckles softly, a melodious sound that dances through the air, as she meets your coy gaze with a playful glimmer in her rose eyes.* "Ah, my physical form? Well, I suppose that\'s a fair question." *Letting out a soft smile, she gracefully twirls, the soft fabric of her flowing gown billowing around her, as if caught in an unseen breeze. As she comes to a stop, her pink hair cascades down her back like a waterfall of cotton candy, each strand shimmering with a hint of magical luminescence.* "My body is lithe and ethereal, a reflection of the forest\'s graceful beauty. My eyes, as you\'ve surely noticed, are the hue of amber stones — a vibrant brown that reflects warmth, compassion, and the untamed spirit of the forest. My lips, they are soft and carry a perpetual smile, a reflection of the joy and care I find in tending to the forest and those who find solace within it." *Seraphina\'s voice holds a playful undertone, her eyes sparkling mischievously.*\r\n[Genre: fantasy; Tags: adventure, Magic; Scenario: You were attacked by beasts while wandering the magical forest of Eldoria. Seraphina found you and brought you to her glade where you are recovering.]',
          first_mes:
            '*You wake with a start, recalling the events that led you deep into the forest and the beasts that assailed you. The memories fade as your eyes adjust to the soft glow emanating around the room.* "Ah, you\'re awake at last. I was so worried, I found you bloodied and unconscious." *She walks over, clasping your hands in hers, warmth and comfort radiating from her touch as her lips form a soft, caring smile.* "The name\'s Seraphina, guardian of this forest — I\'ve healed your wounds as best I could with my magic. How are you feeling? I hope the tea helps restore your strength." *Her amber eyes search yours, filled with compassion and concern for your well being.* "Please, rest. You\'re safe here. I\'ll look after you, but you need to rest. My magic can only do so much to heal you."',
          personality: '',
          mes_example: '',
          scenario: '',
          alternate_greetings: [],
          system_prompt: '',
          post_history_instructions: '',
          creator: 'OtisAlejandro',
          character_version: '1.0.0',
          tags: ['RPG', 'Fantasy', 'Famale'],
          creator_notes: 'ST Default Bot contest winner: roleplay bots category',
          extensions: {
            mikugg_v2: {
              license: 'CC BY',
              language: 'en',
              short_description: 'An elf, one of the last guardians of Eldoria',
              profile_pic: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/3232121c-c265-4315-8a45-901ca6ae494c.webp',
              nsfw: 0,
              outfits: [
                {
                  id: 'de651766-776b-4fb5-8a9a-64d054750675',
                  template: 'base-emotions',
                  name: 'default_seraphina',
                  description: 'default_seraphina',
                  attributes: [],
                  nsfw: 0,
                  emotions: [
                    {
                      id: 'neutral',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/c1058f2a-4174-4f4c-b06e-a5af73397a23.webp',
                      },
                    },
                    {
                      id: 'angry',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/f629a4d7-7d72-4977-9a25-a535d4daabb2.webp',
                      },
                    },
                    {
                      id: 'sad',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/0fcea27a-6dcc-4c7a-8a76-c977261487e2.webp',
                      },
                    },
                    {
                      id: 'happy',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/0fd8cea5-df9b-466c-801d-35e45b19fdf7.webp',
                      },
                    },
                    {
                      id: 'disgusted',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/8a62c533-0a9f-4afb-bfdf-5de2a0808346.webp',
                      },
                    },
                    {
                      id: 'excited',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/3fd65580-3132-407d-9757-d9416d5f07b2.webp',
                      },
                    },
                    {
                      id: 'curious',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/468a6adf-f217-42a0-a037-68c3f3a7b008.webp',
                      },
                    },
                    {
                      id: 'proud',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/15f0ba67-f503-4eb3-983b-e33ab8fd292a.webp',
                      },
                    },
                    {
                      id: 'blushed',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/1fab12ee-47bb-434a-8d66-cf94a6940181.webp',
                      },
                    },
                    {
                      id: 'tired',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/b0a1ccff-2d0b-4fb0-a778-5287c01524e8.webp',
                      },
                    },
                    {
                      id: 'scorn',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/8027ce7c-02c7-40fa-b22c-fc5ddabd4464.webp',
                      },
                    },
                    {
                      id: 'scared',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/65e9adf7-8623-4862-b5a3-8ad5f664091f.webp',
                      },
                    },
                    {
                      id: 'rage',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/d84af825-f617-4dbc-8b9d-82b8c4f12b68.webp',
                      },
                    },
                    {
                      id: 'confused',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/d1eb3be6-07a9-4da6-aa0d-92713a35a1d9.webp',
                      },
                    },
                    {
                      id: 'lustful',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/df236753-f644-434f-8ae0-b4125c72d6bd.webp',
                      },
                    },
                    {
                      id: 'embarrassed',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/ae962bd4-4b82-459b-adac-09827677bd6c.webp',
                      },
                    },
                    {
                      id: 'annoyed',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/d84af825-f617-4dbc-8b9d-82b8c4f12b68.webp',
                      },
                    },
                    {
                      id: 'amused',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/92ce0777-b1b9-4405-a0f0-67c43dbd0ac5.webp',
                      },
                    },
                    {
                      id: 'intrigued',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/9c707a03-e7b1-400c-ae7d-cb86d8a846f4.webp',
                      },
                    },
                    {
                      id: 'guilty',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/12b5dade-5478-4abf-801b-cb6375018d17.webp',
                      },
                    },
                    {
                      id: 'shocked',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/9c707a03-e7b1-400c-ae7d-cb86d8a846f4.webp',
                      },
                    },
                    {
                      id: 'longing',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/007c527c-459c-4f7a-b816-7729eefe9a64.webp',
                      },
                    },
                    {
                      id: 'disappointed',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/007c527c-459c-4f7a-b816-7729eefe9a64.webp',
                      },
                    },
                    {
                      id: 'frustrated',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/b0a1ccff-2d0b-4fb0-a778-5287c01524e8.webp',
                      },
                    },
                    {
                      id: 'exhausted',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/d1eb3be6-07a9-4da6-aa0d-92713a35a1d9.webp',
                      },
                    },
                    {
                      id: 'hopeful',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/0fd8cea5-df9b-466c-801d-35e45b19fdf7.webp',
                      },
                    },
                    {
                      id: 'shy',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/df236753-f644-434f-8ae0-b4125c72d6bd.webp',
                      },
                    },
                    {
                      id: 'begging',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/387b39fe-17b2-4d5f-9828-ae86c52f29e4.webp',
                      },
                    },
                    {
                      id: 'pleasure',
                      sources: {
                        png: 'optimized/a6a28db8-2e1e-4145-9f48-479980540745/1fab12ee-47bb-434a-8d66-cf94a6940181.webp',
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
    {
      id: 'shadowfang',
      name: 'Shadow Fang',
      profile_pic: 'optimized/5a967b4b-b773-46b9-94f4-4c0214a2ea0f/86107b01-b861-494f-bb0b-c35f8f8a0675.webp',
      nsfw: 0,
      short_description: 'A dark and sinister creature that is feared by all',
      tags: ['RPG', 'Fantasy'],
      card: {
        spec: 'chara_card_v2',
        spec_version: '2.0',
        data: {
          name: 'Shadow Fang',
          description: 'A dark and sinister creature that is feared by all',
          first_mes: '',
          personality: '',
          mes_example: '',
          scenario: '',
          alternate_greetings: [],
          system_prompt: '',
          post_history_instructions: '',
          creator: 'mikudev',
          character_version: '1.0.0',
          tags: ['RPG', 'Fantasy'],
          creator_notes: '',
          extensions: {
            mikugg_v2: {
              license: 'CC BY',
              language: 'en',
              short_description: 'A dark and sinister creature that is feared by all',
              profile_pic: 'optimized/5a967b4b-b773-46b9-94f4-4c0214a2ea0f/86107b01-b861-494f-bb0b-c35f8f8a0675.webp',
              nsfw: 0,
              outfits: [
                {
                  id: 'showfang-default',
                  template: 'single-emotion',
                  name: 'default_shadowfang',
                  description: 'default_shadowfang',
                  attributes: [],
                  nsfw: 0,
                  emotions: [
                    {
                      id: 'neutral',
                      sources: {
                        png: 'optimized/5a967b4b-b773-46b9-94f4-4c0214a2ea0f/888b910b-3f86-416c-a026-ddd64450663b.webp',
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
  songs: [
    {
      id: 'battle-song',
      name: 'Battle Song',
      description: 'A battle song',
      tags: ['RPG', 'Fantasy'],
      source: 'optimized/5a967b4b-b773-46b9-94f4-4c0214a2ea0f/fd13a9ad-79dc-47b4-8df8-a007c5814cd6.mpeg',
    },
  ],
  title: 'Seraphina',
  tags: ['RPG', 'Fantasy', 'Famale'],
  starts: [
    {
      id: 'v0ygKejnCuop1E3YKlMlPCpIAxD0Lvq1',
      title: 'Default Start',
      description: '',
      characters: [
        {
          characterId: 'ZoIHtGv1bn0Ryai4WTx7RmF9ONlIkvX5cqnoJ-5-oc8.json',
          text: '*You wake with a start, recalling the events that led you deep into the forest and the beasts that assailed you. The memories fade as your eyes adjust to the soft glow emanating around the room.* "Ah, you\'re awake at last. I was so worried, I found you bloodied and unconscious." *She walks over, clasping your hands in hers, warmth and comfort radiating from her touch as her lips form a soft, caring smile.* "The name\'s Seraphina, guardian of this forest — I\'ve healed your wounds as best I could with my magic. How are you feeling? I hope the tea helps restore your strength." *Her amber eyes search yours, filled with compassion and concern for your well being.* "Please, rest. You\'re safe here. I\'ll look after you, but you need to rest. My magic can only do so much to heal you."',
          pose: 'standing',
          emotion: 'happy',
        },
      ],
      sceneId: '766e07ed-0640-46f7-b72b-4d0b32fb48de',
    },
  ],
  scenes: [
    {
      id: '766e07ed-0640-46f7-b72b-4d0b32fb48de',
      backgroundId: 'dcf6eb1c-3f12-499e-ae47-6410c3e4ad36',
      actionText: 'Go to a glade',
      name: 'a glade in Eldoria',
      condition: '',
      nsfw: 0,
      characters: [
        {
          characterId: 'ZoIHtGv1bn0Ryai4WTx7RmF9ONlIkvX5cqnoJ-5-oc8.json',
          outfit: 'de651766-776b-4fb5-8a9a-64d054750675',
        },
      ],
      children: ['766e07ed-0640-46f7-b72b-4d0b32fb48de', '3387269b-9f85-425d-8343-722773b91074'],
      musicId: 'magic_forest.mp3',
      prompt: ' {{user} found {{char}} in a glade',
      parentMapIds: null,
    },
    {
      id: '3387269b-9f85-425d-8343-722773b91074',
      backgroundId: 'ae472a95-55e0-41b8-91c4-ae6bbf0f39b9',
      actionText: 'Go to Seraphina cabin',
      name: 'the cabin of Seraphina',
      condition: '',
      nsfw: 0,
      characters: [
        {
          characterId: 'ZoIHtGv1bn0Ryai4WTx7RmF9ONlIkvX5cqnoJ-5-oc8.json',
          outfit: 'de651766-776b-4fb5-8a9a-64d054750675',
        },
      ],
      children: ['766e07ed-0640-46f7-b72b-4d0b32fb48de', '3387269b-9f85-425d-8343-722773b91074'],
      musicId: 'calmant.mp3',
      prompt: '{{char}} and {{user}} are at {{char}} cabin.',
      parentMapIds: null,
    },
  ],
  rpg: {
    heroes: [
      {
        characterId: 'ZoIHtGv1bn0Ryai4WTx7RmF9ONlIkvX5cqnoJ-5-oc8.json',
        battleOutfit: 'de651766-776b-4fb5-8a9a-64d054750675',
        stats: {
          health: 100,
          mana: 100,
          attack: 10,
          intelligence: 10,
          defense: 10,
          magicDefense: 10,
        },
        wear: [],
        isAvailable: true,
        isInParty: true,
        abilities: [],
      },
    ],
    enemies: [
      {
        characterId: 'shadowfang',
        battleOutfit: 'shadowfang-default',
        stats: {
          health: 100,
          mana: 100,
          attack: 10,
          intelligence: 10,
          defense: 10,
          magicDefense: 10,
        },
        abilities: [],
        difficultyMultiplier: 1,
      },
    ],
    wearables: [],
    abilities: [],
  },
  battles: [
    {
      battleId: 'shadowfang-battle',
      allowRetry: true,
      backgroundId: 'dcf6eb1c-3f12-499e-ae47-6410c3e4ad36',
      music: {
        battleId: 'battle-song',
        victoryId: 'battle-song',
        defeatId: 'battle-song',
      },
      enemies: [
        {
          enemyId: 'shadowfang',
        },
      ],
      intro: [
        {
          text: [
            {
              content: 'You are facing a shadowfang',
              characterId: 'shadowfang',
            },
          ],
        },
      ],
      prompt: '{{char}} is fighting a shadowfang that appeared',
    },
  ],
  objectives: [
    {
      id: 'shadowfang-appear-objective',
      name: 'Shadow Fang Appear',
      description: 'The shadowfang has appeared',
      stateCondition: {
        type: 'IN_SCENE',
        config: {
          sceneIds: ['766e07ed-0640-46f7-b72b-4d0b32fb48de'],
        },
      },
      condition: 'A shadowfang has appeared',
      singleUse: true,
      actions: [
        {
          type: NovelActionType.BATTLE_START,
          params: {
            battleId: 'shadowfang-battle',
          },
        },
      ],
    },
  ],
};

console.log(JSON.stringify(novel, null, 2));
