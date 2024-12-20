import { CharacterEmotion, NovelManager } from './NovelSpec';

export type FunctionHandler = (...args: any[]) => Promise<string>;

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: FunctionHandler;
}

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
        name: 'get_title',
        description: 'Retrieve the current title of the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getTitle(),
      },
      {
        name: 'get_description',
        description: 'Retrieve the current description of the visual novel.',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getDescription(),
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
      },
      {
        name: 'get_lorebooks',
        description: 'Retrieve all lorebooks in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getLoreBooks(),
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
      },
      {
        name: 'set_character_prompts',
        description: 'Set the detailed description and conversation examples for a character',
        parameters: {
          type: 'object',
          properties: {
            characterId: {
              type: 'string',
              description: 'ID of the character to update',
            },
            description: {
              type: 'string',
              description: "Detailed description of the character's personality, background, and traits",
            },
            conversation_examples: {
              type: 'string',
              description: 'Examples of how the character typically speaks and interacts',
            },
          },
          required: ['characterId', 'description', 'conversation_examples'],
        },
        handler: (args) => novelManager.setCharacterPrompts(args),
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
      },
      {
        name: 'get_characters',
        description: 'Retrieve all characters in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getCharacters(),
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
      },
      {
        name: 'get_backgrounds',
        description: 'Retrieve all backgrounds in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getBackgrounds(),
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
      },
      {
        name: 'modify_music_description',
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
      },
      {
        name: 'remove_music',
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
      },
      {
        name: 'get_music',
        description: 'Retrieve all music tracks in the visual novel',
        parameters: { type: 'object', properties: {} },
        handler: () => novelManager.getMusic(),
      },
      {
        name: 'set_scene_details',
        description: 'Create a new scene or update an existing one in the visual novel',
        parameters: {
          type: 'object',
          properties: {
            sceneId: {
              type: 'string',
              description: 'ID of the scene to update (omit for creating new scene)',
            },
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
            background: {
              type: 'string',
              description: 'ID of the background to use',
            },
            music: {
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
                      background: { type: 'string' },
                      music: { type: 'string' },
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
                    required: ['text', 'background', 'characters'],
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
          required: ['name', 'short_description', 'prompt', 'characters', 'background', 'music'],
        },
        handler: (args) => novelManager.setSceneDetails(args),
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
      },
      {
        name: 'add_start',
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
            firstMessages: {
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
              description: 'Initial messages from characters when starting from this point',
            },
          },
          required: ['sceneId', 'name', 'short_description', 'firstMessages'],
        },
        handler: (args) => novelManager.addStart(args),
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
      },
      {
        name: 'update_scene_cutscene',
        description: 'Update only the cutscene of an existing scene',
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
                      background: { type: 'string' },
                      music: { type: 'string' },
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
                    required: ['text', 'background', 'characters'],
                  },
                },
              },
              required: ['triggerOnlyOnce', 'parts'],
            },
          },
          required: ['sceneId', 'cutscene'],
        },
        handler: (args) => novelManager.updateSceneCutscene(args.sceneId, args.cutscene),
      },
      {
        name: 'update_scene_hint',
        description: 'Update only the hint of an existing scene',
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
      },
      {
        name: 'update_scene_condition',
        description: 'Update only the condition of an existing scene',
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
      },
      {
        name: 'update_scene_characters',
        description: 'Update only the characters in an existing scene',
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
      },
      {
        name: 'update_scene_background',
        description: 'Update only the background of an existing scene',
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
      },
      {
        name: 'update_scene_music',
        description: 'Update only the music of an existing scene',
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
      },
    ];
  }

  getFunctionDefinitions(): FunctionDefinition[] {
    return this.functionDefinitions;
  }

  async executeFunction(name: string, args: any): Promise<string> {
    const handler = this.functions.get(name);
    if (!handler) {
      throw new Error(`Function ${name} not found`);
    }
    return handler(args);
  }
}
