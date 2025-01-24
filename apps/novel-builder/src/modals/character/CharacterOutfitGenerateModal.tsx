import React, { useState } from 'react';
import { Modal, Input, Button, Loader } from '@mikugg/ui-kit';
import sdPromptImprover from '../../libs/sdPromptImprover';
import apiClient from '../../libs/imageInferenceAPI';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../state/store';
import { addPendingInference } from '../../state/slices/novelFormSlice';

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

      // 2) Call startInference
      const inferenceIdRes = await apiClient.startInference({
        workflowId: 'character_pose', // or whichever workflow
        prompt: finalPrompt || '',
        step: 'GEN',
        openposeImageHash: 'pose2.png',
        referenceImageWeight: 0,
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
        }),
      );
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
        <div style={{ marginTop: '1rem' }}>
          <Button theme="primary" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <Loader /> : 'Generate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
