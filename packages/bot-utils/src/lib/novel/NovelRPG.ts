import { NovelAction } from './NovelV3';

export interface NovelRPGAbility {
  abilityId: string;
  name: string;
  description: string;
  manaCost: number;
  target: 'enemy' | 'ally';
  damage: number;
  allFoes: boolean;
  type: 'physical' | 'magical';
}
export interface NovelRPG {
  heroes: {
    /** Unique identifier for the character */
    characterId: string;
    /** Description or identifier of the character's battle outfit */
    battleOutfit: string;
    stats: {
      /** Current health points of the character */
      health: number;
      /** Current mana points for casting abilities */
      mana: number;
      /** Physical attack power */
      attack: number;
      /** Magic power and skill effectiveness */
      intelligence: number;
      /** Physical damage reduction */
      defense: number;
      /** Magical damage reduction */
      magicDefense: number;
    };
    /** Array of equipment currently worn by the character */
    wear: {
      /** Unique identifier for the wearable item */
      wearableId: string;
    }[];
    /** Indicates if the character can be selected for battles */
    isAvailable: boolean;
    /** Indicates if the character is currently in the active party */
    isInParty: boolean;
    abilities: {
      abilityId: string;
    }[];
  }[];

  /** List of enemies that can appear in battles */
  enemies: {
    /** Unique identifier for the enemy */
    enemyId: string;
    /** Charater to use */
    characterId: string;
    /** Description or identifier of the enemy's battle outfit */
    battleOutfit: string;
    /** Name of the enemy */
    stats: {
      /** Current health points of the enemy */
      health: number;
      /** Current mana points for casting abilities */
      mana: number;
      /** Physical attack power */
      attack: number;
      /** Magic power and skill effectiveness */
      intelligence: number;
      /** Physical damage reduction */
      defense: number;
      /** Magical damage reduction */
      magicDefense: number;
    };
    /** Special abilities or attacks this enemy can use */
    abilities: {
      abilityId: string;
    }[];
    /** Difficulty multiplier of the enemy */
    difficultyMultiplier: number;
  }[];

  /** List of wearable items that can be equipped by heroes */
  wearables: {
    /** Unique identifier for the wearable item */
    wearableId: string;
    /** Name of the wearable item */
    name: string;
    /** Description of the wearable item */
    description: string;
    /** Stats granted by the wearable item */
    stats: {
      /** Physical attack power */
      attack: number;
      /** Magic power and skill effectiveness */
      intelligence: number;
      /** Physical damage reduction */
      defense: number;
      /** Magical damage reduction */
      magicDefense: number;
    };
    /** Slot where the wearable item can be equipped */
    slot: WearableSlot;
  }[];

  abilities?: NovelRPGAbility[];
}

export type WearableSlot = 'head' | 'body' | 'hands' | 'feet' | 'accessory';

export interface BattleState {
  /** Unique identifier for the battle */
  battleId: string;
  /** Current turn number */
  turn: number;
  /** List of heroes participating in the battle */
  activeHeroes: {
    characterId: string;
    /** Current HP */
    currentHealth: number;
    /** Current MP */
    currentMana: number;
  }[];
  /** List of enemies in the current battle */
  activeEnemies: {
    enemyId: string;
    /** Position in the battle (front line, back line, etc.) */
    position: number;
    /** Current HP */
    currentHealth: number;
    /** Current MP */
    currentMana: number;
  }[];
  /** Battle status (active, completed, failed, dialogue) */
  status: 'active' | 'victory' | 'defeat' | 'intro' | 'victory-cutscene' | 'defeat-cutscene';
  /** Log of actions taken during the battle */
  battleLog: {
    /** Turn when the action occurred */
    turn: number;
    /** ID of the actor who performed the action */
    actorId: string;
    /** Type of action (attack, skill, item, etc.) */
    actionType: string;
    /** Target(s) of the action */
    targets: string[];
    /** Result of the action (damage dealt, effects applied, etc.) */
    result: string;
    /** Type of target (hero, enemy) */
    actorType: 'hero' | 'enemy';
    /** Type of target (hero, enemy) */
    targetType: 'hero' | 'enemy';
  }[];
}

export interface NovelBattle {
  /** Unique identifier for the battle configuration */
  battleId: string;

  /** Background image or scene to be displayed during battle */
  backgroundId: string;

  /** Background music to be played during battle */
  music: {
    /** Music track ID for the main battle theme */
    battleId: string;
  };

  /** Prompt to be used for the battle */
  prompt: string;

  /** Enemy configuration for this battle */
  enemies: {
    /** ID of the enemy from NovelRPG.enemies */
    enemyId: string;
  }[];

  /** Next scene ID to be shown after defeating all enemies */
  nextSceneIdWin?: string;

  /** Next scene ID to be shown after losing all heroes */
  nextSceneIdLoss?: string;

  /** Actions to be performed after winning the battle */
  winActions?: NovelAction[];

  /** Actions to be performed after losing the battle */
  lossActions?: NovelAction[];

  /** Prompt to be used when changing to the win scene (instead of the default scene prompt) */
  winPromptMessage?: string;

  /** Prompt to be used when changing to the loss scene (instead of the default scene prompt) */
  lossPromptMessage?: string;

  /** Allow the player to retry the battle */
  allowRetry: boolean;

  /** cutscene to play before the battle starts */
  introCutsceneId?: string;

  /** cutscene to play when the player wins the battle */
  winCutsceneId?: string;

  /** cutscene to play when the player loses the battle */
  lossCutsceneId?: string;
}
