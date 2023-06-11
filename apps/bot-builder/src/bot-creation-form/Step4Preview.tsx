import React, { useState } from "react";

import { Carousel, Container, ImageSlider, TextHeading } from "@mikugg/ui-kit";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";
import BotSummary from "./Components/BotSummary";

const Step4Preview: React.FC = () => {
  const { characterData } = useCharacterCreationForm();
  const [selectedBackgroundIndex, setSelectedBackgroundIndex] = useState(0);
  const [selectedEmotionGroupIndex, setSelectedEmotionGroupIndex] = useState(0);
  const [selectedEmotionIndex, setSelectedEmotionIndex] = useState(0);

  const handleEmotionGroupChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedEmotionGroupIndex(
      (event.target.value as unknown as number) || 0
    );
    setSelectedEmotionIndex(0);
  };

  const renderBackgroundSelector = () => {
    return (
      <div className="step4Preview__backgroundSelector">
        {characterData.backgroundImages?.map((bg, index) => (
          <div
            key={index}
            className={`step4Preview__backgroundThumbnail ${
              selectedBackgroundIndex === index
                ? "step4Preview__backgroundThumbnail--selected"
                : ""
            }`}
            style={{ backgroundImage: `url(${bg.source})` }}
            onClick={() => setSelectedBackgroundIndex(index)}
          />
        ))}
      </div>
    );
  };

  const renderEmotionPreview = () => {
    if (!characterData.emotionGroups) return null;

    const selectedEmotionGroup =
      characterData.emotionGroups[selectedEmotionGroupIndex];
    const selectedBackground =
      characterData.backgroundImages[selectedBackgroundIndex];

    const calculateUpdatedIndex = (additional: number): void => {
      const totalImages = selectedEmotionGroup.images.length;

      setSelectedEmotionIndex(
        (selectedEmotionIndex + additional + totalImages) % totalImages
      );
    };

    return (
      <>
        <ImageSlider
          images={selectedEmotionGroup.images.map((image) => ({
            ...image,
            label: image.emotion,
          }))}
          backgroundImageSource={selectedBackground.source}
          selectedIndex={selectedEmotionIndex}
          onChange={calculateUpdatedIndex}
        />
        <Carousel
          children={selectedEmotionGroup.images.map((image) => image.emotion)}
          selectedIndex={selectedEmotionIndex}
          onClick={(index) => setSelectedEmotionIndex(index)}
          className="step4Preview__emotionCarousel"
        />
      </>
    );
  };

  return (
    <Container className="step4Preview">
      <TextHeading size="h2">Step 4: Finished Character</TextHeading>
      <div className="step4Preview__content">
        <BotSummary
          image={characterData.avatar}
          title={characterData.name}
          description={characterData.scenario}
          tags={[characterData.voice]}
        />
        {renderEmotionPreview()}
        <div className="step4Preview__preview">
          {renderBackgroundSelector()}
          <select
            className="step4Preview__emotionGroupSelect"
            onChange={handleEmotionGroupChange}
          >
            {characterData.emotionGroups?.map((emotionGroup, index) => (
              <option key={index} value={index}>
                {emotionGroup.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Container>
  );
};

export default Step4Preview;
