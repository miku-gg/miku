import ProgressiveImage from 'react-progressive-graceful-image';
import { useAppContext } from '../../App.context';
import { selectCurrentScene } from '../../state/selectors';
import { useAppSelector } from '../../state/store';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import classNames from 'classnames';
import './CutsceneDisplayer.scss';
import { useState } from 'react';
import { TextFormatterStatic } from '../common/TextFormatter';

const PartRenderer = ({
  part,
  assetLinkLoader,
  isMobileApp,
  onContinueClick,
}: {
  part: NovelV3.CutScenePart;
  assetLinkLoader: (src: string, type: AssetDisplayPrefix) => string;
  isMobileApp: boolean;
  onContinueClick: () => void;
}) => {
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);

  const background = backgrounds.find((b) => b.id === part.background);
  const currentCharacters = part.characters;
  return (
    <div className="CutsceneDisplayer__main-image-container">
      <ProgressiveImage
        src={
          background
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
          (isMobileApp || window.innerWidth < 600) && background?.source.mp4Mobile ? (
            <video className="CutsceneDisplayer__background-mobileVideo" loop autoPlay muted>
              <source src={assetLinkLoader(background.source.mp4Mobile, AssetDisplayPrefix.BACKGROUND_IMAGE)}></source>
            </video>
          ) : background?.source.mp4 ? (
            <video className="CutsceneDisplayer__background-video" loop autoPlay muted>
              <source src={assetLinkLoader(background.source.mp4, AssetDisplayPrefix.BACKGROUND_VIDEO)}></source>
            </video>
          ) : (
            <img
              className="CutsceneDisplayer__background-image"
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
          CutsceneDisplayer__characters: true,
          'CutsceneDisplayer__characters--multiple': currentCharacters.length > 1,
        })}
      >
        {currentCharacters.map(({ id, emotionId }) => {
          if (!emotionId) {
            return null;
          }
          return (
            <EmotionRenderer
              key={`character-emotion-render-${id}`}
              assetLinkLoader={assetLinkLoader}
              assetUrl={emotionId}
              upDownAnimation
              className={classNames({
                'CutsceneDisplayer__emotion-renderer': true,
                selected: currentCharacters[0]?.id === id,
              })}
            />
          );
        })}
      </div>
      <div onClick={onContinueClick}>
        <TextFormatterStatic text={part.text} />
      </div>
    </div>
  );
};

export const CutsceneDisplayer = () => {
  const { assetLinkLoader, isMobileApp } = useAppContext();
  const scene = useAppSelector(selectCurrentScene);
  const cutscenes = useAppSelector((state) => state.novel.cutscenes);
  const currentCutscene = cutscenes?.find((c) => c.id === scene?.cutScene?.id);
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);

  if (!currentCutscene || !scene) {
    return null;
  }
  const parts = currentCutscene.parts;

  const handleContinueClick = () => {
    if (currentPartIndex < parts.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
    }
  };
  return (
    <PartRenderer
      part={parts[currentPartIndex]}
      assetLinkLoader={assetLinkLoader}
      isMobileApp={isMobileApp}
      onContinueClick={handleContinueClick}
    />
  );
};
