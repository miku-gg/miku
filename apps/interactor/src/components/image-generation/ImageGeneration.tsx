import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { MdCameraAlt } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import classNames from 'classnames';
import { useAppSelector } from '../../state/store';
import { Button, Loader, Modal, Carousel } from '@mikugg/ui-kit';
import { useI18n } from '../../libs/i18n';
import PromptBuilder from '../../libs/prompts/PromptBuilder';
import { ImageGenerationPromptStrategy } from '../../libs/prompts/strategies';
import { store } from '../../state/store';
import { selectTokensCount, selectLastLoadedCharacters } from '../../state/selectors';
import './ImageGeneration.scss';

export default function ImageGeneration() {
  const [buttonOpened, setButtonOpened] = useState<boolean>(false);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<
    Array<{
      id: string;
      url: string;
      prompt: string;
      timestamp: number;
    }>
  >([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [prompt, setPrompt] = useState<string>('');
  const [showPromptEditor, setShowPromptEditor] = useState<boolean>(false);
  // basePromptTemplate is no longer used after in-place recomposition; removing it

  const { disabled } = useAppSelector((state) => state.narration.input);
  const currentTokens = useAppSelector((state) => selectTokensCount(state));
  const lastCharacters = useAppSelector((state) => selectLastLoadedCharacters(state));

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

  const extractEditableScene = (template: string): string => {
    const label = 'Current scene setting:';
    const nextLabel = 'Characters and visible emotions:';
    const startIndex = template.indexOf(label);
    if (startIndex === -1) return '';
    const after = template.slice(startIndex + label.length);
    const candidates = [after.indexOf(nextLabel), after.indexOf('\n'), after.indexOf('<|im_end|>')].filter(
      (i) => i >= 0,
    );
    const endOffset = candidates.length ? Math.min(...candidates) : after.length;
    return after.slice(0, endOffset).trim();
  };

  const composeFinalPrompt = (template: string, newScene: string): string => {
    const label = 'Current scene setting:';
    const nextLabel = 'Characters and visible emotions:';
    const startIndex = template.indexOf(label);
    if (startIndex === -1) return template;
    const before = template.slice(0, startIndex + label.length);
    const afterAll = template.slice(startIndex + label.length);
    const nextIdxCandidates = [
      afterAll.indexOf(nextLabel),
      afterAll.indexOf('\n'),
      afterAll.indexOf('<|im_end|>'),
    ].filter((i) => i >= 0);
    const endIdx = nextIdxCandidates.length ? Math.min(...nextIdxCandidates) : afterAll.length;
    const after = afterAll.slice(endIdx);
    return `${before} ${newScene}${after}`;
  };

  const generateImagePrompt = async () => {
    const strategy = new ImageGenerationPromptStrategy('chatml', 'en');
    const builder = new PromptBuilder({ strategy, truncationLength: 2048, maxNewTokens: 256 });
    const { template } = builder.buildPrompt({ state: store.getState() }, 50);
    return template;
  };

  const pollImageStatus = async (inferenceId: string): Promise<string[]> => {
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.miku.gg/inferences/statuses?inferenceIds[]=${inferenceId}`);
        const data = await response.json();

        if (data[0]?.status?.status === 'done') {
          return data[0].status.result;
        }

        if (data[0]?.status?.status === 'failed') {
          throw new Error('Image generation failed');
        }

        // Wait 5 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('Error polling image status:', error);
        throw error;
      }
    }

    throw new Error('Image generation timed out');
  };

  const handleGenerateImage = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setModalOpened(true);

    try {
      const template = await generateImagePrompt();
      const editable = extractEditableScene(template);
      if (!prompt) setPrompt(editable);

      const selectedCharacter = lastCharacters.find((c) => c.selected) || lastCharacters[0];
      const referenceImageHash = (selectedCharacter?.image || '').split('/').pop() || '';

      const finalPrompt = composeFinalPrompt(template, prompt || editable)
        .replace(/\s+/g, ' ')
        .trim();

      const response = await fetch('https://api.miku.gg/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: 'character_reference',
          prompt: finalPrompt,
          step: 'GEN',
          referenceImageWeight: 1,
          referenceImageHash,
          width: 1024,
          height: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const inferenceId = await response.text();

      const imageHashes = await pollImageStatus(inferenceId);

      if (imageHashes.length === 0) {
        throw new Error('No images generated');
      }

      const newImages = imageHashes.map((hash, index) => ({
        id: `img_${Date.now()}_${index}`,
        url: `https://api.miku.gg/images/${hash}`,
        prompt: finalPrompt,
        timestamp: Date.now(),
      }));

      setGeneratedImages((prev) => [...newImages, ...prev]);
      setSelectedImageIndex(0);
      setModalOpened(true);

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
              {isGenerating ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <MdCameraAlt />}
            </button>
          ) : null}
        </div>
      </div>

      <Modal opened={modalOpened} onCloseModal={() => setModalOpened(false)} shouldCloseOnOverlayClick={!isGenerating}>
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
                <div className="ImageGenerationModal__loading-text">{i18n('generating_image')}</div>
                <div className="ImageGenerationModal__loading-subtext">{i18n('generating_at_1024x1024')}</div>
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
                  <Button theme="transparent" onClick={() => setShowPromptEditor(!showPromptEditor)}>
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
                  <Button theme="gradient" onClick={handleGenerateImage}>
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
                  <Button theme="transparent" onClick={() => setShowPromptEditor(!showPromptEditor)}>
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

                <Button theme="gradient" onClick={handleGenerateImage}>
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
