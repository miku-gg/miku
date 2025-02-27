import { Button, Modal } from '@mikugg/ui-kit';
import { BiSolidError } from 'react-icons/bi';
import { PiVideoCamera } from 'react-icons/pi';
import { MdOutlineTimer } from 'react-icons/md';
import './DisclaimerModal.scss';

interface DisclaimerModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ opened, onClose }: DisclaimerModalProps) {
  return (
    <Modal opened={opened} title="Assistant Disclaimer" shouldCloseOnOverlayClick={false} onCloseModal={onClose}>
      <div className="disclaimer-modal__content">
        <div className="disclaimer-modal__section disclaimer-modal__section--warning">
          <BiSolidError className="disclaimer-modal__icon" />
          <div className="disclaimer-modal__text-container">
            <h3 className="disclaimer-modal__title">Experimental Feature - Save Your Work</h3>
            <p className="disclaimer-modal__text">
              The assistant is highly experimental and may produce unexpected results. Always save your work before
              using it, as it might occasionally misunderstand context or provide suboptimal suggestions. While we
              strive for reliability, it's important to backup your content to prevent any potential data loss.
            </p>
          </div>
        </div>

        <div className="disclaimer-modal__section disclaimer-modal__section--info">
          <MdOutlineTimer className="disclaimer-modal__icon" />
          <div className="disclaimer-modal__text-container">
            <h3 className="disclaimer-modal__title">Usage Limits</h3>
            <p className="disclaimer-modal__text">
              Due to the significant computational costs involved, there are usage limits in place. Please use the
              assistant thoughtfully and efficiently.
            </p>
          </div>
        </div>

        <div className="disclaimer-modal__section disclaimer-modal__section--info">
          <PiVideoCamera className="disclaimer-modal__icon" />
          <div className="disclaimer-modal__text-container">
            <h3 className="disclaimer-modal__title">Moderated Content</h3>
            <p className="disclaimer-modal__text">
              We use an external service for the assistant. So the assistant may occasionally flag content as sensitive.
              Please be aware that the assistant may not always be able to generate content that is not flagged as
              sensitive.
            </p>
          </div>
        </div>

        <div className="disclaimer-modal__button-container">
          <Button onClick={onClose} theme="primary">
            I understand
          </Button>
        </div>
      </div>
    </Modal>
  );
}
