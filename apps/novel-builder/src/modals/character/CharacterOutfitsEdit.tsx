import React, { useState } from 'react';

import {
  Accordion,
  AccordionItem,
  AreYouSure,
  Button,
  CheckBox,
  DragAndDropImages,
  Dropdown,
  Input,
} from '@mikugg/ui-kit';

import { checkFileType } from '../../libs/utils';

import { v4 as uuidv4 } from 'uuid';
import { emotionTemplates } from '../../data/emotions';
import AudioPreview from '../../components/AudioPreview';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { updateCharacter } from '../../state/slices/novelFormSlice';
import { AssetDisplayPrefix, AssetType, MikuCardV2 } from '@mikugg/bot-utils';
import config from '../../config';
import './CharacterOutfitsEdit.scss';
import { toast } from 'react-toastify';
import { BsStars } from 'react-icons/bs';
import { TokenDisplayer } from '../../components/TokenDisplayer';
import { TOKEN_LIMITS } from '../../data/tokenLimits';
import CharacterOutfitGenerateModal from './CharacterOutfitGenerateModal';
import CharacterOutfitEmotionsGenerateModal from './CharacterOutfitEmotionsGenerateModal';
export default function CharacterOutfitsEdit({ characterId }: { characterId?: string }) {
  const dispatch = useAppDispatch();
  const isPremium = useAppSelector((state) => state.user.user?.tier === 'PREMIUM');
  const character = useAppSelector((state) => state.novel.characters.find((c) => c.id === characterId));
  const pendingInferences = useAppSelector((state) => state.novel.pendingInferences);
  if (!character || !characterId) {
    return null;
  }
  const outfits = character.card.data.extensions.mikugg_v2?.outfits || [];
  const [selectedItemByIndex, setSelectedItemByIndex] = useState<number>(-1);
  const [expandedTemplateDropdown, setExpandedTemplateDropdown] = useState(false);
  const { openModal } = AreYouSure.useAreYouSure();
  const [showGenerateOutfitModalForIndex, setShowGenerateOutfitModalForIndex] = useState<number | null>(null);
  const [showGenerateEmotionsModalForIndex, setShowGenerateEmotionsModalForIndex] = useState<number | null>(null);

  const decorateCharacterWithOutfits = (outfits: MikuCardV2['data']['extensions']['mikugg_v2']['outfits']) => {
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
    const newGroup: MikuCardV2['data']['extensions']['mikugg_v2']['outfits'][number] = {
      id: uuidv4(),
      name: 'New Outfit',
      description: '',
      attributes: [],
      template: 'single-emotion',
      nsfw: 0,
      emotions: [
        {
          id: 'neutral',
          sources: {
            png: 'empty_char_emotion.png',
          },
        },
      ],
    };
    dispatch(
      updateCharacter(
        decorateCharacterWithOutfits((character.card.data.extensions.mikugg_v2?.outfits || []).concat(newGroup)),
      ),
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
    return emotionTemplates.findIndex(({ id }) => id === outfits[groupIndex]?.template);
  };

  const handleEmotionGroupNameChange = (
    event: {
      target: { value: string };
    },
    groupIndex: number,
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

  const handleEmotionGroupDescriptionChange = (
    event: {
      target: { value: string };
    },
    groupIndex: number,
  ) => {
    const { value } = event.target;
    if (groupIndex < outfits.length) {
      const newGroups = [...outfits];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        description: value,
      };

      dispatch(updateCharacter(decorateCharacterWithOutfits(newGroups)));
    }
  };

  const uploadEmotionFile = async ({
    file,
    groupIndex,
    emotionId,
    isAudio,
    outfits: _outfits,
  }: {
    file: File;
    groupIndex: number;
    emotionId: string;
    isAudio?: boolean;
    outfits: MikuCardV2['data']['extensions']['mikugg_v2']['outfits'];
  }): Promise<MikuCardV2['data']['extensions']['mikugg_v2']['outfits']> => {
    const { assetId, success } = await config.uploadAsset(
      file,
      file.type === 'video/webm'
        ? AssetType.EMOTION_ANIMATED
        : isAudio
        ? AssetType.EMOTION_SOUND
        : AssetType.EMOTION_IMAGE,
    );
    if (!success) {
      toast.warn('Failed to upload asset');
      return _outfits;
    }
    const newGroups = [..._outfits];
    const emotionTemplate = emotionTemplates.find((template) => template.id === newGroups[groupIndex].template);

    if (emotionTemplate?.emotionIds.includes(emotionId) === false) {
      console.warn(`Invalid emotion id: ${emotionId}`);
      return _outfits;
    }

    const emotions = [...newGroups[groupIndex].emotions];
    const emotionIndex = emotions.findIndex((img) => img.id === emotionId);

    if (isAudio) {
      if (emotionIndex >= 0) {
        emotions[emotionIndex] = {
          ...emotions[emotionIndex],
          sources: {
            ...emotions[emotionIndex].sources,
            sound: assetId,
          },
        };
      }
    } else if (file.type === 'video/webm') {
      if (emotionIndex >= 0) {
        emotions[emotionIndex] = {
          ...emotions[emotionIndex],
          sources: {
            ...emotions[emotionIndex]?.sources,
            webm: assetId,
          },
        };
      } else {
        emotions.push({
          id: emotionId,
          sources: {
            png: '',
            webm: assetId,
          },
        });
      }
    } else {
      if (emotionIndex >= 0) {
        emotions[emotionIndex] = {
          ...emotions[emotionIndex],
          sources: {
            ...emotions[emotionIndex]?.sources,
            png: assetId,
          },
        };
      } else {
        emotions.push({
          id: emotionId,
          sources: {
            png: assetId,
          },
        });
      }
    }

    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      emotions,
    };
    return newGroups;
  };

  const handleImageChange = async (file: File, groupIndex: number, emotionId: string, isAudio?: boolean) => {
    if (file) {
      const newGroups = await uploadEmotionFile({
        file,
        groupIndex,
        emotionId,
        isAudio,
        outfits,
      });
      dispatch(updateCharacter(decorateCharacterWithOutfits(newGroups)));
    }
  };
  const handleMultipleImageChange = async (event: React.ChangeEvent<HTMLInputElement>, groupIndex: number) => {
    const files = event.target.files;
    let newGroups = outfits;

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const emotionId = file.name.split('.')[0];
        newGroups = await uploadEmotionFile({
          file,
          groupIndex,
          emotionId,
          isAudio: false,
          outfits: newGroups,
        });
        dispatch(updateCharacter(decorateCharacterWithOutfits(newGroups)));
      }
    }
  };

  const renderEmotionGroups = () => {
    return outfits.map((group, groupIndex) => {
      const emotionsTemplate = emotionTemplates.find((template) => template.id === group.template);
      const renderEmotionImages = () => {
        if (!emotionsTemplate) return null;

        return emotionsTemplate.emotionIds.map((emotionId) => {
          const emotion = group.emotions.find((img) => img.id === emotionId);
          const isPending = pendingInferences?.some(
            (inf) =>
              inf.characterId === characterId &&
              inf.outfitId === group.id &&
              ((inf.inferenceType === 'emotion' && inf.emotionId === emotionId) ||
                (inf.inferenceType === 'character' && 'neutral' === emotionId)),
          );

          return (
            <div
              className="CharacterOutfitsEdit__emotionPreview"
              key={`emotion_${emotionId}_group_${group.template}_${groupIndex}`}
            >
              <DragAndDropImages
                size="sm"
                dragAreaLabel={emotionId}
                handleChange={(file) => handleImageChange(file, groupIndex, emotionId, file.type === 'audio/mpeg')}
                previewImage={
                  emotion?.sources.webm || emotion?.sources.png
                    ? config.genAssetLink(emotion?.sources.png, AssetDisplayPrefix.EMOTION_IMAGE)
                    : undefined
                }
                placeHolder="(1024x1024)"
                loading={isPending}
                onFileValidate={(file) => {
                  return checkFileType(file, ['image/png', 'image/gif', 'image/webp', 'video/webm', 'audio/mpeg']);
                }}
              />
              {emotion?.sources.sound ? (
                <div className="CharacterOutfitsEdit__audioPreview">
                  <AudioPreview src={config.genAssetLink(emotion?.sources.sound, AssetDisplayPrefix.EMOTION_SOUND)} />
                </div>
              ) : null}
            </div>
          );
        });
      };

      return (
        <AccordionItem
          title={`Outfit ${groupIndex + 1}`}
          key={`group_${groupIndex}`}
          className="CharacterOutfitsEdit__group"
        >
          <div className="CharacterOutfitsEdit__formGroup">
            <Input
              label="Name"
              placeHolder="Enter a name for this outfit"
              id={`group_${groupIndex}_name`}
              name="name"
              value={group.name}
              onChange={(event) => handleEmotionGroupNameChange(event, groupIndex)}
            />
          </div>
          <div className="CharacterOutfitsEdit__formGroup">
            <div className="CharacterOutfitsEdit__description-label-container">
              <label className="Input__label">Description</label>
              <TokenDisplayer text={group.description} limits={TOKEN_LIMITS.OUTFIT_DESCRIPTION} />
            </div>
            <Input
              placeHolder={`[Maiko's Body= "white long hair", "black horns", "dark body lingerie",  "deep pink eyes", "pale skin", "slender figure", "big breasts", "clumsy posture", "pointy ears", "small devilish wings"]`}
              id={`group_${groupIndex}_name`}
              name="description"
              isTextArea
              value={group.description}
              onChange={(event) => handleEmotionGroupDescriptionChange(event, groupIndex)}
            />
          </div>
          <div className="CharacterOutfitsEdit__formGroup">
            <input
              type="file"
              multiple
              accept="image/png, image/gif, video/webm"
              onChange={(event) => handleMultipleImageChange(event, groupIndex)}
            />
          </div>
          <div className="CharacterOutfitsEdit__formGroup">
            <CheckBox
              label="Mark as NSFW outfit"
              value={!!group.nsfw}
              onChange={(e) => {
                const newGroups = [...outfits];
                newGroups[groupIndex] = {
                  ...newGroups[groupIndex],
                  nsfw: e.target.checked ? 1 : 0,
                };
                dispatch(updateCharacter(decorateCharacterWithOutfits(newGroups)));
              }}
            />
          </div>
          <div className="CharacterOutfitsEdit__formGroup">
            <label htmlFor={`group_${groupIndex}_emotionsHash`}>Emotion Set:</label>
            <Dropdown
              items={emotionTemplates}
              onChange={(index) => {
                const hasEmotionsUploaded = outfits[groupIndex]?.emotions.length > 0;
                const isNeutralDefaultEmotion =
                  outfits[groupIndex]?.emotions[0]?.id === 'neutral' &&
                  outfits[groupIndex]?.emotions[0]?.sources?.png === 'empty_char_emotion.png';
                const currentEmotionTemplateIndex = getDropdownEmotionTemplateIndex(groupIndex);

                if (index === currentEmotionTemplateIndex) return;

                if (hasEmotionsUploaded && !isNeutralDefaultEmotion) {
                  openModal({
                    title: 'Are you sure?',
                    description: 'All uploaded emotions to the current set will be removed.',
                    onYes: () => handleTemplateChange(index, groupIndex),
                  });
                } else {
                  handleTemplateChange(index, groupIndex);
                }
              }}
              expanded={expandedTemplateDropdown}
              onToggle={setExpandedTemplateDropdown}
              selectedIndex={getDropdownEmotionTemplateIndex(groupIndex)}
            />
          </div>
          <div className="CharacterOutfitsEdit__emotions-container">
            <div className="CharacterOutfitsEdit__emotions">{renderEmotionImages()}</div>
            {group.template === 'single-emotion' ? (
              <div className="CharacterOutfitsEdit__group-generation-buttons">
                {isPremium ? (
                  <Button
                    theme="secondary"
                    onClick={() => {
                      setShowGenerateOutfitModalForIndex(groupIndex);
                    }}
                  >
                    <BsStars /> Generate Outfit
                  </Button>
                ) : null}
                <Button
                  theme="secondary"
                  disabled={
                    group.emotions?.at(0)?.sources.png === 'empty_char_emotion.png' ||
                    !group.emotions?.at(0)?.sources.png
                  }
                  onClick={() => {
                    setShowGenerateEmotionsModalForIndex(groupIndex);
                  }}
                >
                  <BsStars /> Generate Emotions
                </Button>
              </div>
            ) : null}
          </div>
        </AccordionItem>
      );
    });
  };

  return (
    <div>
      <Accordion
        selectedIndex={selectedItemByIndex}
        onChange={(index) => setSelectedItemByIndex(index)}
        onRemoveItem={(index) => {
          openModal({
            onYes: () => {
              handleRemoveGroup(index);
            },
            title: 'Are you sure?',
            description: 'This action will remove the outfit and all the emotions associated with it.',
            noLabel: 'Cancel',
            yesLabel: 'Remove',
          });
        }}
      >
        {renderEmotionGroups()}
      </Accordion>
      <div className="CharacterOutfitsEdit__buttons">
        <Button theme="secondary" onClick={handleAddGroup}>
          + Add Outfit
        </Button>
      </div>

      {showGenerateOutfitModalForIndex !== null && (
        <CharacterOutfitGenerateModal
          isOpen={showGenerateOutfitModalForIndex !== null}
          onClose={() => setShowGenerateOutfitModalForIndex(null)}
          characterId={characterId}
          outfitId={outfits[showGenerateOutfitModalForIndex].id}
        />
      )}
      {showGenerateEmotionsModalForIndex !== null && (
        <CharacterOutfitEmotionsGenerateModal
          isOpen={showGenerateEmotionsModalForIndex !== null}
          onClose={() => setShowGenerateEmotionsModalForIndex(null)}
          characterId={characterId}
          outfitId={outfits[showGenerateEmotionsModalForIndex].id}
        />
      )}
    </div>
  );
}
