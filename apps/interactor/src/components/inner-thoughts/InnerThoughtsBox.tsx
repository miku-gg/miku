import React, { useState, useRef } from 'react';
import TTSPlayer from '../chat-box/TTSPlayer';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { FaPencil, FaCheck } from 'react-icons/fa6';
import { FaTimes, FaTrash } from 'react-icons/fa';
import './InnerThoughtsBox.scss';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { updateResponse } from '../../state/slices/narrationSlice';

interface InnerThoughtsBoxProps {
  isVisible: boolean;
  thoughts: string;
  onClose?: () => void;
  className?: string;
}

const InnerThoughtsBox: React.FC<InnerThoughtsBoxProps> = ({ isVisible, thoughts, onClose, className = '' }) => {
  const dispatch = useAppDispatch();
  const characterId = useAppSelector((state) => state.settings.modals.innerThoughts?.characterId || '');
  const lastResponse = useAppSelector((state) => state.narration.responses[state.narration.currentResponseId]);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(thoughts);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (characterId && lastResponse) {
      dispatch(
        updateResponse({
          id: lastResponse.id,
          characterId,
          text: lastResponse.characters.find((c) => c.characterId === characterId)?.text || '',
          emotion: lastResponse.characters.find((c) => c.characterId === characterId)?.emotion || '',
          innerThoughts: editText,
        }),
      );
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditText(thoughts);
    setIsEditing(false);
  };

  const handleClearClick = () => {
    setEditText('');
  };

  if (!isVisible) return null;
  return (
    <div className={`InnerThoughtsBox ${className}`}>
      <div className="InnerThoughtsBox__container">
        <div className="InnerThoughtsBox__header">
          <div className="InnerThoughtsBox__left-actions">
            {isEditing ? (
              <>
                <button
                  className="InnerThoughtsBox__save-button"
                  onClick={handleSaveClick}
                  aria-label="Save inner thoughts"
                >
                  <FaCheck />
                  <span className="InnerThoughtsBox__action-text">Save</span>
                </button>
                <button
                  className="InnerThoughtsBox__cancel-button"
                  onClick={handleCancelClick}
                  aria-label="Cancel editing"
                >
                  <FaTimes />
                  <span className="InnerThoughtsBox__action-text">Cancel</span>
                </button>
                <button
                  className="InnerThoughtsBox__clear-button"
                  onClick={handleClearClick}
                  aria-label="Clear inner thoughts"
                >
                  <FaTrash />
                  <span className="InnerThoughtsBox__action-text">Clear</span>
                </button>
              </>
            ) : (
              <>
                <TTSPlayer text={thoughts} />
                {thoughts && characterId && (
                  <button
                    className="InnerThoughtsBox__edit-button"
                    onClick={handleEditClick}
                    aria-label="Edit inner thoughts"
                  >
                    <FaPencil />
                    <span className="InnerThoughtsBox__action-text">Edit</span>
                  </button>
                )}
              </>
            )}
          </div>
          <div className="InnerThoughtsBox__right-actions">
            {onClose && (
              <IoIosCloseCircleOutline
                className="InnerThoughtsBox__close-button"
                onClick={onClose}
                aria-label="Close inner thoughts"
              />
            )}
          </div>
        </div>
        <div className="InnerThoughtsBox__body">
          <div className="InnerThoughtsBox__bg"></div>
          <div className="InnerThoughtsBox__content">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                className="InnerThoughtsBox__editor"
                value={editText}
                onChange={handleTextareaChange}
                placeholder="Enter inner thoughts..."
                autoFocus
              />
            ) : !thoughts ? (
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
