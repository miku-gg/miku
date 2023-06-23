// Step2Assets.tsx
import React, { useRef } from "react";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";

import {
  Button,
  Container,
  TextHeading,
} from "@mikugg/ui-kit";

import { checkImageDimensionsAndType } from "./libs/utils";

import { v4 as uuidv4 } from 'uuid';

const Step2Assets: React.FC = () => {
  const { card, setCard } = useCharacterCreationForm();

  const backgroundImagesInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const validImages: {
        id: string
        description: string
        source: string
      }[] = [];

      for (const file of Array.from(files)) {
        const isValidSize = await checkImageDimensionsAndType(file, [
          "image/png",
          "image/jpeg",
        ]);
        if (isValidSize) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          await new Promise((resolve) => {
            reader.onloadend = () => {
              validImages.push({
                source: reader.result as string,
                description: "",
                id: uuidv4()
              });
              resolve(null);
            };
          });
        } else {
          alert(
            "Background images should be png or jpg"
          );
        }
      }

      setCard({
        ...card,
        data: {
          ...card.data,          
          extensions: {
            ...card.data.extensions,
            mikugg: {
              ...(card.data.extensions.mikugg || {}),
              backgrounds: [
                ...(card.data.extensions.mikugg?.backgrounds || []),
                ...validImages
              ]
            }
          }
        }
      });
    }

    event.target.value = "";
  };

  const handleRemoveBackgroundImage = (index: number) => {
    const newBackgroundImages = [...(card.data.extensions.mikugg?.backgrounds || [])];
    newBackgroundImages.splice(index, 1);
    setCard({
      ...card,
      data: {
        ...card.data,          
        extensions: {
          ...card.data.extensions,
          mikugg: {
            ...(card.data.extensions.mikugg || {}),
            backgrounds: newBackgroundImages
          }
        }
      }
    });
  };

  const handleBackgroundImageDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const updatedBackgroundImages = [...(card.data.extensions.mikugg?.backgrounds || [])];
    updatedBackgroundImages[index] = {
      ...updatedBackgroundImages[index],
      description: event.target.value,
    };
    setCard({
      ...card,
      data: {
        ...card.data,          
        extensions: {
          ...card.data.extensions,
          mikugg: {
            ...(card.data.extensions.mikugg || {}),
            backgrounds: updatedBackgroundImages
          }
        }
      }
    });
  };

  return (
    <Container className="step2Assets">
      <TextHeading size="h2">Step 2: Assets</TextHeading>
      <div className="step2Assets__formGroup">
        <label htmlFor="backgroundImage">
          Upload Background Images: (16:9 format preferred)
        </label>
        {card.data.extensions.mikugg?.backgrounds?.map((backgroundImage, index) => (
          <div key={index} className="step2Assets__backgroundImagePreview">
            <img
              src={backgroundImage.source}
              alt={`Background Image ${index}`}
              height={256}
            />
            <input
              type="text"
              placeholder="Image description"
              value={backgroundImage.description || ""}
              onChange={(e) => handleBackgroundImageDescriptionChange(e, index)}
            />
            <Button
              theme="secondary"
              onClick={() => handleRemoveBackgroundImage(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <input
          type="file"
          id="backgroundImage"
          name="backgroundImage"
          accept="image/png,image/jpeg"
          ref={backgroundImagesInputRef}
          onChange={handleBackgroundImageChange}
          className="step2Assets__backgroundImageInput"
          multiple
        />
      </div>
    </Container>
  );
};

export default Step2Assets;
