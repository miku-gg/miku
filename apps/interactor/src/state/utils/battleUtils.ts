import { NovelV3 } from '@mikugg/bot-utils';
import type { BattleState } from '../versioning/v3.state';

/**
 * Returns the initial BattleState for the given battle configuration and RPG config.
 */
export function getInitialBattleState(battleConfig: NovelV3.NovelBattle, rpgConfig: NovelV3.NovelRPG): BattleState {
  const activeHeroes = rpgConfig.heroes
    .filter((h) => h.isInParty)
    .map((h) => ({
      characterId: h.characterId,
      currentHealth: h.stats.health,
      currentMana: h.stats.mana,
    }));

  const activeEnemies = battleConfig.enemies.map((e, index) => {
    const enemyCfg = rpgConfig.enemies.find((en) => en.enemyId === e.enemyId);
    return {
      enemyId: e.enemyId,
      characterId: enemyCfg?.characterId,
      position: index,
      currentHealth: enemyCfg?.stats.health || 0,
      currentMana: enemyCfg?.stats.mana || 0,
    };
  });

  return {
    battleId: battleConfig.battleId,
    turn: 1,
    activeHeroes,
    activeEnemies,
    status: 'intro',
    battleLog: [],
  };
}
