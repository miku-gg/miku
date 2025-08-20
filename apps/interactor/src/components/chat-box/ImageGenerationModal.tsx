import React, { useState } from 'react';
import { Modal, Button } from '@mikugg/ui-kit';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectLastLoadedCharacters } from '../../state/selectors';
import {
  imageGenerationStart,
  imageGenerationSuccess,
  imageGenerationFailure,
} from '../../state/slices/narrationSlice';
import { useAppContext } from '../../App.context';
import { Loader } from '../common/Loader';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PromptBuilder from '../../libs/prompts/PromptBuilder';
import { ImageGenerationPromptStrategy } from '../../libs/prompts/strategies/image/ImageGenerationPromptStrategy';
import textCompletion from '../../libs/textCompletion';
import { retrieveModelMetadata } from '../../libs/retrieveMetadata';
import './ImageGenerationModal.scss';

interface ImageGenerationModalProps {
  opened: boolean;
  onClose: () => void;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({ opened, onClose }) => {
  const dispatch = useAppDispatch();
  const { servicesEndpoint } = useAppContext();
  const state = useAppSelector((state) => state);
  const currentCharacters = useAppSelector(selectLastLoadedCharacters);
  const currentResponse = useAppSelector((state) => state.narration.responses[state.narration.currentResponseId]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const existingImages = currentResponse?.generatedImages || [];
  const hasImages = existingImages.length > 0;
  const currentImage = existingImages[currentImageIndex];

  const handleGenerateImage = async () => {
    if (!currentResponse) {
      toast.error('No current response found');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate prompt using ImageGenerationPromptStrategy
      const modelMetadata = await retrieveModelMetadata(servicesEndpoint, state.settings.model);
      const promptBuilder = new PromptBuilder<ImageGenerationPromptStrategy>({
        maxNewTokens: 150,
        strategy: new ImageGenerationPromptStrategy(modelMetadata.strategy),
        truncationLength: 4096,
      });

      const prompt = promptBuilder.buildPrompt(state, 50);
      const stream = textCompletion({
        template: prompt.template,
        variables: prompt.variables,
        model: state.settings.model,
        serviceBaseUrl: servicesEndpoint,
        identifier: `image-gen-${Date.now()}`,
      });

      let generatedPrompt = '';
      for await (const result of stream) {
        generatedPrompt = promptBuilder.completeResponse(state, '', result);
      }

      if (!generatedPrompt) {
        throw new Error('Failed to generate image prompt');
      }

      // Get current character image path
      const currentCharacter = currentCharacters[0];
      const characterImagePath = currentCharacter?.image || '';

      // Start image generation in Redux
      dispatch(
        imageGenerationStart({
          responseId: currentResponse.id,
          prompt: generatedPrompt,
          characterImagePath: characterImagePath,
        }),
      );

      // Call actual image generation API endpoint
      const response = await fetch(`${servicesEndpoint}/image/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatedPrompt,
          characterImagePath: characterImagePath,
          aspectRatio: '16:9',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const newImageId = currentResponse.generatedImages?.[currentResponse.generatedImages.length - 1]?.id;

      if (newImageId && result.imageUrl) {
        dispatch(
          imageGenerationSuccess({
            responseId: currentResponse.id,
            imageId: newImageId,
            imageUrl: result.imageUrl,
          }),
        );
        setCurrentImageIndex(existingImages.length); // Show the new image
      } else {
        throw new Error('Invalid API response');
      }

      setIsGenerating(false);
    } catch (error) {
      console.error('Image generation failed:', error);
      toast.error('Failed to generate image');
      setIsGenerating(false);

      if (currentResponse.generatedImages && currentResponse.generatedImages.length > 0) {
        const lastImageId = currentResponse.generatedImages[currentResponse.generatedImages.length - 1].id;
        dispatch(
          imageGenerationFailure({
            responseId: currentResponse.id,
            imageId: lastImageId,
          }),
        );
      }
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : existingImages.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < existingImages.length - 1 ? prev + 1 : 0));
  };

  const handleRegenerateImage = () => {
    handleGenerateImage();
  };

  return (
    <Modal
      opened={opened}
      onCloseModal={onClose}
      className="ImageGenerationModal"
      title="Scene Image"
      shouldCloseOnOverlayClick
    >
      <div className="ImageGenerationModal__content">
        {!hasImages && !isGenerating ? (
          <div className="ImageGenerationModal__empty">
            <h3>Create Image of Current State</h3>
            <p>Generate a cinematic image of the current scene and characters.</p>
            <Button onClick={handleGenerateImage} disabled={isGenerating}>
              Generate Image
            </Button>
          </div>
        ) : (
          <div className="ImageGenerationModal__images">
            {hasImages && (
              <div className="ImageGenerationModal__carousel">
                <div className="ImageGenerationModal__image-container">
                  {currentImage?.status === 'generating' ? (
                    <div className="ImageGenerationModal__loading">
                      <Loader />
                      <p>Generating image...</p>
                    </div>
                  ) : currentImage?.status === 'failed' ? (
                    <div className="ImageGenerationModal__error">
                      <p>Failed to generate image</p>
                      <Button onClick={handleRegenerateImage}>
                        <FaRedo /> Retry
                      </Button>
                    </div>
                  ) : currentImage ? (
                    <img
                      src={currentImage.imageUrl}
                      alt={currentImage.prompt}
                      className="ImageGenerationModal__image"
                    />
                  ) : null}
                </div>

                {existingImages.length > 1 && (
                  <div className="ImageGenerationModal__controls">
                    <Button onClick={handlePreviousImage} theme="transparent">
                      <BsArrowLeft />
                    </Button>
                    <span className="ImageGenerationModal__counter">
                      {currentImageIndex + 1} / {existingImages.length}
                    </span>
                    <Button onClick={handleNextImage} theme="transparent">
                      <BsArrowRight />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="ImageGenerationModal__actions">
              <Button onClick={handleRegenerateImage} disabled={isGenerating}>
                <FaRedo /> Generate New Image
              </Button>
            </div>
          </div>
        )}

        {isGenerating && hasImages && (
          <div className="ImageGenerationModal__generating">
            <Loader />
            <p>Generating new image...</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageGenerationModal;
