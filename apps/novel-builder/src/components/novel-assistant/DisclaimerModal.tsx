import { Button, Modal } from '@mikugg/ui-kit';
import { HiSparkles } from 'react-icons/hi';
import { BiSolidError } from 'react-icons/bi';
import { MdOutlineTimer, MdPhotoCamera } from 'react-icons/md';
import './DisclaimerModal.scss';

interface DisclaimerModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ opened, onClose }: DisclaimerModalProps) {
  return (
    <Modal opened={opened} title="Assistant Disclaimer" shouldCloseOnOverlayClick={false} onCloseModal={onClose}>
      <div className="disclaimer-modal__content">
        <div className="disclaimer-modal__section disclaimer-modal__section--premium">
          <HiSparkles className="disclaimer-modal__icon" />
          <div className="disclaimer-modal__text-container">
            <h3 className="disclaimer-modal__title">Premium Feature</h3>
            <p className="disclaimer-modal__text">
              This feature is exclusively available for premium members at the moment. Please keep in mind that the
              assistant might NOT be available even for premium members in the future due to high costs.
            </p>
          </div>
        </div>

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
          <MdPhotoCamera className="disclaimer-modal__icon" />
          <div className="disclaimer-modal__text-container">
            <h3 className="disclaimer-modal__title">Text Only</h3>
            <p className="disclaimer-modal__text">
              The assistant can help with text content only. It cannot generate, modify, or manipulate images.
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