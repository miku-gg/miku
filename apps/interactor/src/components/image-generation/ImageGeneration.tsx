import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { MdCameraAlt } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import classNames from 'classnames';
import { useAppSelector } from '../../state/store';
import { Button, Loader, Modal, Carousel } from '@mikugg/ui-kit';
import { useI18n } from '../../libs/i18n';
import { selectTokensCount } from '../../state/selectors';
import './ImageGeneration.scss';

export default function ImageGeneration() {
  const [buttonOpened, setButtonOpened] = useState<boolean>(false);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string;
    url: string;
    prompt: string;
    timestamp: number;
  }>>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [prompt, setPrompt] = useState<string>('');
  const [showPromptEditor, setShowPromptEditor] = useState<boolean>(false);

  const { disabled } = useAppSelector((state) => state.narration.input);
  const currentTokens = useAppSelector((state) => selectTokensCount(state));

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setButtonOpened(false);
    },
  });

  const { i18n } = useI18n();

  useEffect(() => {
    // Always show button for testing
    setButtonOpened(true);
  }, []);

  const generateImagePrompt = async () => {
    // TODO: Implement LLM call to generate image prompt based on:
    // - current character emotion
    // - current story progression  
    // - current scene description
    return "A detailed scene showing the current state of the story with characters in their current emotional state";
  };

  const handleGenerateImage = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setModalOpened(true);

    try {
      const imagePrompt = await generateImagePrompt();
      setPrompt(imagePrompt);

      // TODO: Implement actual image generation API call
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate generated image
      const newImage = {
        id: `img_${Date.now()}`,
        url: '/images/placeholder.png', // TODO: Replace with actual generated image URL
        prompt: imagePrompt,
        timestamp: Date.now(),
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setSelectedImageIndex(0);

      // TODO: Show success notification
    } catch (error) {
      console.error('Failed to generate image:', error);
      // TODO: Show error notification
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCarouselChange = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <>
      <div className={classNames('ImageGeneration', !buttonOpened ? 'ImageGeneration--button-hidden' : '')}>
        <div className="ImageGeneration__button-container">
          {!disabled ? (
            <button
              {...swipeHandlers}
              className="ImageGeneration__button"
              onClick={handleGenerateImage}
              disabled={isGenerating}
            >
              <div className="ImageGeneration__text">
                <span>{i18n('generate_scene_image')}</span>
              </div>
              {isGenerating ? (
                <FaSpinner 
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              ) : (
                <MdCameraAlt />
              )}
            </button>
          ) : null}
        </div>
      </div>

      <Modal
        opened={modalOpened}
        onCloseModal={() => setModalOpened(false)}
        shouldCloseOnOverlayClick={!isGenerating}
      >
        <div className="ImageGenerationModal">
          <div className="ImageGenerationModal__header">
            <h2>{i18n('scene_image_generation')}</h2>
            <div className="ImageGenerationModal__tokens">
              <div className="ImageGenerationModal__tokens-amount">
                {i18n('tokens_used', [currentTokens.toString()])}
              </div>
            </div>
          </div>

          <div className="ImageGenerationModal__content">
            {isGenerating ? (
              <div className="ImageGenerationModal__loading">
                <Loader />
                <div className="ImageGenerationModal__loading-text">
                  {i18n('generating_image')}
                </div>
                <div className="ImageGenerationModal__loading-subtext">
                  {i18n('generating_at_1024x1024')}
                </div>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="ImageGenerationModal__results">
                {generatedImages.length > 1 && (
                  <Carousel
                    items={generatedImages.map((image, index) => ({
                      background: image.url,
                      title: `Image ${index + 1}`,
                    }))}
                    isImageCarousel={true}
                    selectedIndex={selectedImageIndex}
                    onClick={(index) => handleCarouselChange(index)}
                    showArrowButtons={true}
                    size="small"
                  />
                )}

                <div className="ImageGenerationModal__image-display">
                  <img
                    src={generatedImages[selectedImageIndex]?.url}
                    alt="Generated scene"
                    className="ImageGenerationModal__current-image"
                  />
                </div>

                <div className="ImageGenerationModal__prompt-actions">
                  <Button
                    theme="transparent"
                    onClick={() => setShowPromptEditor(!showPromptEditor)}
                  >
                    {showPromptEditor ? i18n('hide_prompt') : i18n('edit_prompt')}
                  </Button>
                </div>

                {showPromptEditor && (
                  <div className="ImageGenerationModal__prompt-section">
                    <div className="ImageGenerationModal__prompt-editor">
                      <textarea 
                        className="ImageGenerationModal__textarea scrollbar"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={i18n('enter_custom_prompt')}
                      />
                    </div>
                  </div>
                )}

                <div className="ImageGenerationModal__actions">
                  <Button
                    theme="gradient"
                    onClick={handleGenerateImage}
                  >
                    <MdCameraAlt />
                    {i18n('generate')}
                  </Button>
                </div>

              </div>
            ) : (
              <div className="ImageGenerationModal__empty">
                <div className="ImageGenerationModal__empty-icon">
                  <MdCameraAlt />
                </div>
                <h3>{i18n('no_images_generated')}</h3>
                <p>{i18n('generate_your_first_scene_image')}</p>
                
                <div className="ImageGenerationModal__prompt-actions">
                  <Button
                    theme="transparent"
                    onClick={() => setShowPromptEditor(!showPromptEditor)}
                  >
                    {showPromptEditor ? i18n('hide_prompt') : i18n('edit_prompt')}
                  </Button>
                </div>

                {showPromptEditor && (
                  <div className="ImageGenerationModal__prompt-section">
                    <div className="ImageGenerationModal__prompt-editor">
                      <textarea 
                        className="ImageGenerationModal__textarea scrollbar"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={i18n('enter_custom_prompt')}
                      />
                    </div>
                  </div>
                )}

                <Button
                  theme="gradient"
                  onClick={handleGenerateImage}
                >
                  <MdCameraAlt />
                  {i18n('generate')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
