// Step2ModelAndVoice.tsx

import React from "react";
import { Colors } from "./Components/ModelTag";

import { models, voices } from "./libs/CharacterData";

import { Container, Tag, TextHeading } from "@mikugg/ui-kit";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";

import cheapPriceIcon from "./assets/cheapPrice.svg";
import expensivePriceIcon from "./assets/expensivePrice.svg";
import normalPriceIcon from "./assets/normalPrice.svg";

const Step2ModelAndVoice: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setCharacterData({ ...characterData, [name]: value });
  };

  const TagPropsByPrice: Record<
    "normal" | "cheap" | "expensive",
    { backgroundColor: Colors; iconSRC: string }
  > = {
    cheap: {
      backgroundColor: "#9747FF",
      iconSRC: cheapPriceIcon,
    },
    normal: {
      backgroundColor: "#2F80ED",
      iconSRC: normalPriceIcon,
    },
    expensive: {
      backgroundColor: "#FF4E67",
      iconSRC: expensivePriceIcon,
    },
  };

  return (
    <Container className="step2ModelAndVoice">
      <TextHeading size="h2">Step 2: Prompt completion model</TextHeading>
      <div className="step2ModelAndVoice__formGroup">
        <label htmlFor="model">Model:</label>
        <select
          id="model"
          name="model"
          value={characterData.model || ""}
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
          <div className="step2ModelAndVoice__description">
            <Tag
              className={`step2ModelAndVoice__priceBadge`}
              text={models[characterData.model].price}
              {...TagPropsByPrice[models[characterData.model].price]}
            />
            {models[characterData.model].description}
          </div>
        )}
      </div>
      <div className="step2ModelAndVoice__formGroup">
        <label htmlFor="voice">Voice:</label>
        <select
          id="voice"
          name="voice"
          value={characterData.voice || ""}
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
          <>
            <div className="step2ModelAndVoice__description">
              <Tag
                className={`step2ModelAndVoice__priceBadge`}
                text={voices[characterData.voice].price}
                {...TagPropsByPrice[voices[characterData.voice].price]}
              />
              {/* create voices descriptions! */}
              The most advanced model, capable of understanding complex prompts
              and generating detailed responses
            </div>
            <audio
              src={`/voices/${characterData.voice}.mp3`} // Replace with the correct path to the voice preview files
              controls
              className="step2ModelAndVoice__voicePreview"
            >
              Your browser does not support the audio element.
            </audio>
          </>
        )}
      </div>
    </Container>
  );
};

export default Step2ModelAndVoice;
