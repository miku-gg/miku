// Step2ModelAndVoice.tsx

import React, { useState } from 'react';
import { useCharacterCreationForm } from './CharacterCreationFormContext';
import { models, voices, Voice } from './libs/CharacterData';

const Step2ModelAndVoice: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setCharacterData({ ...characterData, [name]: value });
  };

  return (
    <div className="step2ModelAndVoice">
      <div className="step2ModelAndVoice__description">
        The following are just default values, they can be changed by the bot user.
      </div>
      <div className="step2ModelAndVoice__formGroup">
        <label htmlFor="model">Prompt Completion Model:</label>
        <select
          id="model"
          name="model"
          value={characterData.model || ''}
          onChange={handleInputChange}
          className="step2ModelAndVoice__modelSelect"
        >
          <option value="">Select a model</option>
          {Object.entries(models).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {characterData.model && (
          <div className="step2ModelAndVoice__modelDescription">
            <span className={`step2ModelAndVoice__priceBadge step2ModelAndVoice__priceBadge--${models[characterData.model].price}`}>
              {models[characterData.model].price}
            </span>
            {models[characterData.model].description}
          </div>
        )}
      </div>
      <div className="step2ModelAndVoice__formGroup">
        <label htmlFor="voice">Voice:</label>
        <select
          id="voice"
          name="voice"
          value={characterData.voice || ''}
          onChange={(event) => {
            handleInputChange(event);
          }}
          className="step2ModelAndVoice__voiceSelect"
        >
        <option value="">Select a voice</option>
          {Object.entries(voices).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {characterData.voice && (
          <div className="step2ModelAndVoice__voiceDescription">
            <span className={`step2ModelAndVoice__priceBadge step2ModelAndVoice__priceBadge--${voices[characterData.voice].price}`}>
              {voices[characterData.voice].price}
            </span>
            <audio
              src={`/voices/${characterData.voice}.mp3`} // Replace with the correct path to the voice preview files
              controls
              className="step2ModelAndVoice__voicePreview"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2ModelAndVoice;
