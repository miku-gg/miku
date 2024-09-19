import { Loader, Modal, Tooltip } from '@mikugg/ui-kit';
import CryptoJS from 'crypto-js';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import React, { useState } from 'react';

import { FaCheck, FaClipboard } from 'react-icons/fa';
import { v4 as randomUUID } from 'uuid';
import { useAppContext } from '../../App.context';
import { setDeviceExportModal } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';

import { IoIosCloseCircleOutline } from 'react-icons/io';
import { toast } from 'react-toastify';
import './DeviceExport.scss';
import { uploadNarration } from '../../libs/platformAPI';

function stringToBase64(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let base64 = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new Uint8Array(data);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  // Remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += chars[a] + chars[b] + '==';
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += chars[a] + chars[b] + chars[c] + '=';
  }

  return base64;
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
  const { isProduction, apiEndpoint } = useAppContext();

  const getEncryptedJson = (): {
    encryptionKey: string;
    encryptedData: string;
  } => {
    const clonedState = JSON.parse(JSON.stringify(state));
    clonedState.settings.modals.history = false;
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
      setQR({
        loading: false,
        value: qrValue,
        copied: false,
        expirationDate: uploadResult?.expiration || Date.now(),
      });
    } catch (error) {
      setQR({ ...QR, loading: false });
      dispatch(setDeviceExportModal(false));
      toast.error('Error encrypting narration');
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(QR.value || '');
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

  if (!isProduction) return null;
  return (
    <>
      <button
        data-tooltip-id="device-export-tooltip"
        data-tooltip-content={
          isPremium
            ? 'Export this narration to other device'
            : 'Export to other devices is only available for premium members'
        }
        className={`deviceExport__button ${!isPremium ? 'disabled-export' : ''}`}
        onClick={handleExport}
        disabled={!isPremium}
      >
        Export narration
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
          </div>
        )}
      </Modal>
    </>
  );
};
