import { AreYouSure, Button, DragAndDropImages, Input, Modal, Tooltip } from '@mikugg/ui-kit';
import { HiOutlinePlus } from 'react-icons/hi';

import { FaTrashAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { selectEditingMap } from '../../state/selectors';
import { closeModal, openModal } from '../../state/slices/inputSlice';
import { createPlace, deleteMap, updateMap, updateMapImage, updateScene } from '../../state/slices/novelFormSlice';
import { useAppSelector } from '../../state/store';

import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { toast } from 'react-toastify';
import config, { MAX_FILE_SIZE } from '../../config';
import { checkFileType } from '../../libs/utils';
import './MapEditModal.scss';
import { AssetDisplayPrefix, AssetType } from '@mikugg/bot-utils';

export default function MapEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const map = useAppSelector(selectEditingMap);
  const scenes = useAppSelector((state) => state.novel.scenes);
  const sceneBackgrounds = useAppSelector((state) => {
    return state.novel.scenes.reduce((acc, scene) => {
      const bg = state.novel.backgrounds.find((background) => background.id === scene.backgroundId);
      if (bg && scene.id) {
        acc[scene.id] = bg.source.jpg;
      }
      return acc;
    }, {} as Record<string, string>);
  });
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);

  const handleUploadMapImage = async (file: File) => {
    if (file && map) {
      try {
        const asset = await config.uploadAsset(file, AssetType.MAP_IMAGE);
        dispatch(
          updateMapImage({
            mapId: map.id,
            source: { ...map!.source, png: asset.assetId },
          }),
        );
      } catch (e) {
        toast.error('Error uploading the image');
        console.error(e);
      }
    }
  };

  const handleRemoveIds = (id: string) => {
    const scenesWithMap = scenes.filter((scene) => scene.parentMapIds?.includes(id));
    scenesWithMap.forEach((scene) => {
      if (scene) {
        const newScene = {
          ...scene,
          parentMapIds: scene.parentMapIds?.filter((mapId) => mapId !== id),
        };
        dispatch(updateScene(newScene));
      }
    });
  };

  const handleDeleteMap = (id: string) => {
    areYouSure.openModal({
      title: 'Are you sure?',
      description: 'This map will be deleted. This action cannot be undone.',
      onYes: () => {
        dispatch(closeModal({ modalType: 'mapEdit' }));
        handleRemoveIds(id);
        dispatch(deleteMap(id));
      },
    });
  };

  return (
    <Modal
      opened={!!map}
      shouldCloseOnOverlayClick
      className="MapEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'mapEdit' }))}
    >
      {map ? (
        <div className="MapEdit scrollbar">
          <div className="MapEdit__buttons">
            <FaTrashAlt
              className="MapEdit__buttons__removePlace"
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Delete place"
              onClick={() => {
                handleDeleteMap(map.id);
              }}
            />
            <IoIosCloseCircleOutline
              className="MapEdit__buttons__closeModal"
              onClick={() => {
                dispatch(closeModal({ modalType: 'mapEdit' }));
              }}
            />
          </div>
          <Tooltip id="delete-tooltip" place="bottom" />

          <div className="MapEdit__form">
            <div className="MapEdit__form__top">
              <Input
                label="Name"
                placeHolder="Name for the map. E.g. World map."
                className="MapEdit__form__name"
                value={map?.name}
                onChange={(e) => dispatch(updateMap({ ...map, name: e.target.value }))}
              />
              <Input
                label="Description"
                className="MapEdit__form__description"
                placeHolder="Description of the map. E.g. A map of the world."
                value={map?.description}
                onChange={(e) =>
                  dispatch(
                    updateMap({
                      ...map!,
                      description: e.target.value,
                    }),
                  )
                }
              />
            </div>
            <div className="MapEdit__form__map">
              {map?.places &&
                map?.places.length > 0 &&
                map?.places.map(
                  (place) =>
                    place.maskSource && (
                      <img
                        className={`MapEdit__form__placePreview ${place.id === hoveredPlace ? 'hovered' : ''}`}
                        src={config.genAssetLink(place.maskSource || '', AssetDisplayPrefix.MAP_MASK)}
                      />
                    ),
                )}
              <DragAndDropImages
                placeHolder="Upload map image."
                className="MapEdit__form__uploadMap"
                handleChange={(file) => handleUploadMapImage(file)}
                previewImage={map?.source.png && config.genAssetLink(map.source.png, AssetDisplayPrefix.MAP_IMAGE)}
                onFileValidate={async (file) => {
                  if (file.size > MAX_FILE_SIZE) {
                    toast.error('File size should be less than 5MB');
                    return false;
                  }
                  if (!checkFileType(file, ['image/png', 'image/jpeg', 'image/webp'])) {
                    toast.error('Invalid file type. Please upload a jpg file.');
                    return false;
                  }
                  return true;
                }}
              />
            </div>
          </div>
          <div className="MapEdit__createPlace">
            <div className="MapEdit__createPlace__header">
              <label>Places</label>
              <Button
                onClick={() => {
                  dispatch(createPlace({ mapId: map.id }));
                }}
                theme="gradient"
                className="MapEdit__createPlace__button"
              >
                Add place
              </Button>
            </div>

            {map?.places.length > 0 && (
              <div className="MapEdit__placesContainer scrollbar">
                {map?.places.map((place) => {
                  const mapPlace = place.previewSource || sceneBackgrounds[place.sceneId] || '';
                  return (
                    <div
                      className="MapEdit__place"
                      data-tooltip-id="place-tooltip"
                      data-tooltip-content={place.name}
                      key={place.id}
                      onMouseEnter={() => setHoveredPlace(place.id)}
                      onMouseLeave={() => setHoveredPlace(null)}
                    >
                      {mapPlace && (
                        <img
                          className="MapEdit__place__previewImage"
                          src={config.genAssetLink(mapPlace, AssetDisplayPrefix.MAP_IMAGE_PREVIEW)}
                        />
                      )}
                      <FaPencil
                        className="MapEdit__place__edit"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dispatch(
                            openModal({
                              modalType: 'placeEdit',
                              editId: place.id,
                            }),
                          );
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <HiOutlinePlus
              className="MapEdit__placesContainer__button"
              onClick={() => {
                dispatch(createPlace({ mapId: map.id }));
              }}
            />
          </div>
          <Tooltip id="place-tooltip" place="right" />
        </div>
      ) : null}
    </Modal>
  );
}
