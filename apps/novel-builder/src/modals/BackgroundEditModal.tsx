import { AreYouSure, Button, Input, Loader, Modal, Tooltip } from '@mikugg/ui-kit';
import { useState } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import ButtonGroup from '../components/ButtonGroup';
import config from '../config';
import { selectEditingBackground } from '../state/selectors';
import { closeModal } from '../state/slices/inputSlice';
import { deleteBackground, updateBackground } from '../state/slices/novelFormSlice';
import { useAppSelector } from '../state/store';
import './BackgroundEditModal.scss';
import { AssetDisplayPrefix, AssetType } from '@mikugg/bot-utils';
import BackgroundGenerateModal from './background/BackgroundGenerateModal';
import { BsStars } from 'react-icons/bs';

export default function BackgroundEditModal() {
  const background = useAppSelector(selectEditingBackground);
  const dispatch = useDispatch();
  const { openModal } = AreYouSure.useAreYouSure();
  const [backgroundUploading, setBackgroundUploading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('image');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const handleDeleteBackground = () => {
    openModal({
      title: 'Are you sure?',
      description: 'This action cannot be undone',
      onYes: () => {
        dispatch(closeModal({ modalType: 'background' }));
        setSelectedTab('image');
        if (background) {
          dispatch(deleteBackground(background.id));
        }
      },
    });
  };

  const handleUploadMP4 = (isForMobile: boolean) => {
    if (!background) return;
    const a = document.createElement('input');
    a.type = 'file';
    a.accept = '.mp4';
    a.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 10000000) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setBackgroundUploading(true);
      config.uploadAsset(file, AssetType.BACKGROUND_VIDEO).then(({ success, assetId }) => {
        if (!success || !assetId) {
          setBackgroundUploading(false);
          return;
        }
        if (!isForMobile) {
          dispatch(
            updateBackground({
              ...background,
              source: { ...background.source, mp4: assetId },
            }),
          );
          setSelectedTab('video');
        } else {
          dispatch(
            updateBackground({
              ...background,
              source: { ...background.source, mp4Mobile: assetId },
            }),
          );
          setSelectedTab('mobile-video');
        }
        setBackgroundUploading(false);
      });
    };
    a.click();
  };

  const handleRemoveVideo = (isForMobile: boolean) => {
    if (!background) return;
    if (isForMobile) {
      dispatch(
        updateBackground({
          ...background,
          source: { ...background.source, mp4Mobile: '' },
        }),
      );
      setSelectedTab('video');
    } else {
      dispatch(
        updateBackground({
          ...background,
          source: { ...background.source, mp4: '', mp4Mobile: '' },
        }),
      );
      setSelectedTab('image');
    }
  };

  return (
    <Modal
      opened={!!background}
      className="BackgroundEditModal"
      shouldCloseOnOverlayClick
      onCloseModal={() => {
        dispatch(closeModal({ modalType: 'background' }));
        setSelectedTab('image');
      }}
    >
      {background ? (
        <div className="BackgroundEditModal_content">
          <div className="BackgroundEditModal__buttons">
            <h2>Edit Background</h2>

            <ButtonGroup
              selected={selectedTab}
              onButtonClick={(value) => setSelectedTab(value)}
              buttons={[
                {
                  content: 'Image',
                  value: 'image',
                },
                {
                  content: 'Desktop video',
                  value: 'video',
                  className: !background.source.mp4 ? 'empty' : '',
                },
                {
                  content: 'Mobile video',
                  value: 'mobile-video',
                  className: !background.source.mp4Mobile ? 'empty' : '',
                },
              ]}
            />
          </div>
          {selectedTab === 'image' ? (
            <div className="BackgroundEditModal__background">
              <img src={config.genAssetLink(background.source.jpg, AssetDisplayPrefix.BACKGROUND_IMAGE)} alt="" />
              <div className="BackgroundEditModal__background__generate-button">
                <Button theme="gradient" onClick={() => setShowGenerateModal(true)}>
                  <BsStars />
                </Button>
              </div>
            </div>
          ) : null}
          {background.source.mp4 && selectedTab === 'video' ? (
            <div className="BackgroundEditModal__video">
              <IoIosCloseCircleOutline
                className="BackgroundEditModal__video-remove"
                onClick={() => handleRemoveVideo(false)}
              />
              <video autoPlay loop muted>
                <source
                  src={config.genAssetLink(background.source.mp4, AssetDisplayPrefix.BACKGROUND_VIDEO)}
                  type="video/mp4"
                />
              </video>
            </div>
          ) : null}
          {background.source.mp4Mobile && selectedTab === 'mobile-video' ? (
            <div className="BackgroundEditModal__video mobileVideo">
              <IoIosCloseCircleOutline
                className="BackgroundEditModal__video-remove"
                onClick={() => handleRemoveVideo(true)}
              />
              <video autoPlay loop muted>
                <source
                  src={config.genAssetLink(background.source.mp4Mobile, AssetDisplayPrefix.BACKGROUND_VIDEO)}
                  type="video/mp4"
                />
              </video>
            </div>
          ) : null}

          <div>
            {!background.source.mp4 && selectedTab === 'video' ? (
              <div className="BackgroundEditModal__animated">
                <div className="BackgroundEditModal__animated-label">
                  <p>Animated background</p>
                  <Tooltip id="Info-animated-bg" place="top" />
                  <IoInformationCircleOutline
                    data-tooltip-id="Info-animated-bg"
                    data-tooltip-content="[OPTIONAL] Add a MP4 background, it will replace the static image.(Recomended 1920x1080)"
                  />
                </div>
                <Button disabled={backgroundUploading} theme="gradient" onClick={() => handleUploadMP4(false)}>
                  {backgroundUploading ? <Loader /> : 'Add background'}
                </Button>
              </div>
            ) : null}
            {selectedTab === 'mobile-video' && !background.source.mp4Mobile ? (
              <div className="BackgroundEditModal__animated">
                <div className="BackgroundEditModal__animated-label">
                  <p>Animated mobile background</p>
                  <Tooltip id="Info-animated-bg-mobile" place="top" />
                  <IoInformationCircleOutline
                    data-tooltip-id="Info-animated-bg-mobile"
                    data-tooltip-content="[OPTIONAL] This would be a vertical background for the mobile use case.(Recomended 720x1280)"
                  />
                </div>
                <Button disabled={backgroundUploading} theme="gradient" onClick={() => handleUploadMP4(true)}>
                  {backgroundUploading ? <Loader /> : 'Add mobile background'}
                </Button>
              </div>
            ) : null}

            <Input
              label="Name"
              placeHolder="Forest"
              className="BackgroundEditModal__input"
              value={background.name}
              onChange={(e) => dispatch(updateBackground({ ...background, name: e.target.value }))}
            />
            <Input
              label="Description"
              placeHolder="forest at night, with trees and animals"
              className="BackgroundEditModal__input"
              value={background.description}
              onChange={(e) =>
                dispatch(
                  updateBackground({
                    ...background,
                    description: e.target.value,
                  }),
                )
              }
            />
          </div>
          <div className="BackgroundEditModal__delete">
            <Button onClick={handleDeleteBackground} theme="primary">
              Delete background
            </Button>
          </div>
        </div>
      ) : null}
      {showGenerateModal && (
        <BackgroundGenerateModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          backgroundId={background?.id}
        />
      )}
    </Modal>
  );
}
