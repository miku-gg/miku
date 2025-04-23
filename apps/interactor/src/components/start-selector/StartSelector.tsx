import { useAppSelector, useAppDispatch } from '../../state/store';
import { selectShouldShowStartSelectionModal } from '../../state/selectors';
import { setHasShownStartSelectionModal, swipeResponse } from '../../state/slices/narrationSlice';
import './StartSelector.scss';
import { NovelStart } from '../../state/versioning';
import { useAppContext } from '../../App.context';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import EmotionRenderer from '../emotion-render/EmotionRenderer';

const StartSelectorCard = ({
  start,
  onSelectStart,
}: {
  start: NovelStart;
  onSelectStart: (startId: string) => void;
}) => {
  const { assetLinkLoader } = useAppContext();
  const sceneStart = useAppSelector((state) => state.novel.scenes.find((scene) => scene.id === start.sceneId));
  const background = useAppSelector((state) =>
    state.novel.backgrounds.find((background) => background.id === sceneStart?.backgroundId),
  );
  const characters = useAppSelector((state) =>
    state.novel.characters.filter((character) => sceneStart?.characters.find((c) => c.characterId === character.id)),
  );
  const characterOutfitImages: string[] = characters
    .map((character) => {
      const { outfit: outfitId } = sceneStart?.characters.find((c) => c.characterId === character.id) || {};
      const emotion = start.characters.find((c) => c.characterId === character.id)?.emotion;
      const outfitImage = character.card.data.extensions.mikugg_v2.outfits
        .find((o) => o.id === outfitId)
        ?.emotions.find((e) => e.id === emotion)?.sources.png;
      return outfitImage || '';
    })
    .filter(Boolean);

  if (!sceneStart) {
    return null;
  }

  return (
    <div className="StartSelector__card" onClick={() => onSelectStart(start.id)}>
      <div className="StartSelector__card-text">
        <div className="StartSelector__card-title">{start.title || 'Untitled Start'}</div>
        <div className="StartSelector__card-description">{start.description || 'No description'}</div>
      </div>
      <img
        className="StartSelector__card-background"
        src={assetLinkLoader(background?.source.jpg || '', AssetDisplayPrefix.BACKGROUND_IMAGE)}
        alt={start.title || 'Untitled Start'}
      />
      <div className="StartSelector__card-characters">
        {characterOutfitImages.map((image) => (
          <EmotionRenderer
            className="StartSelector__card-character"
            assetLinkLoader={assetLinkLoader}
            assetUrl={image}
            isSmall
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Displays a fullscreen overlay with cards for each start,
 * allowing the user to pick one of them as the beginning of their story.
 */
export default function StartSelector() {
  const dispatch = useAppDispatch();
  const shouldShow = useAppSelector(selectShouldShowStartSelectionModal);
  const starts = useAppSelector((state) => state.novel.starts);

  if (!shouldShow) {
    return null;
  }

  const onSelectStart = (startId: string) => {
    dispatch(setHasShownStartSelectionModal(true));
    dispatch(swipeResponse(startId));
  };

  const isMobile = window.innerWidth < 820;

  const sliderSettings: Settings = {
    centerMode: isMobile || starts.length > 3,
    centerPadding: isMobile ? '30px' : '60px',
    slidesToShow: isMobile ? 1 : 3,
    infinite: isMobile || starts.length > 3,
    speed: 500,
    draggable: true,
    swipeToSlide: true,
    className: 'StartSelector__slider',
  };

  return (
    <div className="StartSelector__overlay">
      <div className="StartSelector__container">
        <Slider {...sliderSettings}>
          {starts.map((start) => (
            <StartSelectorCard key={start.id} start={start} onSelectStart={onSelectStart} />
          ))}
        </Slider>
      </div>
    </div>
  );
}
