import { Modal } from '@mikugg/ui-kit';
import { FaDice } from 'react-icons/fa';
import { useAppContext } from '../../App.context';
import { trackEvent } from '../../libs/analytics';
import { useI18n } from '../../libs/i18n';
import { selectCharacterOutfits, selectCurrentScene } from '../../state/selectors';
import { regenerationStart } from '../../state/slices/narrationSlice';
import { setRegenerateEmotionModal } from '../../state/slices/settingsSlice';
import { RootState, useAppDispatch, useAppSelector } from '../../state/store';
import './RegenerateEmotionModal.scss';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import {
  FaRegAngry,
  FaRegSadTear,
  FaRegGrinTongueWink,
  FaRegTired,
  FaRegGrinBeamSweat,
  FaRegMehBlank,
  FaRegMehRollingEyes,
  FaRegSadCry,
  FaRegFlushed,
  FaRegSmileBeam,
  FaRegGrimace,
  FaRegSmileWink,
  FaRegMeh,
  FaRegSurprise,
  FaRegLaughSquint,
  FaRegGrinHearts,
  FaRegGrinSquint,
  FaRegKissWinkHeart,
  FaRegGrin,
  FaRegSmile,
} from 'react-icons/fa';
import {
  TbMoodNerd,
  TbMoodWrrr,
  TbMoodConfuzed,
  TbMoodEmpty,
  TbMoodSadDizzy,
  TbMoodNervous,
  TbMoodUp,
  TbMoodSad,
  TbMoodAnnoyed,
  TbMoodHappy,
  TbMoodCrazyHappy,
  TbMoodSmile,
  TbMoodSuprised,
  TbMoodKid,
  TbMoodCry,
  TbMoodTongue,
} from 'react-icons/tb';

// Emotion to icon mapping
const emotionIcons: Record<string, React.ReactNode> = {
  angry: <FaRegAngry />,
  sad: <FaRegSadTear />,
  happy: <FaRegSmileBeam />,
  disgusted: <FaRegGrimace />,
  begging: <FaRegSadCry />,
  scared: <FaRegFlushed />,
  excited: <FaRegSmileWink />,
  hopeful: <FaRegGrinHearts />,
  longing: <TbMoodUp />,
  proud: <FaRegGrinSquint />,
  neutral: <FaRegMeh />,
  rage: <TbMoodWrrr />,
  scorn: <TbMoodEmpty />,
  blushed: <FaRegGrinBeamSweat />,
  pleasure: <FaRegKissWinkHeart />,
  lustful: <FaRegGrinTongueWink />,
  shocked: <FaRegSurprise />,
  confused: <TbMoodConfuzed />,
  disappointed: <TbMoodSadDizzy />,
  embarrassed: <FaRegFlushed />,
  guilty: <TbMoodSad />,
  shy: <FaRegMehBlank />,
  frustrated: <FaRegMehRollingEyes />,
  annoyed: <TbMoodAnnoyed />,
  exhausted: <FaRegTired />,
  tired: <FaRegTired />,
  curious: <TbMoodNerd />,
  intrigued: <TbMoodNervous />,
  amused: <FaRegLaughSquint />,
  surprised: <FaRegSurprise />,

  // Lewd emotions
  desire: <FaRegGrinHearts />,
  anticipation: <TbMoodHappy />,
  condescension: <FaRegGrinSquint />,
  arousal: <FaRegFlushed />,
  ecstasy: <TbMoodCrazyHappy />,
  relief: <FaRegSmile />,
  release: <TbMoodSmile />,
  intensity: <TbMoodSuprised />,
  comfort: <FaRegSmileBeam />,
  humiliation: <FaRegSadTear />,
  discomfort: <TbMoodNervous />,
  submission: <TbMoodKid />,
  pain: <TbMoodCry />,
  teasing: <TbMoodTongue />,
  arrogant: <FaRegGrin />,
};

const RegenerateEmotionModal = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { servicesEndpoint, apiEndpoint, assetLinkLoader } = useAppContext();
  const { opened: isOpen, selectedCharacterIndex } = useAppSelector(
    (state) =>
      state.settings.modals.regenerateEmotion || {
        opened: false,
        selectedCharacterIndex: 0,
      },
  );
  const scene = useAppSelector(selectCurrentScene);
  const characters = useAppSelector((state) => state.novel.characters);
  const { i18n } = useI18n();

  const handleClose = () => {
    dispatch(setRegenerateEmotionModal({ opened: false }));
  };

  const handleCharacterSelect = (index: number) => {
    dispatch(setRegenerateEmotionModal({ opened: true, selectedCharacterIndex: index }));
  };

  const handleEmotionSelect = (emotion: string) => {
    if (!scene) return;

    trackEvent('interaction_regenerate', { emotion });

    // Get the selected character from the scene
    const { characterId } = scene.characters[selectedCharacterIndex] || { characterId: '' };

    dispatch(
      regenerationStart({
        apiEndpoint,
        servicesEndpoint,
        emotion,
        characterId,
      }),
    );

    handleClose();
  };

  const handleRandomSelect = () => {
    if (!scene) return;

    // Get the selected character from the scene
    const { characterId, outfit: outfitId } = scene.characters[selectedCharacterIndex] || {
      characterId: '',
      outfit: '',
    };

    // Get the outfit emotions
    const outfits = selectCharacterOutfits(
      {
        novel: { characters },
      } as RootState,
      characterId,
    );

    const outfit = outfits.find((o) => o.id === outfitId);

    if (outfit && outfit.emotions.length > 0) {
      const randomIndex = Math.floor(Math.random() * outfit.emotions.length);
      const randomEmotion = outfit.emotions[randomIndex].id;
      handleEmotionSelect(randomEmotion);
    }
  };

  // If no scene, don't render
  if (!scene) return <></>;

  // Get the character data for the selected character
  const { characterId, outfit: outfitId } = scene.characters[selectedCharacterIndex] || {
    characterId: '',
    outfit: '',
  };

  // Get the outfit data
  const outfits = selectCharacterOutfits(
    {
      novel: { characters },
    } as RootState,
    characterId,
  );

  const outfit = outfits.find((o) => o.id === outfitId);

  // Get the emotions from the outfit
  const emotions = outfit?.emotions || [];

  return (
    <Modal
      opened={isOpen}
      onCloseModal={handleClose}
      title={i18n('select_reaction')}
      className={`RegenerateEmotionModal`}
    >
      <div className="RegenerateEmotionModal__content">
        {/* Character selector */}
        {scene.characters.length > 1 && (
          <div className="RegenerateEmotionModal__characters">
            {scene.characters.map((sceneCharacter, index) => {
              const char = characters.find((c) => c.id === sceneCharacter.characterId);
              return (
                <button
                  key={`character-${sceneCharacter.characterId}`}
                  className={`RegenerateEmotionModal__character-button ${
                    index === selectedCharacterIndex ? 'selected' : ''
                  }`}
                  onClick={() => handleCharacterSelect(index)}
                >
                  <img
                    src={
                      char?.profile_pic ? assetLinkLoader(char.profile_pic, AssetDisplayPrefix.CHARACTER_PIC_SMALL) : ''
                    }
                    alt={char?.name || 'Character'}
                  />
                  <span>{char?.name || 'Character'}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Emotions grid */}
        <div className="RegenerateEmotionModal__emotions-grid">
          <button
            className="RegenerateEmotionModal__button RegenerateEmotionModal__button-random"
            onClick={handleRandomSelect}
          >
            <span className="RegenerateEmotionModal__button-emoji">
              <FaDice className="RegenerateEmotionModal__button-icon" />
            </span>
            <span className="RegenerateEmotionModal__button-text">{i18n('random')}</span>
          </button>
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              className="RegenerateEmotionModal__button"
              onClick={() => handleEmotionSelect(emotion.id)}
            >
              <span className="RegenerateEmotionModal__button-emoji">{emotionIcons[emotion.id] || <FaRegMeh />}</span>
              <span className="RegenerateEmotionModal__button-text">{emotion.id}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default RegenerateEmotionModal;
