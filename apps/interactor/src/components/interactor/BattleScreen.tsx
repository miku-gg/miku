import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../state/store';
import { useAppContext } from '../../App.context';
import { selectCurrentScene } from '../../state/selectors';
import { Modal, Button } from '@mikugg/ui-kit';
import ProgressiveImage from 'react-progressive-graceful-image';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import {
  interactionStart,
  clearCurrentBattle,
  addHealth,
  addMana,
  addBattleLog,
  moveNextTurn,
} from '../../state/slices/narrationSlice';
import './BattleScreen.scss';

const BattleScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assetLinkLoader, servicesEndpoint, apiEndpoint } = useAppContext();
  const currentScene = useAppSelector(selectCurrentScene);
  const currentBattle = useAppSelector((state) => state.narration.currentBattle);
  const battleLog = useAppSelector((state) => state.narration.currentBattle?.state.battleLog || []);
  const [pendingAbility, setPendingAbility] = useState<NovelV3.NovelRPGAbility | null>(null);
  const [victimId, setVictimId] = useState<string | null>(null);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const battles = useAppSelector((state) => state.novel.battles || []);
  const characters = useAppSelector((state) => state.novel.characters);
  const rpgConfig = useAppSelector((state) => state.novel.rpg);
  const songs = useAppSelector((state) => state.novel.songs);
  const [uiLogs, setUiLogs] = useState<{ id: string; actorName: string; abilityName: string; targetName: string }[]>(
    [],
  );
  const lastLogIndex = useRef(0);

  useEffect(() => {
    if (battleLog.length > lastLogIndex.current) {
      const entry = battleLog[battleLog.length - 1];
      const actorName = characters.find((c) => c.id === entry.actorId)?.name || entry.actorId;
      const abilityName = entry.actionType;
      const targetId = entry.targets[0];
      const targetName = characters.find((c) => c.id === targetId)?.name || targetId;
      const uiEntry = {
        id: `${entry.turn}-${entry.actorId}-${targetId}-${Date.now()}`,
        actorName,
        abilityName,
        targetName,
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
  }, [battleLog, characters]);

  if (!currentBattle) {
    return null;
  }

  const { state: battleState } = currentBattle;
  const { battleId, status, turn, activeHeroes, activeEnemies } = battleState;
  const isVictory = status === 'victory';
  const isDefeat = status === 'defeat';

  // Background
  const battleConfig = battles.find((b) => b.battleId === battleId);
  const bg = backgrounds.find((b) => b.id === battleConfig?.backgroundId);

  // Prepare party and enemies
  const party = activeHeroes.map((h) => {
    const heroRpg = rpgConfig?.heroes.find((hr) => hr.characterId === h.characterId);
    const heroDef = characters.find((c) => c.id === h.characterId);
    const outfitId = heroRpg?.battleOutfit ?? '';
    const outfit = heroDef?.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === outfitId);
    const img = outfit?.emotions.find((e) => e.id === 'neutral')?.sources.png || '';
    return {
      characterId: h.characterId,
      currentHealth: h.currentHealth,
      currentMana: h.currentMana,
      stats: heroRpg?.stats ?? { health: 0, mana: 0, attack: 0, intelligence: 0, defense: 0, magicDefense: 0 },
      battleOutfit: outfitId,
      img,
      profilePic: heroDef?.profile_pic || '',
      wear: heroRpg?.wear || [],
    };
  });
  const enemies = activeEnemies.map((e) => {
    const enemyRpg = rpgConfig?.enemies.find((er) => er.characterId === e.enemyId);
    const eneDef = characters.find((c) => c.id === e.enemyId);
    const outfitId = enemyRpg?.battleOutfit ?? '';
    const outfit = eneDef?.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === outfitId);
    const img = outfit?.emotions.find((em) => em.id === 'neutral')?.sources.png || '';
    return {
      enemyId: e.enemyId,
      position: e.position,
      currentHealth: e.currentHealth,
      currentMana: e.currentMana,
      stats: enemyRpg?.stats ?? { health: 0, mana: 0, attack: 0, intelligence: 0, defense: 0, magicDefense: 0 },
      battleOutfit: outfitId,
      img,
      name: eneDef?.name,
    };
  });

  // Determine current actor index
  const heroCount = party.length || 1;
  const currentHeroIdx = (turn - 1) % heroCount;

  const handleContinue = () => {
    const nextSceneId = isVictory ? battleConfig?.nextSceneIdWin : battleConfig?.nextSceneIdLoss;
    dispatch(clearCurrentBattle());
    dispatch(
      interactionStart({
        servicesEndpoint,
        apiEndpoint,
        sceneId: nextSceneId || currentScene?.id || '',
        isNewScene: !!nextSceneId,
        text: isVictory
          ? 'OOC: The battle was won. Please describe the aftermath.'
          : 'OOC: The battle was lost. Please describe the aftermath.',
        characters: party.map((h) => h.characterId),
        selectedCharacterId: party[currentHeroIdx]?.characterId || '',
      }),
    );
  };

  return (
    <div className="BattleScreen">
      {/* Play battle music */}
      {battleConfig?.music?.battleId && (
        <audio
          src={assetLinkLoader(
            songs.find((s) => s.id === battleConfig.music.battleId)?.source || '',
            AssetDisplayPrefix.MUSIC,
          )}
          autoPlay
          loop
        />
      )}
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
            <div key={h.characterId} className={`BattleScreen__battler ${h.characterId === victimId ? 'victim' : ''}`}>
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
          {enemies.map((e) => (
            <div key={e.enemyId} className={`BattleScreen__battler ${e.enemyId === victimId ? 'victim' : ''}`}>
              <EmotionRenderer
                className="BattleScreen__battler-emotion"
                assetLinkLoader={assetLinkLoader}
                assetUrl={e.img}
              />
              <div className="BattleScreen__bar hp" title={`HP: ${e.currentHealth}/${e.stats.health}`}>
                <div className="BattleScreen__fill" style={{ width: `${(e.currentHealth / e.stats.health) * 100}%` }} />
              </div>
              <div className="BattleScreen__bar mp" title={`MP: ${e.currentMana}/${e.stats.mana}`}>
                <div className="BattleScreen__fill" style={{ width: `${(e.currentMana / e.stats.mana) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Controls at bottom */}
      <div className="BattleScreen__controls">
        {/* Character avatars row */}
        <div className="BattleScreen__avatars-row">
          {party.map((h, idx) => (
            <img
              key={h.characterId}
              src={assetLinkLoader(h.profilePic, AssetDisplayPrefix.CHARACTER_PIC_SMALL)}
              alt={h.characterId}
              className={idx === currentHeroIdx ? 'selected' : 'faded'}
            />
          ))}
        </div>

        <div className="BattleScreen__controls-content">
          {/* First column: Character name and HP/MP bars */}
          <div className="BattleScreen__char-info">
            <h2>
              {characters.find((c) => c.id === party[currentHeroIdx]?.characterId)?.name ||
                party[currentHeroIdx]?.characterId}
            </h2>
            <div className="BattleScreen__status-bar hp">
              <div
                className="BattleScreen__status-fill"
                style={{
                  width: `${(party[currentHeroIdx].currentHealth / party[currentHeroIdx].stats.health) * 100}%`,
                }}
              ></div>
              <span>
                HP {party[currentHeroIdx].currentHealth}/{party[currentHeroIdx].stats.health}
              </span>
            </div>
            <div className="BattleScreen__status-bar mp">
              <div
                className="BattleScreen__status-fill"
                style={{ width: `${(party[currentHeroIdx].currentMana / party[currentHeroIdx].stats.mana) * 100}%` }}
              ></div>
              <span>
                MP {party[currentHeroIdx].currentMana}/{party[currentHeroIdx].stats.mana}
              </span>
            </div>
          </div>

          {/* Second column: Abilities list */}
          <div className="BattleScreen__abilities-list">
            {pendingAbility ? (
              <>
                <div className="BattleScreen__enemy-select-back" onClick={() => setPendingAbility(null)}>
                  Go Back
                </div>
                {pendingAbility.target === 'enemy'
                  ? activeEnemies
                      .filter((e) => e.currentHealth > 0)
                      .map((e) => (
                        <div
                          key={e.enemyId}
                          className="BattleScreen__enemy-select-row"
                          onClick={() => {
                            const heroId = party[currentHeroIdx].characterId;
                            const enemyId = e.enemyId;
                            // Flicker enemy before damage
                            setVictimId(enemyId);
                            dispatch(
                              addBattleLog({
                                turn,
                                actorId: heroId,
                                actionType: pendingAbility.name,
                                targets: [enemyId],
                                result: `${pendingAbility.damage} damage`,
                              }),
                            );
                            setTimeout(() => {
                              // Hero uses ability: spend mana, damage enemy, log, next turn
                              const ability = pendingAbility!;
                              dispatch(
                                addMana({
                                  targetId: heroId,
                                  amount: -ability.manaCost,
                                  maxValue: party[currentHeroIdx].stats.mana,
                                  isEnemy: false,
                                }),
                              );
                              // Compute enemy max health from RPG config
                              const enemyDef = rpgConfig?.enemies.find((er) => er.characterId === enemyId);
                              const enemyMaxHealth = enemyDef?.stats.health ?? 0;
                              dispatch(
                                addHealth({
                                  targetId: enemyId,
                                  amount: -ability.damage,
                                  maxValue: enemyMaxHealth,
                                  isEnemy: true,
                                }),
                              );
                              dispatch(moveNextTurn());
                              setPendingAbility(null);
                              setVictimId(null);
                              // Schedule enemy counterattack
                              const aliveHeroes = activeHeroes.filter((h) => h.currentHealth > 0);
                              if (aliveHeroes.length > 0) {
                                const targetHero =
                                  aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)].characterId;
                                setVictimId(targetHero);
                                const enemyStats = rpgConfig?.enemies.find((er) => er.characterId === enemyId)?.stats;
                                const damage = enemyStats?.attack || 0;
                                dispatch(
                                  addBattleLog({
                                    turn: battleState.turn,
                                    actorId: enemyId,
                                    actionType: 'Melee Attack',
                                    targets: [targetHero],
                                    result: `${damage} damage`,
                                  }),
                                );
                                setTimeout(() => {
                                  dispatch(
                                    addHealth({
                                      targetId: targetHero,
                                      amount: -damage,
                                      maxValue: party.find((h) => h.characterId === targetHero)!.stats.health,
                                      isEnemy: false,
                                    }),
                                  );
                                  dispatch(moveNextTurn());
                                  setVictimId(null);
                                }, 2000);
                              }
                            }, 2000);
                          }}
                        >
                          <span>{enemies.find((en) => en.enemyId === e.enemyId)?.name || e.enemyId}</span>
                          <span>HP: {e.currentHealth}</span>
                        </div>
                      ))
                  : party
                      .filter((h) => h.currentHealth > 0)
                      .map((h) => (
                        <div
                          key={h.characterId}
                          className="BattleScreen__enemy-select-row"
                          onClick={() => {
                            const heroId = party[currentHeroIdx].characterId;
                            const allyId = h.characterId;
                            // Flicker ally before heal
                            setVictimId(allyId);
                            setTimeout(() => {
                              const ability = pendingAbility!;
                              dispatch(
                                addHealth({
                                  targetId: allyId,
                                  amount: ability.damage,
                                  maxValue: party[currentHeroIdx].stats.health,
                                  isEnemy: false,
                                }),
                              );
                              dispatch(
                                addBattleLog({
                                  turn,
                                  actorId: heroId,
                                  actionType: ability.name,
                                  targets: [allyId],
                                  result: `Healed ${ability.damage}`,
                                }),
                              );
                              dispatch(moveNextTurn());
                              setPendingAbility(null);
                              setVictimId(null);
                              // Counterattack
                              const aliveHeroes = activeHeroes.filter((h) => h.currentHealth > 0);
                              if (aliveHeroes.length > 0) {
                                const targetHero =
                                  aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)].characterId;
                                const enemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
                                setVictimId(targetHero);
                                setTimeout(() => {
                                  const dmg =
                                    rpgConfig?.enemies.find((er) => er.characterId === enemy.enemyId)?.stats.attack ||
                                    0;
                                  dispatch(
                                    addHealth({
                                      targetId: targetHero,
                                      amount: -dmg,
                                      maxValue: party.find((h) => h.characterId === targetHero)!.stats.health,
                                      isEnemy: false,
                                    }),
                                  );
                                  dispatch(
                                    addBattleLog({
                                      turn: battleState.turn,
                                      actorId: enemy.enemyId,
                                      actionType: 'Melee Attack',
                                      targets: [targetHero],
                                      result: `${dmg} damage`,
                                    }),
                                  );
                                  dispatch(moveNextTurn());
                                  setVictimId(null);
                                }, 2000);
                              }
                            }, 2000);
                          }}
                        >
                          <span>{characters.find((c) => c.id === h.characterId)?.name || h.characterId}</span>
                          <span>HP: {h.currentHealth}</span>
                        </div>
                      ))}
              </>
            ) : (
              [
                {
                  abilityId: 'melee',
                  name: 'Melee Attack',
                  description: 'Basic melee attack',
                  manaCost: 0,
                  target: 'enemy',
                  damage: party[currentHeroIdx]?.stats.attack ?? 0,
                } as NovelV3.NovelRPGAbility,
              ]
                .concat(rpgConfig?.abilities || [])
                .map((ability, idx) => (
                  <div key={idx} className="BattleScreen__enemy-select-row" onClick={() => setPendingAbility(ability)}>
                    <span style={{ color: ability.target === 'ally' ? '#4af' : '#fff' }}>{ability.name}</span>
                    <span>{ability.manaCost}</span>
                  </div>
                ))
            )}
          </div>

          {/* Third column: Character stats and equipment */}
          <div className="BattleScreen__stats-list">
            <h3>Status</h3>
            <div className="BattleScreen__stat-row">
              <span className="BattleScreen__stat-label">Speed</span>
              <span className="BattleScreen__stat-value">{party[currentHeroIdx].stats.intelligence || 11}</span>
            </div>
            <div className="BattleScreen__stat-row">
              <span className="BattleScreen__stat-label">Strength</span>
              <span className="BattleScreen__stat-value">{party[currentHeroIdx].stats.attack || 14}</span>
            </div>
            <div className="BattleScreen__stat-row">
              <span className="BattleScreen__stat-label">Defense</span>
              <span className="BattleScreen__stat-value">{party[currentHeroIdx].stats.defense || 9}</span>
            </div>

            {party[currentHeroIdx].wear && party[currentHeroIdx].wear.length > 0 && (
              <>
                <h3 className="BattleScreen__equipment-title">Equipment</h3>
                <div className="BattleScreen__equipment-list">
                  {party[currentHeroIdx].wear.map((item: { wearableId: string }) => {
                    const wearable = rpgConfig?.wearables.find((w) => w.wearableId === item.wearableId);
                    return wearable ? (
                      <div key={item.wearableId} className="BattleScreen__equipment-item">
                        <span className="BattleScreen__equipment-name">{wearable.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Outcome modal */}
      {(isVictory || isDefeat) && (
        <Modal opened={true} shouldCloseOnOverlayClick={false}>
          <div className="BattleScreen__modal">
            <h2>{isVictory ? 'Victory!' : 'Defeat...'}</h2>
            <Button theme="primary" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </Modal>
      )}
      {/* Battle log messages */}
      <div className="BattleScreen__log-container">
        {uiLogs.map((log, index) => (
          <div key={log.id} className={`BattleScreen__log ${index === uiLogs.length - 1 ? 'new' : 'old'}`}>
            <span className="log-actor">{log.actorName}</span> used{' '}
            <span className="log-ability">{log.abilityName}</span> on{' '}
            <span className="log-target">{log.targetName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleScreen;
