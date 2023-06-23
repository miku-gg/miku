// Step2ModelAndVoice.tsx

import React, { useState } from "react";

import { Container, Dropdown, Tag, TextHeading } from "@mikugg/ui-kit";

import { useCharacterCreationForm } from "./CharacterCreationFormContext";
import { Model, Voice, models, voices } from "./libs/CharacterData";

import cheapPriceIcon from "./assets/cheapPrice.svg";
import expensivePriceIcon from "./assets/expensivePrice.svg";
import normalPriceIcon from "./assets/normalPrice.svg";

import { Colors } from "./Components/ModelTag";

type ModelEntryTuple = [
  Model,
  {
    label: string;
    price: "normal" | "cheap" | "expensive";
    color: Colors;
    description: string;
  }
];

type VoiceEntryTuple = [
  Voice,
  {
    label: string;
    price: "normal" | "cheap" | "expensive";
    service: "elevenlabs_tts" | "azure_tts";
  }
];

const Step2ModelAndVoice: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();
  const [expandedModelDropdown, setExpandedModelDropdown] = useState(false);
  const [expandedVoiceDropdown, setExpandedVoiceDropdown] = useState(false);

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

  const modelsEntries: ModelEntryTuple[] = Object.entries(
    models
  ) as ModelEntryTuple[];

  const voicesEntries: VoiceEntryTuple[] = Object.entries(
    voices
  ) as VoiceEntryTuple[];

  function handleDropdownChange(
    newSelectedIndex: number,
    itemList: ModelEntryTuple[],
    type: "model"
  ): void;
  function handleDropdownChange(
    newSelectedIndex: number,
    itemList: VoiceEntryTuple[],
    type: "voice"
  ): void;
  function handleDropdownChange(
    newSelectedIndex: number,
    itemList: any,
    type: any
  ): void {
    const selectedItemByIndex = itemList[newSelectedIndex];
    const [name] = selectedItemByIndex;

    setCharacterData({ ...characterData, [type]: name });
  }

  return (
    <Container className="step2ModelAndVoice">
      <TextHeading size="h2">Step 2: Prompt completion model</TextHeading>
      <div className="step2ModelAndVoice__formGroup">
        <label htmlFor="model">Model:</label>
        <Dropdown
          expanded={expandedModelDropdown}
          items={modelsEntries.map(([, { label }]) => ({ name: label }))}
          onChange={(newSelectedIndex) =>
            handleDropdownChange(newSelectedIndex, modelsEntries, "model")
          }
          onToggle={setExpandedModelDropdown}
          selectedIndex={modelsEntries.findIndex(
            ([name]) => characterData.model === name
          )}
        />
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
        <Dropdown
          expanded={expandedVoiceDropdown}
          items={voicesEntries.map(([, { label }]) => ({ name: label }))}
          onChange={(newSelectedIndex) =>
            handleDropdownChange(newSelectedIndex, voicesEntries, "voice")
          }
          onToggle={setExpandedVoiceDropdown}
          selectedIndex={voicesEntries.findIndex(
            ([name]) => characterData.voice === name
          )}
        />
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
