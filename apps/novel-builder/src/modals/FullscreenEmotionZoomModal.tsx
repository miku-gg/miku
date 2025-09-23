import { Modal } from '@mikugg/ui-kit';
import './FullscreenEmotionZoomModal.scss';

export interface FullscreenEmotionZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  emotionName?: string;
  characterName?: string;
}

export default function FullscreenEmotionZoomModal({
  isOpen,
  onClose,
  imageUrl,
  emotionName,
  characterName,
}: FullscreenEmotionZoomModalProps) {
  const title = characterName && emotionName 
    ? `${characterName} - ${emotionName}` 
    : characterName 
    ? characterName 
    : 'Fullscreen Emotion';

  return (
    <Modal
      opened={isOpen}
      className="FullscreenEmotionZoomModal"
      title={title}
      shouldCloseOnOverlayClick
      onCloseModal={onClose}
    >
      <div className="FullscreenEmotionZoomModal__image-container">
        <img
          src={imageUrl}
          alt={emotionName ? `${characterName} ${emotionName} emotion` : 'Character emotion'}
          className="FullscreenEmotionZoomModal__image"
        />
      </div>
    </Modal>
  );
}