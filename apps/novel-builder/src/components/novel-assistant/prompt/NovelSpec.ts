import { NovelV3, validateNovelState } from '@mikugg/bot-utils';

export interface LoreBookEntry {
  id: string;
  name: string;
  keywords: string[];
  content: string;
}

export interface LoreBook {
  id: string;
  name: string;
  isGlobal: boolean;
  sceneIds: string[];
  entries: LoreBookEntry[];
}

export enum CharacterEmotion {
  ANGRY = 'angry',
  SAD = 'sad',
  HAPPY = 'happy',
  DISGUSTED = 'disgusted',
  BEGGING = 'begging',
  SCARED = 'scared',
  EXCITED = 'excited',
  HOPEFUL = 'hopeful',
  LONGING = 'longing',
  PROUD = 'proud',
  NEUTRAL = 'neutral',
  RAGE = 'rage',
  SCORN = 'scorn',
  BLUSHED = 'blushed',
  PLEASURE = 'pleasure',
  LUSTFUL = 'lustful',
  SHOCKED = 'shocked',
  CONFUSED = 'confused',
  DISAPPOINTED = 'disappointed',
  EMBARRASSED = 'embarrassed',
  GUILTY = 'guilty',
  SHY = 'shy',
  FRUSTRATED = 'frustrated',
  ANNOYED = 'annoyed',
  EXHAUSTED = 'exhausted',
  TIRED = 'tired',
  CURIOUS = 'curious',
  INTRIGUED = 'intrigued',
  AMUSED = 'amused',
}

export interface CutScenePart {
  id: string;
  text: {
    type: 'dialogue' | 'description';
    content: string;
  }[];
  background: string;
  music?: string;
  characters: {
    id: string;
    outfitId: string;
    emotionId: CharacterEmotion;
  }[];
}

export interface SceneObjective {
  characterId: string;
  objective: string;
}

const ids: Map<string, number> = new Map();
function getId(prefix: string): string {
  if (!ids.has(prefix)) {
    ids.set(prefix, 0);
  }
  ids.set(prefix, (ids.get(prefix) || 0) + 1);
  return `${prefix}_${ids.get(prefix)}`;
}

export class NovelManager {
  private novel: NovelV3.NovelState;

  constructor() {
    this.novel = {
      title: '',
      description: '',
      logoPic: '',
      author: '',
      tags: [],
      characters: [],
      backgrounds: [],
      songs: [],
      maps: [],
      scenes: [],
      starts: [],
      lorebooks: [],
      inventory: [],
      cutscenes: [],
      language: 'en',
    };
  }

  replaceState(state: NovelV3.NovelState) {
    this.novel = JSON.parse(JSON.stringify(state));
  }

  getNovelState(): NovelV3.NovelState {
    return JSON.parse(JSON.stringify(this.novel));
  }

  async getNovelStats(): Promise<string> {
    const warns = validateNovelState(this.novel);
    return JSON.stringify({
      warnings: warns,
      scenes: this.novel.scenes?.length,
      characters: this.novel.characters?.length,
      backgrounds: this.novel.backgrounds?.length,
      songs: this.novel.songs?.length,
      maps: this.novel.maps?.length,
      starts: this.novel.starts?.length,
      lorebooks: this.novel.lorebooks?.length,
      inventory: this.novel.inventory?.length,
      cutscenes: this.novel.cutscenes?.length,
    });
  }

  async getTitle(): Promise<string> {
    return this.novel.title || 'empty value';
  }

  async getDescription(): Promise<string> {
    return this.novel.description || 'empty value';
  }

  async setTitle(title: string): Promise<string> {
    this.novel.title = title;
    return `Title set to: ${title}`;
  }

  async setDescription(description: string): Promise<string> {
    this.novel.description = description;
    return `Description updated successfully`;
  }

  async getLoreBooks(): Promise<string> {
    if (!this.novel.lorebooks) return 'empty value';
    return this.novel.lorebooks.length > 0 ? JSON.stringify(this.novel.lorebooks) : 'empty value';
  }

  async setLoreBookDetails(params: {
    lorebookId?: string;
    name?: string;
    description?: string;
    isGlobal?: boolean;
  }): Promise<string> {
    const { lorebookId, name, description, isGlobal } = params;

    if (lorebookId) {
      // Update existing lorebook
      const lorebook = this.novel.lorebooks?.find((lb) => lb.id === lorebookId);
      if (!lorebook) return 'Lorebook not found';

      if (name) lorebook.name = name;
      if (description) lorebook.description = description;
      if (isGlobal !== undefined) lorebook.isGlobal = isGlobal;

      return 'Lorebook updated successfully';
    } else {
      // Create new lorebook
      if (!name || isGlobal === undefined) {
        return 'Error: missing required parameters for new lorebook';
      }

      const newLorebook: NovelV3.NovelLorebook = {
        id: getId('lorebook'),
        name,
        description: description || '',
        isGlobal,
        entries: [],
        extensions: [],
      };

      this.novel.lorebooks?.push(newLorebook);
      return `New lorebook created with ID: ${newLorebook.id}`;
    }
  }

  async addLorebookToScene(lorebookId: string, sceneId: string): Promise<string> {
    const lorebook = this.novel.lorebooks?.find((lb) => lb.id === lorebookId);
    if (!lorebook) return 'Lorebook not found';

    const scene = this.novel.scenes?.find((s) => s.id === sceneId);
    if (!scene) return 'Scene not found';
    if (!scene.lorebookIds) scene.lorebookIds = [];

    if (!scene.lorebookIds.includes(lorebookId)) {
      scene.lorebookIds.push(lorebookId);
    }
    return 'Lorebook added to scene successfully';
  }

  async removeLorebookFromScene(lorebookId: string, sceneId: string): Promise<string> {
    const scene = this.novel.scenes?.find((s) => s.id === sceneId);
    if (!scene) return 'Scene not found';

    scene.lorebookIds = scene.lorebookIds?.filter((id) => id !== lorebookId);
    return 'Lorebook removed from scene successfully';
  }

  async removeEntryFromLorebook(lorebookId: string, entryId: number): Promise<string> {
    const lorebook = this.novel.lorebooks?.find((lb) => lb.id === lorebookId);
    if (!lorebook) return 'Lorebook not found';

    lorebook.entries = lorebook.entries.filter((entry) => entry.id !== entryId);
    return 'Entry removed from lorebook successfully';
  }

  async setEntryToLorebook(params: {
    lorebookId: string;
    entryId?: number;
    name?: string;
    keywords?: string[];
    content?: string;
  }): Promise<string> {
    const { lorebookId, entryId, name, keywords, content } = params;
    const lorebook = this.novel.lorebooks?.find((lb) => lb.id === lorebookId);
    if (!lorebook) return 'Lorebook not found';

    if (entryId) {
      // Update existing entry
      const entry = lorebook.entries.find((e) => e.id === entryId);
      if (!entry) return 'Entry not found';

      if (name) entry.name = name;
      if (keywords) entry.keys = keywords;
      if (content) entry.content = content;

      return 'Entry updated successfully';
    } else {
      // Create new entry
      if (!name || !keywords) {
        return 'Error: missing required parameters for new entry';
      }

      const id = Number(getId('entry'));
      lorebook.entries.push({
        id,
        enabled: true,
        insertion_order: 0,
        case_sensitive: false,
        name: name,
        priority: 0,
        position: 'before_char',
        keys: keywords,
        content: content || '',
        extensions: {},
      });
      return `New entry created with ID: ${id}`;
    }
  }

  async addCharacterBasics(params: {
    characterId?: string;
    name: string;
    short_description: string;
    tags: string[];
  }): Promise<string> {
    const { characterId, name, short_description, tags } = params;

    if (characterId) {
      // Update existing character
      const character = this.novel.characters.find((c) => c.id === characterId);
      if (!character) return 'Character not found';

      character.name = name;
      character.short_description = short_description;
      character.card.data.tags = tags;
      character.card.data.name = name;
      character.card.data.extensions.mikugg_v2.short_description = short_description;

      return 'Character updated successfully';
    } else {
      const id = getId('character');
      const outfitId = getId('outfit');
      // Create new character
      this.novel.characters.push({
        id,
        name,
        short_description,
        profile_pic: 'empty_char.png',
        tags,
        nsfw: NovelV3.NovelNSFW.NONE,
        card: {
          spec: 'chara_card_v2',
          spec_version: '2.0',
          data: {
            name: 'char1',
            alternate_greetings: [],
            character_version: '1',
            creator: '',
            creator_notes: '',
            description: '',
            extensions: {
              mikugg_v2: {
                license: 'CC BY-NC-SA 4.0',
                language: 'en',
                short_description,
                profile_pic: 'empty_char.png',
                nsfw: NovelV3.NovelNSFW.NONE,
                outfits: [
                  {
                    id: outfitId,
                    name: 'default',
                    description: 'The default outfit',
                    attributes: [],
                    template: 'single-emotion',
                    nsfw: NovelV3.NovelNSFW.NONE,
                    emotions: [
                      {
                        id: 'neutral',
                        sources: {
                          png: 'empty_char_emotion.png',
                        },
                      },
                    ],
                  },
                ],
              },
            },
            first_mes: '',
            mes_example: '',
            personality: '',
            post_history_instructions: '',
            scenario: '',
            system_prompt: '',
            tags: [],
          },
        },
      });
      return `New character created with ID: ${id} with outfit ID: ${outfitId}`;
    }
  }

  async setCharacterPrompts(params: {
    characterId: string;
    description: string;
    conversation_examples: string;
  }): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === params.characterId);
    if (!character) return 'Character not found';

    character.card.data.description = params.description;
    character.card.data.mes_example = params.conversation_examples;

    return 'Character prompts updated successfully';
  }

  async deleteCharacter(characterId: string): Promise<string> {
    const initialLength = this.novel.characters.length;
    this.novel.characters = this.novel.characters.filter((c) => c.id !== characterId);

    return initialLength !== this.novel.characters.length ? 'Character deleted successfully' : 'Character not found';
  }

  async getCharacters(): Promise<string> {
    if (!this.novel.characters.length) return 'empty value';

    const characterList = this.novel.characters.map((char) => ({
      id: char.id,
      name: char.name,
      short_description: char.short_description,
      description: char.card.data.description,
      conversation_examples: char.card.data.mes_example,
      outfits: char.card.data.extensions.mikugg_v2.outfits.map((outfit) => ({
        id: outfit.id,
        name: outfit.name,
        description: outfit.description,
      })),
      lorebookIds: char.lorebookIds || [],
    }));

    return JSON.stringify(characterList);
  }

  async attachLorebookToCharacter(characterId: string, lorebookId: string): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return 'Character not found';

    const lorebook = this.novel.lorebooks?.find((l) => l.id === lorebookId);
    if (!lorebook) return 'Lorebook not found';

    if (!character.lorebookIds) {
      character.lorebookIds = [];
    }

    if (!character.lorebookIds.includes(lorebookId)) {
      character.lorebookIds.push(lorebookId);
    }

    return 'Lorebook attached to character successfully';
  }

  async detachLorebookFromCharacter(characterId: string, lorebookId: string): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return 'Character not found';

    if (!character.lorebookIds) {
      return 'Character has no lorebooks attached';
    }

    character.lorebookIds = character.lorebookIds.filter((id) => id !== lorebookId);

    return 'Lorebook detached from character successfully';
  }

  async addBackgroundFromDatabase(prompt: string): Promise<string> {
    // In a real implementation, this would search a database
    // For now, we'll create a mock background
    const id = getId('background');
    this.novel.backgrounds.push({
      id,
      name: `background_${id}`,
      description: prompt,
      source: {
        jpg: 'empty_background.png',
      },
      attributes: [],
    });

    return `Background added with ID: ${id}. Description: ${prompt}`;
  }

  async modifyBackgroundDescription(backgroundId: string, description: string): Promise<string> {
    const background = this.novel.backgrounds?.find((bg) => bg.id === backgroundId);
    if (!background) return 'Background not found';

    background.description = description;
    return 'Background description updated successfully';
  }

  async removeBackground(backgroundId: string): Promise<string> {
    const initialLength = this.novel.backgrounds.length;
    this.novel.backgrounds = this.novel.backgrounds.filter((bg) => bg.id !== backgroundId);

    return initialLength !== this.novel.backgrounds.length ? 'Background removed successfully' : 'Background not found';
  }

  async getBackgrounds(): Promise<string> {
    if (!this.novel.backgrounds.length) return 'empty value';

    const backgroundList = this.novel.backgrounds.map((bg) => ({
      id: bg.id,
      description: bg.description,
    }));

    return JSON.stringify(backgroundList);
  }

  async addMusicFromDatabase(prompt: string): Promise<string> {
    // In a real implementation, this would search a music database
    // For now, we'll create a mock music entry
    const id = getId('music');
    this.novel.songs.push({
      id,
      name: `song_${id}`,
      description: prompt,
      source: 'empty_song.mp3',
      tags: [],
    });

    return `Music added with ID: ${id}. Description: ${prompt}`;
  }

  async modifyMusicDescription(musicId: string, description: string): Promise<string> {
    const music = this.novel.songs?.find((s) => s.id === musicId);
    if (!music) return 'Error: Music not found';

    music.description = description;
    return 'Music description updated successfully';
  }

  async removeMusic(musicId: string): Promise<string> {
    const initialLength = this.novel.songs.length;
    this.novel.songs = this.novel.songs.filter((song) => song.id !== musicId);

    return initialLength !== this.novel.songs.length ? 'Music removed successfully' : 'Music not found';
  }

  async getMusic(): Promise<string> {
    if (!this.novel.songs.length) return 'empty value';

    const musicList = this.novel.songs.map((song) => ({
      id: song.id,
      description: song.description,
    }));

    return JSON.stringify(musicList);
  }

  async setSceneDetails(params: {
    sceneId?: string; // If not provided, creates a new scene
    name?: string;
    short_description?: string;
    prompt?: string;
    characters?: {
      id: string;
      outfitId: string;
      emotionId: CharacterEmotion;
      objective?: string;
    }[];
    backgroundId?: string;
    musicId?: string;
    cutscene?: {
      triggerOnlyOnce: boolean;
      parts: {
        text: {
          type: 'dialogue' | 'description';
          content: string;
        }[];
        backgroundId: string;
        music?: string;
        characters: {
          id: string;
          outfitId: string;
          emotionId: CharacterEmotion;
        }[];
      }[];
    };
    hint?: string;
    condition?: string;
    actionText?: string;
  }): Promise<string> {
    const { sceneId, ...sceneData } = params;

    if (!sceneId) {
      if (!sceneData.name) return 'Error: missing scene name';
      if (!sceneData.short_description) return 'Error: missing scene short description';
      if (!sceneData.prompt) return 'Error: missing scene prompt';
      if (!sceneData.characters) return 'Error: missing scene characters';
      if (!sceneData.backgroundId) return 'Error: missing scene background';
      if (!sceneData.musicId) return 'Error: missing scene music';

      // Validate characters length
      if (sceneData.characters.length === 0 || sceneData.characters.length > 2) {
        return 'Error: Scene must have 1 or 2 characters';
      }

      // Validate characters exist and their outfits
      for (const char of sceneData.characters) {
        const character = this.novel.characters.find((c) => c.id === char.id);
        if (!character) return `Error: Character with ID ${char.id} not found`;

        const outfit = character.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === char.outfitId);
        if (!outfit) {
          return `Error: Outfit with ID ${char.outfitId} not found for character ${char.id}`;
        }
      }

      // Validate background exists
      const bgExists = this.novel.backgrounds.find((bg) => bg.id === sceneData.backgroundId);
      if (!bgExists) return `Error: Background with ID ${sceneData.backgroundId} not found`;

      // Validate music exists
      const musicExists = this.novel.songs.find((s) => s.id === sceneData.musicId);
      if (!musicExists) return `Error: Music with ID ${sceneData.musicId} not found`;
    } else {
      // Updating existing scene - only validate what's being updated
      const existingScene = this.novel.scenes.find((s) => s.id === sceneId);
      if (!existingScene) return `Error: Scene with ID ${sceneId} not found`;

      if (sceneData.characters) {
        // Validate characters length
        if (sceneData.characters.length === 0 || sceneData.characters.length > 2) {
          return 'Error: Scene must have 1 or 2 characters';
        }

        // Validate characters and outfits
        for (const char of sceneData.characters) {
          const character = this.novel.characters.find((c) => c.id === char.id);
          if (!character) return `Error: Character with ID ${char.id} not found`;

          const outfit = character.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === char.outfitId);
          if (!outfit) {
            return `Error: Outfit with ID ${char.outfitId} not found for character ${char.id}`;
          }
        }
      }

      if (sceneData.backgroundId) {
        const bgExists = this.novel.backgrounds.find((bg) => bg.id === sceneData.backgroundId);
        if (!bgExists) return `Error: Background with ID ${sceneData.backgroundId} not found`;
      }

      if (sceneData.musicId) {
        const musicExists = this.novel.songs.find((s) => s.id === sceneData.musicId);
        if (!musicExists) return `Error: Music with ID ${sceneData.musicId} not found`;
      }
    }

    // Handle cutscene if provided
    let cutSceneId: string | null = null;
    if (sceneData.cutscene) {
      const existingScene = sceneId ? this.novel.scenes.find((s) => s.id === sceneId) : null;
      cutSceneId = existingScene?.cutScene?.id || getId('cutscene');

      const cutsceneData = {
        id: cutSceneId,
        name: 'cutscene',
        parts: sceneData.cutscene.parts.map((part) => ({
          id: getId('cutscene'),
          text: part.text,
          background: part.backgroundId,
          music: part.music,
          characters: part.characters,
        })),
      };

      if (existingScene?.cutScene) {
        const existingCutscene = this.novel.cutscenes?.find((cs) => cs.id === cutSceneId);
        if (existingCutscene) {
          Object.assign(existingCutscene, cutsceneData);
        }
      } else {
        if (!this.novel.cutscenes) {
          this.novel.cutscenes = [];
        }
        this.novel.cutscenes.push(cutsceneData);
      }
    }

    if (sceneId) {
      // Update existing scene - only update provided fields
      const sceneIndex = this.novel.scenes.findIndex((s) => s.id === sceneId);
      if (sceneIndex === -1) return 'Error: Scene not found';

      const existingScene = this.novel.scenes[sceneIndex];

      // Update only the fields that were provided
      if (sceneData.name) existingScene.name = sceneData.name;
      if (sceneData.short_description) existingScene.description = sceneData.short_description;
      if (sceneData.prompt) existingScene.prompt = sceneData.prompt;
      if (sceneData.characters) {
        existingScene.characters = sceneData.characters.map((char) => ({
          characterId: char.id,
          outfit: char.outfitId,
          objective: char.objective,
        }));
      }
      if (sceneData.backgroundId) existingScene.backgroundId = sceneData.backgroundId;
      if (sceneData.musicId) existingScene.musicId = sceneData.musicId;
      if (sceneData.cutscene && cutSceneId) {
        existingScene.cutScene = {
          id: cutSceneId,
          triggerOnlyOnce: sceneData.cutscene.triggerOnlyOnce,
          triggered: false,
        };
      }
      if (sceneData.hint !== undefined) existingScene.hint = sceneData.hint;
      if (sceneData.condition !== undefined) existingScene.condition = sceneData.condition || null;
      if (sceneData.actionText !== undefined) existingScene.actionText = sceneData.actionText;

      return 'Scene updated successfully';
    } else {
      // Create new scene
      const newScene: NovelV3.NovelScene = {
        id: getId('scene'),
        name: sceneData.name!,
        description: sceneData.short_description!,
        prompt: sceneData.prompt!,
        characters: sceneData.characters!.map((char) => ({
          characterId: char.id,
          outfit: char.outfitId,
          objective: char.objective,
        })),
        backgroundId: sceneData.backgroundId!,
        musicId: sceneData.musicId!,
        cutScene: cutSceneId
          ? {
              id: cutSceneId,
              triggerOnlyOnce: sceneData.cutscene?.triggerOnlyOnce || false,
              triggered: false,
            }
          : undefined,
        hint: sceneData.hint,
        condition: sceneData.condition || null,
        actionText: sceneData.actionText || '',
        lorebookIds: [],
        children: [],
        nsfw: NovelV3.NovelNSFW.NONE,
      };

      this.novel.scenes.push(newScene);
      return `Scene created with ID: ${newScene.id}`;
    }
  }

  async removeScene(sceneId: string): Promise<string> {
    const initialLength = this.novel.scenes.length;
    this.novel.scenes = this.novel.scenes.filter((s) => s.id !== sceneId);

    // Also remove this scene from any parent scenes' childrenIds
    this.novel.scenes.forEach((scene) => {
      if (scene.children?.includes(sceneId)) {
        scene.children = scene.children.filter((id) => id !== sceneId);
      }
    });

    return initialLength !== this.novel.scenes.length ? 'Scene removed successfully' : 'Scene not found';
  }

  async connectScenes(sceneId: string, childSceneId: string): Promise<string> {
    const parentScene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!parentScene) return 'Error: Parent scene not found';

    const childScene = this.novel.scenes.find((s) => s.id === childSceneId);
    if (!childScene) return 'Error: Child scene not found';

    if (!parentScene.children) {
      parentScene.children = [];
    }

    if (!parentScene.children.includes(childSceneId)) {
      parentScene.children.push(childSceneId);
    }

    return 'Scenes connected successfully';
  }

  async disconnectScenes(sceneId: string, childSceneId: string): Promise<string> {
    const parentScene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!parentScene) return 'Parent scene not found';

    if (!parentScene.children?.includes(childSceneId)) {
      return 'Error: Scenes are not connected';
    }

    parentScene.children = parentScene.children.filter((id) => id !== childSceneId);
    return 'Scenes disconnected successfully';
  }

  async addStart(params: {
    sceneId: string;
    name: string;
    short_description: string;
    firstMessages: {
      characterId: string;
      message: string;
      emotionId: CharacterEmotion;
    }[];
  }): Promise<string> {
    const { sceneId, name, short_description, firstMessages } = params;

    // Validate scene exists
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';

    // Validate characters exist and emotions
    for (const msg of firstMessages) {
      const character = this.novel.characters.find((c) => c.id === msg.characterId);
      if (!character) {
        return `Error: Character with ID ${msg.characterId} not found`;
      }
    }

    const newStart: NovelV3.NovelStart = {
      id: getId('start'),
      title: name,
      description: short_description,
      sceneId,
      characters: firstMessages.map((msg) => ({
        characterId: msg.characterId,
        text: msg.message,
        emotion: msg.emotionId,
        pose: '',
      })),
    };

    if (!this.novel.starts) {
      this.novel.starts = [];
    }

    this.novel.starts.push(newStart);
    return `Start point created with ID: ${newStart.id}`;
  }

  async removeStart(startId: string): Promise<string> {
    const initialLength = this.novel.starts?.length || 0;
    if (!this.novel.starts) return 'Error: Start not found';

    this.novel.starts = this.novel.starts.filter((s) => s.id !== startId);

    return initialLength !== this.novel.starts.length ? 'Start removed successfully' : 'Error: Start not found';
  }

  async moveStartAsFirstOption(startId: string): Promise<string> {
    if (!this.novel.starts || this.novel.starts.length === 0) {
      return 'No starts available';
    }

    const startIndex = this.novel.starts.findIndex((s) => s.id === startId);
    if (startIndex === -1) return 'Error: Start not found';
    if (startIndex === 0) return 'Error: Start is already the first option';

    // Remove the start from its current position and insert it at the beginning
    const [start] = this.novel.starts.splice(startIndex, 1);
    this.novel.starts.unshift(start);

    return 'Start moved to first position successfully';
  }

  async updateSceneCutscene(
    sceneId: string,
    cutscene: {
      triggerOnlyOnce: boolean;
      parts: {
        text: {
          type: 'dialogue' | 'description';
          content: string;
        }[];
        backgroundId: string;
        musicId: string;
        characters: {
          id: string;
          outfitId: string;
          emotionId: CharacterEmotion;
        }[];
      }[];
    },
  ): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';

    const cutSceneId = scene.cutScene?.id || getId('cutscene');

    const cutsceneData = {
      id: cutSceneId,
      name: 'cutscene',
      parts: cutscene.parts.map((part) => ({
        id: getId('cutscene'),
        text: part.text,
        background: part.backgroundId,
        music: part.musicId,
        characters: part.characters,
      })),
    };

    if (scene.cutScene) {
      const existingCutscene = this.novel.cutscenes?.find((cs) => cs.id === cutSceneId);
      if (existingCutscene) {
        Object.assign(existingCutscene, cutsceneData);
      }
    } else {
      if (!this.novel.cutscenes) {
        this.novel.cutscenes = [];
      }
      this.novel.cutscenes.push(cutsceneData);
    }

    scene.cutScene = {
      id: cutSceneId,
      triggerOnlyOnce: cutscene.triggerOnlyOnce,
      triggered: false,
    };

    return 'Scene cutscene updated successfully';
  }

  async updateSceneHint(sceneId: string, hint: string): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';

    scene.hint = hint;
    return 'Scene hint updated successfully';
  }

  async updateSceneCondition(sceneId: string, condition: string): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';

    scene.condition = condition;
    return 'Scene condition updated successfully';
  }

  async updateSceneCharacters(sceneId: string, characters: any[]): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Scene not found';

    // Validate characters length
    if (characters.length === 0 || characters.length > 2) {
      return 'Scene must have 1 or 2 characters';
    }

    // Validate characters and outfits
    for (const char of characters) {
      const character = this.novel.characters.find((c) => c.id === char.id);
      if (!character) return `Error: Character with ID ${char.id} not found`;

      const outfit = character.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === char.outfitId);
      if (!outfit) {
        return `Error: Outfit with ID ${char.outfitId} not found for character ${char.id}`;
      }
    }

    scene.characters = characters.map((char) => ({
      characterId: char.id,
      outfit: char.outfitId,
      objective: char.objective,
    }));

    return 'Scene characters updated successfully';
  }

  async updateSceneBackground(sceneId: string, backgroundId: string): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';

    const background = this.novel.backgrounds.find((bg) => bg.id === backgroundId);
    if (!background) return 'Error: Background not found';

    scene.backgroundId = backgroundId;
    return 'Scene background updated successfully';
  }

  async updateSceneMusic(sceneId: string, musicId: string): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';

    const music = this.novel.songs.find((s) => s.id === musicId);
    if (!music) return 'Error: Music not found';

    scene.musicId = musicId;
    return 'Scene music updated successfully';
  }

  async updateCharacterName(characterId: string, name: string): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return 'Error: Character not found';

    character.name = name;
    character.card.data.name = name;
    return 'Character name updated successfully';
  }

  async updateCharacterShortDescription(characterId: string, shortDescription: string): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return 'Character not found';

    character.short_description = shortDescription;
    character.card.data.extensions.mikugg_v2.short_description = shortDescription;
    return 'Character short description updated successfully';
  }

  async updateCharacterTags(characterId: string, tags: string[]): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return 'Error: Character not found';

    character.tags = tags;
    character.card.data.tags = tags;
    return 'Character tags updated successfully';
  }

  async getScenes(): Promise<string> {
    return JSON.stringify({
      amount_of_scenes: this.novel.scenes.length,
      scenes: this.novel.scenes,
    });
  }

  async createItem(args: {
    name: string;
    description: string;
    hidden?: boolean;
    isPremium?: boolean;
    isNovelOnly?: boolean;
  }): Promise<string> {
    if (!this.novel.inventory) {
      this.novel.inventory = [];
    }
    const itemId = getId('item');
    this.novel.inventory.push({
      id: itemId,
      name: args.name,
      description: args.description,
      icon: '',
      hidden: args.hidden ?? false,
      isPremium: args.isPremium ?? false,
      isNovelOnly: args.isNovelOnly ?? true,
      actions: [
        {
          id: getId('itemaction'),
          name: 'Default Action',
          prompt: '',
          usageActions: [],
        },
      ],
    });
    return `Item created with ID: ${itemId}`;
  }

  async updateItem(args: {
    itemId: string;
    name?: string;
    description?: string;
    hidden?: boolean;
    isPremium?: boolean;
    isNovelOnly?: boolean;
  }): Promise<string> {
    if (!this.novel.inventory) return 'Error: No items in the inventory';
    const item = this.novel.inventory.find((itm) => itm.id === args.itemId);
    if (!item) return 'Error: Item not found';

    if (args.name !== undefined) item.name = args.name;
    if (args.description !== undefined) item.description = args.description;
    if (args.hidden !== undefined) item.hidden = args.hidden;
    if (args.isPremium !== undefined) item.isPremium = args.isPremium;
    if (args.isNovelOnly !== undefined) item.isNovelOnly = args.isNovelOnly;

    return 'Item updated successfully';
  }

  async removeItem(itemId: string): Promise<string> {
    if (!this.novel.inventory) return 'Error: No items in the inventory';
    const initialLength = this.novel.inventory.length;
    this.novel.inventory = this.novel.inventory.filter((itm) => itm.id !== itemId);
    return initialLength !== this.novel.inventory.length ? 'Item removed successfully' : 'Error: Item not found';
  }

  //
  // OBJECTIVES
  //
  async createObjective(args: {
    name: string;
    description?: string;
    hint?: string;
    condition?: string;
  }): Promise<string> {
    if (!this.novel.objectives) {
      (this.novel as any).objectives = []; // Casting to any to allow new field; or define it in the interface
    }
    const newId = getId('objective');
    (this.novel as any).objectives.push({
      id: newId,
      name: args.name,
      description: args.description || '',
      hint: args.hint || '',
      condition: args.condition || '',
      actions: [],
      singleUse: true,
      stateCondition: {
        type: 'IN_SCENE',
        config: { sceneIds: [] },
      },
    });
    return `Objective created with ID: ${newId}`;
  }

  async updateObjective(args: {
    objectiveId: string;
    name?: string;
    description?: string;
    hint?: string;
    condition?: string;
  }): Promise<string> {
    if (!this.novel.objectives) return 'Error: No objectives in the novel';
    const objective = (this.novel as any).objectives.find((obj: any) => obj.id === args.objectiveId);
    if (!objective) return 'Error: Objective not found';

    if (args.name !== undefined) objective.name = args.name;
    if (args.description !== undefined) objective.description = args.description;
    if (args.hint !== undefined) objective.hint = args.hint;
    if (args.condition !== undefined) objective.condition = args.condition;

    return 'Objective updated successfully';
  }

  async removeObjective(objectiveId: string): Promise<string> {
    if (!this.novel.objectives) return 'Error: No objectives in the novel';
    const initialLength = (this.novel as any).objectives.length;
    (this.novel as any).objectives = (this.novel as any).objectives.filter((obj: any) => obj.id !== objectiveId);
    return initialLength !== (this.novel as any).objectives.length
      ? 'Objective removed successfully'
      : 'Error: Objective not found';
  }

  //
  // MAPS
  //
  async createMap(args: { name: string; description?: string }): Promise<string> {
    if (!this.novel.maps) {
      this.novel.maps = [];
    }
    const newId = getId('map');
    this.novel.maps.push({
      id: newId,
      name: args.name,
      description: args.description || '',
      source: { png: '' },
      places: [],
    });
    return `Map created with ID: ${newId}`;
  }

  async updateMap(args: { mapId: string; name?: string; description?: string }): Promise<string> {
    const map = this.novel.maps?.find((m) => m.id === args.mapId);
    if (!map) return 'Error: Map not found';

    if (args.name !== undefined) map.name = args.name;
    if (args.description !== undefined) map.description = args.description;

    return 'Map updated successfully';
  }

  async removeMap(mapId: string): Promise<string> {
    const initialLength = this.novel.maps?.length || 0;
    this.novel.maps = this.novel.maps?.filter((m) => m.id !== mapId);
    return initialLength !== (this.novel.maps?.length || 0) ? 'Map removed successfully' : 'Error: Map not found';
  }

  async createMapPlace(args: { mapId: string; name: string; sceneId?: string; description?: string }): Promise<string> {
    const map = this.novel.maps?.find((m) => m.id === args.mapId);
    if (!map) return 'Error: Map not found';
    const newPlaceId = getId('place');

    map.places.push({
      id: newPlaceId,
      sceneId: args.sceneId || '',
      name: args.name,
      description: args.description || '',
      previewSource: '',
      maskSource: '',
    });
    return `New place created with ID: ${newPlaceId} in map ${args.mapId}`;
  }

  async updateMapPlace(args: {
    mapId: string;
    placeId: string;
    name?: string;
    sceneId?: string;
    description?: string;
  }): Promise<string> {
    const map = this.novel.maps?.find((m) => m.id === args.mapId);
    if (!map) return 'Error: Map not found';
    const place = map.places.find((p) => p.id === args.placeId);
    if (!place) return 'Error: Place not found';

    if (args.name !== undefined) place.name = args.name;
    if (args.sceneId !== undefined) place.sceneId = args.sceneId;
    if (args.description !== undefined) place.description = args.description;

    return 'Map place updated successfully';
  }

  async removeMapPlace(mapId: string, placeId: string): Promise<string> {
    const map = this.novel.maps?.find((m) => m.id === mapId);
    if (!map) return 'Error: Map not found';
    const initialLength = map.places.length;
    map.places = map.places.filter((p) => p.id !== placeId);
    return initialLength !== map.places.length ? 'Place removed successfully' : 'Error: Place not found';
  }
}
