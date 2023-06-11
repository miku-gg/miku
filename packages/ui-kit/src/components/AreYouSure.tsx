import React from 'react';

import { CloseIcon } from '../assets/svg';
import Button from './Button';
import TextHeading from './TextHeading';

import './AreYouSure.scss';

interface AreYouSureProps {
  cancelButtonLabel?: string;
  className?: string;
  closePopUpFunction: () => void;
  confirmationFunction: () => void;
  confirmButtonLabel?: string;
  isShowingPupUp: boolean;
  modalMessage: string;
}

const AreYouSure = ({
  cancelButtonLabel = 'Cancel',
  className = '',
  closePopUpFunction,
  confirmationFunction,
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
              <button
                className="AreYouSure__closeButton"
                onClick={closePopUpFunction}
              >
                <CloseIcon />
              </button>
            </div>
            <TextHeading size="h2">{modalMessage}</TextHeading>
            <div className="AreYouSure__buttonsContainer">
              <Button theme="gradient" onClick={confirmationFunction}>
                {confirmButtonLabel}
              </Button>
              <Button theme="transparent" onClick={closePopUpFunction}>
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
