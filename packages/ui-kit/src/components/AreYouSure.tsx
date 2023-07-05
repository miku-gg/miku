import React from 'react';

import { DashIcon } from '../assets/svg';
import Button from './Button';
import TextHeading from './TextHeading';

import './AreYouSure.scss';

interface AreYouSureProps {
  cancelButtonLabel?: string;
  className?: string;
  onClose: () => void;
  onSubmit: () => void;
  confirmButtonLabel?: string;
  isShowingPupUp: boolean;
  modalMessage: string;
}

const AreYouSure = ({
  cancelButtonLabel = 'Cancel',
  className = '',
  onClose,
  onSubmit,
  confirmButtonLabel = 'Confirm',
  isShowingPupUp,
  modalMessage,
}: AreYouSureProps) => {
  return (
    <>
      {isShowingPupUp && (
        <div className="AreYouSure__background ">
          <div className={`AreYouSure__modal ${className}`}>
            <div className="AreYouSure__closeContainer">
              <button className="AreYouSure__closeButton" onClick={onClose}>
                <DashIcon />
              </button>
            </div>
            <TextHeading size="h2">{modalMessage}</TextHeading>
            <div className="AreYouSure__buttonsContainer">
              <Button theme="gradient" onClick={onSubmit}>
                {confirmButtonLabel}
              </Button>
              <Button theme="transparent" onClick={onClose}>
                {cancelButtonLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AreYouSure;
