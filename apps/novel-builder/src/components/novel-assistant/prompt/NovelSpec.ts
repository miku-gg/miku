import { AssetDisplayPrefix, getAssetLink, NovelV3, validateNovelState } from '@mikugg/bot-utils';
import { BackgroundResult, listSearch, SearchType, SongResult } from '../../../libs/listSearch';
import config from '../../../config';
import sdPromptImprover, { poses, getPromptForEmotion } from '../../../libs/sdPromptImprover';
import imageInferenceAPI from '../../../libs/imageInferenceAPI';
import { store } from '../../../state/store';
import { addPendingInference, PendingInference } from '../../../state/slices/novelFormSlice';
import { consumeCredits } from '../../../state/slices/userSlice';
import { emotionTemplates } from '../../../data/emotions';
import { openSpendApprovalModal } from '../../../state/slices/inputSlice';
import { addApprovalListener } from '../../../services/spendApprovalService';
import { v4 } from 'uuid';

const blobUrlToFile = (blobUrl: string, filename: string): Promise<File> =>
  new Promise((resolve) => {
    fetch(blobUrl).then((res) => {
      res.blob().then((blob) => {
        const file = new File([blob], filename, { type: blob.type });
        resolve(file);
      });
    });
  });

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
  private novel: NovelV3.NovelState & { pendingInferences?: PendingInference[] };

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
      pendingInferences: [],
    };
  }

  replaceState(state: NovelV3.NovelState) {
    this.novel = JSON.parse(JSON.stringify(state));

    // RESET IDS for character (already present code)
    const maxCharId = this.novel.characters.reduce((acc, character) => {
      const parts = character.id.split('_');
      if (parts.length === 2 && parts[0] === 'character') {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > acc) {
          acc = num;
        }
      }
      return acc;
    }, 0);
    ids.set('character', maxCharId);

    // NEW: RESET IDS for lorebook
    let maxLorebookId = 0;
    if (this.novel.lorebooks) {
      for (const lb of this.novel.lorebooks) {
        const parts = lb.id.split('_');
        if (parts.length === 2 && parts[0] === 'lorebook') {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxLorebookId) {
            maxLorebookId = num;
          }
        }
      }
      ids.set('lorebook', maxLorebookId);
    }

    // NEW: RESET IDS for entry (note that entryId is stored as a number)
    let maxEntryId = 0;
    if (this.novel.lorebooks) {
      for (const lb of this.novel.lorebooks) {
        for (const e of lb.entries) {
          // e.id is a number
          if (typeof e.id === 'number' && e.id > maxEntryId) {
            maxEntryId = e.id;
          }
        }
      }
      ids.set('entry', maxEntryId);
    }

    // NEW: RESET IDS for outfit
    let maxOutfitId = 0;
    for (const character of this.novel.characters) {
      const outfits = character.card?.data?.extensions?.mikugg_v2?.outfits ?? [];
      for (const outfit of outfits) {
        const parts = outfit.id.split('_');
        if (parts.length === 2 && parts[0] === 'outfit') {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxOutfitId) {
            maxOutfitId = num;
          }
        }
      }
    }
    ids.set('outfit', maxOutfitId);

    // NEW: RESET IDS for background
    let maxBgId = 0;
    for (const bg of this.novel.backgrounds) {
      const parts = bg.id.split('_');
      if (parts.length === 2 && parts[0] === 'background') {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxBgId) {
          maxBgId = num;
        }
      }
    }
    ids.set('background', maxBgId);

    // NEW: RESET IDS for music
    let maxMusicId = 0;
    for (const s of this.novel.songs) {
      const parts = s.id.split('_');
      if (parts.length === 2 && parts[0] === 'music') {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxMusicId) {
          maxMusicId = num;
        }
      }
    }
    ids.set('music', maxMusicId);

    // NEW: RESET IDS for cutscene
    let maxCutsceneId = 0;
    if (this.novel.cutscenes) {
      for (const c of this.novel.cutscenes) {
        const parts = c.id.split('_');
        if (parts.length === 2 && parts[0] === 'cutscene') {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxCutsceneId) {
            maxCutsceneId = num;
          }
        }
      }
    }
    ids.set('cutscene', maxCutsceneId);

    // NEW: RESET IDS for scene
    let maxSceneId = 0;
    for (const sc of this.novel.scenes) {
      const parts = sc.id.split('_');
      if (parts.length === 2 && parts[0] === 'scene') {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxSceneId) {
          maxSceneId = num;
        }
      }
    }
    ids.set('scene', maxSceneId);

    // NEW: RESET IDS for start
    let maxStartId = 0;
    for (const st of this.novel.starts) {
      const parts = st.id.split('_');
      if (parts.length === 2 && parts[0] === 'start') {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxStartId) {
          maxStartId = num;
        }
      }
    }
    ids.set('start', maxStartId);

    // NEW: RESET IDS for item
    let maxItemId = 0;
    if (this.novel.inventory) {
      for (const it of this.novel.inventory) {
        const parts = it.id.split('_');
        if (parts.length === 2 && parts[0] === 'item') {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxItemId) {
            maxItemId = num;
          }
        }
      }
    }
    ids.set('item', maxItemId);

    // NEW: RESET IDS for objective
    if (!this.novel.objectives) {
      this.novel.objectives = [];
    }
    let maxObjectiveId = 0;
    for (const obj of this.novel.objectives) {
      const parts = obj.id.split('_');
      if (parts.length === 2 && parts[0] === 'objective') {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxObjectiveId) {
          maxObjectiveId = num;
        }
      }
    }
    ids.set('objective', maxObjectiveId);

    // NEW: RESET IDS for map
    let maxMapId = 0;
    for (const m of this.novel.maps) {
      const parts = m.id.split('_');
      if (parts.length === 2 && parts[0] === 'map') {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxMapId) {
          maxMapId = num;
        }
      }
    }
    ids.set('map', maxMapId);

    // NEW: RESET IDS for place
    let maxPlaceId = 0;
    for (const m of this.novel.maps) {
      for (const p of m.places) {
        const parts = p.id.split('_');
        if (parts.length === 2 && parts[0] === 'place') {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxPlaceId) {
            maxPlaceId = num;
          }
        }
      }
    }
    ids.set('place', maxPlaceId);

    // NEW: RESET IDS for indicator
    let maxIndicatorId = 0;
    for (const sc of this.novel.scenes) {
      if (sc.indicators) {
        for (const ind of sc.indicators) {
          const parts = ind.id.split('_');
          if (parts.length === 2 && parts[0] === 'indicator') {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num > maxIndicatorId) {
              maxIndicatorId = num;
            }
          }
        }
      }
    }
    ids.set('indicator', maxIndicatorId);
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
      if (!character) return `Error: Character with id ${characterId} not found`;

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
    prompt: string;
    conversation_examples: string;
  }): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === params.characterId);
    if (!character) return `Error: Character with id ${params.characterId} not found`;

    character.card.data.description = params.prompt;
    character.card.data.mes_example = params.conversation_examples;

    return 'Character prompts updated successfully';
  }

  async deleteCharacter(characterId: string): Promise<string> {
    const initialLength = this.novel.characters.length;
    this.novel.characters = this.novel.characters.filter((c) => c.id !== characterId);

    return initialLength !== this.novel.characters.length
      ? 'Character deleted successfully'
      : `Error: Character with id ${characterId} not found`;
  }

  async getCharacters(): Promise<string> {
    if (!this.novel.characters.length) return 'empty value';

    const characterList = this.novel.characters.map((char) => ({
      id: char.id,
      name: char.name,
      short_description: char.short_description,
      prompt: char.card.data.description,
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
    if (!character) return `Error: Character with id ${characterId} not found`;

    const lorebook = this.novel.lorebooks?.find((l) => l.id === lorebookId);
    if (!lorebook) return `Error: Lorebook with id ${lorebookId} not found`;

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
    if (!character) return `Error: Character with id ${characterId} not found`;

    if (!character.lorebookIds) {
      return `Error: Character with id ${characterId} has no lorebooks attached`;
    }

    character.lorebookIds = character.lorebookIds.filter((id) => id !== lorebookId);

    return 'Lorebook detached from character successfully';
  }

  async addBackgroundFromDatabase(prompt: string): Promise<string> {
    try {
      let background: BackgroundResult = {
        id: 'default_background',
        description: 'default_background',
        asset: 'default_background.png',
        sdPrompt: null,
        sdModel: null,
        sdParams: null,
        author: {
          id: 'miku',
          username: 'miku',
          profilePic: null,
        },
        createdAt: new Date(),
        tags: [],
      };
      let searchingError = false;
      try {
        // Use vector search to find the most similar background
        const results = await listSearch<BackgroundResult>(config.platformAPIEndpoint, SearchType.BACKGROUND_VECTORS, {
          search: prompt,
          take: 1,
          skip: 0,
        });

        if (!results.length) {
          searchingError = true;
          console.error('No matching background found for the given description');
        } else {
          background = results[0];
        }
      } catch (error) {
        console.error('Error searching for background:', error);
        searchingError = true;
      }

      const id = getId('background');

      this.novel.backgrounds.push({
        id,
        name: `background_${id}`,
        description: background.description,
        source: {
          jpg: background.asset,
        },
        attributes: background.tags?.map((tag) => ['tag', tag]) || [],
      });

      return `Background added with ID: ${id}. Description: ${background.description}.${
        searchingError
          ? ' There was an error searching for the background in the database. Using default background'
          : ''
      }`;
    } catch (error) {
      console.error('Error searching for background:', error);
      return 'Error searching for background in database';
    }
  }

  async modifyBackgroundDescription(backgroundId: string, description: string): Promise<string> {
    const background = this.novel.backgrounds?.find((bg) => bg.id === backgroundId);
    if (!background) return `Error: Background with id ${backgroundId} not found`;

    background.description = description;
    return 'Background description updated successfully';
  }

  async removeBackground(backgroundId: string): Promise<string> {
    const initialLength = this.novel.backgrounds.length;
    this.novel.backgrounds = this.novel.backgrounds.filter((bg) => bg.id !== backgroundId);

    return initialLength !== this.novel.backgrounds.length ? 'Background removed successfully' : 'Background not found';
  }

  async getBackgrounds(): Promise<string> {
    if (!this.novel.backgrounds.length) return "There's no backgrounds";

    const backgroundList = this.novel.backgrounds.map((bg) => ({
      id: bg.id,
      description: bg.description,
    }));

    return JSON.stringify(backgroundList);
  }

  async addMusicFromDatabase(prompt: string): Promise<string> {
    try {
      let song: SongResult = {
        id: 'devonshire',
        title: 'default_song',
        description: 'default_song',
        asset: 'devonshire.mp3',
        tags: [],
        authorId: 'miku',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      let searchingError = false;
      try {
        // Use vector search to find the most similar song
        const results = await listSearch<SongResult>(config.platformAPIEndpoint, SearchType.SONG_VECTOR, {
          search: prompt,
          take: 1,
          skip: 0,
        });

        if (!results.length) {
          searchingError = true;
        } else {
          song = results[0];
        }
      } catch (error) {
        searchingError = true;
        console.error('Error searching for song:', error);
      }

      const id = getId('music');

      this.novel.songs.push({
        id,
        name: song.title || `song_${id}`,
        description: song.description,
        source: song.asset,
        tags: song.tags || [],
      });

      return `Music added with ID: ${id}. Description: ${song.description}.${
        searchingError ? ' There was an error searching for the song in the database. Using default song' : ''
      }`;
    } catch (error) {
      console.error('Error searching for song:', error);
      return 'Error searching for song in database';
    }
  }

  async modifyMusicDescription(musicId: string, description: string): Promise<string> {
    const music = this.novel.songs?.find((s) => s.id === musicId);
    if (!music) return `Error: Music with id ${musicId} with id ${musicId} not found`;

    music.description = description;
    return 'Music description updated successfully';
  }

  async removeMusic(musicId: string): Promise<string> {
    const initialLength = this.novel.songs.length;
    this.novel.songs = this.novel.songs.filter((song) => song.id !== musicId);

    return initialLength !== this.novel.songs.length
      ? 'Music removed successfully'
      : `Error: Music with id ${musicId} not found`;
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

      return `Scene ID ${sceneId} updated successfully`;
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
    firstMessagePerCharacters: {
      characterId: string;
      message: string;
      emotionId: CharacterEmotion;
    }[];
  }): Promise<string> {
    const { sceneId, name, short_description, firstMessagePerCharacters } = params;

    // Validate scene exists
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';

    // Validate characters exist and emotions
    for (const msg of firstMessagePerCharacters) {
      const character = this.novel.characters.find((c) => c.id === msg.characterId);
      if (!character) {
        return `Error: Character with ID ${msg.characterId} not found`;
      }
    }
    // check if characters.length in the scene === firstMessages.length
    if (scene.characters.length !== firstMessagePerCharacters.length) {
      return 'Error: Number of characters in the scene does not match the number of characters in the first messages';
    }
    // check if all characters in the scene are in the first messages
    for (const char of scene.characters) {
      if (!firstMessagePerCharacters.some((msg) => msg.characterId === char.characterId)) {
        return `Error: Character with ID ${char.characterId} not found in the first messages`;
      }
    }

    const newStart: NovelV3.NovelStart = {
      id: getId('start'),
      title: name,
      description: short_description,
      sceneId,
      characters: firstMessagePerCharacters.map((msg) => ({
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
    if (!character) return `Error: Character with id ${characterId} not found`;

    character.name = name;
    character.card.data.name = name;
    return 'Character name updated successfully';
  }

  async updateCharacterShortDescription(characterId: string, shortDescription: string): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return `Error: Character with id ${characterId} not found`;

    character.short_description = shortDescription;
    character.card.data.extensions.mikugg_v2.short_description = shortDescription;
    return 'Character short description updated successfully';
  }

  async updateCharacterTags(characterId: string, tags: string[]): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return `Error: Character with id ${characterId} not found`;

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
    scenes?: string[];
    actions?: {
      name: string;
      prompt: string;
      usageActions?: {
        actionType:
          | 'attach_parent_scene_to_child'
          | 'suggest_advance_to_scene'
          | 'display_inventory_item'
          | 'hide_inventory_item';
        suggestSceneId?: string;
        itemId?: string;
        parentSceneId?: string;
        childSceneId?: string;
      }[];
    }[];
  }): Promise<string> {
    if (!this.novel.inventory) {
      this.novel.inventory = [];
    }
    const itemId = getId('item');

    // Convert item actions (if provided)
    const itemActions: NovelV3.InventoryAction[] =
      args.actions?.map((action) => ({
        id: getId('itemaction'),
        name: action.name,
        prompt: action.prompt,
        usageActions:
          action.usageActions?.map((usageAction) => {
            switch (usageAction.actionType) {
              case 'attach_parent_scene_to_child':
                return {
                  type: NovelV3.NovelActionType.ADD_CHILD_SCENES,
                  params: { sceneId: usageAction.parentSceneId || '', children: [usageAction.childSceneId || ''] },
                };
              case 'suggest_advance_to_scene':
                return {
                  type: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
                  params: { sceneId: usageAction.suggestSceneId || '' },
                };
              case 'display_inventory_item':
                return {
                  type: NovelV3.NovelActionType.SHOW_ITEM,
                  params: { itemId: usageAction.itemId || '' },
                };
              case 'hide_inventory_item':
              default:
                return {
                  type: NovelV3.NovelActionType.HIDE_ITEM,
                  params: { itemId: usageAction.itemId || '' },
                };
            }
          }) || [],
      })) || [];

    // Create and store the item
    this.novel.inventory.push({
      id: itemId,
      name: args.name,
      description: args.description,
      icon: '',
      hidden: args.hidden ?? false,
      isPremium: false,
      isNovelOnly: true,
      locked: args.scenes?.length ? { type: 'IN_SCENE', config: { sceneIds: args.scenes } } : undefined,
      actions: itemActions,
    });

    return `Item created with ID: ${itemId}`;
  }

  async updateItem(args: {
    itemId: string;
    name?: string;
    description?: string;
    hidden?: boolean;
    scenes?: string[];
    actions?: {
      name: string;
      prompt: string;
      usageActions?: {
        actionType:
          | 'attach_parent_scene_to_child'
          | 'suggest_advance_to_scene'
          | 'display_inventory_item'
          | 'hide_inventory_item';
        suggestSceneId?: string;
        itemId?: string;
        parentSceneId?: string;
        childSceneId?: string;
      }[];
    }[];
  }): Promise<string> {
    if (!this.novel.inventory) return 'Error: No items in the inventory';

    const item = this.novel.inventory.find((itm) => itm.id === args.itemId);
    if (!item) return 'Error: Item not found';

    // Update fields only if present in args
    if (args.name !== undefined) item.name = args.name;
    if (args.description !== undefined) item.description = args.description;
    if (args.hidden !== undefined) item.hidden = args.hidden;
    // If actions were provided, overwrite the existing actions
    if (args.actions !== undefined) {
      item.actions =
        args.actions?.map((action) => ({
          id: getId('itemaction'),
          name: action.name,
          prompt: action.prompt,
          usageActions:
            action.usageActions?.map((usageAction) => {
              switch (usageAction.actionType) {
                case 'attach_parent_scene_to_child':
                  return {
                    type: NovelV3.NovelActionType.ADD_CHILD_SCENES,
                    params: { sceneId: usageAction.parentSceneId || '', children: [usageAction.childSceneId || ''] },
                  };
                case 'suggest_advance_to_scene':
                  return {
                    type: NovelV3.NovelActionType.SUGGEST_ADVANCE_SCENE,
                    params: { sceneId: usageAction.suggestSceneId || '' },
                  };
                case 'display_inventory_item':
                  return {
                    type: NovelV3.NovelActionType.SHOW_ITEM,
                    params: { itemId: usageAction.itemId || '' },
                  };
                case 'hide_inventory_item':
                default:
                  return {
                    type: NovelV3.NovelActionType.HIDE_ITEM,
                    params: { itemId: usageAction.itemId || '' },
                  };
              }
            }) || [],
        })) || [];
    }

    if (args.scenes) {
      item.locked = args.scenes?.length ? { type: 'IN_SCENE', config: { sceneIds: args.scenes } } : undefined;
    }

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
    sceneId: string;
    name: string;
    description?: string;
    hint?: string;
    condition?: string;
  }): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === args.sceneId);
    if (!scene) return 'Error: Scene not found';
    const objectives = this.novel.objectives || [];

    const newId = getId('objective');
    objectives.push({
      id: newId,
      name: args.name,
      description: args.description || '',
      hint: args.hint || '',
      condition: args.condition || '',
      actions: [],
      singleUse: true,
      stateCondition: {
        type: 'IN_SCENE',
        config: {
          sceneIds: [args.sceneId],
        },
      },
    });
    return `Objective created with ID: ${newId} in scene ${args.sceneId}`;
  }

  async updateObjective(args: {
    sceneId: string;
    objectiveId: string;
    name?: string;
    description?: string;
    hint?: string;
    condition?: string;
  }): Promise<string> {
    const objective = this.novel.objectives?.find((obj: any) => obj.id === args.objectiveId);
    if (!objective) return 'Error: Objective not found';
    if (args.name !== undefined) objective.name = args.name;
    if (args.description !== undefined) objective.description = args.description;
    if (args.sceneId !== undefined)
      objective.stateCondition = {
        type: 'IN_SCENE',
        config: {
          sceneIds: [args.sceneId],
        },
      };
    if (args.hint !== undefined) objective.hint = args.hint;
    if (args.condition !== undefined) objective.condition = args.condition;

    return 'Objective updated successfully';
  }

  async removeObjective(objectiveId: string): Promise<string> {
    const objective = this.novel.objectives?.find((obj) => obj.id === objectiveId);
    if (!objective) return 'Error: Objective not found';
    this.novel.objectives = this.novel.objectives?.filter((obj) => obj.id !== objectiveId);
    return 'Objective removed successfully';
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

  async addIndicatorToScene(args: {
    sceneId: string;
    name: string;
    description?: string;
    type: 'percentage' | 'amount' | 'discrete';
    values?: string[];
    initialValue: string;
    inferred?: boolean;
    step?: number;
    min?: number;
    max?: number;
    hidden?: boolean;
    editable?: boolean;
    color?: string;
  }): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === args.sceneId);
    if (!scene) return 'Error: Scene not found';

    if (!scene.indicators) {
      scene.indicators = [];
    }
    const indicatorId = getId('indicator');

    scene.indicators.push({
      id: indicatorId,
      name: args.name,
      description: args.description ?? '',
      type: args.type,
      values: args.values || [],
      initialValue: args.initialValue,
      inferred: args.inferred ?? false,
      step: args.step,
      min: args.min,
      max: args.max,
      hidden: args.hidden ?? false,
      editable: args.editable ?? false,
      color: args.color || '#4CAF50',
    });
    return `Indicator created with ID: ${indicatorId}`;
  }

  async updateIndicatorInScene(args: {
    sceneId: string;
    indicatorId: string;
    name?: string;
    description?: string;
    type?: 'percentage' | 'amount' | 'discrete';
    values?: string[];
    initialValue?: string;
    inferred?: boolean;
    step?: number;
    min?: number;
    max?: number;
    hidden?: boolean;
    editable?: boolean;
    color?: string;
  }): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === args.sceneId);
    if (!scene) return 'Error: Scene not found';
    if (!scene.indicators) return 'Error: No indicators in this scene';

    const indicator = scene.indicators.find((i) => i.id === args.indicatorId);
    if (!indicator) return 'Error: Indicator not found';

    if (args.name !== undefined) indicator.name = args.name;
    if (args.description !== undefined) indicator.description = args.description;
    if (args.type !== undefined) indicator.type = args.type;
    if (args.values !== undefined) indicator.values = args.values;
    if (args.initialValue !== undefined) indicator.initialValue = args.initialValue;
    if (args.inferred !== undefined) indicator.inferred = args.inferred;
    if (args.step !== undefined) indicator.step = args.step;
    if (args.min !== undefined) indicator.min = args.min;
    if (args.max !== undefined) indicator.max = args.max;
    if (args.hidden !== undefined) indicator.hidden = args.hidden;
    if (args.editable !== undefined) indicator.editable = args.editable;
    if (args.color !== undefined) indicator.color = args.color;

    return 'Indicator updated successfully';
  }

  async removeIndicatorFromScene(sceneId: string, indicatorId: string): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';
    if (!scene.indicators) return 'Error: No indicators in this scene';

    const initialLength = scene.indicators.length;
    scene.indicators = scene.indicators.filter((ind) => ind.id !== indicatorId);
    return initialLength !== scene.indicators.length ? 'Indicator removed successfully' : 'Error: Indicator not found';
  }

  async getItems(): Promise<string> {
    if (!this.novel.inventory || !this.novel.inventory.length) {
      return 'No items found';
    }
    return JSON.stringify(
      this.novel.inventory.map((item) => {
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          hidden: item.hidden,
          actions: item.actions.map((action) => ({
            id: action.id,
            name: action.name,
            prompt: action.prompt,
            usageActions: action.usageActions,
          })),
          scenes: item.actions.length ? item.actions[0].usageCondition?.config.sceneIds : [],
        };
      }),
    );
  }

  async getObjectivesInScene(sceneId: string): Promise<string> {
    const objectives = this.novel.objectives?.filter((obj) => obj.stateCondition.config.sceneIds.includes(sceneId));
    if (!objectives || !objectives.length) return 'Error: Empty objectives';
    return JSON.stringify(
      objectives.map((objective) => {
        return {
          id: objective.id,
          name: objective.name,
          description: objective.description,
          hint: objective.hint,
          condition: objective.condition,
          actions: objective.actions,
          sceneId: objective.stateCondition?.config?.sceneIds[0],
        };
      }),
    );
  }

  async getIndicatorsInScene(sceneId: string): Promise<string> {
    const scene = this.novel.scenes.find((s) => s.id === sceneId);
    if (!scene) return 'Error: Scene not found';
    if (!scene.indicators || !scene.indicators.length) return 'Error: Empty indicators';
    return JSON.stringify(scene.indicators);
  }

  async getMaps(): Promise<string> {
    if (!this.novel.maps || !this.novel.maps.length) {
      return 'Error: No maps found';
    }
    return JSON.stringify(
      this.novel.maps.map((map) => ({
        id: map.id,
        name: map.name,
        description: map.description,
        places: map.places.map((place) => ({ id: place.id, name: place.name, description: place.description })),
        sceneIdsWhereVisible: this.novel.scenes
          .filter((scene) => scene.parentMapIds?.includes(map.id))
          .map((scene) => scene.id),
      })),
    );
  }

  async setMapScenes(mapId: string, sceneIds: string[]): Promise<string> {
    const map = this.novel.maps?.find((m) => m.id === mapId);
    if (!map) return 'Error: Map not found';
    this.novel.scenes
      .filter((scene) => sceneIds.includes(scene.id))
      .forEach((scene) => {
        if (!scene.parentMapIds?.includes(mapId)) {
          scene.parentMapIds = scene.parentMapIds || [];
          scene.parentMapIds.push(mapId);
        }
      });
    return 'Map scenes updated successfully';
  }

  // NEW: askForSpendApproval function
  async askForSpendApproval(amount: number, reason: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Generate a unique approval ID using our getId function.
      const approvalId = v4();
      // Save the resolve/reject callbacks in our approval service
      addApprovalListener(approvalId, resolve, reject);
      // Dispatch an action to open the spend approval modal,
      // passing the approval ID plus the amount and reason.
      store.dispatch(openSpendApprovalModal({ id: approvalId, amount, reason }));
    });
  }

  async generateCharacterOutfit(characterId: string, appearance: string): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return 'Error: characterId not found';
    const firstOutfit = character.card.data.extensions.mikugg_v2.outfits[0];
    let outfit = {
      id: getId('outfit'),
      name: 'New Outfit',
      description: 'A new outfit for the character',
      template: 'single-emotion',
      emotions: [
        {
          id: 'neutral',
          sources: {
            png: 'empty_char_emotion.png',
          },
        },
      ],
      attributes: [] as string[][],
    };
    if (
      firstOutfit.template === 'single-emotion' &&
      (!firstOutfit.emotions.length ||
        firstOutfit.emotions[0].sources.png === 'empty_char_emotion.png' ||
        !firstOutfit.emotions[0].sources.png)
    ) {
      outfit = firstOutfit;
    } else {
      // new outfit
      character.card.data.extensions.mikugg_v2.outfits.push(outfit);
    }
    const { user, pricing } = store.getState().user;
    if ((user?.credits || 0) < pricing.character) {
      return 'Error: Not enough credits. Please ask the user to buy more inference credits to generate images.';
    }
    // NEW: Wait for spend approval before starting the inference.
    try {
      await this.askForSpendApproval(pricing.character, 'generate character outfit');
    } catch (err) {
      return 'Error: Generation denied by user';
    }
    const promptResponse = await sdPromptImprover.generatePrompt(appearance);
    if (!promptResponse.prompt) return 'Error: No prompt generated';
    const seed = String(Math.floor(Math.random() * 1000000000));
    const inferenceResponse = await imageInferenceAPI.startInference({
      modelToUse: 1,
      prompt: promptResponse.prompt || '',
      workflowId: 'character_pose',
      seed,
      step: 'GEN',
      emotion: 'neutral',
      openposeImageHash: poses[promptResponse.components.pose] || 'pose2.jpg',
      referenceImageWeight: 0,
      headPrompt: promptResponse.components.character_head,
    });
    if (!inferenceResponse.data) return 'Error: Error sending inference to server';
    const inferenceId = inferenceResponse.data;
    if (!this.novel.pendingInferences) {
      this.novel.pendingInferences = [];
    }
    this.novel.pendingInferences.push({
      inferenceId,
      inferenceType: 'character',
      prompt: promptResponse.prompt || '',
      modelToUse: 1,
      seed,
      headPrompt: promptResponse.components.character_head,
      outfitId: outfit.id,
      characterId,
      status: 'pending',
      createdAt: Date.now(),
    });
    store.dispatch(consumeCredits('character'));
    return `Outfit with id "${outfit.id}" started generation successfully`;
  }

  async generateOutfitEmotions(characterId: string, outfitId: string): Promise<string> {
    const character = this.novel.characters.find((c) => c.id === characterId);
    if (!character) return 'Error: characterId not found';

    const outfit = character.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === outfitId);
    if (!outfit) return 'Error: outfitId not found. Generate an outfit first.';

    // Ensure the outfit's neutral emotion has been generated.
    if (outfit.emotions.find((e) => e.id === 'neutral' && e.sources.png === 'empty_char_emotion.png')) {
      const pendingInference = this.novel.pendingInferences?.find(
        (i) => i.outfitId === outfitId && i.characterId === characterId,
      );
      if (pendingInference) {
        return 'Error: The outfit is still generating. Please wait for it to finish before generating emotions.';
      } else {
        return 'Error: Outfit has no neutral emotion. Generate an outfit first.';
      }
    }

    // check if emotions are being generated
    const emotionsBeingGenerated = this.novel.pendingInferences?.filter(
      (i) => i.outfitId === outfitId && i.characterId === characterId,
    );
    if (emotionsBeingGenerated && emotionsBeingGenerated.length > 0) {
      return 'Error: The outfit is still generating. Please wait for it to finish.';
    }

    // Update outfit template to use tiny-emotions
    outfit.template = 'tiny-emotions';

    // Get the neutral emotion's image hash
    const neutralEmotion = outfit.emotions.find((e) => e.id === 'neutral');
    if (!neutralEmotion || !neutralEmotion.sources.png) {
      return 'Error: Neutral emotion not found in outfit';
    }

    // Get the tiny-emotions template and obtain its emotionIds (expected to be 9)
    const tinyEmotionTemplate = emotionTemplates.find((t) => t.id === 'tiny-emotions');
    const emotionsToGenerate = tinyEmotionTemplate ? tinyEmotionTemplate.emotionIds : [];
    if (emotionsToGenerate.length === 0) {
      return 'Error: No emotions configured for tiny-emotions template';
    }

    const { user, pricing } = store.getState().user;
    if ((user?.credits || 0) < pricing.emotion * 9) {
      return 'Error: Not enough credits. Please ask the user to buy more inference credits to generate images.';
    }

    // NEW: Ask for spend approval before generating emotions.
    try {
      await this.askForSpendApproval(pricing.emotion * 9, 'generate outfit emotions');
    } catch (err) {
      return 'Error: Generation denied by user';
    }
    const imageUrl = getAssetLink(
      {
        optimized: config.assetsEndpointOptimized,
        fallback: config.assetsEndpoint,
      },
      neutralEmotion.sources.png,
      AssetDisplayPrefix.EMOTION_IMAGE,
    );
    const file = await blobUrlToFile(imageUrl, 'file.png');
    const neutralImageHashResponse = await imageInferenceAPI.uploadImageToWizardAssets(file);
    const neutralImageHash = neutralImageHashResponse.data.image_hash;
    // Determine head prompt from the outfit's generationData (or default to an empty string if not provided)
    const headPrompt = (outfit.generationData && outfit.generationData.headPrompt) || '';
    // Prepare the original generation data. If none exists, create and store a new one.
    const originalGenerationData = outfit.generationData || {
      seed: String(Math.floor(Math.random() * 1000000000)),
      modelToUse: 1,
      referenceImage: neutralImageHash,
      prompt: headPrompt,
      poseImage: neutralImageHash,
      headPrompt: headPrompt,
    };
    outfit.generationData = originalGenerationData;

    // Fire off an inference for each emotion
    await Promise.all(
      emotionsToGenerate.map(async (emotionId, index) => {
        const finalPrompt = getPromptForEmotion(emotionId, headPrompt);
        const inferenceResponse = await imageInferenceAPI.startInference({
          workflowId: 'only_emotion',
          prompt: finalPrompt,
          step: 'EMOTION',
          referenceImageWeight: 0.6,
          referenceImageHash: neutralImageHash,
          renderedPoseImageHash: neutralImageHash,
          emotion: emotionId,
          seed: String(originalGenerationData.seed),
          modelToUse: originalGenerationData.modelToUse,
          emotionIndex: index,
        });
        if (!inferenceResponse.data) return 'Error: Error sending inference to server';

        if (!this.novel.pendingInferences) {
          this.novel.pendingInferences = [];
        }
        this.novel.pendingInferences.push({
          inferenceId: inferenceResponse.data,
          inferenceType: 'emotion',
          prompt: finalPrompt,
          headPrompt: headPrompt,
          emotionId: emotionId,
          seed: originalGenerationData.seed,
          modelToUse: originalGenerationData.modelToUse,
          referenceImage: originalGenerationData.referenceImage,
          outfitId: outfit.id,
          characterId,
          status: 'pending',
          createdAt: Date.now(),
        });

        // Deduct the price of the emotion generation
        store.dispatch(consumeCredits('emotion'));
      }),
    );

    return 'Outfit emotions generation started successfully';
  }

  async generateBackgroundImage(backgroundId: string, prompt: string): Promise<string> {
    const background = this.novel.backgrounds.find((b) => b.id === backgroundId);
    if (!background) return 'Error: backgroundId not found';

    const { user, pricing } = store.getState().user;
    if ((user?.credits || 0) < pricing.background) {
      return 'Error: Not enough credits. Please ask the user to buy more inference credits to generate images.';
    }
    // NEW: Ask for spend approval before generating emotions.
    try {
      await this.askForSpendApproval(pricing.background, 'generate a background');
    } catch (err) {
      return 'Error: Generation denied by user';
    }

    const seed = String(Math.floor(Math.random() * 1000000000));
    const inferenceResponse = await imageInferenceAPI.startInference({
      modelToUse: 1,
      prompt: prompt || '',
      workflowId: 'backgrounds',
      seed,
      step: 'GEN',
      referenceImageWeight: 0,
    });
    if (!inferenceResponse.data) return 'Error: Error sending inference to server';
    const inferenceId = inferenceResponse.data;
    if (!this.novel.pendingInferences) {
      this.novel.pendingInferences = [];
    }
    this.novel.pendingInferences.push({
      inferenceId,
      inferenceType: 'background',
      backgroundId,
      prompt: prompt || '',
      modelToUse: 1,
      seed,
      status: 'pending',
      createdAt: Date.now(),
    });
    store.dispatch(consumeCredits('background'));
    return `Background generation for id "${backgroundId}" started successfully`;
  }

  async generateItemImage(itemId: string, prompt: string): Promise<string> {
    const item = this.novel.inventory?.find((i) => i.id === itemId);
    if (!item) return 'Error: itemId not found';

    const { user, pricing } = store.getState().user;
    if ((user?.credits || 0) < pricing.item) {
      return 'Error: Not enough credits. Please ask the user to buy more inference credits to generate images.';
    }
    // NEW: Ask for spend approval before generating emotions.
    try {
      await this.askForSpendApproval(pricing.item, 'generate an item image');
    } catch (err) {
      return 'Error: Generation denied by user';
    }

    const seed = String(Math.floor(Math.random() * 1000000000));
    const inferenceResponse = await imageInferenceAPI.startInference({
      modelToUse: 1,
      prompt: prompt || '',
      workflowId: 'rpg_item',
      seed,
      step: 'GEN',
      referenceImageWeight: 0,
    });
    if (!inferenceResponse.data) return 'Error: Error sending inference to server';
    const inferenceId = inferenceResponse.data;
    if (!this.novel.pendingInferences) {
      this.novel.pendingInferences = [];
    }
    this.novel.pendingInferences.push({
      inferenceId,
      inferenceType: 'item',
      itemId,
      prompt: prompt || '',
      modelToUse: 1,
      seed,
      status: 'pending',
      createdAt: Date.now(),
    });
    store.dispatch(consumeCredits('item'));
    return `Item image generation for id "${itemId}" started successfully`;
  }

  createBackground(name: string, description: string): string {
    const id = getId('background');
    const background = {
      id,
      name,
      description,
      attributes: [],
      source: {
        jpg: 'empty_background.jpg',
      },
    };
    this.novel.backgrounds.push(background);
    return id;
  }
}
