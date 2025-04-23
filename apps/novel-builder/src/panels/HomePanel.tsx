import { MdDraw } from 'react-icons/md';
import { FaUpload } from 'react-icons/fa';

import './HomePanel.scss';
import { useAppDispatch } from '../state/store';
import { closeModal, navigatePage, navigatePanel, openModal } from '../state/slices/inputSlice';
import { useRef } from 'react';
import { importAndReplaceNovelStateAssets, inputToNovelState } from '@mikugg/bot-utils';
import { loadCompleteState } from '../state/slices/novelFormSlice';
import config from '../config';
import InferenceBanner from './InferenceBanner';

export default function HomePanel() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') return;
      try {
        dispatch(openModal({ modalType: 'loading', text: 'Parsing novel...' }));
        const data = JSON.parse(result);
        const state = inputToNovelState(data);
        const novelWithUploadedAssets = await importAndReplaceNovelStateAssets(state.novel, {
          onError: (err, msg) => {
            console.error(err, msg);
          },
          onUpdate: ({ progress, total, bytes }) => {
            dispatch(
              openModal({
                modalType: 'loading',
                text: `Uploading ${progress}/${total}... ${bytes} bytes`,
              }),
            );
          },
          uploadAsset: async (assetBase64URI: string, type) => {
            if (assetBase64URI.startsWith('data:')) {
              return await config.uploadAsset(assetBase64URI, type);
            } else {
              return { success: true, assetId: assetBase64URI };
            }
          },
          uploadBatchSize: 10,
        });
        dispatch(closeModal({ modalType: 'loading' }));
        dispatch(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          loadCompleteState({ ...novelWithUploadedAssets, pendingInferences: data.novel.pendingInferences || [] }),
        );
        dispatch(navigatePage('edit'));
        dispatch(navigatePanel('details'));
      } catch (e) {
        console.error(e);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="HomePanel">
        <div className="HomePanel__options">
          <div
            className="HomePanel__option"
            tabIndex={0}
            role="button"
            onClick={() => {
              dispatch(navigatePage('edit'));
              dispatch(navigatePanel('details'));
            }}
          >
            <div className="HomePanel__option__icon">
              <MdDraw />
            </div>
            <div className="HomePanel__option__text">Start from scratch</div>
            <div className="HomePanel__option__description">Create an empty novel</div>
          </div>
          <div className="HomePanel__option" tabIndex={0} role="button" onClick={() => fileInputRef.current?.click()}>
            <div className="HomePanel__option__icon">
              <FaUpload />
            </div>
            <div className="HomePanel__option__text">Import novel or card</div>
            <div className="HomePanel__option__description">
              From <span style={{ color: 'gray' }}>MikuGG, Agnastic, TavernAI, Pygmalion, RisuAI</span>
              <br />
              Formats: <span style={{ color: 'gray' }}>.png, .miku-temp.json, .miku.json, .miku.card.png (old)</span>
            </div>
            <input
              type="file"
              accept="application/json,.json,image/png,.png,.miku,.miku-temp.json,.miku.json,.miku.card.png"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileLoad}
              multiple
            />
          </div>
        </div>
      </div>
      <InferenceBanner />
    </>
  );
}
