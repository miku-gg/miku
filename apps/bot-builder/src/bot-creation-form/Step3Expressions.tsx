import React, { useState } from "react";

import { useCharacterCreationForm } from "./CharacterCreationFormContext";

import {
  Accordion,
  AccordionItem,
  Button,
  Container,
  DragAndDropImages,
  Dropdown,
  Input,
  TextHeading,
} from "@mikugg/ui-kit";
import { EmotionGroup, emotionHashConfigs } from "./libs/CharacterData";
import { checkImageDimensionsAndType } from "./libs/utils";

const Step3Expressions: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();
  const [selectedItemByIndex, setSelectedItemByIndex] = useState<number>(0);
  const [expandedEmotionSetDropdown, setExpandedEmotionSetDropdown] =
    useState(false);

  const handleAddGroup = () => {
    const newGroup: EmotionGroup = {
      name: "",
      trigger: "",
      description: "",
      emotionsHash: "",
      images: [],
    };
    setCharacterData({
      ...characterData,
      emotionGroups: [...(characterData.emotionGroups || []), newGroup],
    });
  };

  const handleRemoveGroup = (index: number) => {
    if (characterData.emotionGroups) {
      const newGroups = [...characterData.emotionGroups];
      newGroups.splice(index, 1);
      setCharacterData({ ...characterData, emotionGroups: newGroups });
    }
  };

  const handleDropdownChange = (selectedIndex: number, groupIndex: number) => {
    const selectedHashItem = emotionHashConfigs[selectedIndex].hash;

    if (characterData.emotionGroups) {
      const newGroups = [...characterData.emotionGroups];

      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        emotionsHash: selectedHashItem,
        images: [],
      };

      setCharacterData({ ...characterData, emotionGroups: newGroups });
    }
  };

  const getDropdownEmotionSetIndex = (groupIndex: number) => {
    return emotionHashConfigs.findIndex(
      ({ hash }) =>
        hash === characterData.emotionGroups[groupIndex].emotionsHash
    );
  };

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    groupIndex: number
  ) => {
    const { name, value } = event.target;
    if (characterData.emotionGroups) {
      const newGroups = [...characterData.emotionGroups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        [name]: value,
      };
      setCharacterData({ ...characterData, emotionGroups: newGroups });
    }
  };

  const handleImageChange = async (
    file: File,
    groupIndex: number,
    emotionId: string
  ) => {
    if (file && characterData.emotionGroups) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newGroups = [...characterData.emotionGroups];
        const emotionHashConfig = emotionHashConfigs.find(
          (config) => config.hash === newGroups[groupIndex].emotionsHash
        );

        if (emotionHashConfig?.emotionIds.includes(emotionId) === false) {
          console.warn(`Invalid emotion id: ${emotionId}`);
          return;
        }

        const images = newGroups[groupIndex].images || [];
        const imageIndex = images.findIndex((img) => img.emotion === emotionId);

        if (imageIndex >= 0) {
          images[imageIndex].sources = [base64];
        } else {
          images.push({
            emotion: emotionId,
            sources: [base64],
            fileTypes: file.type,
          });
        }

        newGroups[groupIndex].images = images;
        setCharacterData({ ...characterData, emotionGroups: newGroups });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    groupIndex: number
  ) => {
    const files = event.target.files;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const emotionId = file.name.split(".")[0];
        handleImageChange(file, groupIndex, emotionId);
      }
    }
  };

  const renderEmotionGroups = () => {
    if (!characterData.emotionGroups) return null;

    return characterData.emotionGroups.map((group, groupIndex) => {
      const emotionHashConfig = emotionHashConfigs.find(
        (config) => config.hash === group.emotionsHash
      );
      const renderEmotionImages = () => {
        if (!emotionHashConfig) return null;

        return emotionHashConfig.emotionIds.map((emotionId) => {
          const PreviewImage = group.images.find(
            (img) => img.emotion === emotionId
          );

          return (
            <DragAndDropImages
              key={`emotion_${emotionId}_group_${group.emotionsHash}`}
              size="sm"
              dragAreaLabel={emotionId}
              handleChange={(file) =>
                handleImageChange(file, groupIndex, emotionId)
              }
              previewImage={PreviewImage?.sources[0]}
              placeHolder="(1024x1024)"
              errorMessage="Please upload an image with dimensions of 1024x1024 pixels in PNG or GIF format."
              onFileValidate={(file) =>
                checkImageDimensionsAndType(file, [
                  "image/png",
                  "image/gif",
                  "video/webm",
                ])
              }
            />
          );
        });
      };

      return (
        <AccordionItem
          title={`Emotion Group ${groupIndex + 1}`}
          key={`group_${groupIndex}`}
          className="step3Expressions__group"
        >
          <div className="step3Expressions__formGroup">
            <Input
              label="Name:"
              placeHolder="Enter a name for this emotion group"
              id={`group_${groupIndex}_name`}
              name="name"
              value={group.name}
              onChange={(event) => handleInputChange(event, groupIndex)}
            />
          </div>

          <div className="step3Expressions__formGroup">
            <Input
              isTextArea
              label="Trigger embedding:"
              placeHolder="Enter a text that will trigger this emotion group. This could be a list of keywords or a sentence. This text will be converted to an embedding."
              id={`group_${groupIndex}_description`}
              name="description"
              value={group.description}
              onChange={(event) => handleInputChange(event, groupIndex)}
              className="step3Expressions__formGroup__textarea"
            />
          </div>
          <div className="step3Expressions__formGroup">
            <Input
              isTextArea
              label="Switch sentence:"
              placeHolder="Enter a text that will be added to the prompt when this emotion group is triggered."
              id={`group_${groupIndex}_trigger`}
              name="trigger"
              value={group.trigger}
              onChange={(event) => handleInputChange(event, groupIndex)}
              className="step3Expressions__formGroup__textarea"
            />
          </div>

          <div className="step3Expressions__formGroup">
            <input
              type="file"
              multiple
              accept="image/png, image/gif, video/webm"
              onChange={(event) => handleMultipleImageChange(event, groupIndex)}
            />
          </div>
          <div className="step3Expressions__formGroup">
            <label htmlFor={`group_${groupIndex}_emotionsHash`}>
              Emotion Set:
            </label>
            <Dropdown
              items={emotionHashConfigs}
              onChange={(index) => handleDropdownChange(index, groupIndex)}
              expanded={expandedEmotionSetDropdown}
              onToggle={setExpandedEmotionSetDropdown}
              selectedIndex={getDropdownEmotionSetIndex(groupIndex)}
            />
          </div>
          <div className="step3Expressions__emotions">
            {renderEmotionImages()}
          </div>
        </AccordionItem>
      );
    });
  };

  return (
    <Container className="step3Expressions">
      <TextHeading size="h2">Step 3: Emotion Groups</TextHeading>
      <Accordion
        selectedIndex={selectedItemByIndex}
        onChange={(index) => setSelectedItemByIndex(index)}
        onRemoveItem={(index) => handleRemoveGroup(index)}
      >
        {renderEmotionGroups()}
      </Accordion>
      <Button theme="gradient" onClick={handleAddGroup}>
        + Add Emotion Group
      </Button>
    </Container>
  );
};

export default Step3Expressions;
