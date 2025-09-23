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
import CharacterPopup from '../inner-thoughts/CharacterPopup';
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
  const { fullscreenCharacter, nonFullscreenCharacters } = useFullscreenEmotions();
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const displayingCutscene = useAppSelector(selectDisplayingCutScene);
  const shouldPlayGlobalCutscene = useAppSelector(selectShouldPlayGlobalStartCutscene);
  const battles = useAppSelector((state) => state.novel.battles);
  const novelCharacters = useAppSelector((state) => state.novel.characters);

  if (!scene) {
    return null;
  }
  const background = backgrounds.find((b) => b.id === scene.backgroundId);

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
                <div
                  className={classNames({
                    Interactor__characters: true,
                    'Interactor__characters--multiple': nonFullscreenCharacters.length > 1,
                  })}
                >
              {/* Character Popups - positioned relative to each character */}
              {!fullscreenCharacter && lastCharacters.map(({ id, image }) => {
                if (!image || displayingCutscene) {
                  return null;
                }
                const character = novelCharacters.find(c => c.id === id);
                if (!character) return null;
                
                 return (
                   <div className={classNames({
                     'Interactor__character-container': true,
                     selected: displayCharacter?.id === id,
                   })}>
                     <EmotionRenderer
                        key={`character-emotion-render-${id}`}
                        assetLinkLoader={assetLinkLoader}
                        assetUrl={image}
                        upDownAnimation
                        className= 'Interactor__emotion-renderer'
                     />
                     {displayCharacter?.id === id && (
                        <CharacterPopup
                          character={{
                            id: character.id,
                            name: character.name,
                            description:
                              character.card?.data?.description ||
                              character.card?.data?.personality ||
                              '',
                            profile_pic: character.profile_pic,
                          }}
                          assetLinkLoader={assetLinkLoader}
                          isVisible={true}
                          position={{ x: 0, y: 0 }} // Position will be calculated relative to character
                        />
                      )}
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
              
            </div>
          </>
        )}
      </div>
    </AreYouSure.AreYouSureProvider>
  );
};

export default Interactor;
