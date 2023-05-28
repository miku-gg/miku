import React, { useState } from 'react';
import { useCharacterCreationForm } from './CharacterCreationFormContext';
import { voices } from './libs/CharacterData';

const Step4Preview: React.FC = () => {
  const { characterData } = useCharacterCreationForm();
  const [selectedBackgroundIndex, setSelectedBackgroundIndex] = useState(0);
  const [selectedEmotionGroupIndex, setSelectedEmotionGroupIndex] = useState(0);
  const [selectedEmotionIndex, setSelectedEmotionIndex] = useState(0);

  const voice = voices[characterData.voice] || voices['elevenlabs_tts.EXAVITQu4vr4xnSDxMaL'];
  
  const handleEmotionGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmotionGroupIndex(event.target.value as unknown as number || 0);
    setSelectedEmotionIndex(0);
  };

  const renderBackgroundSelector = () => {
    return (
      <div className="step4Preview__backgroundSelector">
        {characterData.backgroundImages?.map((bg, index) => (
          <div
            key={index}
            className={`step4Preview__backgroundThumbnail ${
              selectedBackgroundIndex === index ? "step4Preview__backgroundThumbnail--selected" : ""
            }`}
            style={{ backgroundImage: `url(${bg.source})` }}
            onClick={() => setSelectedBackgroundIndex(index)}
          />
        ))}
      </div>
    );
  };
  
  const renderEmotionSlider = () => {
    if (!characterData.emotionGroups) return null;
  
    const selectedEmotionGroup = characterData.emotionGroups[selectedEmotionGroupIndex];
    const selectedEmotion = selectedEmotionGroup.images[selectedEmotionIndex];
    const selectedBackground = characterData.backgroundImages[selectedBackgroundIndex];
    
    return (
      <div className="step4Preview__emotionSlider">
        <button
          className="step4Preview__emotionSliderButton"
          onClick={() =>
            setSelectedEmotionIndex((prevIndex) => (prevIndex - 1 + selectedEmotionGroup.images.length) % selectedEmotionGroup.images.length)
          }
        >
          Prev
        </button>
        <div className="step4Preview__emotionImage" style={{ backgroundImage: `url(${selectedBackground.source})` }}>
          <img src={selectedEmotion.sources[0]} alt={selectedEmotion.emotion} />
        </div>
        <p className="step4Preview__emotionName">{selectedEmotion.emotion}</p>
        <button
          className="step4Preview__emotionSliderButton"
          onClick={() => setSelectedEmotionIndex((prevIndex) => (prevIndex + 1) % selectedEmotionGroup.images.length)}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="step4Preview">
      <div className="step4Preview__content">
        <div className="step4Preview__info">
          <h2>{characterData.name}</h2>
          <p>{characterData.scenario}</p>
          {characterData.avatar && (
            <img src={characterData.avatar} alt={`${characterData.name}'s avatar`} />
          )}
          <div className="step4Preview__tags">
            <span className="step4Preview__tag">{voice.label}</span>
          </div>
        </div>
        <div className="step4Preview__preview">
          {renderBackgroundSelector()}
          <select className="step4Preview__emotionGroupSelect" onChange={handleEmotionGroupChange}>
            {characterData.emotionGroups?.map((emotionGroup, index) => (
              <option key={index} value={index}>
                {emotionGroup.name}
              </option>
            ))}
          </select>
          <div className="step4Preview__emotionImages">
            {renderEmotionSlider()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Preview;