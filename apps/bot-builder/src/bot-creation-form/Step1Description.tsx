// Step1Description.tsx
import React, { useRef } from "react";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";

import {
  Button,
  Container,
  DragAndDropImages,
  Input,
  TextHeading,
} from "@mikugg/ui-kit";

import { Attribute, BackgroundImage } from "./libs/CharacterData";
import { checkImageDimensionsAndType } from "./libs/utils";

import { RemoveX } from "./assets/svg";

const Step1Description: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();

  const handleInputChange = (event: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = event.target;
    setCharacterData({ ...characterData, [name]: value });
  };

  const handleAttributeChange = (
    index: number,
    updatedAttribute: Attribute
  ) => {
    const newAttributes = characterData.attributes?.map((attribute, i) =>
      i === index ? updatedAttribute : attribute
    );
    setCharacterData({ ...characterData, attributes: newAttributes });
  };

  const addAttribute = () => {
    const newAttribute: Attribute = { key: "", value: "" };
    setCharacterData({
      ...characterData,
      attributes: [...(characterData.attributes || []), newAttribute],
    });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = characterData.attributes?.filter(
      (_, i) => i !== index
    );
    setCharacterData({ ...characterData, attributes: newAttributes });
  };

  const handleAvatarChange = async (file: File) => {
    if (file) {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      await new Promise((resolve) => {
        reader.onloadend = () => {
          setCharacterData({
            ...characterData,
            avatar: reader.result as string,
          });

          resolve(null);
        };
      });
    }
  };

  const backgroundImagesInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const validImages: BackgroundImage[] = [];

      for (const file of Array.from(files)) {
        const isValidSize = await checkImageDimensionsAndType(file, [
          "image/png",
          "image/jpg",
        ]);
        if (isValidSize) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          await new Promise((resolve) => {
            reader.onloadend = () => {
              validImages.push({
                source: reader.result as string,
                description: "",
              });
              resolve(null);
            };
          });
        } else {
          alert(
            "Please upload background images with dimensions of 1024x1024 pixels."
          );
        }
      }

      setCharacterData({
        ...characterData,
        backgroundImages: [
          ...(characterData.backgroundImages || []),
          ...validImages,
        ],
      });
    }

    event.target.value = "";
  };

  const handleRemoveBackgroundImage = (index: number) => {
    const newBackgroundImages = [...(characterData.backgroundImages || [])];
    newBackgroundImages.splice(index, 1);
    setCharacterData({
      ...characterData,
      backgroundImages: newBackgroundImages,
    });
  };

  const handleBackgroundImageDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const updatedBackgroundImages = [...(characterData.backgroundImages || [])];
    updatedBackgroundImages[index] = {
      ...updatedBackgroundImages[index],
      description: event.target.value,
    };
    setCharacterData({
      ...characterData,
      backgroundImages: updatedBackgroundImages,
    });
  };

  return (
    <Container className="step1Description">
      <TextHeading size="h2">Step 1: Description</TextHeading>
      <div className="step1Description__formGroup">
        <Input
          placeHolder="The name of your character E.g *Irina*"
          id="name"
          name="name"
          label="Character name"
          value={characterData.name || ""}
          onChange={handleInputChange}
          className="step1Description__input"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          placeHolder="The version of your character E.g *1.0*"
          label="Character version"
          id="version"
          name="version"
          value={characterData.version || ""}
          onChange={handleInputChange}
          className="step1Description__input"
        />
      </div>

      <div className="step1Description__formGroup">
        <label>Upload Avatar</label>

        <DragAndDropImages
          size="lg"
          className="step1Description__dragAndDropImages"
          handleChange={handleAvatarChange}
          previewImage={characterData.avatar}
          placeHolder="(256x256)"
          onFileValidate={(file) =>
            checkImageDimensionsAndType(file, ["image/png", "image/jpeg"])
          }
          errorMessage="Please upload an avatar with dimensions of 256x256 pixels."
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          id="author"
          name="author"
          placeHolder="The name of the author *user name*"
          label="Author"
          maxLength={64}
          value={characterData.author}
          onChange={handleInputChange}
          className="step1Description__input"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          id="shortDescription"
          name="shortDescription"
          placeHolder="E.g *A character based in...*"
          label="Character short description"
          value={characterData.shortDescription}
          maxLength={256}
          onChange={handleInputChange}
          className="step1Description__input"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Character Complete Description:"
          placeHolder="E.g 'Aqua is a beautiful goddess of water who is selfish and arrogant. Aqua often acts superior to others and looks down on those who worship other gods. Aqua does not miss an opportunity to boast about her status. Aqua is also a crybaby who easily breaks down in tears when things don't go her way. Aqua is not very smart or lucky, and often causes trouble for herself and her party with her poor decisions and actions. Aqua has a habit of spending all her money on alcohol and parties, leaving her in debt and unable to pay for basic necessities. Aqua also has a low work ethic and prefers to slack off or avoid doing any tasks that require effort or responsibility. Aqua acts very cowardly against tough monsters, often making up lame excuses on why she cannot fight. Aqua has a very negative opinion of the undead and demons and will be very cold and aggressive to them. Aqua is incapable of lying convincingly. Aqua has a kind heart and will help those in need, especially if they are her followers or friends. Aqua has a strong sense of justice and will fight against evil with her powerful water, healing, and purification magic. Aqua also has a playful and cheerful side, and enjoys having fun with her party and performing party tricks. Aqua is worshipped by the Axis Order in this world, who are generally considered by everyone as strange overbearing cultists. Aqua currently lives in the city of Axel, a place for beginner adventurers.'"
          id="description"
          name="description"
          value={characterData.description}
          onChange={handleInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Describe the Scenario:"
          placeHolder="E.g 'Aqua is gathering followers for her faith in the city Axel's town square.'"
          id="scenario"
          name="scenario"
          value={characterData.scenario || ""}
          onChange={handleInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Sample Conversation:"
          placeHolder={`E.g 'Aqua: "You there! You look like you know what's what. What sect are you from?"\nAnon: "I’m not really religious, but I guess I respect all the gods?"\nAqua: "All the gods? Don't you know that there's only one god who deserves your respect and worship, Aqua? I'm the most beautiful, powerful, and benevolent being in this world! I can knock out giant toads in one hit and perform the most amazing party tricks known to mankind! Did I mention how amazing I am?"\nAnon: "Huh...? Wait a minute... You're an Axis Order cultist. Everyone knows you're all weirdos... And isn't it terrible to pretend to be a god?"\nAqua: "What? Weirdos?! That's a lie spread by jealous people! Me and my followers are perfect in every way! How dare you insult me! And I'm not pretending!!"\nAnon: "Hey, calm down. I'm just telling you what I heard."\nAqua: "No, you're wrong! You're so wrong that it hurts my ears! You need to repent and join the Axis Order right now! Or else you'll face my wrath!"\nAnon: "We're brand-new adventurers who don’t even have any decent gear. What kind of 'allies' would join our party?"\nAqua: "Did you forget that I'M here? When word gets out we want party members, they'll come. I am an Arch-priest, you know—an advanced class! I can use all kinds of healing magic; I can cure paralysis and poisoning, even revive the dead! What party wouldn't want me? I’m the great Aqua, aren't I? Pretty soon they'll be knocking at our door. 'Please let us join you!' they'll say. Get it?!"\nAnon: "I want some cash..."\nAqua: "So does everybody. Myself included, of course! ...Think about it. Isn't this completely pathetic? Let’s say I— a goddess, remember!—was willing to live in a stable for the rest of my life; why would you let me? Wouldn't you be ashamed to do that? If you understand, then make with the goods! Baby me!"'`}
          id="sampleConversation"
          name="sampleConversation"
          value={characterData.sampleConversation || ""}
          onChange={handleInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <TextHeading size="h2">Character Attributes</TextHeading>
        {characterData.attributes?.map((attribute, index) => {
          const isLastAttribute: boolean =
            index === (characterData.attributes?.length || 0) - 1;

          return (
            <div key={index} className="step1Description__attribute">
              <div className="step1Description__attribute__fields">
                <Input
                  name={`attribute-key-${index}`}
                  value={attribute.key}
                  onChange={(e) =>
                    handleAttributeChange(index, {
                      ...attribute,
                      key: e.target.value,
                    })
                  }
                  className="step1Description__input"
                  placeHolder="Attribute Key"
                />
                <Input
                  name={`attribute-value-${index}`}
                  value={attribute.value}
                  onChange={(e) =>
                    handleAttributeChange(index, {
                      ...attribute,
                      value: e.target.value,
                    })
                  }
                  className="step1Description__input"
                  placeHolder="Attribute Value"
                />
                <div className="step1Description__attribute__controls">
                  <button
                    className="step1Description__attribute__remove"
                    onClick={() => removeAttribute(index)}
                  >
                    <RemoveX />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div className="step1Description__addAttributeButton">
          <Button theme="gradient" onClick={addAttribute}>
            + Add Attribute
          </Button>
        </div>
      </div>

      <div className="step1Description__formGroup">
        <Input
          isTextArea
          label="Character Greeting:"
          id="greeting"
          placeHolder="E.g 'It’s a pleasure to meet you'"
          name="greeting"
          value={characterData.greeting || ""}
          onChange={handleInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="backgroundImage">
          Upload Background Images (1024x1024):
        </label>
        {characterData.backgroundImages?.map((backgroundImage, index) => (
          <div key={index} className="step1Description__backgroundImagePreview">
            <img
              src={backgroundImage.source}
              alt={`Background Image ${index}`}
              width={256}
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
          accept="image/*"
          ref={backgroundImagesInputRef}
          onChange={handleBackgroundImageChange}
          className="step1Description__backgroundImageInput"
          multiple
        />
      </div>
    </Container>
  );
};

export default Step1Description;
