import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../state/store';
import { useAppContext } from '../../App.context';
import { selectCurrentScene } from '../../state/selectors';
import { Modal, Button } from '@mikugg/ui-kit';
import ProgressiveImage from 'react-progressive-graceful-image';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import { interactionStart, clearCurrentBattle, battleMeleeAttack } from '../../state/slices/narrationSlice';
import './BattleScreen.scss';

const BattleScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { assetLinkLoader, servicesEndpoint, apiEndpoint } = useAppContext();
  const currentScene = useAppSelector(selectCurrentScene);
  const currentBattle = useAppSelector((state) => state.narration.currentBattle);
  const [isTargetSelectOpen, setIsTargetSelectOpen] = useState(false);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const battles = useAppSelector((state) => state.novel.battles || []);
  const characters = useAppSelector((state) => state.novel.characters);
  const rpgConfig = useAppSelector((state) => state.novel.rpg);
  const songs = useAppSelector((state) => state.novel.songs);

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
            <div key={h.characterId} className="BattleScreen__battler">
              <EmotionRenderer
                className="BattleScreen__battler-emotion"
                assetLinkLoader={assetLinkLoader}
                assetUrl={h.img}
              />
              <div className="BattleScreen__bar hp" title={`HP: ${h.currentHealth}/${h.stats.health}`} />
              <div className="BattleScreen__bar mp" title={`MP: ${h.currentMana}/${h.stats.mana}`} />
            </div>
          ))}
        </div>
        <div className="BattleScreen__enemy-group">
          {enemies.map((e) => (
            <div key={e.enemyId} className="BattleScreen__battler">
              <EmotionRenderer
                className="BattleScreen__battler-emotion"
                assetLinkLoader={assetLinkLoader}
                assetUrl={e.img}
              />
              <div className="BattleScreen__bar hp" title={`HP: ${e.currentHealth}/${e.stats.health}`} />
              <div className="BattleScreen__bar mp" title={`MP: ${e.currentMana}/${e.stats.mana}`} />
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
            <Button theme="primary" onClick={() => setIsTargetSelectOpen(true)}>
              Attack
            </Button>
            <Button
              theme="secondary"
              onClick={() => {
                if (party[currentHeroIdx].currentMana >= 2) {
                  // Here we would implement heal logic
                  // For now, just open target selection
                  setIsTargetSelectOpen(true);
                }
              }}
              disabled={party[currentHeroIdx].currentMana < 2}
            >
              Heal <span className="BattleScreen__ability-cost">2 MP</span>
            </Button>
            <Button
              theme="secondary"
              onClick={() => {
                if (party[currentHeroIdx].currentMana >= 3) {
                  // Here we would implement drain logic
                  // For now, just open target selection
                  setIsTargetSelectOpen(true);
                }
              }}
              disabled={party[currentHeroIdx].currentMana < 3}
            >
              Flare <span className="BattleScreen__ability-cost">3 MP</span>
            </Button>
            {/* Additional abilities can go here */}
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
      {/* Target selection modal */}
      <Modal
        opened={isTargetSelectOpen}
        shouldCloseOnOverlayClick={false}
        onCloseModal={() => setIsTargetSelectOpen(false)}
      >
        <div className="BattleScreen__modal">
          <h3>Select Target</h3>
          <div className="BattleScreen__target-list">
            {activeEnemies
              .filter((e) => e.currentHealth > 0)
              .map((e) => (
                <Button
                  key={e.enemyId}
                  theme="primary"
                  onClick={() => {
                    dispatch(battleMeleeAttack({ targetId: e.enemyId }));
                    setIsTargetSelectOpen(false);
                  }}
                >
                  <div className="BattleScreen__target-button-content">
                    <span>{enemies.find((en) => en.enemyId === e.enemyId)?.name || e.enemyId}</span>
                    <span className="BattleScreen__target-hp">
                      HP: {e.currentHealth}/
                      {rpgConfig?.enemies.find((en) => en.characterId === e.enemyId)?.stats.health || 100}
                    </span>
                  </div>
                </Button>
              ))}
          </div>
          <Button theme="secondary" onClick={() => setIsTargetSelectOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
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
    </div>
  );
};

export default BattleScreen;
