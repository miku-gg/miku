import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { getPromptForEmotion } from '../../libs/sdPromptImprover';
import { addPendingInference, updateCharacter } from '../../state/slices/novelFormSlice';
import config from '../../config';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { emotionTemplates } from '../../data/emotions';
import apiClient from '../../libs/imageInferenceAPI';
import './CharacterOutfitEmotionsGenerateModal.scss';
import { BsStars } from 'react-icons/bs';
import { consumeCredits } from '../../state/slices/userSlice';
import { PiCoinsLight } from 'react-icons/pi';

export interface CharacterOutfitEmotionsGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  outfitId: string;
}

export default function CharacterOutfitEmotionsGenerateModal({
  isOpen,
  onClose,
  characterId,
  outfitId,
}: CharacterOutfitEmotionsGenerateModalProps) {
  const dispatch = useAppDispatch();
  const [headPrompt, setHeadPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Find the character / outfit
  const character = useAppSelector((state) => state.novel.characters.find((c) => c.id === characterId));
  const userCredits = useAppSelector((state) => state.user.user?.credits || 0);
  const totalPrice = useAppSelector((state) => state.user.pricing.emotion * 9);
  if (!character) return null;

  const outfits = character.card.data.extensions.mikugg_v2?.outfits || [];
  const outfitIndex = outfits.findIndex((o) => o.id === outfitId);
  if (outfitIndex < 0) return null;

  const outfit = outfits[outfitIndex];
  // We'll assume 'neutral' must exist.
  const neutralEmotion = outfit.emotions.find((e) => e.id === 'neutral');
  const neutralImageHash = neutralEmotion?.sources.png || '';
  const neutralImageURL = config.genAssetLink(neutralImageHash, AssetDisplayPrefix.EMOTION_IMAGE);

  // UseEffect to set default headPrompt from generationData
  useEffect(() => {
    if (outfit.template === 'single-emotion' && outfit.generationData?.headPrompt && !headPrompt) {
      setHeadPrompt(outfit.generationData.headPrompt);
    }
  }, [outfit.template, outfit.generationData?.headPrompt, headPrompt]);

  // We'll generate for the 'tiny-emotions' set
  const tinyTemplate = emotionTemplates.find((t) => t.id === 'tiny-emotions');
  const emotionsToGenerate = tinyTemplate?.emotionIds || [];

  const handleGenerateAllEmotions = async () => {
    try {
      setIsLoading(true);

      // Update outfit to tiny-emotions + generationData
      const updatedOutfit = {
        ...outfit,
        template: 'tiny-emotions',
      };
      const newOutfits = [...outfits];
      newOutfits[outfitIndex] = updatedOutfit;

      dispatch(
        updateCharacter({
          ...character,
          card: {
            ...character.card,
            data: {
              ...character.card.data,
              extensions: {
                ...character.card.data.extensions,
                mikugg_v2: {
                  ...character.card.data.extensions.mikugg_v2,
                  outfits: newOutfits,
                },
              },
            },
          },
        }),
      );

      const originalGenerationData = updatedOutfit.generationData || {
        seed: Math.random().toString(36).substring(2, 15),
        modelToUse: 1,
        referenceImage: neutralImageHash,
        prompt: headPrompt,
        poseImage: neutralImageHash,
        headPrompt,
      };

      // Fire off an inference for each emotion
      await Promise.all(
        emotionsToGenerate.map(async (emotionId, index) => {
          const finalPrompt = getPromptForEmotion(emotionId, headPrompt);
          const res = await apiClient.startInference({
            workflowId: 'only_emotion',
            prompt: finalPrompt,
            step: 'EMOTION',
            referenceImageWeight: 0.6,
            referenceImageHash: neutralImageHash,
            renderedPoseImageHash: neutralImageHash,
            emotion: emotionId,
            seed: String(originalGenerationData.seed),
            modelToUse: originalGenerationData.modelToUse,
            emotionIndex: index,
          });

          // Track each inference
          dispatch(
            addPendingInference({
              inferenceId: res.data,
              characterId,
              outfitId,
              inferenceType: 'emotion',
              prompt: finalPrompt,
              headPrompt,
              emotionId,
              seed: originalGenerationData.seed,
              modelToUse: originalGenerationData.modelToUse,
              referenceImage: originalGenerationData.referenceImage,
            }),
          );
          dispatch(consumeCredits('emotion'));
        }),
      );

      setHeadPrompt('');
      onClose();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onCloseModal={onClose}
      title="Generate Multiple Emotions"
      hideCloseButton={false}
      shouldCloseOnOverlayClick
    >
      <div style={{ padding: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          <div>
            {neutralImageHash ? (
              <img src={neutralImageURL} alt="Neutral emotion preview" style={{ maxWidth: '128px' }} />
            ) : null}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.9rem' }}>
              This will create 9 new emotion images for the "tiny-emotions" set based on the single-emotion's neutral
              image.
            </div>
            <div style={{ fontSize: '0.9rem' }}>Provide a face prompt to avoid inconsistencies.</div>
            <Input
              label="Face Prompt"
              value={headPrompt}
              onChange={(e) => setHeadPrompt(e.target.value)}
              placeHolder="e.g. green eyes, red hair, etc."
            />
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
              <Button
                theme="gradient"
                onClick={handleGenerateAllEmotions}
                disabled={isLoading || !neutralImageHash || totalPrice > userCredits}
              >
                {isLoading ? (
                  'Generating...'
                ) : (
                  <>
                    <BsStars /> Generate All 9 Emotions
                  </>
                )}
              </Button>
              <div style={{ fontSize: '0.7rem', color: 'gold', position: 'absolute', bottom: -17, right: 5 }}>
                <PiCoinsLight /> {totalPrice} credits
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
