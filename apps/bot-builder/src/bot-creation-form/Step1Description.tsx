// Step1Description.tsx

import React, { useRef } from 'react';
import { useCharacterCreationForm } from './CharacterCreationFormContext';
import { checkImageDimensionsAndType } from './libs/utils';
import { Attribute, BackgroundImage } from './libs/CharacterData';
import placeholderImage from './assets/placeholder.png'; // Replace with the actual path to the image

const Step1Description: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: {target: {name: string, value: string}}) => {
    const { name, value } = event.target;
    setCharacterData({ ...characterData, [name]: value });
  };

  const handleAttributeChange = (index: number, updatedAttribute: Attribute) => {
    const newAttributes = characterData.attributes?.map((attribute, i) =>
      i === index ? updatedAttribute : attribute,
    );
    setCharacterData({ ...characterData, attributes: newAttributes });
  };

  const addAttribute = () => {
    const newAttribute: Attribute = { key: '', value: '' };
    setCharacterData({ ...characterData, attributes: [...(characterData.attributes || []), newAttribute] });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = characterData.attributes?.filter((_, i) => i !== index);
    setCharacterData({ ...characterData, attributes: newAttributes });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isValidSize = await checkImageDimensionsAndType(file, ['image/png', 'image/jpeg']);
      if (isValidSize) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            setCharacterData({ ...characterData, avatar: reader.result as string });
            resolve(null);
          };
        });
      } else {
        alert('Please upload an avatar with dimensions of 256x256 pixels.');
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const renderAvatarPreview = (): string => {
    if (characterData.avatar) {
      return characterData.avatar;
    } else {
      return placeholderImage;
    }
  };

  const backgroundImagesInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validImages: BackgroundImage[] = [];
  
      for (const file of Array.from(files)) {
        const isValidSize = await checkImageDimensionsAndType(file, ['image/png', 'image/jpeg']);
        if (isValidSize) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          await new Promise((resolve) => {
            reader.onloadend = () => {
              validImages.push({ source: reader.result as string, description: "" });
              resolve(null);
            };
          });
        } else {
          alert('Please upload background images with dimensions of 1024x1024 pixels.');
        }
      }
  
      setCharacterData({
        ...characterData,
        backgroundImages: [...(characterData.backgroundImages || []), ...validImages],
      });
    }

    event.target.value = "";
  };

  const handleRemoveBackgroundImage = (index: number) => {
    const newBackgroundImages = [...(characterData.backgroundImages || [])];
    newBackgroundImages.splice(index, 1);
    setCharacterData({ ...characterData, backgroundImages: newBackgroundImages });
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
    setCharacterData({ ...characterData, backgroundImages: updatedBackgroundImages });
  };
  

  return (
    <div>
      <h2>Step 1: Description</h2>
      <div className="step1Description__formGroup">
        <label htmlFor="name">Character Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={characterData.name || ''}
          onChange={handleInputChange}
          className="step1Description__input"
        />
      </div>
      
      <div className="step1Description__formGroup">
        <label htmlFor="name">Character version:</label>
        <input
          type="text"
          id="version"
          name="version"
          value={characterData.version || ''}
          onChange={handleInputChange}
          className="step1Description__input"
        />
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="avatar">Upload Avatar (256x256):</label>
        <div
          className="step1Description__avatarPreview"
          onClick={handleAvatarClick}
          style={{ backgroundImage: `url(${renderAvatarPreview()})` }}
        />
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          className="step1Description__avatarInput"
        />
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="author">Author:</label>
        <input
          type="text"
          id="author"
          name="author"
          maxLength={64}
          value={characterData.author}
          onChange={handleInputChange}
        />
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="shortDescription">Character Short Description:</label>
        <input
          type="text"
          id="shortDescription"
          name="shortDescription"
          value={characterData.shortDescription}
          maxLength={256}
          onChange={handleInputChange}
        />
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="description">Character Complete Description:</label>
        <textarea
          id="description"
          name="description"
          value={characterData.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="scenario">Describe the Scenario:</label>
        <textarea
          id="scenario"
          name="scenario"
          value={characterData.scenario || ''}
          onChange={handleInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="sampleConversation">Sample Conversation:</label>
        <textarea
          id="sampleConversation"
          name="sampleConversation"
          value={characterData.sampleConversation || ''}
          onChange={handleInputChange}
          className="step1Description__textarea"
        />
        <div className="step1Description__formGroup">
          <label htmlFor="attributes">Character Attributes</label>
          {characterData.attributes?.map((attribute, index) => (
            <div key={index} className="step1Description__attribute">
              <div className="step1Description__attribute__fields">
                <input
                  type="text"
                  name={`attribute-key-${index}`}
                  value={attribute.key}
                  onChange={(e) => handleAttributeChange(index, { ...attribute, key: e.target.value })}
                  placeholder="Attribute Key"
                />
                <input
                  type="text"
                  name={`attribute-value-${index}`}
                  value={attribute.value}
                  onChange={(e) => handleAttributeChange(index, { ...attribute, value: e.target.value })}
                  placeholder="Attribute Value"
                />
              </div>
              <div className="step1Description__attribute__controls">
                <button type="button" onClick={() => removeAttribute(index)}>
                  Remove
                </button>
                {index === (characterData.attributes?.length || 0) - 1 && (
                  <button type="button" onClick={addAttribute}>
                    Add
                  </button>
                )}
              </div>
            </div>
          ))}
          {!characterData.attributes?.length  && (
            <div className="step1Description__attribute__controls">
              <button type="button" onClick={addAttribute}>
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="greeting">Character Greeting:</label>
        <textarea
          id="greeting"
          name="greeting"
          value={characterData.greeting || ''}
          onChange={handleInputChange}
          className="step1Description__textarea"
        />
      </div>

      <div className="step1Description__formGroup">
        <label htmlFor="backgroundImage">Upload Background Images (1024x1024):</label>
        {characterData.backgroundImages?.map((backgroundImage, index) => (
          <div key={index} className="step1Description__backgroundImagePreview">
            <img src={backgroundImage.source} alt={`Background Image ${index}`} width={256} height={256} />
            <input
              type="text"
              placeholder="Image description"
              value={backgroundImage.description || ""}
              onChange={(e) => handleBackgroundImageDescriptionChange(e, index)}
            />
            <button onClick={() => handleRemoveBackgroundImage(index)}>Remove</button>
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
    </div>
  );
};

export default Step1Description;
