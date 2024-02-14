import React, { useState } from "react";

import {
  Accordion,
  AccordionItem,
  Button,
  DragAndDropImages,
  Dropdown,
  Input,
} from "@mikugg/ui-kit";

import { checkFileType } from "../../libs/utils";

import { v4 as uuidv4 } from "uuid";
import { emotionTemplates } from "../../data/emotions";
import AudioPreview from "../../components/AudioPreview";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { updateCharacter } from "../../state/slices/novelFormSlice";
import { MikuCardV2 } from "@mikugg/bot-utils";

interface EmotionGroup {
  id: string;
  name: string;
  template: string;
  emotions: { id: string; source: string[] }[];
}

export default function CharacterOutfitsEdit({
  characterId,
}: {
  characterId?: string;
}) {
  const dispatch = useAppDispatch();
  const character = useAppSelector((state) =>
    state.novel.characters.find((c) => c.id === characterId)
  );
  if (!character || !characterId) {
    return null;
  }
  const outfits = character.card.data.extensions.mikugg_v2?.outfits || [];
  const [selectedItemByIndex, setSelectedItemByIndex] = useState<number>(-1);
  const [expandedTemplateDropdown, setExpandedTemplateDropdown] =
    useState(false);

  const decorateCharacterWithOutfits = (
    outfits: MikuCardV2["data"]["extensions"]["mikugg_v2"]["outfits"]
  ) => {
    return {
      ...character,
      card: {
        ...character.card,
        data: {
          ...character.card.data,
          extensions: {
            ...character.card.data.extensions,
            mikugg_v2: {
              ...character.card.data.extensions.mikugg_v2,
              outfits,
            },
          },
        },
      },
    };
  };

  const handleAddGroup = () => {
    const newGroup: MikuCardV2["data"]["extensions"]["mikugg_v2"]["outfits"][number] =
      {
        id: uuidv4(),
        name: "New Outfit",
        description: "",
        attributes: [],
        template: "single-emotion",
        emotions: [
          {
            id: "neutral",
            sources: {
              png: "empty_char_emotion.png",
            },
          },
        ],
      };
    dispatch(
      updateCharacter(
        decorateCharacterWithOutfits(
          (character.card.data.extensions.mikugg_v2?.outfits || []).concat(
            newGroup
          )
        )
      )
    );
  };

  const handleRemoveGroup = (index: number) => {
    if (index < outfits.length) {
      const newGroups = [...outfits];
      newGroups.splice(index, 1);
      dispatch(updateCharacter(decorateCharacterWithOutfits(newGroups)));
    }
  };

  const handleTemplateChange = (selectedIndex: number, groupIndex: number) => {
    const selectedTemplateId = emotionTemplates[selectedIndex].id;

    if (groupIndex < outfits.length) {
      const newGroups = [...outfits];

      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        template: selectedTemplateId,
        emotions: [],
      };
      dispatch(updateCharacter(decorateCharacterWithOutfits(newGroups)));
    }
  };

  const getDropdownEmotionTemplateIndex = (groupIndex: number) => {
    return emotionTemplates.findIndex(
      ({ id }) => id === outfits[groupIndex]?.template
    );
  };

  const handleEmotionGroupNameChange = (
    event: {
      target: { value: string };
    },
    groupIndex: number
  ) => {
    const { value } = event.target;
    if (groupIndex < outfits.length) {
      const newGroups = [...outfits];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        name: value,
      };

      dispatch(updateCharacter(decorateCharacterWithOutfits(newGroups)));
    }
  };

  const handleImageChange = async (
    file: File,
    groupIndex: number,
    emotionId: string,
    isAudio?: boolean
  ) => {
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newGroups = [...outfits];
        const emotionTemplate = emotionTemplates.find(
          (template) => template.id === newGroups[groupIndex].template
        );

        if (emotionTemplate?.emotionIds.includes(emotionId) === false) {
          console.warn(`Invalid emotion id: ${emotionId}`);
          return;
        }

        const emotions = [...newGroups[groupIndex].emotions] || [];
        const emotionIndex = emotions.findIndex((img) => img.id === emotionId);

        if (isAudio) {
          if (emotionIndex >= 0) {
            emotions[emotionIndex] = {
              ...emotions[emotionIndex],
              sources: {
                ...emotions[emotionIndex].sources,
                sound: base64,
              },
            };
          }
        } else if (file.type === "video/webm") {
          if (emotionIndex >= 0) {
            emotions[emotionIndex] = {
              ...emotions[emotionIndex],
              sources: {
                ...emotions[emotionIndex].sources,
                webm: base64,
              },
            };
          } else {
            emotions.push({
              id: emotionId,
              sources: {
                png: "",
                webm: base64,
              },
            });
          }
        } else {
          if (emotionIndex >= 0) {
            emotions[emotionIndex] = {
              ...emotions[emotionIndex],
              sources: {
                ...emotions[emotionIndex].sources,
                png: base64,
              },
            };
          } else {
            emotions.push({
              id: emotionId,
              sources: {
                png: base64,
              },
            });
          }
        }

        newGroups[groupIndex] = {
          ...newGroups[groupIndex],
          emotions,
        };

        dispatch(updateCharacter(decorateCharacterWithOutfits(newGroups)));
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
    return outfits.map((group, groupIndex) => {
      const emotionsTemplate = emotionTemplates.find(
        (template) => template.id === group.template
      );
      const renderEmotionImages = () => {
        if (!emotionsTemplate) return null;

        return emotionsTemplate.emotionIds.map((emotionId) => {
          const emotion = group.emotions.find((img) => img.id === emotionId);

          return (
            <div
              className="step2Assets__emotionPreview"
              key={`emotion_${emotionId}_group_${group.template}_${groupIndex}`}
            >
              <DragAndDropImages
                size="sm"
                dragAreaLabel={emotionId}
                handleChange={(file) => {
                  handleImageChange(
                    file,
                    groupIndex,
                    emotionId,
                    file.type === "audio/mpeg"
                  );
                }}
                previewImage={emotion?.sources.webm || emotion?.sources.png}
                placeHolder="(1024x1024)"
                errorMessage="Please upload PNG, GIF or WEBM."
                onFileValidate={(file) =>
                  checkFileType(file, [
                    "image/png",
                    "image/gif",
                    "video/webm",
                    "audio/mpeg",
                  ])
                }
              />
              {emotion?.sources.sound ? (
                <div className="step2Assets__audioPreview">
                  <AudioPreview src={emotion?.sources.sound} />
                </div>
              ) : null}
            </div>
          );
        });
      };

      return (
        <AccordionItem
          title={`Emotion Group ${groupIndex + 1}`}
          key={`group_${groupIndex}`}
          className="step2Assets__group"
        >
          <div className="step2Assets__formGroup">
            <Input
              label="Name:"
              placeHolder="Enter a name for this emotion group"
              id={`group_${groupIndex}_name`}
              name="name"
              value={group.name}
              onChange={(event) =>
                handleEmotionGroupNameChange(event, groupIndex)
              }
            />
          </div>
          <div className="step2Assets__formGroup">
            <input
              type="file"
              multiple
              accept="image/png, image/gif, video/webm"
              onChange={(event) => handleMultipleImageChange(event, groupIndex)}
            />
          </div>
          <div className="step2Assets__formGroup">
            <label htmlFor={`group_${groupIndex}_emotionsHash`}>
              Emotion Set:
            </label>
            <Dropdown
              items={emotionTemplates}
              onChange={(index) => handleTemplateChange(index, groupIndex)}
              expanded={expandedTemplateDropdown}
              onToggle={setExpandedTemplateDropdown}
              selectedIndex={getDropdownEmotionTemplateIndex(groupIndex)}
            />
          </div>
          <div className="step2Assets__emotions">{renderEmotionImages()}</div>
        </AccordionItem>
      );
    });
  };

  return (
    <div>
      <Accordion
        selectedIndex={selectedItemByIndex}
        onChange={(index) => setSelectedItemByIndex(index)}
        onRemoveItem={(index) => handleRemoveGroup(index)}
      >
        {renderEmotionGroups()}
      </Accordion>
      <Button theme="gradient" onClick={handleAddGroup}>
        + Add Outfit
      </Button>
    </div>
  );
}
