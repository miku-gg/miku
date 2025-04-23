import { AreYouSure, DragAndDropImages, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import { FaTrashAlt } from 'react-icons/fa';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { selectEditingMap, selectEditingPlace } from '../../state/selectors';

import { closeModal } from '../../state/slices/inputSlice';
import { deletePlace, updatePlace } from '../../state/slices/novelFormSlice';
import { useAppSelector } from '../../state/store';

import { toast } from 'react-toastify';
import config, { MAX_FILE_SIZE } from '../../config';
import { checkFileType } from '../../libs/utils';
import SceneSelector from '../scene/SceneSelector';
import './PlaceEditModal.scss';
import { AssetDisplayPrefix, AssetType } from '@mikugg/bot-utils';

function isBlackAndWhite(pixels: Uint8ClampedArray): boolean {
  const tolerance = 20;

  const isNearBlack = (r: number, g: number, b: number) => {
    return (
      r <= tolerance &&
      g <= tolerance &&
      b <= tolerance &&
      Math.abs(r - g) < 10 &&
      Math.abs(g - b) < 10 &&
      Math.abs(r - b) < 10
    );
  };

  const isNearWhite = (r: number, g: number, b: number) => {
    return (
      r >= 255 - tolerance &&
      g >= 255 - tolerance &&
      b >= 255 - tolerance &&
      Math.abs(r - g) < 10 &&
      Math.abs(g - b) < 10 &&
      Math.abs(r - b) < 10
    );
  };

  let hasBlack = false;
  let hasWhite = false;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (isNearBlack(r, g, b)) {
      hasBlack = true;
    }

    if (isNearWhite(r, g, b)) {
      hasWhite = true;
    }

    if (hasBlack && hasWhite) {
      return true;
    }
  }

  return false;
}

export default function PlaceEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const map = useAppSelector(selectEditingMap);
  const place = useAppSelector(selectEditingPlace);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);

  const validateMaskImage = async (file: File) => {
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

        const mapImage = new Image();
        mapImage.src = config.genAssetLink(mapImageSrc, AssetDisplayPrefix.MAP_IMAGE);

        let maskRatio: number;

        if (image.width > 1024) {
          const width = mapImage.width;
          maskRatio = image.width / image.height;
          const height = width / maskRatio;
          canvas.width = width;
          canvas.height = height;
        } else {
          canvas.width = image.width;
          canvas.height = image.height;
          maskRatio = image.width / image.height;
        }

        ctx.drawImage(image, 0, 0, image.width, image.height);
        const pixels = ctx.getImageData(0, 0, image.width, image.height).data;

        if (!isBlackAndWhite(pixels)) {
          toast.error('Mask should be all black and have a white area for the place.');
          resolve(false);
          return;
        }
        // check if the mask is the same size as the map image

        mapImage.onload = () => {
          const mapRatio = mapImage.width / mapImage.height;
          if (maskRatio !== mapRatio) {
            toast.error('Mask should be the same size as the map image.');
            resolve(false);
            return;
          }
          resolve(true);
        };
      };
    });
  };

  const handleUploadImage = async (file: File, source: 'preview' | 'mask') => {
    if (file && place) {
      try {
        switch (source) {
          case 'preview':
            const { assetId } = await config.uploadAsset(file, AssetType.MAP_IMAGE_PREVIEW);
            dispatch(
              updatePlace({
                mapId: map!.id,
                place: { id: place.id, previewSource: assetId },
              }),
            );
            return;
          case 'mask':
            const validatedFile = await validateMaskImage(file);
            if (!validatedFile) return;

            const uploadedAsset = await config.uploadAsset(file, AssetType.MAP_MASK);
            dispatch(
              updatePlace({
                mapId: map!.id,
                place: { id: place.id, maskSource: uploadedAsset.assetId },
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
              <img
                className="PlaceEdit__maskImage__map"
                src={config.genAssetLink(map.source.png, AssetDisplayPrefix.MAP_IMAGE)}
                alt="map"
              />
            )}

            <DragAndDropImages
              placeHolder="Add a mask for the place."
              className="PlaceEdit__maskImage__mask"
              previewImage={place.maskSource && config.genAssetLink(place.maskSource, AssetDisplayPrefix.MAP_MASK)}
              handleChange={(file) => handleUploadImage(file, 'mask')}
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
              size="md"
              previewImage={
                place.previewSource
                  ? config.genAssetLink(
                      backgrounds.find((b) => b.id === place.previewSource)?.source.jpg || place.previewSource,
                      AssetDisplayPrefix.MAP_IMAGE_PREVIEW,
                    )
                  : ''
              }
              handleChange={(file) => handleUploadImage(file, 'preview')}
              onFileValidate={async (file) => {
                if (file.size > MAX_FILE_SIZE) {
                  toast.error('File size should be less than 5MB');
                  return false;
                }
                if (!checkFileType(file, ['image/png', 'image/jpeg', 'image/webp'])) {
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
