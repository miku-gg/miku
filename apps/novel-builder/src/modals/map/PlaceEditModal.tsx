import { AreYouSure, DragAndDropImages, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import { FaTrashAlt } from 'react-icons/fa';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { selectEditingMap, selectEditingPlace } from '../../state/selectors';

import { closeModal } from '../../state/slices/inputSlice';
import { deletePlace, updatePlace } from '../../state/slices/novelFormSlice';
import { useAppSelector } from '../../state/store';

import { useState } from 'react';
import { toast } from 'react-toastify';
import config from '../../config';
import { checkFileType } from '../../libs/utils';
import SceneSelector from '../scene/SceneSelector';
import './PlaceEditModal.scss';
import { AssetType } from '@mikugg/bot-utils';

function isBlackAndWhite(pixels: Uint8ClampedArray): boolean {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Check if the pixel is grayscale (r, g, b values are the same) and fully opaque (a is 255)
    if (!(r === g && g === b && a === 255)) {
      return false;
    }
  }
  return true;
}

export default function PlaceEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const map = useAppSelector(selectEditingMap);
  const [selectSceneOpened, setSelectSceneOpened] = useState(false);
  const place = useAppSelector(selectEditingPlace);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const scenes = useAppSelector((state) => state.novel.scenes);

  const handleUploadImage = async (file: File, source: 'preview' | 'mask') => {
    if (file && place) {
      try {
        const asset = await config.uploadAsset(
          file,
          source === 'preview' ? AssetType.MAP_IMAGE_PREVIEW : AssetType.MAP_MASK,
        );
        switch (source) {
          case 'preview':
            dispatch(
              updatePlace({
                mapId: map!.id,
                place: { id: place.id, previewSource: asset.assetId },
              }),
            );
            return;
          case 'mask':
            dispatch(
              updatePlace({
                mapId: map!.id,
                place: { id: place.id, maskSource: asset.assetId },
              }),
            );
            return;
        }
      } catch (e) {
        toast.error('Error uploading the image');
        console.error(e);
      }
    }
  };

  const handleDeletePlace = (id: string) => {
    areYouSure.openModal({
      title: 'Are you sure?',
      description: 'This action cannot be undone',
      onYes: () => {
        dispatch(closeModal({ modalType: 'placeEdit' }));
        dispatch(
          deletePlace({
            mapId: map!.id,
            placeId: id,
          }),
        );
      },
    });
  };

  const getSceneData = (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);

    return scene;
  };

  return (
    <Modal
      opened={!!place}
      shouldCloseOnOverlayClick
      className="PlaceEditModal"
      title="Edit Place"
      onCloseModal={() => dispatch(closeModal({ modalType: 'placeEdit' }))}
    >
      {place ? (
        <div className="PlaceEdit">
          <div className="PlaceEdit__buttons">
            <FaTrashAlt
              className="PlaceEdit__buttons__removePlace"
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Delete place"
              onClick={() => {
                handleDeletePlace(place.id);
              }}
            />
            <IoIosCloseCircleOutline
              className="PlaceEdit__buttons__closeModal"
              onClick={() => {
                dispatch(closeModal({ modalType: 'placeEdit' }));
              }}
            />
          </div>
          <div className="PlaceEdit__maskImage">
            {map?.source.png && (
              <img className="PlaceEdit__maskImage__map" src={config.genAssetLink(map.source.png)} alt="map" />
            )}

            <DragAndDropImages
              placeHolder="Add a mask for the place."
              className="PlaceEdit__maskImage__mask"
              previewImage={place.maskSource && config.genAssetLink(place.maskSource)}
              handleChange={(file) => handleUploadImage(file, 'mask')}
              onFileValidate={async (file) => {
                const mapImageSrc = map?.source.png;
                if (!mapImageSrc) {
                  toast.error('Please upload a map image first.');
                  return false;
                }
                if (file.size > 2 * 1024 * 1024) {
                  toast.error('File size should be less than 1MB');
                  return false;
                }
                if (!checkFileType(file, ['image/png', 'image/jpeg'])) {
                  toast.error('Invalid file type. Please upload a jpg file.');
                  return false;
                }
                const image = new Image();
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                  image.src = e.target?.result as string;
                };
                return new Promise((resolve) => {
                  image.onload = () => {
                    // check if the mask contains only black and white pixels
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                      resolve(false);
                      return;
                    }
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                    const pixels = ctx.getImageData(0, 0, image.width, image.height).data;

                    if (!isBlackAndWhite(pixels)) {
                      toast.error('Mask should be all black and have a white area for the place.');
                      resolve(false);
                      return;
                    }
                    // check if the mask is the same size as the map image
                    const mapImage = new Image();
                    mapImage.src = config.genAssetLink(mapImageSrc);
                    mapImage.onload = () => {
                      if (mapImage.width !== image.width || mapImage.height !== image.height) {
                        toast.error('Mask should be the same size as the map image.');
                        resolve(false);
                        return;
                      }
                      resolve(true);
                    };
                  };
                });
              }}
            />
          </div>
          <div className="PlaceEdit__form">
            <div className="PlaceEdit__sceneSelect">
              <label>Select a scene</label>
              <SceneSelector
                multiSelect={false}
                nonDeletable
                value={place.sceneId}
                onChange={(sceneId) => {
                  dispatch(
                    updatePlace({
                      mapId: map!.id,
                      place: {
                        ...place,
                        sceneId: sceneId || '',
                      },
                    }),
                  );
                }}
              />
            </div>
            <Input
              label="Place name"
              placeHolder="Place name. E.g. Rose garden."
              value={place.name}
              onChange={(e) => {
                dispatch(
                  updatePlace({
                    mapId: map!.id,
                    place: { ...place, name: e.target.value },
                  }),
                );
              }}
            />
            <Input
              isTextArea
              label="Place description"
              placeHolder="Description of the place. E.g. A garden with a lot of flowers."
              value={place.description}
              onChange={(e) => {
                dispatch(
                  updatePlace({
                    mapId: map!.id,
                    place: { ...place, description: e.target.value },
                  }),
                );
              }}
            />
            <DragAndDropImages
              placeHolder="Add a Preview Image"
              previewImage={
                place.previewSource
                  ? config.genAssetLink(
                      backgrounds.find((b) => b.id === place.previewSource)?.source.jpg || place.previewSource,
                    )
                  : ''
              }
              handleChange={(file) => handleUploadImage(file, 'preview')}
              onFileValidate={async (file) => {
                if (file.size > 2 * 1024 * 1024) {
                  toast.error('File size should be less than 1MB');
                  return false;
                }
                if (!checkFileType(file, ['image/png', 'image/jpeg'])) {
                  toast.error('Invalid file type. Please upload a valid image file');
                  return false;
                }
                return true;
              }}
            />
          </div>

          <Tooltip id="delete-tooltip" place="bottom" />
        </div>
      ) : null}
    </Modal>
  );
}
