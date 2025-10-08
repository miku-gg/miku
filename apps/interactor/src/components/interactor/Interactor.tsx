import { AreYouSure } from '@mikugg/ui-kit';
import classNames from 'classnames';
import ProgressiveImage from 'react-progressive-graceful-image';
import { useAppContext } from '../../App.context';
import {
  selectCurrentScene,
  selectLastLoadedCharacters,
  selectLastSelectedCharacter,
  selectDisplayingCutScene,
  selectShouldPlayGlobalStartCutscene,
} from '../../state/selectors';
import { useAppDispatch, useAppSelector } from '../../state/store';
import ChatBox from '../chat-box/ChatBox';
import RegenerateEmotionModal from '../chat-box/RegenerateEmotionModal';
import DebugModal from './DebugModal';
import ModelSelectorModal from './ModelSelectorModal';
import './Interactor.scss';
import InteractorHeader from './InteractorHeader';
import Inventory from './Inventory';
import SceneSuggestion from './SceneSuggestion';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import InnerThoughtsTrigger from '../inner-thoughts/InnerThoughtsTrigger';
import InnerThoughtsModal from '../inner-thoughts/InnerThoughtsModal';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { CutsceneDisplayer } from './CutsceneDisplayer';
import { useFullscreenEmotions } from '../fullscreen-emotions/useFullscreenEmotions';
import {
  markCurrentCutsceneAsSeen,
  setHasPlayedGlobalStartCutscene,
  startBattle,
  clearCurrentBattle,
} from '../../state/slices/narrationSlice';
import IndicatorsDisplay from '../indicators-display/IndicatorsDisplay';
import StartSelector from '../start-selector/StartSelector';
import BattleScreen from './BattleScreen';

const Interactor = () => {
  const { assetLinkLoader, isMobileApp } = useAppContext();
  const dispatch = useAppDispatch();
  const scene = useAppSelector(selectCurrentScene);
  const currentBattle = useAppSelector((state) => state.narration.currentBattle);
  const lastCharacters = useAppSelector(selectLastLoadedCharacters);
  const displayCharacter = useAppSelector(selectLastSelectedCharacter);
  const { fullscreenCharacter } = useFullscreenEmotions();
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const displayingCutscene = useAppSelector(selectDisplayingCutScene);
  const shouldPlayGlobalCutscene = useAppSelector(selectShouldPlayGlobalStartCutscene);
  const battles = useAppSelector((state) => state.novel.battles);
  const novelCharacters = useAppSelector((state) => state.novel.characters);

  if (!scene) {
    return null;
  }
  const background = backgrounds.find((b) => b.id === scene.backgroundId);
  const selectedCharacterId = displayCharacter ? displayCharacter.id : lastCharacters[0].id;
  let orderedCharacters = lastCharacters.filter((c) => c.image);
  orderedCharacters =
    displayCharacter && !orderedCharacters.some((c) => c.id === displayCharacter.id)
      ? [...orderedCharacters, displayCharacter]
      : orderedCharacters;
  orderedCharacters =
    isMobileApp || window.innerWidth < 600
      ? reorderCharactersForCenterDisplay(orderedCharacters, displayCharacter?.id, 3)
      : orderedCharacters;

  function getDesktopCharaTransform(index: number): string {
    let total: number = orderedCharacters.length;
    if (total === 0) return '';

    const totalSpaceWidth = 800;
    const centralGap = 400;
    const backgroundZ = -10;
    const backgroundScale = 0.75;

    const selectedIndex = selectedCharacterId ? orderedCharacters.findIndex((c) => c.id === selectedCharacterId) : -1;

    if (index === selectedIndex) {
      return `
        translateX(0px)
        translateX(-50%)
        translateZ(0px)
        scale(1)
      `;
    }

    if (selectedIndex < 0) total += 1;

    if (total === 1) return '';

    const leftStart = -totalSpaceWidth / 2;
    const leftEnd = -centralGap / 2;
    const rightStart = centralGap / 2;
    const rightEnd = totalSpaceWidth / 2;

    const leftCount = Math.ceil(total / 2);
    const rightCount = Math.floor(total / 2);

    let x = 0;

    if (index < leftCount) {
      if (leftCount === 1) {
        x = (leftStart + leftEnd) / 2;
      } else {
        const step = (leftEnd - leftStart) / (leftCount - 1);
        x = leftStart + step * index;
      }
    } else {
      if (rightCount === 1) {
        x = (rightStart + rightEnd) / 2;
      } else {
        const step = (rightEnd - rightStart) / (rightCount - 1);
        const rightIndex = index - leftCount;
        x = rightStart + step * rightIndex;
      }
    }

    return `
      translateX(${x}px)
      translateX(-50%)
      translateZ(${backgroundZ}px)
      scale(${backgroundScale})
    `;
  }

  function getMobileCharaTransform(index: number): string {
    const offsetX = 160;
    const backgroundZ = -10;
    const backgroundScale = 0.75;

    const selectedIndex = selectedCharacterId ? orderedCharacters.findIndex((c) => c.id === selectedCharacterId) : -1;

    if (selectedIndex < 0 || index === selectedIndex) {
      return `
        translateX(0px)
        translateX(-50%)
        translateZ(0px)
        scale(1)
      `;
    }

    const offsetFromSelected = index - selectedIndex;
    const x = offsetFromSelected * offsetX;

    return `
      translateX(${x}px)
      translateX(-50%)
      translateZ(${backgroundZ}px)
      scale(${backgroundScale})
    `;
  }

  function reorderCharactersForCenterDisplay<T extends { id: string }>(
    characters: T[],
    selectedId: string,
    maxCharacters?: number,
  ): T[] {
    const selectedIndex = characters.findIndex((c) => c.id === selectedId);
    if (selectedIndex === -1) return characters;

    const total = characters.length;

    const offset = Math.floor(total / 2);
    const rotated = [...characters.slice(selectedIndex + 1), ...characters.slice(0, selectedIndex)];

    let before = rotated.slice(-offset);
    let after = rotated.slice(0, total - 1 - offset);

    if (typeof maxCharacters === 'number' && maxCharacters > 1) {
      const sideCount = Math.floor((maxCharacters - 1) / 2);
      before = before.slice(-sideCount);
      after = after.slice(0, sideCount);
    }

    return [...before, characters[selectedIndex], ...after];
  }

  return (
    <AreYouSure.AreYouSureProvider>
      <div
        className={classNames('Interactor', {
          'Interactor--battle': currentBattle?.isActive,
          'Interactor--cutscene': displayingCutscene,
        })}
      >
        <InteractorHeader />
        {displayingCutscene ? (
          <div className="Interactor__cutscene">
            <CutsceneDisplayer
              onEndDisplay={() => {
                const battleConfig = currentBattle
                  ? battles?.find((b) => b.battleId === currentBattle.state.battleId)
                  : undefined;
                if (currentBattle?.state.status === 'intro') {
                  dispatch(startBattle());
                } else if (currentBattle?.state.status === 'victory-cutscene' && battleConfig?.winCutsceneId) {
                  dispatch(clearCurrentBattle());
                } else if (currentBattle?.state.status === 'defeat-cutscene' && battleConfig?.lossCutsceneId) {
                  dispatch(clearCurrentBattle());
                } else if (shouldPlayGlobalCutscene) {
                  dispatch(setHasPlayedGlobalStartCutscene(true));
                } else {
                  dispatch(markCurrentCutsceneAsSeen());
                }
              }}
            />
          </div>
        ) : currentBattle?.isActive ? (
          <div className="Interactor__battle-screen">
            <BattleScreen />
          </div>
        ) : (
          <>
            <StartSelector />
            <div className="Interactor__content">
              <IndicatorsDisplay />
              <SceneSuggestion />
              <div className="Interactor__main-image-container">
                <ProgressiveImage
                  src={
                    fullscreenCharacter
                      ? assetLinkLoader(fullscreenCharacter.image, AssetDisplayPrefix.BACKGROUND_IMAGE)
                      : background
                      ? assetLinkLoader(
                          (isMobileApp || window.innerWidth < 600) && background.source.mp4Mobile
                            ? background.source.mp4Mobile
                            : background.source.mp4 || background.source.jpg,
                          (isMobileApp || window.innerWidth < 600) && background.source.mp4Mobile
                            ? AssetDisplayPrefix.BACKGROUND_VIDEO
                            : background.source.mp4
                            ? AssetDisplayPrefix.BACKGROUND_VIDEO
                            : AssetDisplayPrefix.BACKGROUND_IMAGE,
                        )
                      : ''
                  }
                  placeholder={
                    background ? assetLinkLoader(background.source.jpg, AssetDisplayPrefix.BACKGROUND_IMAGE_SMALL) : ''
                  }
                >
                  {(src) =>
                    fullscreenCharacter ? (
                      <img
                        className="Interactor__background-image"
                        src={`${src}`}
                        alt="fullscreen emotion"
                        onError={({ currentTarget }) => {
                          if (currentTarget.src !== '/images/default_background.png') {
                            currentTarget.onerror = null;
                            currentTarget.src = '/images/default_background.png';
                          }
                        }}
                      />
                    ) : (isMobileApp || window.innerWidth < 600) && background?.source.mp4Mobile ? (
                      <video className="Interactor__background-mobileVideo" loop autoPlay muted>
                        <source
                          src={assetLinkLoader(background.source.mp4Mobile, AssetDisplayPrefix.BACKGROUND_IMAGE)}
                        ></source>
                      </video>
                    ) : background?.source.mp4 ? (
                      <video className="Interactor__background-video" loop autoPlay muted>
                        <source
                          src={assetLinkLoader(background.source.mp4, AssetDisplayPrefix.BACKGROUND_VIDEO)}
                        ></source>
                      </video>
                    ) : (
                      <img
                        className="Interactor__background-image"
                        src={`${src}`}
                        alt="background"
                        onError={({ currentTarget }) => {
                          if (currentTarget.src !== '/images/default_background.png') {
                            currentTarget.onerror = null;
                            currentTarget.src = '/images/default_background.png';
                          }
                        }}
                      />
                    )
                  }
                </ProgressiveImage>
                <div className="Interactor__characters">
                  {/* Character emotions with inner thoughts triggers */}
                  {!fullscreenCharacter &&
                    orderedCharacters.map(({ id, image }, index) => {
                      if (!image || displayingCutscene) {
                        return null;
                      }
                      const character = novelCharacters.find((c) => c.id === id);
                      if (!character) return null;

                      const isSelected = displayCharacter?.id === id;

                      return (
                        <div
                          key={`character-container-${id}`}
                          className={classNames('Interactor__character-container', { selected: isSelected })}
                          style={{
                            transform:
                              isMobileApp || window.innerWidth < 600
                                ? getMobileCharaTransform(index)
                                : getDesktopCharaTransform(index),
                            zIndex: isSelected ? 1 : 0,
                          }}
                        >
                          <EmotionRenderer
                            key={`character-emotion-render-${id}`}
                            assetLinkLoader={assetLinkLoader}
                            assetUrl={image}
                            upDownAnimation
                            className="Interactor__emotion-renderer"
                          />
                          {isSelected && <InnerThoughtsTrigger characterId={id} />}
                        </div>
                      );
                    })}
                </div>
              </div>
              <ChatBox />
              <Inventory />
              <DebugModal />
              <ModelSelectorModal />
              <RegenerateEmotionModal />
              <InnerThoughtsModal />
            </div>
          </>
        )}
      </div>
    </AreYouSure.AreYouSureProvider>
  );
};

export default Interactor;
