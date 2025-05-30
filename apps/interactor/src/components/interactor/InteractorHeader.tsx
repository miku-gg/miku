import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { useAppContext } from '../../App.context';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { useAppSelector } from '../../state/store';
import AnimatedText from '../common/AnimatedText';
import History from '../history/History';
import InteractiveMap from '../scenarios/InteractiveMap';
import { SceneChangeModal } from '../scenarios/SceneChangeModal';
import SceneSelector from '../scenarios/SceneSelector';
import Hint from './Hint';
import './InteractorHeader.scss';
import { InventoryTrigger } from './Inventory';
import MemoryCapacityView from './MemoryCapacityView';
// import ModelSelector from './ModelSelector';
import MusicPlayer from './MusicPlayer';
import PremiumHint from './PremiumHint';
import ScreenSizer from './ScreenSizer';
import Settings from './Settings';
import { selectDisplayingCutScene } from '../../state/selectors';

const InteractorHeader = () => {
  const { assetLinkLoader } = useAppContext();
  const title = useAppSelector((state) => state.novel.title);
  const firstCharacter = useAppSelector((state) => Object.values(state.novel.characters)[0]);
  const isMobileWidth = document.body.clientWidth < 600;

  // do not display left side if battle is active or cutscene is active
  const activeBattle = useAppSelector((state) => state.narration.currentBattle?.isActive || false);
  const displayingCutscene = useAppSelector(selectDisplayingCutScene);
  const completeHeader = !activeBattle && !displayingCutscene;

  if (!firstCharacter) {
    return null;
  }

  return (
    <div className="InteractorHeader">
      <div className="InteractorHeader__container">
        <div className="InteractorHeader__left">
          {completeHeader && (
            <>
              <div
                className="InteractorHeader__profile_pic"
                style={{
                  backgroundImage: firstCharacter.profile_pic
                    ? `url(${assetLinkLoader(firstCharacter.profile_pic, AssetDisplayPrefix.CHARACTER_PIC_SMALL)})`
                    : '',
                }}
                onClick={() => postMessage(CustomEventType.NOVEL_PROFILE_CLICK, true)}
              />
              {!isMobileWidth && (
                <div className="InteractorHeader__header-name">{<AnimatedText text={title} minLength={20} />}</div>
              )}
              <SceneSelector />
              <InventoryTrigger />
              <InteractiveMap />
              <SceneChangeModal />
            </>
          )}
        </div>
        <div className="InteractorHeader__right">
          {completeHeader ? (
            <>
              <MemoryCapacityView />
              <History />
            </>
          ) : null}
          {/* <ModelSelector /> */}
          <MusicPlayer />
          <ScreenSizer />
          <Settings />
        </div>
      </div>
      <div className="InteractorHeader__hints">
        <Hint />
        <PremiumHint />
      </div>
    </div>
  );
};

export default InteractorHeader;
