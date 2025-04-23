import { useState } from 'react';
import { Modal, Input, Button, Loader } from '@mikugg/ui-kit';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { createNewInventoryItem, addPendingInference } from '../../state/slices/novelFormSlice';
import apiClient from '../../libs/imageInferenceAPI';
import { v4 as randomUUID } from 'uuid';
import { LuExternalLink } from 'react-icons/lu';
import { BsStars } from 'react-icons/bs';
import { consumeCredits } from '../../state/slices/userSlice';
import { PiCoinsLight } from 'react-icons/pi';

export interface ItemGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId?: string; // Optional - if we're updating an existing item
}

export default function ItemGenerateModal({ isOpen, onClose, itemId }: ItemGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const itemPrice = useAppSelector((state) => state.user.pricing.item);
  const userCredits = useAppSelector((state) => state.user.user?.credits || 0);
  const item = useAppSelector((state) =>
    itemId && state.novel.inventory ? state.novel.inventory.find((item) => item.id === itemId) : null,
  );

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const seed = Math.floor(Math.random() * 1000000000).toString();

      // Create a new item ID if needed
      const id = itemId || randomUUID();

      // If we don't have an existing item, create one
      if (!itemId) {
        dispatch(createNewInventoryItem({ itemId: id }));
      }

      // Call startInference
      const inferenceIdRes = await apiClient.startInference({
        workflowId: 'rpg_item',
        prompt: prompt,
        step: 'GEN',
        seed,
        modelToUse: 1,
      });

      toast.info(`Item generation started!`);

      // Notify store about pending inference
      dispatch(
        addPendingInference({
          inferenceId: inferenceIdRes.data,
          itemId: id,
          inferenceType: 'item',
          prompt,
          seed,
          modelToUse: 1,
        }),
      );

      dispatch(consumeCredits('item'));
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
    <Modal opened={isOpen} onCloseModal={onClose} title="Generate Item with AI">
      <div style={{ padding: '1rem' }}>
        <div>
          <label>Item Description</label>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeHolder="e.g. magical glowing orb with blue energy"
          />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative' }}>
            <Button
              theme="gradient"
              onClick={handleGenerate}
              disabled={isLoading || !prompt || itemPrice > userCredits}
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
              <PiCoinsLight /> {itemPrice} credits
            </div>
          </div>
          <a href="https://emotions.miku.gg/items" target="_blank">
            <Button theme="transparent">
              <LuExternalLink /> Go to Library
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
