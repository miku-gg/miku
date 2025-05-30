import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../state/store';
import { useAppContext } from '../../App.context';
import { selectCurrentScene } from '../../state/selectors';
import { Modal, Tooltip } from '@mikugg/ui-kit';
import ProgressiveImage from 'react-progressive-graceful-image';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import { GiSwordman, GiShield, GiSpellBook, GiMagicSwirl } from 'react-icons/gi';
import { BsDropletHalf } from 'react-icons/bs';
import {
  interactionStart,
  clearCurrentBattle,
  setCurrentBattle,
  addHealth,
  addMana,
  addBattleLog,
  moveNextTurn,
} from '../../state/slices/narrationSlice';
import './BattleScreen.scss';
import { novelActionToStateAction } from '../../state/mutations';

const ABILITY_ANIMATION_DURATION = 1000;

const playSoundEffect = (audio: 'button_hover' | 'attack_spell' | 'buff_spell' | 'win' | 'lose') => {
  const audioElement = new Audio(`/sound_effects/${audio}.mp3`);
  audioElement.currentTime = 0;
  audioElement.play().catch(() => {});
};

const BattleScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assetLinkLoader, servicesEndpoint, apiEndpoint } = useAppContext();
  const currentScene = useAppSelector(selectCurrentScene);
  const currentBattle = useAppSelector((state) => state.narration.currentBattle);
  const battleLog = useAppSelector((state) => state.narration.currentBattle?.state.battleLog || []);
  const [pendingAbility, setPendingAbility] = useState<NovelV3.NovelRPGAbility | null>(null);
  const [victimIds, setVictimIds] = useState<string[]>([]);
  const [controlsDisabled, setControlsDisabled] = useState(false);
  const [attackerId, setAttackerId] = useState<string | null>(null);
  const [healMode, setHealMode] = useState(false);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const battles = useAppSelector((state) => state.novel.battles || []);
  const characters = useAppSelector((state) => state.novel.characters);
  const rpgConfig = useAppSelector((state) => state.novel.rpg);
  const [uiLogs, setUiLogs] = useState<
    {
      id: string;
      actorName: string;
      abilityName: string;
      targetName: string;
      actorType: 'hero' | 'enemy';
      targetType: 'hero' | 'enemy';
    }[]
  >([]);
  const lastLogIndex = useRef(0);

  useEffect(() => {
    if (battleLog.length > lastLogIndex.current) {
      const entry = battleLog[battleLog.length - 1];
      const actorName =
        entry.actorType === 'enemy'
          ? characters.find((c) => c.id === rpgConfig?.enemies.find((er) => er.enemyId === entry.actorId)?.characterId)
              ?.name || entry.actorId
          : characters.find((c) => c.id === entry.actorId)?.name || entry.actorId;
      const abilityName = entry.actionType;
      const targetId = entry.targets[0];
      const targetName =
        entry.targetType === 'enemy'
          ? characters.find((c) => c.id === rpgConfig?.enemies.find((er) => er.enemyId === targetId)?.characterId)
              ?.name || targetId
          : characters.find((c) => c.id === targetId)?.name || targetId;
      const uiEntry = {
        id: `${entry.turn}-${entry.actorId}-${targetId}-${Date.now()}`,
        actorName,
        abilityName,
        targetName,
        actorType: entry.actorType,
        targetType: entry.targetType,
      };
      setUiLogs((logs) => {
        const next = logs.slice(-1).concat(uiEntry);
        return next;
      });
      lastLogIndex.current = battleLog.length;
      setTimeout(() => {
        setUiLogs((logs) => logs.filter((l) => l.id !== uiEntry.id));
      }, 3000);
    }
  }, [battleLog, characters, rpgConfig]);

  // Play win/lose sound when battle ends (hook called unconditionally)
  const isVictory = currentBattle?.state.status === 'victory';
  const isDefeat = currentBattle?.state.status === 'defeat';
  useEffect(() => {
    if (isVictory) playSoundEffect('win');
    if (isDefeat) playSoundEffect('lose');
  }, [isVictory, isDefeat]);

  if (!currentBattle) {
    return null;
  }

  const { state: battleState } = currentBattle;
  const { battleId, turn, activeHeroes, activeEnemies } = battleState;
  const battleConfig = battles.find((b) => b.battleId === battleId);

  // Background
  const bg = backgrounds.find((b) => b.id === battleConfig?.backgroundId);

  // Prepare party and enemies
  const party = activeHeroes.map((h) => {
    const heroRpg = rpgConfig?.heroes.find((hr) => hr.characterId === h.characterId);
    const heroDef = characters.find((c) => c.id === h.characterId);
    const outfitId = heroRpg?.battleOutfit ?? '';
    const outfit = heroDef?.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === outfitId);
    const img = outfit?.emotions.find((e) => e.id === 'neutral')?.sources.png || '';
    const wearableDefs =
      heroRpg && rpgConfig
        ? heroRpg.wear
            .map((item) => rpgConfig.wearables.find((w) => w.wearableId === item.wearableId))
            .filter((w): w is NovelV3.NovelRPG['wearables'][0] => !!w)
        : [];
    const statBonuses = wearableDefs.reduce(
      (acc, w) => {
        acc.attack += w.stats.attack;
        acc.defense += w.stats.defense;
        acc.intelligence += w.stats.intelligence;
        acc.magicDefense += w.stats.magicDefense;
        return acc;
      },
      { attack: 0, defense: 0, intelligence: 0, magicDefense: 0 },
    );
    const baseStats = heroRpg?.stats || { health: 0, mana: 0, attack: 0, intelligence: 0, defense: 0, magicDefense: 0 };
    const adjustedStats = {
      ...baseStats,
      attack: baseStats.attack + statBonuses.attack,
      intelligence: baseStats.intelligence + statBonuses.intelligence,
      defense: baseStats.defense + statBonuses.defense,
      magicDefense: baseStats.magicDefense + statBonuses.magicDefense,
    };
    return {
      characterId: h.characterId,
      currentHealth: h.currentHealth,
      currentMana: h.currentMana,
      stats: heroRpg?.stats ?? baseStats,
      wearables: wearableDefs,
      statBonuses,
      adjustedStats,
      battleOutfit: outfitId,
      img,
      profilePic: heroDef?.profile_pic || '',
      wear: heroRpg?.wear || [],
      abilities: ((heroRpg?.abilities || [])
        .map(({ abilityId }) => rpgConfig?.abilities?.find((a) => a.abilityId === abilityId))
        .filter((a) => a) || []) as NovelV3.NovelRPGAbility[],
    };
  });
  const enemies = activeEnemies.map((e) => {
    const enemyRpg = rpgConfig?.enemies.find((er) => er.enemyId === e.enemyId);
    const eneDef = characters.find((c) => c.id === enemyRpg?.characterId);
    const outfitId = enemyRpg?.battleOutfit ?? '';
    const outfit = eneDef?.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === outfitId);
    const img = outfit?.emotions.find((em) => em.id === 'neutral')?.sources.png || '';
    const enemyRefAbilities = enemyRpg?.abilities || [];
    const fullEnemyAbilities = enemyRefAbilities
      .map(({ abilityId }) => rpgConfig?.abilities?.find((a) => a.abilityId === abilityId))
      .filter((a): a is NovelV3.NovelRPGAbility => !!a);
    return {
      enemyId: e.enemyId,
      characterId: enemyRpg?.characterId,
      position: e.position,
      currentHealth: e.currentHealth,
      currentMana: e.currentMana,
      stats: enemyRpg?.stats ?? { health: 0, mana: 0, attack: 0, intelligence: 0, defense: 0, magicDefense: 0 },
      battleOutfit: outfitId,
      img,
      name: eneDef?.name,
      abilities: fullEnemyAbilities,
    };
  });

  // Determine current actor index (only alive heroes)
  const aliveParty = party.filter((h) => h.currentHealth > 0);
  const heroCount = aliveParty.length || 1;
  const currentAliveHeroIdx = (turn - 1) % heroCount;
  const currentHero = aliveParty[currentAliveHeroIdx];
  const currentHeroIdx = party.findIndex((h) => h.characterId === currentHero?.characterId);

  // Handler for retrying the battle if allowed
  const handleRetry = () => {
    if (battleConfig && rpgConfig) {
      const initialHeroes = rpgConfig.heroes
        .filter((h) => h.isInParty)
        .map((h) => ({ characterId: h.characterId, currentHealth: h.stats.health, currentMana: h.stats.mana }));
      const initialEnemies = battleConfig.enemies.map((e, idx) => {
        const enemyCfg = rpgConfig.enemies.find((en) => en.enemyId === e.enemyId);
        return {
          enemyId: e.enemyId,
          position: idx,
          currentHealth: enemyCfg?.stats.health || 0,
          currentMana: enemyCfg?.stats.mana || 0,
        };
      });
      const initialBattleState: NovelV3.BattleState = {
        battleId: battleConfig.battleId,
        turn: 1,
        activeHeroes: initialHeroes,
        activeEnemies: initialEnemies,
        status: 'intro',
        battleLog: [],
      };
      dispatch(setCurrentBattle({ state: initialBattleState, isActive: true }));
    }
  };

  const handleContinue = () => {
    const nextSceneId = isVictory ? battleConfig?.nextSceneIdWin : battleConfig?.nextSceneIdLoss;
    if (isVictory && battleConfig?.winActions) {
      battleConfig.winActions?.forEach((action) => {
        novelActionToStateAction(action).forEach((sa) => dispatch(sa));
      });
    }
    if (isDefeat && battleConfig?.lossActions) {
      battleConfig.lossActions?.forEach((action) => {
        novelActionToStateAction(action).forEach((sa) => dispatch(sa));
      });
    }
    if (isVictory && battleConfig?.winCutsceneId) {
      dispatch(setCurrentBattle({ state: { ...battleState, status: 'victory-cutscene' }, isActive: true }));
    } else if (isDefeat && battleConfig?.lossCutsceneId) {
      dispatch(setCurrentBattle({ state: { ...battleState, status: 'defeat-cutscene' }, isActive: true }));
    } else {
      dispatch(clearCurrentBattle());
    }
    dispatch(
      interactionStart({
        servicesEndpoint,
        apiEndpoint,
        sceneId: nextSceneId || currentScene?.id || '',
        isNewScene: !!nextSceneId,
        text: isVictory
          ? battleConfig?.winPromptMessage || 'OOC: The battle was won. Please describe the aftermath.'
          : battleConfig?.lossPromptMessage || 'OOC: The battle was lost. Please describe the aftermath.',
        characters: party.filter((h) => h.currentHealth > 0).map((h) => h.characterId),
        selectedCharacterId: party.find((h) => h.currentHealth > 0)?.characterId || party[0]?.characterId || '',
        afterBattle: {
          battleId: battleState.battleId,
          isWin: isVictory,
        },
      }),
    );
  };

  // Add utility for enemy turn with mana filtering
  const performEnemyTurn = () => {
    const aliveHeroesIds = activeHeroes.filter((h) => h.currentHealth > 0).map((h) => h.characterId);
    const aliveEnemiesList = enemies.filter((e) => e.currentHealth > 0);
    if (aliveEnemiesList.length === 0 || aliveHeroesIds.length === 0) {
      setControlsDisabled(false);
      return;
    }
    const selectedEnemy = aliveEnemiesList[Math.floor(Math.random() * aliveEnemiesList.length)];
    const defaultEnemyAbility: NovelV3.NovelRPGAbility = {
      abilityId: 'melee',
      name: 'Melee Attack',
      description: 'Basic melee attack',
      manaCost: 0,
      target: 'enemy',
      damage: 10,
      allFoes: false,
      type: 'physical',
    };
    const usableAbilities = [defaultEnemyAbility, ...selectedEnemy.abilities].filter(
      (ability) => ability.manaCost <= selectedEnemy.currentMana,
    );
    const abilityToUse = usableAbilities[Math.floor(Math.random() * usableAbilities.length)];
    // Handle all-target enemy abilities
    if (abilityToUse.allFoes) {
      setAttackerId(selectedEnemy.enemyId);
      playSoundEffect('attack_spell');
      // Spend mana for the enemy
      dispatch(
        addMana({
          targetId: selectedEnemy.enemyId,
          amount: -abilityToUse.manaCost,
          maxValue: selectedEnemy.stats.mana,
          isEnemy: true,
        }),
      );
      // Log attack on all heroes
      const targets = aliveHeroesIds;
      targets.forEach((targetHero) => {
        // Calculate damage for each hero using FF-style formula
        const defenderStats = party.find((h) => h.characterId === targetHero)?.adjustedStats || {
          attack: 0,
          intelligence: 0,
          defense: 0,
          magicDefense: 0,
        };

        let attackPower: number;
        let defensePower: number;

        if (abilityToUse.type === 'physical') {
          attackPower = selectedEnemy.stats.attack;
          defensePower = defenderStats.defense;
        } else {
          attackPower = selectedEnemy.stats.intelligence;
          defensePower = defenderStats.magicDefense;
        }

        const rawDamage = (abilityToUse.damage * attackPower) / Math.max(1, defensePower);
        const finalDamage = Math.max(1, Math.floor(rawDamage));

        dispatch(
          addBattleLog({
            turn: battleState.turn,
            actorId: selectedEnemy.enemyId,
            actionType: abilityToUse.name,
            targets: [targetHero],
            result: `${finalDamage} damage`,
            actorType: 'enemy',
            targetType: 'hero',
          }),
        );
      });
      // Set all heroes as victims for animation
      setVictimIds(targets);
      // Apply damage after animation
      setTimeout(() => {
        targets.forEach((targetHero) => {
          // Recalculate damage for application
          const defenderStats = party.find((h) => h.characterId === targetHero)?.adjustedStats || {
            attack: 0,
            intelligence: 0,
            defense: 0,
            magicDefense: 0,
          };

          let attackPower: number;
          let defensePower: number;

          if (abilityToUse.type === 'physical') {
            attackPower = selectedEnemy.stats.attack;
            defensePower = defenderStats.defense;
          } else {
            attackPower = selectedEnemy.stats.intelligence;
            defensePower = defenderStats.magicDefense;
          }

          const rawDamage = (abilityToUse.damage * attackPower) / Math.max(1, defensePower);
          const finalDamage = Math.max(1, Math.floor(rawDamage));

          dispatch(
            addHealth({
              targetId: targetHero,
              amount: -finalDamage,
              maxValue: party.find((h) => h.characterId === targetHero)!.stats.health,
              isEnemy: false,
            }),
          );
        });
        dispatch(moveNextTurn());
        setVictimIds([]);
        setAttackerId(null);
        setControlsDisabled(false);
      }, ABILITY_ANIMATION_DURATION);
      return;
    }
    const targetHero = aliveHeroesIds[Math.floor(Math.random() * aliveHeroesIds.length)];
    setAttackerId(selectedEnemy.enemyId);
    setVictimIds([targetHero]);
    playSoundEffect('attack_spell');

    // Calculate damage using FF-style formula
    const defenderStats = party.find((h) => h.characterId === targetHero)?.adjustedStats || {
      attack: 0,
      intelligence: 0,
      defense: 0,
      magicDefense: 0,
    };

    let attackPower: number;
    let defensePower: number;

    if (abilityToUse.type === 'physical') {
      attackPower = selectedEnemy.stats.attack;
      defensePower = defenderStats.defense;
    } else {
      attackPower = selectedEnemy.stats.intelligence;
      defensePower = defenderStats.magicDefense;
    }

    const rawDamage = (abilityToUse.damage * attackPower) / Math.max(1, defensePower);
    const finalDamage = Math.max(1, Math.floor(rawDamage));

    dispatch(
      addBattleLog({
        turn: battleState.turn,
        actorId: selectedEnemy.enemyId,
        actionType: abilityToUse.name,
        actorType: 'enemy',
        targetType: 'hero',
        targets: [targetHero],
        result: `${finalDamage} damage`,
      }),
    );
    dispatch(
      addMana({
        targetId: selectedEnemy.enemyId,
        amount: -abilityToUse.manaCost,
        maxValue: selectedEnemy.stats.mana,
        isEnemy: true,
      }),
    );
    setTimeout(() => {
      dispatch(
        addHealth({
          targetId: targetHero,
          amount: -finalDamage,
          maxValue: party.find((h) => h.characterId === targetHero)!.stats.health,
          isEnemy: false,
        }),
      );
      dispatch(moveNextTurn());
      setVictimIds([]);
      setAttackerId(null);
      setControlsDisabled(false);
    }, ABILITY_ANIMATION_DURATION);
  };

  // Unified attack function for player actions
  const performAttack = (playerId: string, targets: string[], abilityId: string) => {
    const currentActiveHero = party[currentHeroIdx];
    if (!currentActiveHero || currentActiveHero.currentHealth <= 0 || currentActiveHero.characterId !== playerId) {
      return;
    }

    // Find the ability being used
    const defaultAbility: NovelV3.NovelRPGAbility = {
      abilityId: 'melee',
      name: 'Melee Attack',
      description: 'Basic melee attack',
      manaCost: 0,
      target: 'enemy',
      damage: 10,
      allFoes: false,
      type: 'physical',
    };
    const allAbilities = [defaultAbility, ...currentActiveHero.abilities];
    const ability = allAbilities.find((a) => a.abilityId === abilityId);
    if (!ability) return;

    setControlsDisabled(true);

    // Set animation states
    if (ability.target === 'ally') {
      setAttackerId(playerId);
      setHealMode(true);
      playSoundEffect('buff_spell');
    } else {
      playSoundEffect('attack_spell');
    }

    // Set victims for animation
    setVictimIds(targets);

    // Spend mana
    dispatch(
      addMana({
        targetId: playerId,
        amount: -ability.manaCost,
        maxValue: currentActiveHero.stats.mana,
        isEnemy: false,
      }),
    );

    // Process each target
    targets.forEach((targetId) => {
      if (ability.target === 'enemy') {
        // Attack enemy with Final Fantasy-style damage calculation
        const heroStats = currentActiveHero.adjustedStats;
        const defenderStats = rpgConfig?.enemies.find((er) => er.enemyId === targetId)?.stats || {
          health: 0,
          mana: 0,
          attack: 0,
          intelligence: 0,
          defense: 0,
          magicDefense: 0,
        };

        // Final Fantasy-style damage calculation
        let attackPower: number;
        let defensePower: number;

        if (ability.type === 'physical') {
          attackPower = heroStats.attack;
          defensePower = defenderStats.defense;
        } else {
          attackPower = heroStats.intelligence;
          defensePower = defenderStats.magicDefense;
        }

        // FF-style formula: (Ability Base Damage * Attack Stat) / Defense Stat
        const rawDamage = (ability.damage * attackPower) / Math.max(1, defensePower);
        const finalDamage = Math.max(1, Math.floor(rawDamage)); // Minimum 1 damage

        dispatch(
          addBattleLog({
            turn: battleState.turn,
            actorId: playerId,
            actionType: ability.name,
            targets: [targetId],
            result: `${finalDamage} damage`,
            actorType: 'hero',
            targetType: 'enemy',
          }),
        );
      } else {
        // Heal ally - healing is based on intelligence regardless of ability type
        const heroStats = currentActiveHero.adjustedStats;
        const healAmount = Math.floor(ability.damage * (heroStats.intelligence / 10));

        dispatch(
          addBattleLog({
            turn: battleState.turn,
            actorId: playerId,
            actionType: ability.name,
            targets: [targetId],
            result: `Healed ${healAmount}`,
            actorType: 'hero',
            targetType: 'hero',
          }),
        );
      }
    });

    // Apply effects after animation
    setTimeout(() => {
      const damageList = targets.map((targetId) => {
        if (ability.target === 'enemy') {
          // Apply damage to enemy
          const enemyDef = rpgConfig?.enemies.find((er) => er.enemyId === targetId);
          const enemyMaxHealth = enemyDef?.stats.health ?? 0;
          const heroStats = currentActiveHero.adjustedStats;
          const defenderStats = enemyDef?.stats || {
            health: 0,
            mana: 0,
            attack: 0,
            intelligence: 0,
            defense: 0,
            magicDefense: 0,
          };

          // Final Fantasy-style damage calculation
          let attackPower: number;
          let defensePower: number;

          if (ability.type === 'physical') {
            attackPower = heroStats.attack;
            defensePower = defenderStats.defense;
          } else {
            attackPower = heroStats.intelligence;
            defensePower = defenderStats.magicDefense;
          }

          // FF-style formula: (Ability Base Damage * Attack Stat) / Defense Stat
          const rawDamage = (ability.damage * attackPower) / Math.max(1, defensePower);
          const finalDamage = Math.max(1, Math.floor(rawDamage)); // Minimum 1 damage

          dispatch(
            addHealth({
              targetId: targetId,
              amount: -finalDamage,
              maxValue: enemyMaxHealth,
              isEnemy: true,
            }),
          );
          return {
            targetId,
            damage: finalDamage,
          };
        } else {
          // Heal ally - healing is based on intelligence regardless of ability type
          const heroStats = currentActiveHero.adjustedStats;
          const healAmount = Math.floor(ability.damage * (heroStats.intelligence / 10));

          dispatch(
            addHealth({
              targetId: targetId,
              amount: healAmount,
              maxValue: party.find((h) => h.characterId === targetId)?.stats.health || 0,
              isEnemy: false,
            }),
          );
          return {
            targetId,
            damage: healAmount,
          };
        }
      });

      // Clear pending ability and animation states
      setPendingAbility(null);
      setVictimIds([]);
      setAttackerId(null);
      setHealMode(false);

      // Check if battle should continue
      const aliveHeroes = activeHeroes.filter((h) => h.currentHealth > 0);
      const aliveEnemies = activeEnemies.filter((e) => {
        const health = e.currentHealth;
        const damage = damageList.find((d) => d.targetId === e.enemyId)?.damage;
        return health - (damage ?? 0) > 0;
      });

      if (aliveEnemies.length > 0 && aliveHeroes.length > 0) {
        // Enemy turn will advance the turn
        performEnemyTurn();
      } else {
        // Battle ended, advance turn and re-enable controls
        dispatch(moveNextTurn());
        setControlsDisabled(false);
      }
    }, ABILITY_ANIMATION_DURATION);
  };

  // Handler for skipping hero turn
  const handleDoNothing = () => {
    setControlsDisabled(true);
    setPendingAbility(null);
    setVictimIds([]);
    setAttackerId(null);
    setHealMode(false);
    // Enemy turn will advance the turn (same as attack actions)
    performEnemyTurn();
  };

  return (
    <div className={`BattleScreen ${isVictory ? 'victory' : isDefeat ? 'defeat' : ''}`}>
      {/* Battle music via MusicPlayer */}
      {/* Background */}
      {bg && (
        <ProgressiveImage
          src={assetLinkLoader(bg.source.jpg, AssetDisplayPrefix.BACKGROUND_IMAGE)}
          placeholder={assetLinkLoader(bg.source.jpg, AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL)}
        >
          {(src) => <img className="BattleScreen__background" src={src} alt="battle background" />}
        </ProgressiveImage>
      )}
      {/* Battlefield layout */}
      <div className="BattleScreen__battlefield">
        <div className="BattleScreen__party-group">
          {party.map((h) => (
            <div
              key={h.characterId}
              className={`BattleScreen__battler ${h.characterId === attackerId ? 'attacking' : ''} ${
                victimIds.includes(h.characterId) ? (healMode ? 'heal-victim' : 'victim') : ''
              } ${h.currentHealth <= 0 ? 'dead' : ''}`}
            >
              <EmotionRenderer
                className="BattleScreen__battler-emotion"
                assetLinkLoader={assetLinkLoader}
                assetUrl={h.img}
              />
              <div className="BattleScreen__bar hp" title={`HP: ${h.currentHealth}/${h.stats.health}`}>
                <div className="BattleScreen__fill" style={{ width: `${(h.currentHealth / h.stats.health) * 100}%` }} />
              </div>
              <div className="BattleScreen__bar mp" title={`MP: ${h.currentMana}/${h.stats.mana}`}>
                <div className="BattleScreen__fill" style={{ width: `${(h.currentMana / h.stats.mana) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="BattleScreen__enemy-group">
          {enemies
            .filter((e) => e.currentHealth > 0)
            .map((e) => (
              <div
                key={e.enemyId}
                className={`BattleScreen__battler ${e.enemyId === attackerId ? 'attacking' : ''} ${
                  victimIds.includes(e.enemyId) ? (healMode ? 'heal-victim' : 'victim') : ''
                }`}
              >
                <EmotionRenderer
                  className="BattleScreen__battler-emotion"
                  assetLinkLoader={assetLinkLoader}
                  assetUrl={e.img}
                />
                <div className="BattleScreen__bar hp" title={`HP: ${e.currentHealth}/${e.stats.health}`}>
                  <div
                    className="BattleScreen__fill"
                    style={{ width: `${(e.currentHealth / e.stats.health) * 100}%` }}
                  />
                </div>
                <div className="BattleScreen__bar mp" title={`MP: ${e.currentMana}/${e.stats.mana}`}>
                  <div className="BattleScreen__fill" style={{ width: `${(e.currentMana / e.stats.mana) * 100}%` }} />
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* Controls at bottom */}
      <div className={`BattleScreen__controls ${controlsDisabled ? 'disabled' : ''}`}>
        <div className="BattleScreen__controls-player">
          <div className="BattleScreen__party-list">
            {party.map((h, idx) => (
              <div
                key={h.characterId}
                className={`BattleScreen__party-member ${idx === currentHeroIdx ? 'active' : ''} ${
                  h.currentHealth <= 0 ? 'dead' : ''
                }`}
              >
                <img
                  src={assetLinkLoader(h.profilePic, AssetDisplayPrefix.CHARACTER_PIC_SMALL)}
                  alt={h.characterId}
                  className="BattleScreen__party-member-image"
                />
                <div className="BattleScreen__party-member-info">
                  <div className="BattleScreen__party-member-name">
                    {characters.find((c) => c.id === h.characterId)?.name || h.characterId}
                  </div>
                  <div className="BattleScreen__party-member-bars">
                    <div className="BattleScreen__party-member-bar hp">
                      <div
                        className="BattleScreen__party-member-fill"
                        style={{ width: `${(h.currentHealth / h.stats.health) * 100}%` }}
                      ></div>
                      <span>
                        HP {h.currentHealth}/{h.stats.health}
                      </span>
                    </div>
                    <div className="BattleScreen__party-member-bar mp">
                      <div
                        className="BattleScreen__party-member-fill"
                        style={{ width: `${(h.currentMana / h.stats.mana) * 100}%` }}
                      ></div>
                      <span>
                        MP {h.currentMana}/{h.stats.mana}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="BattleScreen__hero-actions">
            <div className="BattleScreen__stats-panel">
              <div className="BattleScreen__stat-row">
                <span
                  className="BattleScreen__stat-icon"
                  data-tooltip-id={`stat-label-tooltip`}
                  data-tooltip-html={`Attack`}
                  data-tooltip-varaint="light"
                >
                  <GiSwordman />
                </span>
                <span className="BattleScreen__stat-value">{party[currentHeroIdx]?.adjustedStats.attack || 0}</span>
                {party[currentHeroIdx]?.statBonuses.attack > 0 && (
                  <span className="BattleScreen__stat-bonus">+{party[currentHeroIdx].statBonuses.attack}</span>
                )}
              </div>

              <div className="BattleScreen__stat-row">
                <span
                  className="BattleScreen__stat-icon"
                  data-tooltip-id={`stat-label-tooltip`}
                  data-tooltip-html={`Defense`}
                  data-tooltip-varaint="light"
                >
                  <GiShield />
                </span>
                <span className="BattleScreen__stat-value">{party[currentHeroIdx]?.adjustedStats.defense || 0}</span>
                {party[currentHeroIdx]?.statBonuses.defense > 0 && (
                  <span className="BattleScreen__stat-bonus">+{party[currentHeroIdx].statBonuses.defense}</span>
                )}
              </div>

              <div className="BattleScreen__stat-row">
                <span
                  className="BattleScreen__stat-icon"
                  data-tooltip-id={`stat-label-tooltip`}
                  data-tooltip-html={`Magic`}
                  data-tooltip-varaint="light"
                >
                  <GiSpellBook />
                </span>
                <span className="BattleScreen__stat-value">
                  {party[currentHeroIdx]?.adjustedStats.intelligence || 0}
                </span>
                {party[currentHeroIdx]?.statBonuses.intelligence > 0 && (
                  <span className="BattleScreen__stat-bonus">+{party[currentHeroIdx].statBonuses.intelligence}</span>
                )}
              </div>
              <div className="BattleScreen__stat-row">
                <span
                  className="BattleScreen__stat-icon"
                  data-tooltip-id={`stat-label-tooltip`}
                  data-tooltip-html={`Magic Defense`}
                  data-tooltip-varaint="light"
                >
                  <GiMagicSwirl />
                </span>
                <span className="BattleScreen__stat-value">
                  {party[currentHeroIdx]?.adjustedStats.magicDefense || 0}
                </span>
                {party[currentHeroIdx]?.statBonuses.magicDefense > 0 && (
                  <span className="BattleScreen__stat-bonus">+{party[currentHeroIdx].statBonuses.magicDefense}</span>
                )}
              </div>
              <Tooltip id="stat-label-tooltip" place="top" />
            </div>
            <div className="BattleScreen__abilities-panel scrollbar">
              {!party[currentHeroIdx] || party[currentHeroIdx].currentHealth <= 0 ? (
                <div style={{ textAlign: 'center', color: '#ccc', padding: '20px' }}>No active hero available</div>
              ) : pendingAbility ? (
                <>
                  <div
                    className="BattleScreen__enemy-select-back"
                    onClick={() => setPendingAbility(null)}
                    onMouseEnter={() => playSoundEffect('button_hover')}
                  >
                    Go Back
                  </div>
                  {pendingAbility.allFoes && pendingAbility.target === 'enemy' && (
                    <div
                      key="everyone"
                      className="BattleScreen__ability-row target"
                      onMouseEnter={() => playSoundEffect('button_hover')}
                      onClick={() => {
                        // Attack all enemies
                        const currentActiveHero = party[currentHeroIdx];
                        if (!currentActiveHero || currentActiveHero.currentHealth <= 0) return;

                        const targets = activeEnemies.filter((e) => e.currentHealth > 0).map((e) => e.enemyId);
                        performAttack(currentActiveHero.characterId, targets, pendingAbility!.abilityId);
                      }}
                    >
                      <span className="target-name">Everyone</span>
                    </div>
                  )}
                  {pendingAbility.allFoes && pendingAbility.target === 'ally' && (
                    <div
                      key="everyone"
                      className="BattleScreen__ability-row target"
                      onMouseEnter={() => playSoundEffect('button_hover')}
                      onClick={() => {
                        // Heal all allies
                        const currentActiveHero = party[currentHeroIdx];
                        if (!currentActiveHero || currentActiveHero.currentHealth <= 0) return;

                        const targets = party.filter((h) => h.currentHealth > 0).map((h) => h.characterId);
                        performAttack(currentActiveHero.characterId, targets, pendingAbility!.abilityId);
                      }}
                    >
                      <span className="target-name">Everyone</span>
                    </div>
                  )}
                  {!pendingAbility.allFoes && (
                    <>
                      {pendingAbility.target === 'enemy'
                        ? activeEnemies
                            .filter((e) => e.currentHealth > 0)
                            .map((e) => (
                              <div
                                key={e.enemyId}
                                className="BattleScreen__ability-row target"
                                onMouseEnter={() => playSoundEffect('button_hover')}
                                onClick={() => {
                                  // Attack single enemy
                                  const currentActiveHero = party[currentHeroIdx];
                                  if (!currentActiveHero || currentActiveHero.currentHealth <= 0) return;

                                  performAttack(currentActiveHero.characterId, [e.enemyId], pendingAbility!.abilityId);
                                }}
                              >
                                <span className="target-name">
                                  {enemies.find((en) => en.enemyId === e.enemyId)?.name || e.enemyId}
                                </span>
                                <span className="target-health">HP: {e.currentHealth}</span>
                              </div>
                            ))
                        : party
                            .filter((h) => h.currentHealth > 0)
                            .map((h) => (
                              <div
                                key={h.characterId}
                                className="BattleScreen__ability-row target"
                                onMouseEnter={() => playSoundEffect('button_hover')}
                                onClick={() => {
                                  // Heal single ally
                                  const currentActiveHero = party[currentHeroIdx];
                                  if (!currentActiveHero || currentActiveHero.currentHealth <= 0) return;

                                  performAttack(
                                    currentActiveHero.characterId,
                                    [h.characterId],
                                    pendingAbility!.abilityId,
                                  );
                                }}
                              >
                                <span className="target-name">
                                  {characters.find((c) => c.id === h.characterId)?.name || h.characterId}
                                </span>
                                <span className="target-health">HP: {h.currentHealth}</span>
                              </div>
                            ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  {[
                    {
                      abilityId: 'melee',
                      name: 'Melee Attack',
                      description: 'Basic melee attack',
                      manaCost: 0,
                      target: 'enemy',
                      damage: 5,
                      allFoes: false,
                      type: 'physical',
                    } as NovelV3.NovelRPGAbility,
                  ]
                    .concat(party[currentHeroIdx]?.abilities || [])
                    .map((ability, idx) => {
                      const disabled = ability.manaCost > (party[currentHeroIdx]?.currentMana ?? 0);
                      return (
                        <div
                          key={idx}
                          className={`BattleScreen__ability-row ${disabled ? 'disabled' : ''}`}
                          onClick={() => {
                            if (!disabled) setPendingAbility(ability);
                          }}
                          onMouseEnter={() => {
                            if (!disabled) playSoundEffect('button_hover');
                          }}
                        >
                          <span className={`ability-name ${ability.target === 'ally' ? 'heal' : 'attack'}`}>
                            {ability.name}
                          </span>
                          <div className="ability-details">
                            <span className="ability-description">{ability.description}</span>
                            <span className="ability-cost">
                              <BsDropletHalf />
                              {ability.manaCost}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  <div
                    key="do-nothing"
                    className="BattleScreen__ability-row do-nothing"
                    onClick={handleDoNothing}
                    onMouseEnter={() => playSoundEffect('button_hover')}
                  >
                    <span className="ability-name">Do Nothing</span>
                    <div className="ability-details">
                      <span className="ability-description">Skip your turn</span>
                      <span className="ability-cost">
                        <BsDropletHalf />0
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="BattleScreen__enemy-panel scrollbar">
          <h3>Enemies</h3>
          {enemies
            .filter((e) => e.currentHealth > 0)
            .map((e) => (
              <div key={e.enemyId} className="BattleScreen__enemy-row">
                <div className="BattleScreen__enemy-info">
                  <div className="BattleScreen__enemy-name">{e.name || e.enemyId}</div>
                  <div className="BattleScreen__enemy-health-bar">
                    <div
                      className="BattleScreen__enemy-health-fill"
                      style={{ width: `${(e.currentHealth / e.stats.health) * 100}%` }}
                    ></div>
                    <span>
                      {e.currentHealth}/{e.stats.health}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* Outcome modal */}
      {(isVictory || isDefeat) && (
        <Modal opened={true} shouldCloseOnOverlayClick={false} className="BattleScreen__finish-modal">
          <div className="BattleScreen__modal">
            <h2 className={isVictory ? 'victory-text' : 'defeat-text'}>{isVictory ? 'Victory!' : 'Defeat...'}</h2>
            <div className="BattleScreen__modal-buttons">
              {battleConfig?.allowRetry && isDefeat && (
                <button onClick={handleRetry} className="BattleScreen__retry-button">
                  Retry
                </button>
              )}
              <button onClick={handleContinue} className="BattleScreen__continue-button">
                Continue
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Battle log messages */}
      <div className="BattleScreen__log-container">
        {uiLogs.map((log, index) => {
          const selfUse = log.targetName === log.actorName;
          return (
            <div key={log.id} className={`BattleScreen__log ${index === uiLogs.length - 1 ? 'new' : 'old'}`}>
              <span className={`log-actor ${log.actorType === 'hero' ? 'hero' : 'enemy'}`}>{log.actorName}</span> used{' '}
              <span className={`log-ability ${log.actorType === log.targetType ? 'heal' : ''}`}>{log.abilityName}</span>{' '}
              {selfUse ? '' : 'on '}
              <span className={`log-target ${log.targetType === 'hero' ? 'hero' : 'enemy'}`}>
                {selfUse ? '' : log.targetName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BattleScreen;
