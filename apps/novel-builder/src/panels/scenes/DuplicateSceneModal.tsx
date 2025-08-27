import React from 'react';
import { RiFileCopyLine, RiGitBranchLine } from 'react-icons/ri';
import './DuplicateSceneModal.scss';

interface DuplicateSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicateJustScene: () => void;
  onDuplicateWithBranches: () => void;
  position: { x: number; y: number };
}

export const DuplicateSceneModal: React.FC<DuplicateSceneModalProps> = ({
  isOpen,
  onClose,
  onDuplicateJustScene,
  onDuplicateWithBranches,
  position,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="DuplicateSceneModal__overlay" onClick={onClose} />
      <div
        className="DuplicateSceneModal"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="DuplicateSceneModal__options">
          <button
            className="DuplicateSceneModal__option"
            onClick={onDuplicateJustScene}
            title="Copy scene without connections"
          >
            <RiFileCopyLine className="DuplicateSceneModal__option-icon" />
            <span className="DuplicateSceneModal__option-title">Just Scene</span>
          </button>
          <button
            className="DuplicateSceneModal__option"
            onClick={onDuplicateWithBranches}
            title="Copy scene with parent connections"
          >
            <RiGitBranchLine className="DuplicateSceneModal__option-icon" />
            <span className="DuplicateSceneModal__option-title">With Branches</span>
          </button>
        </div>
      </div>
    </>
  );
};
