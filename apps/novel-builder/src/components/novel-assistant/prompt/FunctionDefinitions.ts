import { CharacterEmotion, NovelManager } from './NovelSpec';
import { FunctionDefinition, FunctionHandler, FunctionAction } from '../../../libs/assistantCall';

export class FunctionRegistry {
  private functions: Map<string, FunctionHandler>;
  private functionDefinitions: FunctionDefinition[];

  constructor(novelManager: NovelManager) {
    this.functions = new Map();
    this.functionDefinitions = this.createFunctionDefinitions(novelManager);

    // Register all functions
    this.functionDefinitions.forEach((fn) => {
      this.functions.set(fn.name, fn.handler);
    });
  }

  private createFunctionDefinitions(novelManager: NovelManager): FunctionDefinition[] {
    return [
      {
        name: 'get_novel_validation_state',
        description: 'Gives information about the current state of the novel and indicates warnings and missing parts',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getNovelStats(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'get_title',
        description: 'Retrieve the current title of the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getTitle(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'get_description',
        description: 'Retrieve the current description of the visual novel.',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getDescription(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'set_title',
        description: 'Set a new title for the visual novel',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The new title to set for the visual novel',
            },
          },
          required: ['title'],
        },
        handler: (args: { title: string }) => novelManager.setTitle(args.title),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'the novel title',
        },
      },
      {
        name: 'set_description',
        description: 'Set a new description for the visual novel. The description should be ONLY one sentence.',
        parameters: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'The new description to set for the visual novel',
            },
          },
          required: ['description'],
        },
        handler: (args: { description: string }) => novelManager.setDescription(args.description),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'the novel description',
        },
      },
      {
        name: 'get_all_lorebooks_in_novel',
        description: 'Retrieve all lorebooks in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getLoreBooks(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'set_lorebook_details',
        description: 'Create a new lorebook or update an existing one',
        parameters: {
          type: 'object',
          properties: {
            lorebookId: {
              type: 'string',
              description: 'ID of the lorebook to update (omit for creating new)',
            },
            name: {
              type: 'string',
              description: 'Name of the lorebook (required for new lorebooks)',
            },
            description: {
              type: 'string',
              description: 'Very small description of the lorebook. The actual content should be inside entries.',
            },
            isGlobal: {
              type: 'boolean',
              description: 'Whether the lorebook is available to all novel scenes',
            },
          },
        },
        handler: (args) => novelManager.setLoreBookDetails(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'the lorebook details',
        },
      },
      {
        name: 'add_lorebook_to_scene',
        description: 'Attaches a lorebook to a specific scene',
        parameters: {
          type: 'object',
          properties: {
            lorebookId: {
              type: 'string',
              description: 'ID of the lorebook to add',
            },
            sceneId: {
              type: 'string',
              description: 'ID of the scene to add the lorebook to',
            },
          },
          required: ['lorebookId', 'sceneId'],
        },
        handler: (args: { lorebookId: string; sceneId: string }) =>
          novelManager.addLorebookToScene(args.lorebookId, args.sceneId),
        displayData: {
          isSetter: true,
          action: 'connected',
          subject: 'a lorebook with a scene',
        },
      },
      {
        name: 'remove_lorebook_from_scene',
        description: 'Detaches a lorebook from a specific scene',
        parameters: {
          type: 'object',
          properties: {
            lorebookId: {
              type: 'string',
              description: 'ID of the lorebook to detach',
            },
            sceneId: {
              type: 'string',
              description: 'ID of the scene to detach the lorebook from',
            },
          },
          required: ['lorebookId', 'sceneId'],
        },
        handler: (args: { lorebookId: string; sceneId: string }) =>
          novelManager.removeLorebookFromScene(args.lorebookId, args.sceneId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a lorebook from a scene',
        },
      },
      {
        name: 'remove_entry_from_lorebook',
        description: 'Removes an entry from a lorebook',
        parameters: {
          type: 'object',
          properties: {
            lorebookId: {
              type: 'string',
              description: 'ID of the lorebook containing the entry',
            },
            entryId: {
              type: 'number',
              description: 'ID of the entry to remove',
            },
          },
          required: ['lorebookId', 'entryId'],
        },
        handler: (args: { lorebookId: string; entryId: number }) =>
          novelManager.removeEntryFromLorebook(args.lorebookId, args.entryId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'an entry from a lorebook',
        },
      },
      {
        name: 'set_entry_to_lorebook',
        description:
          'Creates a new entry or updates an existing one in a lorebook. Entries are used to give more context to the AI. Entries MUST be give information about the world, characters. The should NOT be used to give information about the player or events that will happen in the story.',
        parameters: {
          type: 'object',
          properties: {
            lorebookId: {
              type: 'string',
              description: 'ID of the lorebook',
            },
            entryId: {
              type: 'string',
              description: 'ID of the entry to update (omit for creating new)',
            },
            name: {
              type: 'string',
              description: 'Name of the entry (required for new entries)',
            },
            keywords: {
              type: 'array',
              items: { type: 'string' },
              description: 'Keywords that make the entry be used to give more context (required for new entries)',
            },
            content: {
              type: 'string',
              description: 'Content of the entry that, in Q-A format.',
            },
          },
          required: ['lorebookId'],
        },
        handler: (args) => novelManager.setEntryToLorebook(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'an entry in a lorebook',
        },
      },
      {
        name: 'add_character_basics',
        description: 'Create a new character or update basic information of an existing character',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character to update (omit for creating new character)',
            },
            name: {
              type: 'string',
              description: 'Name of the character',
            },
            short_description: {
              type: 'string',
              description: 'A brief one-line description of the character',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: "Tags that describe the character's traits and characteristics",
            },
          },
          required: ['name', 'short_description', 'tags'],
        },
        handler: (args) => novelManager.addCharacterBasics(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a character',
        },
      },
      {
        name: 'set_character_prompt_and_examples',
        description: 'Set the detailed description and conversation examples for a character',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character to update',
            },
            prompt: {
              type: 'string',
              description:
                "Detailed description of the character's personality, background, physical appearance and traits",
            },
            conversation_examples: {
              type: 'string',
              description: 'Examples of how the character typically speaks and interacts',
            },
          },
          required: ['characterId', 'prompt', 'conversation_examples'],
        },
        handler: (args) => novelManager.setCharacterPrompts(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a character',
        },
      },
      {
        name: 'delete_character',
        description: 'Remove a character from the novel',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character to delete',
            },
          },
          required: ['characterId'],
        },
        handler: (args: { characterId: string }) => novelManager.deleteCharacter(args.characterId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a character',
        },
      },
      {
        name: 'get_all_characters_in_novel',
        description: 'Retrieve all characters in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getCharacters(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'attach_lorebook_to_character',
        description: 'Associate a lorebook with a character to provide additional context',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character',
            },
            lorebookId: {
              type: 'string',
              description: 'ID of the lorebook to attach',
            },
          },
          required: ['characterId', 'lorebookId'],
        },
        handler: (args: { characterId: string; lorebookId: string }) =>
          novelManager.attachLorebookToCharacter(args.characterId, args.lorebookId),
        displayData: {
          isSetter: true,
          action: 'connected',
          subject: 'a lorebook with a character',
        },
      },
      {
        name: 'detach_lorebook_from_character',
        description: 'Remove a lorebook association from a character',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character',
            },
            lorebookId: {
              type: 'string',
              description: 'ID of the lorebook to detach',
            },
          },
          required: ['characterId', 'lorebookId'],
        },
        handler: (args: { characterId: string; lorebookId: string }) =>
          novelManager.detachLorebookFromCharacter(args.characterId, args.lorebookId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a lorebook from a character',
        },
      },
      {
        name: 'add_background_from_database',
        description: 'Search and add a background that best matches the given description',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: "Description of the background scene you're looking for",
            },
          },
          required: ['prompt'],
        },
        handler: (args: { prompt: string }) => novelManager.addBackgroundFromDatabase(args.prompt),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'a background',
        },
      },
      {
        name: 'modify_background_description',
        description: 'Update the description of an existing background',
        parameters: {
          type: 'object',
          properties: {
            backgroundId: {
              type: 'string',
              description: 'ID of the background to modify',
            },
            description: {
              type: 'string',
              description: 'New description for the background',
            },
          },
          required: ['backgroundId', 'description'],
        },
        handler: (args: { backgroundId: string; description: string }) =>
          novelManager.modifyBackgroundDescription(args.backgroundId, args.description),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a background description',
        },
      },
      {
        name: 'remove_background',
        description: 'Remove a background from the novel',
        parameters: {
          type: 'object',
          properties: {
            backgroundId: {
              type: 'string',
              description: 'ID of the background to remove',
            },
          },
          required: ['backgroundId'],
        },
        handler: (args: { backgroundId: string }) => novelManager.removeBackground(args.backgroundId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a background',
        },
      },
      {
        name: 'get_all_backgrounds_in_novel',
        description: 'Retrieve all backgrounds in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getBackgrounds(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'add_music_from_database',
        description: 'Search and add music that best matches the given description',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: "Description of the music or atmosphere you're looking for",
            },
          },
          required: ['prompt'],
        },
        handler: (args: { prompt: string }) => novelManager.addMusicFromDatabase(args.prompt),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'a music track',
        },
      },
      {
        name: 'set_music_description',
        description: 'Update the description of an existing music track',
        parameters: {
          type: 'object',
          properties: {
            musicId: {
              type: 'string',
              description: 'ID of the music track to modify',
            },
            description: {
              type: 'string',
              description: 'New description for the music track',
            },
          },
          required: ['musicId', 'description'],
        },
        handler: (args: { musicId: string; description: string }) =>
          novelManager.modifyMusicDescription(args.musicId, args.description),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a music track description',
        },
      },
      {
        name: 'remove_music_from_novel',
        description: 'Remove a music track from the novel',
        parameters: {
          type: 'object',
          properties: {
            musicId: {
              type: 'string',
              description: 'ID of the music track to remove',
            },
          },
          required: ['musicId'],
        },
        handler: (args: { musicId: string }) => novelManager.removeMusic(args.musicId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a music track',
        },
      },
      {
        name: 'get_all_music_in_novel',
        description: 'Retrieve all music tracks in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getMusic(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'get_all_scenes_in_novel',
        description: 'Retrieve all scenes in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getScenes(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'create_scene',
        description: 'Create a new scene in the visual novel. It requires a background and music already created.',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the scene',
            },
            short_description: {
              type: 'string',
              description: 'Brief description of what happens in the scene',
            },
            prompt: {
              type: 'string',
              description: "Instructions for the AI about the scene, must start with 'OOC:'",
            },
            characters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'ID of the character',
                  },
                  outfitId: {
                    type: 'string',
                    description: 'ID of the outfit for this character',
                  },
                  objective: {
                    type: 'string',
                    description: 'Optional objective for this character in the scene',
                  },
                },
                required: ['id', 'outfitId'],
              },
              description: 'Array of characters in the scene (1-2 characters)',
            },
            backgroundId: {
              type: 'string',
              description: 'ID of the background to use',
            },
            musicId: {
              type: 'string',
              description: 'ID of the music track to play',
            },
            cutscene: {
              type: 'object',
              properties: {
                triggerOnlyOnce: {
                  type: 'boolean',
                  description: 'Whether this cutscene should only play once',
                },
                parts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            type: {
                              type: 'string',
                              enum: ['dialogue', 'description'],
                            },
                            content: { type: 'string' },
                          },
                          required: ['type', 'content'],
                        },
                      },
                      backgroundId: { type: 'string' },
                      musicId: { type: 'string' },
                      characters: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            outfitId: { type: 'string' },
                            emotionId: {
                              type: 'string',
                              enum: [
                                'angry',
                                'sad',
                                'happy',
                                'disgusted',
                                'begging',
                                'scared',
                                'excited',
                                'hopeful',
                                'longing',
                                'proud',
                                'neutral',
                                'rage',
                                'scorn',
                                'blushed',
                                'pleasure',
                                'lustful',
                                'shocked',
                                'confused',
                                'disappointed',
                                'embarrassed',
                                'guilty',
                                'shy',
                                'frustrated',
                                'annoyed',
                                'exhausted',
                                'tired',
                                'curious',
                                'intrigued',
                                'amused',
                              ],
                            },
                          },
                          required: ['id', 'outfitId', 'emotionId'],
                        },
                      },
                    },
                    required: ['text', 'backgroundId', 'characters'],
                  },
                },
              },
              required: ['triggerOnlyOnce', 'parts'],
              description: 'Optional cutscene sequence',
            },
            hint: {
              type: 'string',
              description: 'Optional hint to help players navigate the scene',
            },
            condition: {
              type: 'string',
              description: 'Optional condition that must be met to trigger the scene',
            },
            actionText: {
              type: 'string',
              description: 'Optional button text to trigger the scene',
            },
          },
          required: ['name', 'short_description', 'prompt', 'characters', 'backgroundId', 'musicId'],
        },
        handler: (args) => novelManager.setSceneDetails(args),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'a scene',
        },
      },
      {
        name: 'remove_scene',
        description: 'Remove a scene from the visual novel',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene to remove',
            },
          },
          required: ['sceneId'],
        },
        handler: (args: { sceneId: string }) => novelManager.removeScene(args.sceneId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a scene',
        },
      },
      {
        name: 'connect_scenes',
        description: 'Connect two scenes, making one a child of another',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the parent scene',
            },
            childSceneId: {
              type: 'string',
              description: 'ID of the scene to make a child',
            },
          },
          required: ['sceneId', 'childSceneId'],
        },
        handler: (args: { sceneId: string; childSceneId: string }) =>
          novelManager.connectScenes(args.sceneId, args.childSceneId),
        displayData: {
          isSetter: true,
          action: 'connected',
          subject: 'two scenes',
        },
      },
      {
        name: 'disconnect_scenes',
        description: 'Remove the connection between two scenes',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the parent scene',
            },
            childSceneId: {
              type: 'string',
              description: 'ID of the child scene to disconnect',
            },
          },
          required: ['sceneId', 'childSceneId'],
        },
        handler: (args: { sceneId: string; childSceneId: string }) =>
          novelManager.disconnectScenes(args.sceneId, args.childSceneId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a scene connection',
        },
      },
      {
        name: 'create_start',
        description: 'Add a new starting point for the visual novel',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene where this start point begins',
            },
            name: {
              type: 'string',
              description: 'Name of the start point',
            },
            short_description: {
              type: 'string',
              description: 'Brief description of this starting point',
            },
            firstMessagePerCharacters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  characterId: {
                    type: 'string',
                    description: 'ID of the character speaking',
                  },
                  message: {
                    type: 'string',
                    description: 'The message content',
                  },
                  emotionId: {
                    type: 'string',
                    enum: [
                      'angry',
                      'sad',
                      'happy',
                      'disgusted',
                      'begging',
                      'scared',
                      'excited',
                      'hopeful',
                      'longing',
                      'proud',
                      'neutral',
                      'rage',
                      'scorn',
                      'blushed',
                      'pleasure',
                      'lustful',
                      'shocked',
                      'confused',
                      'disappointed',
                      'embarrassed',
                      'guilty',
                      'shy',
                      'frustrated',
                      'annoyed',
                      'exhausted',
                      'tired',
                      'curious',
                      'intrigued',
                      'amused',
                    ],
                    description: 'The emotion the character shows while speaking',
                  },
                },
                required: ['characterId', 'message', 'emotionId'],
              },
              description:
                'Initial messages from characters when starting from this point. A single message per character. The message can have several paragraphs in the string.',
            },
          },
          required: ['sceneId', 'name', 'short_description', 'firstMessagePerCharacters'],
        },
        handler: (args) => novelManager.addStart(args),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'a start point',
        },
      },
      {
        name: 'remove_start',
        description: 'Remove a starting point from the visual novel',
        parameters: {
          type: 'object',
          properties: {
            startId: {
              type: 'string',
              description: 'ID of the start point to remove',
            },
          },
          required: ['startId'],
        },
        handler: (args: { startId: string }) => novelManager.removeStart(args.startId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a start point',
        },
      },
      {
        name: 'move_start_as_first_option',
        description: 'Move a start point to be the first option in the list',
        parameters: {
          type: 'object',
          properties: {
            startId: {
              type: 'string',
              description: 'ID of the start point to move to first position',
            },
          },
          required: ['startId'],
        },
        handler: (args: { startId: string }) => novelManager.moveStartAsFirstOption(args.startId),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'start point order',
        },
      },
      {
        name: 'set_scene_cutscene',
        description: 'Update the cutscene of an existing scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene to update',
            },
            cutscene: {
              type: 'object',
              properties: {
                triggerOnlyOnce: {
                  type: 'boolean',
                  description: 'Whether this cutscene should only play once',
                },
                parts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            type: {
                              type: 'string',
                              enum: ['dialogue', 'description'],
                            },
                            content: { type: 'string' },
                          },
                          required: ['type', 'content'],
                        },
                      },
                      backgroundId: { type: 'string' },
                      musicId: { type: 'string' },
                      characters: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            outfitId: { type: 'string' },
                            emotionId: {
                              type: 'string',
                              enum: Object.values(CharacterEmotion),
                            },
                          },
                          required: ['id', 'outfitId', 'emotionId'],
                        },
                      },
                    },
                    required: ['text', 'backgroundId', 'characters'],
                  },
                },
              },
              required: ['triggerOnlyOnce', 'parts'],
            },
          },
          required: ['sceneId', 'cutscene'],
        },
        handler: (args) => novelManager.updateSceneCutscene(args.sceneId, args.cutscene),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a scene cutscene',
        },
      },
      {
        name: 'set_scene_hint',
        description: 'Update the hint of an existing scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene to update',
            },
            hint: {
              type: 'string',
              description: 'New hint to help players navigate the scene',
            },
          },
          required: ['sceneId', 'hint'],
        },
        handler: (args) => novelManager.updateSceneHint(args.sceneId, args.hint),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a scene hint',
        },
      },
      {
        name: 'set_scene_condition',
        description: 'Update the condition of an existing scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene to update',
            },
            condition: {
              type: 'string',
              description: 'New condition that must be met to trigger the scene',
            },
          },
          required: ['sceneId', 'condition'],
        },
        handler: (args) => novelManager.updateSceneCondition(args.sceneId, args.condition),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a scene condition',
        },
      },
      {
        name: 'set_scene_characters',
        description: 'Update the characters in an existing scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene to update',
            },
            characters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'ID of the character',
                  },
                  outfitId: {
                    type: 'string',
                    description: 'ID of the outfit for this character',
                  },
                  objective: {
                    type: 'string',
                    description: 'Optional objective for this character in the scene',
                  },
                },
                required: ['id', 'outfitId'],
              },
              description: 'Array of characters in the scene (1-2 characters)',
            },
          },
          required: ['sceneId', 'characters'],
        },
        handler: (args) => novelManager.updateSceneCharacters(args.sceneId, args.characters),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'scene characters',
        },
      },
      {
        name: 'set_scene_background',
        description: 'Update the background of an existing scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene to update',
            },
            backgroundId: {
              type: 'string',
              description: 'ID of the new background to use',
            },
          },
          required: ['sceneId', 'backgroundId'],
        },
        handler: (args) => novelManager.updateSceneBackground(args.sceneId, args.backgroundId),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a scene background',
        },
      },
      {
        name: 'set_scene_music',
        description: 'Update the music of an existing scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene to update',
            },
            musicId: {
              type: 'string',
              description: 'ID of the new music track to play',
            },
          },
          required: ['sceneId', 'musicId'],
        },
        handler: (args) => novelManager.updateSceneMusic(args.sceneId, args.musicId),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a scene music',
        },
      },
      {
        name: 'update_character_name',
        description: 'Update only the name of an existing character',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character to update',
            },
            name: {
              type: 'string',
              description: 'New name for the character',
            },
          },
          required: ['characterId', 'name'],
        },
        handler: (args) => novelManager.updateCharacterName(args.characterId, args.name),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a character name',
        },
      },
      {
        name: 'update_character_short_description',
        description: 'Update only the short description of an existing character',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character to update',
            },
            shortDescription: {
              type: 'string',
              description: 'New short description for the character',
            },
          },
          required: ['characterId', 'shortDescription'],
        },
        handler: (args) => novelManager.updateCharacterShortDescription(args.characterId, args.shortDescription),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a character description',
        },
      },
      {
        name: 'update_character_tags',
        description: 'Update only the tags of an existing character',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character to update',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'New tags for the character',
            },
          },
          required: ['characterId', 'tags'],
        },
        handler: (args) => novelManager.updateCharacterTags(args.characterId, args.tags),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'character tags',
        },
      },
      {
        name: 'create_inventory_item',
        description: 'Create a new item in the novel inventory.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the item' },
            description: { type: 'string', description: 'Description of the item' },
            hidden: { type: 'boolean', description: 'Whether the item is hidden from the player by default' },
            scenes: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of scenes where the item can be used. Empty for every scene.',
            },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Name of the action' },
                  prompt: { type: 'string', description: 'Prompt for the action' },
                  usageActions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        actionType: {
                          type: 'string',
                          enum: [
                            'attach_parent_scene_to_child',
                            'suggest_advance_to_scene',
                            'display_inventory_item',
                            'hide_inventory_item',
                          ],
                          description: 'Type of the action',
                        },
                        suggestSceneId: { type: 'string', description: 'ID of the scene to suggest to the player' },
                        itemId: { type: 'string', description: 'ID of the item to add' },
                        parentSceneId: { type: 'string', description: 'ID of the parent scene' },
                        childSceneId: { type: 'string', description: 'ID of the child scene' },
                      },
                      required: ['actionType'],
                    },
                    description: 'List of actions that can be used to trigger this item. Optional.',
                  },
                },
              },
            },
          },
          required: ['name', 'description'],
        },
        handler: (args) => novelManager.createItem(args),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'an item',
        },
      },
      {
        name: 'update_inventory_item',
        description: 'Update an existing item in the novel inventory.',
        parameters: {
          type: 'object',
          properties: {
            itemId: { type: 'string', description: 'ID of the item to update' },
            name: { type: 'string', description: 'New name for the item' },
            description: { type: 'string', description: 'Updated description' },
            hidden: { type: 'boolean', description: 'Whether the item is hidden from the player' },
            scenesIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of scene ids where the item can be used. Empty for every scene.',
            },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Name of the action' },
                  prompt: { type: 'string', description: 'Prompt for the action' },
                  usageActions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        actionType: {
                          type: 'string',
                          enum: [
                            'attach_parent_scene_to_child',
                            'suggest_advance_to_scene',
                            'display_inventory_item',
                            'hide_inventory_item',
                          ],
                          description: 'Type of the action',
                        },
                        suggestSceneId: { type: 'string', description: 'ID of the scene to suggest to the player' },
                        itemId: { type: 'string', description: 'ID of the item to add' },
                        parentSceneId: { type: 'string', description: 'ID of the parent scene' },
                        childSceneId: { type: 'string', description: 'ID of the child scene' },
                      },
                      required: ['actionType'],
                    },
                    description: 'List of actions that can be used to trigger this item. Optional.',
                  },
                },
              },
            },
          },
          required: ['itemId'],
        },
        handler: (args) => novelManager.updateItem(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'an item',
        },
      },
      {
        name: 'remove_inventory_item',
        description: 'Remove an item from the novel inventory.',
        parameters: {
          type: 'object',
          properties: {
            itemId: { type: 'string', description: 'ID of the item to remove' },
          },
          required: ['itemId'],
        },
        handler: (args) => novelManager.removeItem(args.itemId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'an item',
        },
      },
      {
        name: 'create_map',
        description: 'Create a new map for the novel.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the map' },
            description: { type: 'string', description: 'Short description of the map' },
          },
          required: ['name'],
        },
        handler: (args) => novelManager.createMap(args),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'a map',
        },
      },
      {
        name: 'update_map',
        description: 'Update an existing map in the novel.',
        parameters: {
          type: 'object',
          properties: {
            mapId: { type: 'string', description: 'ID of the map to update' },
            name: { type: 'string', description: 'New name for the map' },
            description: { type: 'string', description: 'Updated description' },
          },
          required: ['mapId'],
        },
        handler: (args) => novelManager.updateMap(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a map',
        },
      },
      {
        name: 'remove_map',
        description: 'Remove a map from the novel.',
        parameters: {
          type: 'object',
          properties: {
            mapId: { type: 'string', description: 'ID of the map to remove' },
          },
          required: ['mapId'],
        },
        handler: (args) => novelManager.removeMap(args.mapId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a map',
        },
      },
      {
        name: 'create_map_place',
        description: 'Create a new place in an existing map.',
        parameters: {
          type: 'object',
          properties: {
            mapId: { type: 'string', description: 'ID of the map to create the place in' },
            name: { type: 'string', description: 'Name of the place' },
            sceneId: { type: 'string', description: 'If associated with a scene, specify its ID' },
            description: { type: 'string', description: 'Short description of the place' },
          },
          required: ['mapId', 'name'],
        },
        handler: (args) => novelManager.createMapPlace(args),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'a map place',
        },
      },
      {
        name: 'update_map_place',
        description: 'Update a place in an existing map.',
        parameters: {
          type: 'object',
          properties: {
            mapId: { type: 'string', description: 'ID of the map containing the place' },
            placeId: { type: 'string', description: 'ID of the place to update' },
            name: { type: 'string', description: 'New name for the place' },
            sceneId: { type: 'string', description: 'Associated scene ID if any' },
            description: { type: 'string', description: 'Updated place description' },
          },
          required: ['mapId', 'placeId'],
        },
        handler: (args) => novelManager.updateMapPlace(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a map place',
        },
      },
      {
        name: 'remove_map_place',
        description: 'Remove a place from an existing map.',
        parameters: {
          type: 'object',
          properties: {
            mapId: { type: 'string', description: 'ID of the map containing the place' },
            placeId: { type: 'string', description: 'ID of the place to remove' },
          },
          required: ['mapId', 'placeId'],
        },
        handler: (args) => novelManager.removeMapPlace(args.mapId, args.placeId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a place from a map',
        },
      },
      {
        name: 'create_scene_indicator',
        description: 'Attach a new indicator to a scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'ID of the scene to receive the indicator' },
            name: { type: 'string', description: 'Indicator name' },
            description: { type: 'string', description: 'Indicator purpose or context' },
            type: {
              type: 'string',
              description: 'Indicator type: percentage, amount or discrete',
              enum: ['percentage', 'amount', 'discrete'],
            },
            values: {
              type: 'array',
              description: 'Valid only for discrete indicators. List of possible states',
              items: { type: 'string' },
            },
            initialValue: {
              type: 'string',
              description: 'Default or starting value of the indicator',
            },
            inferred: {
              type: 'boolean',
              description: 'If true, the system will set the indicator value automatically',
            },
            step: {
              type: 'number',
              description: 'Step used to increment or decrement the indicator if not inferred',
            },
            min: {
              type: 'number',
              description: 'Minimum range for amounts or percentages',
            },
            max: {
              type: 'number',
              description: 'Maximum range for amounts or percentages',
            },
            hidden: {
              type: 'boolean',
              description: 'Whether the indicator is hidden from the player',
            },
            editable: {
              type: 'boolean',
              description: 'Whether the player can change this indicator in-game',
            },
            color: {
              type: 'string',
              description: 'Color for the indicator, e.g. #4CAF50',
            },
          },
          required: ['sceneId', 'name', 'type', 'initialValue'],
        },
        handler: (args) => novelManager.addIndicatorToScene(args),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'a scene indicator',
        },
      },
      {
        name: 'update_scene_indicator',
        description: 'Update an existing indicator in a scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'ID of the scene containing the indicator' },
            indicatorId: { type: 'string', description: 'ID of the indicator to update' },
            name: { type: 'string', description: 'Updated indicator name' },
            description: { type: 'string', description: 'Updated indicator purpose or context' },
            type: {
              type: 'string',
              description: 'Indicator type: percentage, amount or discrete',
              enum: ['percentage', 'amount', 'discrete'],
            },
            values: {
              type: 'array',
              description: 'Valid only for discrete indicators. List of possible states',
              items: { type: 'string' },
            },
            initialValue: { type: 'string', description: 'Updated default or current value' },
            inferred: { type: 'boolean', description: 'If true, the system sets the value automatically' },
            step: { type: 'number', description: 'Step for increment/decrement' },
            min: { type: 'number', description: 'Minimum range' },
            max: { type: 'number', description: 'Maximum range' },
            hidden: { type: 'boolean', description: 'Whether the indicator is hidden' },
            editable: { type: 'boolean', description: 'Whether the player can change this indicator' },
            color: { type: 'string', description: 'Color (hex) for the indicator' },
          },
          required: ['sceneId', 'indicatorId'],
        },
        handler: (args) => novelManager.updateIndicatorInScene(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'a scene indicator',
        },
      },
      {
        name: 'remove_scene_indicator',
        description: 'Remove an indicator from a scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'ID of the scene containing the indicator' },
            indicatorId: { type: 'string', description: 'ID of the indicator to remove' },
          },
          required: ['sceneId', 'indicatorId'],
        },
        handler: (args) => novelManager.removeIndicatorFromScene(args.sceneId, args.indicatorId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'a scene indicator',
        },
      },
      {
        name: 'get_objectives_in_scene',
        description: 'Retrieve all objectives in a specific scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'ID of the scene to list objectives from' },
          },
          required: ['sceneId'],
        },
        handler: (args) => novelManager.getObjectivesInScene(args.sceneId),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'get_all_inventory_items_in_novel',
        description: 'Retrieve all inventory items in the novel inventory',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getItems(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'get_indicators_in_scene',
        description: 'Retrieve the indicators associated with a particular scene',
        parameters: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'ID of the scene' },
          },
          required: ['sceneId'],
        },
        handler: (args) => novelManager.getIndicatorsInScene(args.sceneId),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'create_objective',
        description: 'Create a new objective and attach it to a given scene.',
        parameters: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'ID of the scene to attach this objective' },
            name: { type: 'string', description: 'Name of the objective' },
            description: { type: 'string', description: 'Short description of the objective' },
            hint: { type: 'string', description: 'Hint for the player about this objective' },
            condition: { type: 'string', description: 'Condition prompt that triggers the objective' },
          },
          required: ['sceneId', 'name'],
        },
        handler: (args) => novelManager.createObjective(args),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'an objective',
        },
      },
      {
        name: 'update_objective',
        description: 'Update an existing objective in a specific scene.',
        parameters: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'ID of the scene containing the objective' },
            objectiveId: { type: 'string', description: 'ID of the objective to update' },
            name: { type: 'string', description: 'Name of the objective' },
            description: { type: 'string', description: 'Short description' },
            hint: { type: 'string', description: 'Hint for the player' },
            condition: { type: 'string', description: 'Condition prompt that triggers the objective' },
          },
          required: ['sceneId', 'objectiveId'],
        },
        handler: (args) => novelManager.updateObjective(args),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'an objective',
        },
      },
      {
        name: 'remove_objective',
        description: 'Remove an objective from a specific scene.',
        parameters: {
          type: 'object',
          properties: {
            sceneId: { type: 'string', description: 'ID of the scene that has the objective' },
            objectiveId: { type: 'string', description: 'ID of the objective to remove' },
          },
          required: ['sceneId', 'objectiveId'],
        },
        handler: (args) => novelManager.removeObjective(args.objectiveId),
        displayData: {
          isSetter: true,
          action: 'removed',
          subject: 'an objective',
        },
      },
      {
        name: 'get_all_maps_in_novel',
        description: 'Retrieve all maps in the novel',
        parameters: {
          type: 'object',
          properties: {},
        },
        handler: () => novelManager.getMaps(),
        displayData: {
          isSetter: false,
        },
      },
      {
        name: 'set_map_scenes',
        description: 'Define a list of scene IDs where the map is accessible or visible',
        parameters: {
          type: 'object',
          properties: {
            mapId: { type: 'string', description: 'ID of the map to attach to scenes' },
            sceneIds: {
              type: 'array',
              description: 'List of scene IDs where the map is visible',
              items: { type: 'string' },
            },
          },
          required: ['mapId', 'sceneIds'],
        },
        handler: (args) => novelManager.setMapScenes(args.mapId, args.sceneIds),
        displayData: {
          isSetter: true,
          action: 'updated',
          subject: 'the scenes that have a map',
        },
      },
      {
        name: 'generate_character_outfit',
        description: 'Given a character id and appearance, generate a new outfit for the character.',
        parameters: {
          type: 'object',
          properties: {
            characterId: { type: 'string', description: 'ID of the character to generate an outfit for' },
            appearance: { type: 'string', description: 'Appearance of the character' },
          },
          required: ['characterId', 'appearance'],
        },
        handler: (args) => novelManager.generateCharacterOutfit(args.characterId, args.appearance),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'an outfit',
        },
      },
      {
        name: 'generate_outfit_emotions',
        description: 'Given a character id and outfit id, generates the emotions for the outfit.',
        parameters: {
          type: 'object',
          properties: {
            characterId: { type: 'string', description: 'ID of the character to generate an outfit for' },
            outfitId: { type: 'string', description: 'ID of the outfit to generate emotions for' },
          },
          required: ['characterId', 'outfitId'],
        },
        handler: (args) => novelManager.generateOutfitEmotions(args.characterId, args.outfitId),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'emotions for an outfit',
        },
      },
      {
        name: 'generate_background_image',
        description: 'Given a background prompt, creates a new background image.',
        parameters: {
          type: 'object',
          properties: {
            backgroundName: { type: 'string', description: 'Name of the background' },
            prompt: { type: 'string', description: 'Prompt for the background image' },
          },
          required: ['backgroundName', 'prompt'],
        },
        handler: (args) => {
          const backgroundId = novelManager.createBackground(args.backgroundName, args.prompt);
          return novelManager.generateBackgroundImage(backgroundId, args.prompt);
        },
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'a background image',
        },
      },
      {
        name: 'generate_item_image',
        description: 'Given an item id and prompt, generates a new item image.',
        parameters: {
          type: 'object',
          properties: {
            itemId: { type: 'string', description: 'ID of the item to generate an image for' },
            prompt: { type: 'string', description: 'Prompt for the item image' },
          },
          required: ['itemId', 'prompt'],
        },
        handler: (args) => novelManager.generateItemImage(args.itemId, args.prompt),
        displayData: {
          isSetter: true,
          action: 'created',
          subject: 'an item image',
        },
      },
    ];
  }

  getFunctionDefinitions(): FunctionDefinition[] {
    return this.functionDefinitions;
  }

  getFunctionDisplayData(name: string):
    | { isSetter: false }
    | {
        isSetter: true;
        action: FunctionAction;
        subject: string;
      }
    | null {
    return this.functionDefinitions.find((fn) => fn.name === name)?.displayData || null;
  }

  async executeFunction(name: string, args: any): Promise<string> {
    const handler = this.functions.get(name);
    if (!handler) {
      throw new Error(`Function ${name} not found`);
    }
    return handler(args);
  }
}
