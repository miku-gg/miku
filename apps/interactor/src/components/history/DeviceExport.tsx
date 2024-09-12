import { Loader, Modal, Tooltip } from '@mikugg/ui-kit';
import CryptoJS from 'crypto-js';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { FaCheck, FaClipboard } from 'react-icons/fa';
import { v4 as randomUUID } from 'uuid';
import { useAppContext } from '../../App.context';
import { setDeviceExportModal } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';

import { IoIosCloseCircleOutline } from 'react-icons/io';
import { toast } from 'react-toastify';
import './DeviceExport.scss';

interface QRProps {
  id: string | null;
  loading: boolean;
  copied: boolean;
}

const intialQRState: QRProps = {
  id: null,
  loading: false,
  copied: false,
};

export const DeviceExport = () => {
  const dispatch = useAppDispatch();
  const [QR, setQR] = useState<QRProps>(intialQRState);
  const state = useAppSelector((state) => state);
  const { isPremium } = useAppSelector((state) => state.settings.user);
  const isModalOpen = useAppSelector((state) => state.settings.modals.deviceExport);
  const { isProduction, servicesEndpoint } = useAppContext();
  const userId = useAppSelector((state) => state.settings.user.id);
  if (!isProduction) return null;

  const getEncryptedJson = () => {
    const clonedState = JSON.parse(JSON.stringify(state));
    clonedState.settings.modals.history = false;
    const json = JSON.stringify(clonedState);
    const id = randomUUID();
    const encryptedData: string = CryptoJS.AES.encrypt(json, id).toString();
    return { id: id, data: encryptedData };
  };

  const handleUpload = async (encryptedData: { data: string; id: string }) => {
    const response = await fetch(`${servicesEndpoint}/user/save-narration`, {
      method: 'POST',
      body: JSON.stringify({
        id: `${userId}/${encryptedData.id}`,
        data: encryptedData.data,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    return json;
  };

  const handleExport = async () => {
    dispatch(setDeviceExportModal(true));
    setQR({ ...QR, loading: true });

    const json = getEncryptedJson();

    await handleUpload(json)
      .then((r) => {
        setQR({ ...QR, loading: false, id: r.id });

        toast.success('Data uploaded successfully');
      })
      .catch(() => {
        setQR({ ...QR, loading: false });
        dispatch(setDeviceExportModal(false));
        toast.error('Error when generate export');
      });
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(QR.id || '');
    setQR({ ...QR, copied: true });
    toast.success('Hash copied to clipboard');
    setTimeout(() => {
      setQR({ ...QR, copied: false });
    }, 4000);
  };

  const handleCloseModal = () => {
    if (QR.loading) return undefined;
    setQR(intialQRState);
    dispatch(setDeviceExportModal(false));
  };

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
            <p>Generating QR code...</p>
          </div>
        ) : (
          <div className="deviceExport__container">
            <IoIosCloseCircleOutline onClick={handleCloseModal} size={20} className="deviceExport__container__close" />
            <div className="deviceExport__container__header">
              <h2>Export narration</h2>
              <p>Scan the QR code or copy the hash to import this narration to another device.</p>
            </div>
            <div className="deviceExport__container__code">
              <QRCodeSVG
                size={256}
                bgColor="transparent"
                fgColor="#ffffff"
                value={QR.id || ''}
                imageSettings={{
                  src: '../../../public/images/logo.png',
                  x: undefined,
                  y: undefined,
                  height: 100,
                  width: 100,
                  opacity: 1,
                  excavate: true,
                }}
              />{' '}
            </div>
            <div className="deviceExport__container__hash">
              <p>{QR.id}</p>
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
