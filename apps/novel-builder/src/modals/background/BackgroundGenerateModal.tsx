import { useState } from 'react';
import { Modal, Input, Button, Loader } from '@mikugg/ui-kit';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { addBackground, addPendingInference } from '../../state/slices/novelFormSlice';
import apiClient from '../../libs/imageInferenceAPI';
import { v4 as randomUUID } from 'uuid';
import { LuExternalLink } from 'react-icons/lu';
import { BsStars } from 'react-icons/bs';
import { consumeCredits } from '../../state/slices/userSlice';
import { PiCoinsLight } from 'react-icons/pi';

export interface BackgroundGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundId?: string; // Optional - if we're updating an existing background
}

export default function BackgroundGenerateModal({ isOpen, onClose, backgroundId }: BackgroundGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const backgroundPrice = useAppSelector((state) => state.user.pricing.background);
  const userCredits = useAppSelector((state) => state.user.user?.credits || 0);
  const background = useAppSelector((state) =>
    backgroundId ? state.novel.backgrounds.find((bg) => bg.id === backgroundId) : null,
  );

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const seed = Math.floor(Math.random() * 1000000000).toString();

      // Create a new background ID if needed
      const id = backgroundId || randomUUID();

      // If we don't have an existing background, create one
      if (!backgroundId) {
        dispatch(
          addBackground({
            id,
            name: prompt.substring(0, 30),
            description: prompt,
            attributes: [],
            source: { jpg: '', mp4: '' },
          }),
        );
      }

      // Call startInference
      const inferenceIdRes = await apiClient.startInference({
        workflowId: 'backgrounds',
        prompt: prompt,
        step: 'GEN',
        seed,
        modelToUse: 1,
      });

      toast.info(`Background generation started!`);

      // Notify store about pending inference
      dispatch(
        addPendingInference({
          inferenceId: inferenceIdRes.data,
          backgroundId: id,
          inferenceType: 'background',
          prompt,
          seed,
          modelToUse: 1,
        }),
      );

      dispatch(consumeCredits('background'));
      setIsLoading(false);
      setPrompt('');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Error starting inference');
      setIsLoading(false);
    }
  };

  return (
    <Modal opened={isOpen} onCloseModal={onClose} title="Generate Background with AI">
      <div style={{ padding: '1rem' }}>
        <div>
          <label>Background Description</label>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeHolder="e.g. cyberpunk city streets at night with neon lights"
          />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative' }}>
            <Button
              theme="gradient"
              onClick={handleGenerate}
              disabled={isLoading || !prompt || backgroundPrice > userCredits}
            >
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
              <PiCoinsLight /> {backgroundPrice} credits
            </div>
          </div>
          <a href="https://emotions.miku.gg/backgrounds" target="_blank">
            <Button theme="transparent">
              <LuExternalLink /> Go to Library
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
