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
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import MusicPlayer from './MusicPlayer';

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
  const songs = useAppSelector((state) => state.novel.songs);

  const background = backgrounds.find((b) => b.id === part.background);
  const currentCharacters = part.characters;
  const songSource = songs.find((s) => s.id === part.music)?.source;

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
      {part.music && (
        <div className="CutsceneDisplayer__music-player">
          <MusicPlayer source={songSource} />
        </div>
      )}
    </div>
  );
};

export const CutsceneDisplayer = ({ onEndDisplay }: { onEndDisplay: () => void }) => {
  const { assetLinkLoader, isMobileApp } = useAppContext();
  const scene = useAppSelector(selectCurrentScene);
  const cutscenes = useAppSelector((state) => state.novel.cutscenes);
  const currentCutscene = cutscenes?.find((c) => c.id === scene?.cutScene?.id);
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [displayedTextIndices, setDisplayedTextIndices] = useState<number[]>([0]);

  if (!currentCutscene || !scene) {
    return null;
  }
  const parts = currentCutscene.parts;

  const handleContinueClick = () => {
    const currentPart = parts[currentPartIndex];
    if (currentTextIndex < currentPart.text.length - 1) {
      setCurrentTextIndex(currentTextIndex + 1);
      setDisplayedTextIndices([...displayedTextIndices, currentTextIndex + 1]);
    } else if (currentPartIndex < parts.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
      setCurrentTextIndex(0);
      setDisplayedTextIndices([0]);
    }
  };

  const handlePreviousClick = () => {
    if (currentTextIndex > 0) {
      setCurrentTextIndex(currentTextIndex - 1);
    } else if (currentPartIndex > 0) {
      setCurrentPartIndex(currentPartIndex - 1);
      setCurrentTextIndex(parts[currentPartIndex - 1].text.length - 1);
    }
  };

  const getText = (partIndex: number, textIndex: number) => {
    const text = parts[partIndex].text[textIndex];
    return text.type === 'description' ? text.content : `"${text.content}"`;
  };

  return (
    <>
      <PartRenderer
        part={parts[currentPartIndex]}
        assetLinkLoader={assetLinkLoader}
        isMobileApp={isMobileApp}
        onContinueClick={handleContinueClick}
        onPreviousClick={handlePreviousClick}
      />
      <div className="CutsceneDisplayer__text-container">
        {displayedTextIndices.map((textIndex) => (
          <div
            key={`text-${currentPartIndex}-${textIndex}`}
            className={`CutsceneDisplayer__text ${parts[currentPartIndex].text[textIndex].type}`}
            onClick={(e) => {
              e.stopPropagation();
              handleContinueClick();
            }}
          >
            <TextFormatterStatic text={getText(currentPartIndex, textIndex)} />
          </div>
        ))}
      </div>
      <div className="CutsceneDisplayer__buttons">
        {(currentPartIndex > 0 || currentTextIndex > 0) && (
          <IoIosArrowBack
            className="CutsceneDisplayer__buttons-left"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handlePreviousClick();
            }}
          />
        )}
        {currentPartIndex < parts.length - 1 || currentTextIndex < parts[currentPartIndex].text.length - 1 ? (
          <>
            {currentPartIndex === 0 && currentTextIndex === 0 && <div>{/* {"empty div for center"} */}</div>}
            <IoIosArrowForward
              className="CutsceneDisplayer__buttons-right"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleContinueClick();
              }}
            />
          </>
        ) : (
          <>
            {currentPartIndex === 0 && currentTextIndex === 0 && <div>{/* {"empty div for center"} */}</div>}

            <button
              className="CutsceneDisplayer__buttons-right"
              onClick={(e) => {
                e.stopPropagation();
                onEndDisplay();
              }}
            >
              <p className="CutsceneDisplayer__buttons-right__text">
                Go to scene
                <IoIosArrowForward />
              </p>
            </button>
          </>
        )}
      </div>
    </>
  );
};
