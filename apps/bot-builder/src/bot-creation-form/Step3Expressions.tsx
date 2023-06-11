import React from "react";

import { useCharacterCreationForm } from "./CharacterCreationFormContext";

import { EmotionGroup, emotionHashConfigs } from "./libs/CharacterData";
import { checkImageDimensionsAndType } from "./libs/utils";

import {
  Button,
  Container,
  DragAndDropImages,
  Input,
  TextHeading,
} from "@mikugg/ui-kit";

const closeIconBase64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIHZpZXdCb3g9IjAgMCAxNiAxNyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeT0iMC41IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSI4IiBmaWxsPSIjRkFGQUZBIi8+CjxyZWN0IHg9IjQiIHk9IjcuNSIgd2lkdGg9IjgiIGhlaWdodD0iMiIgZmlsbD0iIzFCMjE0MiIvPgo8L3N2Zz4K";

const Step3Expressions: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();

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

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    groupIndex: number
  ) => {
    const { name, value } = event.target;
    if (characterData.emotionGroups) {
      const newGroups = [...characterData.emotionGroups];
      newGroups[groupIndex] = { ...newGroups[groupIndex], [name]: value };
      if (name === "emotionsHash") {
        newGroups[groupIndex].images = [];
      }
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
        <div key={`group_${groupIndex}`} className="step3Expressions__group">
          <div className="step3Expressions__groupHeader">
            <h3>Emotion Group {groupIndex + 1}</h3>
            <button
              type="button"
              className="step3Expressions__removeGroupButton"
              onClick={() => handleRemoveGroup(groupIndex)}
            >
              <img src={closeIconBase64} />
            </button>
          </div>

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
            <select
              id={`group_${groupIndex}_emotionsHash`}
              name="emotionsHash"
              value={group.emotionsHash}
              onChange={(event) => handleInputChange(event, groupIndex)}
            >
              <option value="">Select Emotion Set</option>
              {emotionHashConfigs.map((config) => (
                <option key={config.hash} value={config.hash}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>
          <div className="step3Expressions__emotions">
            {renderEmotionImages()}
          </div>
        </div>
      );
    });
  };

  return (
    <Container className="step3Expressions">
      <TextHeading size="h2">Step 3: Emotion Groups</TextHeading>
      {renderEmotionGroups()}
      <Button theme="gradient" onClick={handleAddGroup}>
        + Add Emotion Group
      </Button>
    </Container>
  );
};

export default Step3Expressions;
