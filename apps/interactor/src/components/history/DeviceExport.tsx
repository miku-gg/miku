import { Loader, Modal, Tooltip } from '@mikugg/ui-kit';
import CryptoJS from 'crypto-js';
import { QRCodeCanvas } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { IoQrCode } from 'react-icons/io5';

import { FaCheck, FaClipboard } from 'react-icons/fa';
import { v4 as randomUUID } from 'uuid';
import { useAppContext } from '../../App.context';
import { setDeviceExportModal } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';

import { IoIosCloseCircleOutline } from 'react-icons/io';
import { toast } from 'react-toastify';
import './DeviceExport.scss';
import { uploadNarration } from '../../libs/platformAPI';
import { CustomEventType, postMessage } from '../../libs/stateEvents';

function stringToBase64(str: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
}

interface QRProps {
  value: string | null;
  expirationDate: number;
  loading: boolean;
  copied: boolean;
}

const intialQRState: QRProps = {
  value: null,
  expirationDate: Date.now(),
  loading: false,
  copied: false,
};

export const DeviceExport = (): React.ReactNode => {
  const dispatch = useAppDispatch();
  const [QR, setQR] = useState<QRProps>(intialQRState);
  const state = useAppSelector((state) => state);
  const { isPremium } = useAppSelector((state) => state.settings.user);
  const isModalOpen = useAppSelector((state) => state.settings.modals.deviceExport);
  const { isProduction, apiEndpoint, botId } = useAppContext();
  const [_, forceUpdate] = useState(0);

  const getEncryptedJson = (): {
    encryptionKey: string;
    encryptedData: string;
  } => {
    const clonedState = JSON.parse(JSON.stringify(state));
    clonedState.settings.modals.history = false;
    clonedState.botId = botId;
    const json = JSON.stringify(clonedState);
    const encryptionKey = randomUUID();
    const encryptedData: string = CryptoJS.AES.encrypt(json, encryptionKey).toString();
    return { encryptionKey, encryptedData };
  };

  const handleExport = async () => {
    dispatch(setDeviceExportModal(true));
    setQR((qr) => ({ ...qr, loading: true }));

    try {
      const { encryptedData, encryptionKey } = getEncryptedJson();
      const uploadResult = await uploadNarration(apiEndpoint, encryptedData);
      const qrValue = uploadResult?.filename ? stringToBase64(`${uploadResult.filename}#${encryptionKey}`) : null;
      console.log('uploadResult?.expiration', uploadResult?.expiration);
      console.log('Date.now()', Date.now());
      setQR({
        loading: false,
        value: qrValue,
        copied: false,
        expirationDate: uploadResult?.expiration ? new Date(uploadResult.expiration).getTime() : Date.now(),
      });
    } catch (error) {
      setQR({ ...QR, loading: false });
      dispatch(setDeviceExportModal(false));
      toast.error('Error encrypting narration');
    }
  };

  const handleCopyHash = () => {
    postMessage(CustomEventType.COPY_TO_CLIPBOARD, QR.value || '');
    setQR((qr) => ({ ...qr, copied: true }));
    toast.success('Key copied to clipboard');
    setTimeout(() => {
      setQR((qr) => ({ ...qr, copied: false }));
    }, 4000);
  };

  const handleCloseModal = () => {
    if (QR.loading) return undefined;
    setQR(intialQRState);
    dispatch(setDeviceExportModal(false));
  };
  const timeLeft = Math.floor((QR.expirationDate - Date.now()) / 1000 / 60);

  useEffect(() => {
    setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 60000);
  }, []);

  if (!isProduction) return null;
  return (
    <>
      <button
        data-tooltip-id="device-export-tooltip"
        data-tooltip-content={
          isPremium
            ? 'Export this narration to other device.'
            : 'Export to other devices is only available for premium members.'
        }
        className={`deviceExport__button ${!isPremium ? 'disabled-export' : ''}`}
        onClick={handleExport}
        disabled={!isPremium}
      >
        <IoQrCode />
      </button>
      <Tooltip id="device-export-tooltip" place="bottom" />
      <Modal className="deviceExport__modal" opened={isModalOpen} onCloseModal={handleCloseModal}>
        {QR.loading ? (
          <div className="deviceExport__loading">
            <Loader />
            <p>Encrypting narration as QR...</p>
          </div>
        ) : (
          <div className="deviceExport__container">
            <IoIosCloseCircleOutline onClick={handleCloseModal} size={20} className="deviceExport__container__close" />
            <div className="deviceExport__container__header">
              <h2>Export narration</h2>
              <p>Scan the QR code or copy the key to import this narration to another device.</p>
            </div>
            <div className="deviceExport__container__code">
              {/* eslint-disable-next-line */}
              {/* @ts-ignore */}
              <QRCodeCanvas
                size={256}
                bgColor="transparent"
                fgColor="#ffffff"
                value={QR.value || ''}
                imageSettings={{
                  src: '../../../public/images/logo.png',
                  x: undefined,
                  y: undefined,
                  height: 50,
                  width: 50,
                  opacity: 1,
                  excavate: true,
                }}
              />
            </div>
            <div className="deviceExport__container__hash">
              <p>{QR.value}</p>
              <button disabled={QR.copied} onClick={handleCopyHash}>
                {QR.copied ? <FaCheck color="#00ff33" /> : <FaClipboard />}
              </button>
            </div>
            <div className="deviceExport__container__expiration">
              {timeLeft > 0 ? `Expires in ${timeLeft} minutes` : 'Expired'}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
