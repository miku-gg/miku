import { useState } from 'react';
import { Modal, Input, Button, Loader } from '@mikugg/ui-kit';
import sdPromptImprover, { poses } from '../../libs/sdPromptImprover';
import apiClient from '../../libs/imageInferenceAPI';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { addPendingInference } from '../../state/slices/novelFormSlice';
import { LuExternalLink } from 'react-icons/lu';
import { BsStars } from 'react-icons/bs';
import { consumeCredits } from '../../state/slices/userSlice';
import { PiCoinsLight } from 'react-icons/pi';

export interface CharacterOutfitGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  outfitId: string;
}

/**
 * Allows user to enter a brief description, then:
 * 1) uses prompt improver to create prompt
 * 2) calls startInference
 * 3) dispatches to pendingInferences
 */
export default function CharacterOutfitGenerateModal({
  isOpen,
  onClose,
  characterId,
  outfitId,
}: CharacterOutfitGenerateModalProps) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const characterPrice = useAppSelector((state) => state.user.pricing.character);
  const userCredits = useAppSelector((state) => state.user.user?.credits || 0);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      // 1) Generate prompt
      const res = await sdPromptImprover.generatePrompt(description);
      if (!res.success) {
        toast.error(`Prompt creation failed: ${res.error}`);
        setIsLoading(false);
        return;
      }
      const finalPrompt = res.prompt;
      const seed = Math.random().toString(36).substring(2, 15);

      // 2) Call startInference
      const inferenceIdRes = await apiClient.startInference({
        workflowId: 'character_pose', // or whichever workflow
        prompt: finalPrompt || '',
        step: 'GEN',
        openposeImageHash: poses[res.components?.pose || ''] || 'pose2.jpg',
        referenceImageWeight: 0,
        seed,
        modelToUse: 1,
      });

      toast.info(`Inference started!`);
      // 3) Notify store that we have a pending inference
      dispatch(
        addPendingInference({
          inferenceId: inferenceIdRes.data,
          characterId,
          outfitId,
          inferenceType: 'character',
          prompt: finalPrompt || '',
          headPrompt: res.components?.character_head,
          seed,
          modelToUse: 1,
        }),
      );
      dispatch(consumeCredits('character'));
      setIsLoading(false);
      setDescription('');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Error starting inference');
      setIsLoading(false);
    }
  };

  return (
    <Modal opened={isOpen} onCloseModal={onClose} title="Generate Outfit with AI">
      <div style={{ padding: '1rem' }}>
        <div>
          <label>Brief Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeHolder="e.g. a stealthy hacker outfit with a futuristic vibe"
          />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative' }}>
            <Button theme="gradient" onClick={handleGenerate} disabled={isLoading || characterPrice > userCredits}>
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <BsStars />
                  Generate with AI
                </>
              )}
            </Button>
            <div style={{ fontSize: '0.7rem', color: 'gold', position: 'absolute', bottom: -17, right: 5 }}>
              <PiCoinsLight /> {characterPrice} credits
            </div>
          </div>
          <a href="https://emotions.miku.gg" target="_blank">
            <Button theme="transparent">
              <LuExternalLink /> Go to Library
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
