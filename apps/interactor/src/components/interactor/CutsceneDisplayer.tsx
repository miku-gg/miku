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
import { setCutsceneTextIndex, setCutsceneGroupIndex, setCutscenePartIndex } from '../../state/slices/narrationSlice';

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
  const currentCharacters = part.characters;

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
  const currentCutscene = useAppSelector((state) => state.novel.cutscenes?.find((c) => c.id === scene?.cutScene?.id));

  const currentPartIndex = useAppSelector((state) => state.narration.input.cutscenePartIndex || 0);
  const currentTextIndex = useAppSelector((state) => state.narration.input.cutsceneTextIndex || 0);
  const currentGroupIndex = useAppSelector((state) => state.narration.input.cutsceneGroupIndex || 0);

  const isMobileDisplay = isMobileApp || window.innerWidth < 600;
  const TEXTS_PER_GROUP = 3;

  const getTextGroups = (texts: NovelV3.CutScenePart['text']) => {
    if (!isMobileDisplay) return [texts];
    return texts.reduce((acc: NovelV3.CutScenePart['text'][], curr, i) => {
      const groupIndex = Math.floor(i / TEXTS_PER_GROUP);
      if (!acc[groupIndex]) acc[groupIndex] = [];
      acc[groupIndex].push(curr);
      return acc;
    }, []);
  };

  const handleContinueClick = () => {
    const currentPart = parts[currentPartIndex];
    const textGroups = getTextGroups(currentPart.text);
    const currentGroup = textGroups[currentGroupIndex];

    if (currentTextIndex < currentGroup.length - 1) {
      dispatch(setCutsceneTextIndex(currentTextIndex + 1));
    } else if (currentGroupIndex < textGroups.length - 1) {
      dispatch(setCutsceneGroupIndex(currentGroupIndex + 1));
      dispatch(setCutsceneTextIndex(0));
    } else if (currentPartIndex < parts.length - 1) {
      dispatch(setCutscenePartIndex(currentPartIndex + 1));
      dispatch(setCutsceneGroupIndex(0));
      dispatch(setCutsceneTextIndex(0));
    }
  };

  const handlePreviousClick = () => {
    if (currentTextIndex > 0) {
      dispatch(setCutsceneTextIndex(currentTextIndex - 1));
    } else if (currentGroupIndex > 0) {
      dispatch(setCutsceneGroupIndex(currentGroupIndex - 1));
      const previousGroup = getTextGroups(parts[currentPartIndex].text)[currentGroupIndex - 1];
      dispatch(setCutsceneTextIndex(previousGroup.length - 1));
    } else if (currentPartIndex > 0) {
      dispatch(setCutscenePartIndex(currentPartIndex - 1));
      const previousPartGroups = getTextGroups(parts[currentPartIndex - 1].text);
      dispatch(setCutsceneGroupIndex(previousPartGroups.length - 1));
      dispatch(setCutsceneTextIndex(previousPartGroups[previousPartGroups.length - 1].length - 1));
    }
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
  const lastPart = parts[parts.length - 1];

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
          {(() => {
            const currentPart = parts[currentPartIndex];
            const textGroups = getTextGroups(currentPart.text);
            const currentGroup = textGroups[currentGroupIndex];

            return currentGroup.slice(0, currentTextIndex + 1).map((textItem, index) => (
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
            ));
          })()}
        </div>
        <div className="CutsceneDisplayer__buttons">
          <button
            className="CutsceneDisplayer__buttons-left"
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
              if (currentPartIndex < parts.length - 1 || currentTextIndex < parts[currentPartIndex].text.length - 1) {
                handleContinueClick();
              } else {
                onEndDisplay();
              }
            }}
          >
            {lastPart.id === parts[currentPartIndex].id &&
            currentTextIndex === parts[currentPartIndex].text.length - 1 ? (
              <p className="CutsceneDisplayer__buttons-right__text">{i18n('go_to_scene')}</p>
            ) : null}
            <IoIosArrowForward />
          </button>
        </div>
      </div>
    </>
  );
};
