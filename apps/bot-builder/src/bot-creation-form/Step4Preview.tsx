import React, { useState } from "react";

import {
  Carousel,
  Container,
  Dropdown,
  ImageSlider,
  TextHeading,
} from "@mikugg/ui-kit";

import { useCharacterCreationForm } from "./CharacterCreationFormContext";
import BotSummary from "./Components/BotSummary";

const Step4Preview: React.FC = () => {
  const { characterData } = useCharacterCreationForm();
  const [selectedBackgroundIndex, setSelectedBackgroundIndex] = useState(0);
  const [selectedEmotionGroupIndex, setSelectedEmotionGroupIndex] = useState(0);
  const [selectedEmotionIndex, setSelectedEmotionIndex] = useState(0);
  const [expandedEmotionGroupsDropdown, setExpandedEmotionGroupsDropdown] =
    useState(false);

  const handleDropdownChange = (selectedIndex: number) => {
    setSelectedEmotionGroupIndex(selectedIndex);
    setSelectedEmotionIndex(0);
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
          items={selectedEmotionGroup.images.map((image) => image.emotion)}
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
        <div className="step4Preview__emotionList">
          <TextHeading className="step4Preview__emotionList__label" size="h3">
            Emotion Group
          </TextHeading>
          <Dropdown
            className="step4Preview__emotionList__dropdown"
            items={characterData.emotionGroups.map((emotionGroup) => ({
              ...emotionGroup,
              description: undefined,
            }))}
            onChange={(selectedIndex) => handleDropdownChange(selectedIndex)}
            selectedIndex={selectedEmotionGroupIndex}
            expanded={expandedEmotionGroupsDropdown}
            onToggle={setExpandedEmotionGroupsDropdown}
          />
        </div>
        {renderEmotionPreview()}
        <div className="step4Preview__preview">
          <Carousel
            items={characterData.backgroundImages.map(
              (background) => background.source
            )}
            onClick={(index) => setSelectedBackgroundIndex(index)}
            selectedIndex={selectedBackgroundIndex}
            isImageCarousel
          />
        </div>
      </div>
    </Container>
  );
};

export default Step4Preview;
