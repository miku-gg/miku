import ProgressiveImage from 'react-progressive-graceful-image';
import { useAppContext } from '../../App.context';
import { selectCurrentScene } from '../../state/selectors';
import { useAppSelector, useAppDispatch } from '../../state/store';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import classNames from 'classnames';
import './CutsceneDisplayer.scss';
import { useRef, useEffect } from 'react';
import { TextFormatterStatic } from '../common/TextFormatter';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useI18n } from '../../libs/i18n';
import { setCutsceneTextIndex, setCutscenePartIndex } from '../../state/slices/narrationSlice';
import { selectShouldPlayGlobalStartCutscene } from '../../state/selectors';

const PartRenderer = ({
  part,
  assetLinkLoader,
  isMobileApp,
}: {
  part: NovelV3.CutScenePart;
  assetLinkLoader: (src: string, type: AssetDisplayPrefix) => string;
  isMobileApp: boolean;
  onContinueClick: () => void;
  onPreviousClick: () => void;
}) => {
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const characters = useAppSelector((state) => state.novel.characters);

  const background = backgrounds.find((b) => b.id === part.background);
  const currentCharacters = part.characters.filter((c) => characters?.find((ch) => ch?.id === c?.id));

  return (
    <div className={`CutsceneDisplayer__main-image-container ${isMobileApp ? 'MobileDisplay' : ''}`}>
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
      {currentCharacters.length > 0 && (
        <div
          className={classNames({
            CutsceneDisplayer__characters: true,
            'CutsceneDisplayer__characters--multiple': currentCharacters.length > 1,
          })}
        >
          {currentCharacters.map(({ id, outfitId, emotionId }) => {
            const character = characters.find((c) => c.id === id);
            const outfit = character?.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === outfitId);
            const emotion = outfit?.emotions.find((e) => e.id === emotionId);
            if (!outfitId || !emotion) {
              return null;
            }
            return (
              <EmotionRenderer
                key={`character-emotion-render-${id}`}
                assetLinkLoader={assetLinkLoader}
                assetUrl={emotion.sources.png}
                className="CutsceneDisplayer__emotion-renderer"
                upDownAnimation
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CutsceneDisplayer = ({ onEndDisplay }: { onEndDisplay: () => void }) => {
  const { assetLinkLoader, isMobileApp } = useAppContext();
  const { i18n } = useI18n();
  const dispatch = useAppDispatch();
  const scene = useAppSelector(selectCurrentScene);
  const shouldPlayGlobalCutscene = useAppSelector(selectShouldPlayGlobalStartCutscene);
  const globalCutscene = useAppSelector(
    (state) =>
      state.novel.globalStartCutsceneId &&
      state.novel.cutscenes?.find((c) => c.id === state.novel.globalStartCutsceneId),
  );
  const currentCutscene = useAppSelector((state) =>
    shouldPlayGlobalCutscene ? globalCutscene : state.novel.cutscenes?.find((c) => c.id === scene?.cutScene?.id),
  );

  const currentPartIndex = useAppSelector((state) => state.narration.input.cutscenePartIndex || 0);
  const currentTextIndex = useAppSelector((state) => state.narration.input.cutsceneTextIndex || 0);

  const isMobileDisplay = isMobileApp || window.innerWidth < 600;
  const TEXTS_PER_GROUP = 3;

  const handleContinueClick = () => {
    const currentPart = parts[currentPartIndex];

    if (currentTextIndex < currentPart.text.length - 1) {
      dispatch(setCutsceneTextIndex(currentTextIndex + 1));
    } else if (currentPartIndex < parts.length - 1) {
      dispatch(setCutscenePartIndex(currentPartIndex + 1));
      dispatch(setCutsceneTextIndex(0));
    }
  };

  const handlePreviousClick = () => {
    if (currentTextIndex > 0) {
      dispatch(setCutsceneTextIndex(currentTextIndex - 1));
    } else if (currentPartIndex > 0) {
      const previousPart = parts[currentPartIndex - 1];
      dispatch(setCutscenePartIndex(currentPartIndex - 1));
      dispatch(setCutsceneTextIndex(previousPart.text.length - 1));
    }
  };

  const isAtEnd = () => {
    if (!parts[currentPartIndex]) return false;

    const currentPart = parts[currentPartIndex];
    const isLastPart = currentPartIndex === parts.length - 1;

    return isLastPart && currentTextIndex === currentPart.text.length - 1;
  };

  const getCurrentTextsToShow = () => {
    const currentPart = parts[currentPartIndex];
    if (!isMobileDisplay) {
      return currentPart.text.slice(0, currentTextIndex + 1);
    }

    const startIndex = Math.floor(currentTextIndex / TEXTS_PER_GROUP) * TEXTS_PER_GROUP;
    return currentPart.text.slice(startIndex, currentTextIndex + 1);
  };

  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [currentTextIndex]);

  if (!currentCutscene || !scene) {
    return null;
  }

  const parts = currentCutscene.parts;

  return (
    <>
      <PartRenderer
        part={parts[currentPartIndex]}
        assetLinkLoader={assetLinkLoader}
        isMobileApp={isMobileDisplay}
        onContinueClick={handleContinueClick}
        onPreviousClick={handlePreviousClick}
      />
      <div className="CutsceneDisplayer__body">
        <div
          ref={textContainerRef}
          className={`CutsceneDisplayer__text-container ${isMobileDisplay ? 'MobileDisplay' : ''}`}
        >
          {getCurrentTextsToShow().map((textItem, index) => (
            <div
              key={`${textItem.content}-${index}`}
              className={`CutsceneDisplayer__text ${textItem.type}`}
              onClick={(e) => {
                e.stopPropagation();
                handleContinueClick();
              }}
            >
              <TextFormatterStatic
                text={textItem.type === 'description' ? textItem.content : `"${textItem.content}"`}
              />
            </div>
          ))}
        </div>
        <div className="CutsceneDisplayer__buttons">
          <button
            className={classNames({
              'CutsceneDisplayer__buttons-left': true,
              'CutsceneDisplayer__buttons-left--hidden': currentTextIndex === 0 && currentPartIndex === 0,
            })}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handlePreviousClick();
            }}
          >
            <IoIosArrowBack />
          </button>
          <button
            className="CutsceneDisplayer__buttons-right"
            onClick={(e) => {
              e.stopPropagation();
              if (isAtEnd()) {
                onEndDisplay();
              } else {
                handleContinueClick();
              }
            }}
          >
            {isAtEnd() ? <p className="CutsceneDisplayer__buttons-right__text">{i18n('go_to_scene')}</p> : null}
            <IoIosArrowForward />
          </button>
        </div>
      </div>
    </>
  );
};
