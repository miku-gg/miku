import React from 'react';
import { createPortal } from 'react-dom';
import TTSPlayer from '../chat-box/TTSPlayer';
import './InnerThoughtsBox.scss';

interface InnerThoughtsBoxProps {
  isVisible: boolean;
  thoughts: string[];
  onClose: () => void;
  characterName?: string;
  className?: string;
}

const InnerThoughtsBox: React.FC<InnerThoughtsBoxProps> = ({
  isVisible,
  thoughts,
  onClose,
  characterName,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  const modalContent = (
    <div className={`InnerThoughtsBox ${className} ${isVisible ? 'InnerThoughtsBox--visible' : 'InnerThoughtsBox--hidden'}`}>
      <div className="InnerThoughtsBox__overlay" onClick={onClose} />
      <div 
        className={`InnerThoughtsBox__container ${isAnimating ? 'InnerThoughtsBox__container--visible' : ''}`}
      >
        <div className="InnerThoughtsBox__header">
          <h3 className="InnerThoughtsBox__title">
            {characterName ? `${characterName}'s Inner Thoughts` : 'Inner Thoughts'}
          </h3>
          <div className="InnerThoughtsBox__header-actions">
            <TTSPlayer />
            <button 
              className="InnerThoughtsBox__close-button"
              onClick={onClose}
              aria-label="Close inner thoughts"
            >
            </button>
          </div>
        </div>
        
        <div className="InnerThoughtsBox__content">
          {thoughts.length === 0 ? (
            <p className="InnerThoughtsBox__empty">This is a test message for the inner thoughts text-to-speech feature.</p>
          ) : (
            <div className="InnerThoughtsBox__thoughts-text">
              {thoughts.join(' ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render using portal to ensure it's always on top
  return createPortal(modalContent, document.body);
};

export default InnerThoughtsBox;
