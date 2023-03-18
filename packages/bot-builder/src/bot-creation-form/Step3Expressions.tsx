import React, { useRef } from 'react';
import { useCharacterCreationForm } from './CharacterCreationFormContext';
import { EmotionGroup, emotionHashConfigs } from './CharacterData';
import placeholderImage from './assets/placeholder.png'; // Replace with the actual path to the image
import { checkImageDimensionsAndType } from './utils';

const EmotionImage = (
  {id, emotionId, handleImageChange, renderImagePreview, groupIndex}: {
    id: string,
    emotionId: string,
    handleImageChange: (event: React.ChangeEvent<HTMLInputElement>, groupIndex: number, emotionId: string) => void
    renderImagePreview: (groupIndex: number, emotionId: string) => string,
    groupIndex: number
  }
): JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="step3Expressions__emotion">
      <label htmlFor={id}>{emotionId}</label>
      <input
        type="file"
        id={id}
        name={id}
        accept="image/png, image/gif"
        ref={fileInputRef}
        onChange={(event) => handleImageChange(event, groupIndex, emotionId)}
        className="step3Expressions__emotionInput"
        hidden
      />
      <img
        src={renderImagePreview(groupIndex, emotionId)}
        alt={`Emotion ${emotionId}`}
        className="step3Expressions__emotionPreview"
        onClick={() => fileInputRef.current?.click()}
      />
    </div>
  )
}


const Step3Expressions: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreationForm();

  const handleAddGroup = () => {
    const newGroup: EmotionGroup = {
      name: '',
      description: '',
      emotionsHash: '',
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
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    groupIndex: number
  ) => {
    const { name, value } = event.target;
    if (characterData.emotionGroups) {
      const newGroups = [...characterData.emotionGroups];
      newGroups[groupIndex] = { ...newGroups[groupIndex], [name]: value };
      setCharacterData({ ...characterData, emotionGroups: newGroups });
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    groupIndex: number,
    emotionId: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const isValidSizeAndType = await checkImageDimensionsAndType(file, ['image/png', 'image/gif'], 1024, 1024);
      if (isValidSizeAndType) {
        if (characterData.emotionGroups) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const newGroups = [...characterData.emotionGroups];
            const images = newGroups[groupIndex].images || [];
            const imageIndex = images.findIndex((img) => img.emotion === emotionId);
            if (imageIndex >= 0) {
              images[imageIndex].sources = [base64];
            } else {
              images.push({ emotion: emotionId, sources: [base64] });
            }
            newGroups[groupIndex].images = images;
            setCharacterData({ ...characterData, emotionGroups: newGroups });
          };
          reader.readAsDataURL(file);
        }
      } else {
        alert('Please upload an image with dimensions of 1024x1024 pixels in PNG or GIF format.');
      }
    }
  };
  

  const renderImagePreview = (
    groupIndex: number,
    emotionId: string
  ): string => {
    const group = characterData.emotionGroups?.[groupIndex];
    if (!group) return '';

    const image = group.images.find((img) => img.emotion === emotionId);
    if (image && image.sources.length > 0) {
      return image.sources[0] || '';
    } else {
      return placeholderImage;
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
          // const fileInputRef = useRef<HTMLInputElement>(null);
          const key = `emotion_${emotionId}_group_${groupIndex}`;
          return (
            <EmotionImage
              key={key}
              id={key}
              emotionId={emotionId}
              handleImageChange={handleImageChange}
              renderImagePreview={renderImagePreview}
              groupIndex={groupIndex}
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
              Remove Group
            </button>
          </div>
          <div className="step3Expressions__formGroup">
            <label htmlFor={`group_${groupIndex}_name`}>Name:</label>
            <input
              type="text"
              id={`group_${groupIndex}_name`}
              name="name"
              value={group.name}
              onChange={(event) => handleInputChange(event, groupIndex)}
            />
          </div>
          <div className="step3Expressions__formGroup">
            <label htmlFor={`group_${groupIndex}_description`}>Description:</label>
            <textarea
              id={`group_${groupIndex}_description`}
              name="description"
              value={group.description}
              onChange={(event) => handleInputChange(event, groupIndex)}
            />
          </div>
          <div className="step3Expressions__formGroup">
            <label htmlFor={`group_${groupIndex}_emotionsHash`}>Emotion Set:</label>
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
          <div className="step3Expressions__emotions">{renderEmotionImages()}</div>
        </div>
      );
    });
  };

  return (
    <div className="step3Expressions">
      <h2>Step 3: Emotion Groups</h2>
      {renderEmotionGroups()}
      <button type="button" className="step3Expressions__addGroupButton" onClick={handleAddGroup}>
        Add Emotion Group
      </button>
    </div>
  );
}

export default Step3Expressions;