import React, { createContext, useContext, useState, useCallback } from 'react';
import Button from './Button';
import Loader from './Loader';
import Modal from './Modal';
import './AreYouSure.scss';
export interface AreYouSureSettings {
  title?: string;
  description?: React.ReactNode;
  yesLabel?: string;
  noLabel?: string;
  onNo?: () => void;
  onYes: () => Promise<void> | void;
}

const DEFAULT_ARE_YOU_SURE_SETTINGS: AreYouSureSettings = {
  title: 'Are you sure?',
  description: '',
  yesLabel: 'Yes',
  noLabel: 'Cancel',
  onYes: () => {},
  onNo: () => {},
};

interface AreYouSureContextProps {
  isOpen: boolean;
  openModal: (settings: AreYouSureSettings) => void;
  closeModal: () => void;
}

const AreYouSureContext = createContext<AreYouSureContextProps | undefined>(undefined);

export const useAreYouSure = (): AreYouSureContextProps => {
  const context = useContext(AreYouSureContext);
  if (!context) {
    throw new Error('useAreYouSure must be used within an AreYouSureProvider');
  }
  return context;
};

interface AreYouSureProviderProps {
  children: React.ReactNode;
}

export const AreYouSureProvider: React.FC<AreYouSureProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<AreYouSureSettings>();
  const [loadingOnYes, setLoadingOnYes] = useState<boolean>(false);

  const openModal = useCallback((settings: AreYouSureSettings) => {
    setIsOpen(true);
    setSettings({
      ...DEFAULT_ARE_YOU_SURE_SETTINGS,
      ...settings,
    });
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AreYouSureContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <Modal opened={isOpen} onCloseModal={closeModal} shouldCloseOnOverlayClick title={settings?.title}>
        <p className="AreYouSure__description">{settings?.description || ''}</p>
        <div className="AreYouSure__actions">
          <Button
            theme="transparent"
            onClick={() => {
              settings?.onNo && settings.onNo();
              closeModal();
            }}
          >
            {settings?.noLabel || ''}
          </Button>
          <Button
            theme={loadingOnYes ? 'transparent' : 'primary'}
            disabled={loadingOnYes}
            onClick={async () => {
              try {
                setLoadingOnYes(true);
                await settings?.onYes();
                setLoadingOnYes(false);
                closeModal();
              } catch (error) {
                console.error(error);
                setLoadingOnYes(false);
              }
            }}
          >
            {!loadingOnYes ? settings?.yesLabel || '' : <Loader />}
          </Button>
        </div>
      </Modal>
    </AreYouSureContext.Provider>
  );
};
