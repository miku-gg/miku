import { useAppContext } from '../../App.context';
import { selectCurrentScene, selectCurrentCutscene } from '../../state/selectors';
import { useAppSelector, useAppDispatch } from '../../state/store';
import EmotionRenderer from '../emotion-render/EmotionRenderer';
import { AssetDisplayPrefix, NovelV3 } from '@mikugg/bot-utils';
import classNames from 'classnames';
import './CutsceneDisplayer.scss';
import { useRef, useEffect, useState } from 'react';
import { TextFormatterStatic } from '../common/TextFormatter';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useI18n } from '../../libs/i18n';
import { setCutsceneTextIndex, setCutscenePartIndex } from '../../state/slices/narrationSlice';
import { useFillTextTemplateFunction } from '../../libs/hooks';

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

  // Crossfade state for background asset
  const FADE_DURATION = 300; // ms
  const [assets, setAssets] = useState<
    Array<{ key: string; src: string; type: 'video' | 'image'; isExiting?: boolean }>
  >(() => []);
  // Determine current asset source and type
  const computeAsset = () => {
    if (!background) return { src: '', type: 'image' as const };
    if ((isMobileApp || window.innerWidth < 600) && background.source.mp4Mobile) {
      return {
        src: assetLinkLoader(background.source.mp4Mobile, AssetDisplayPrefix.BACKGROUND_IMAGE),
        type: 'video' as const,
      };
    } else if (background.source.mp4) {
      return {
        src: assetLinkLoader(background.source.mp4, AssetDisplayPrefix.BACKGROUND_VIDEO),
        type: 'video' as const,
      };
    }
    return {
      src: assetLinkLoader(background.source.jpg, AssetDisplayPrefix.BACKGROUND_IMAGE),
      type: 'image' as const,
    };
  };
  // Update assets on background change
  useEffect(() => {
    const { src, type } = computeAsset();
    const key = src;
    if (!assets.length) {
      setAssets([{ key, src, type }]);
      return;
    }
    const [current] = assets;
    if (current.src !== src) {
      // Fade out previous and show new
      const exiting = { ...current, isExiting: true };
      const incoming = { key, src, type };
      setAssets([incoming, exiting]);
      const timeout = setTimeout(() => setAssets([incoming]), FADE_DURATION);
      return () => clearTimeout(timeout);
    }
    // Re-run when background or display mode changes
  }, [background?.id, isMobileApp, assetLinkLoader]);

  return (
    <div className={`CutsceneDisplayer__main-image-container ${isMobileApp ? 'MobileDisplay' : ''}`}>
      {/* Crossfade background assets */}
      {assets.map(({ key, src, type, isExiting }) =>
        type === 'video' ? (
          <video
            key={key}
            src={src}
            className={classNames('CutsceneDisplayer__fade-image', 'CutsceneDisplayer__fade-image--video', {
              'CutsceneDisplayer__fade-image--in': !isExiting,
              'CutsceneDisplayer__fade-image--out': !!isExiting,
            })}
            loop
            autoPlay
            muted
            playsInline
          />
        ) : (
          <img
            key={key}
            src={src}
            className={classNames('CutsceneDisplayer__fade-image', {
              'CutsceneDisplayer__fade-image--in': !isExiting,
              'CutsceneDisplayer__fade-image--out': !!isExiting,
            })}
            alt="background"
            onError={({ currentTarget }) => {
              if (currentTarget.src !== '/images/default_background.png') {
                currentTarget.onerror = null;
                currentTarget.src = '/images/default_background.png';
              }
            }}
          />
        ),
      )}
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
  const fillTextTemplate = useFillTextTemplateFunction();
  const scene = useAppSelector(selectCurrentScene);
  const currentCutscene = useAppSelector(selectCurrentCutscene);

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

  // Prefetch next part background asset to cache before transition
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const parts = (currentCutscene as NovelV3.CutScene)?.parts || [];

  useEffect(() => {
    if (!currentCutscene || !scene) return;
    const nextPart = parts[currentPartIndex + 1];
    if (!nextPart) return;
    const nextBackground = backgrounds.find((b) => b.id === nextPart.background);
    if (!nextBackground) return;

    let url: string;
    let asType: 'video' | 'image';
    if (isMobileDisplay && nextBackground.source.mp4Mobile) {
      url = assetLinkLoader(nextBackground.source.mp4Mobile, AssetDisplayPrefix.BACKGROUND_IMAGE);
      asType = 'video';
    } else if (nextBackground.source.mp4) {
      url = assetLinkLoader(nextBackground.source.mp4, AssetDisplayPrefix.BACKGROUND_VIDEO);
      asType = 'video';
    } else {
      url = assetLinkLoader(nextBackground.source.jpg, AssetDisplayPrefix.BACKGROUND_IMAGE);
      asType = 'image';
    }

    if (asType === 'image') {
      const img = new Image();
      img.src = url;
    } else {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'video';
      document.head.appendChild(link);
    }
  }, [currentPartIndex, parts, backgrounds, assetLinkLoader, isMobileDisplay]);

  if (!currentCutscene || !scene) {
    return null;
  }

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
          {getCurrentTextsToShow().map((textItem: NovelV3.CutScenePart['text'][number], index: number) => (
            <div
              key={`${textItem.content}-${index}`}
              className={`CutsceneDisplayer__text ${textItem.type}`}
              onClick={(e) => {
                e.stopPropagation();
                handleContinueClick();
              }}
            >
              <TextFormatterStatic
                noAnimation={index < currentTextIndex}
                doNotSplit={textItem.type === 'dialogue'}
                text={fillTextTemplate(textItem.content)}
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
