import React from 'react';
import TTSPlayer from '../chat-box/TTSPlayer';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import './InnerThoughtsBox.scss';

interface InnerThoughtsBoxProps {
  isVisible: boolean;
  thoughts: string;
  onClose?: () => void;
  className?: string;
}

const InnerThoughtsBox: React.FC<InnerThoughtsBoxProps> = ({ isVisible, thoughts, onClose, className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`InnerThoughtsBox ${className}`}>
      <div className="InnerThoughtsBox__container">
        <div className="InnerThoughtsBox__header">
          <TTSPlayer text={thoughts || undefined} />
          {onClose && (
            <IoIosCloseCircleOutline
              className="InnerThoughtsBox__close-button"
              onClick={onClose}
              aria-label="Close inner thoughts"
            />
          )}
        </div>
        <div className="InnerThoughtsBox__body">
          <div className="InnerThoughtsBox__bg"></div>
          <div className="InnerThoughtsBox__content">
            {!thoughts ? (
              <p className="InnerThoughtsBox__empty">No thoughts generated.</p>
            ) : (
              <div className="InnerThoughtsBox__thoughts-text">{thoughts}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InnerThoughtsBox;
