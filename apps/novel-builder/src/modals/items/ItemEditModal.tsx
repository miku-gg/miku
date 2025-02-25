import { AreYouSure, Button, CheckBox, DragAndDropImages, Input, Loader, Modal, Tooltip } from '@mikugg/ui-kit';
import { v4 as randomUUID } from 'uuid';

import { useDispatch } from 'react-redux';
import { selectEditingInventoryItem } from '../../state/selectors';
import { closeModal, openModal } from '../../state/slices/inputSlice';
import { deleteInventoryItem, updateInventoryItem } from '../../state/slices/novelFormSlice';
import { useAppSelector } from '../../state/store';

import { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import config, { MAX_FILE_SIZE } from '../../config';
import { checkFileType } from '../../libs/utils';
import SceneSelector from '../scene/SceneSelector';
import './ItemEditModal.scss';
import { AssetDisplayPrefix, AssetType } from '@mikugg/bot-utils';
import ItemGenerateModal from './ItemGenerateModal';
import { BsStars } from 'react-icons/bs';

export default function ItemEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const item = useAppSelector(selectEditingInventoryItem);
  const [isUploading, setIsUploading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const handleUploadImage = async (file: File) => {
    if (file && item) {
      setIsUploading(true);
      try {
        const asset = await config.uploadAsset(file, AssetType.ITEM_IMAGE);
        dispatch(
          updateInventoryItem({
            ...item,
            icon: asset.assetId,
          }),
        );
        setIsUploading(false);
      } catch (e) {
        toast.error('Error uploading the image');
        setIsUploading(false);
        console.error(e);
      }
    }
  };

  const handleDelete = (id: string) => {
    areYouSure.openModal({
      title: 'Are you sure?',
      description: 'This Item will be deleted. This action cannot be undone.',
      onYes: () => {
        dispatch(closeModal({ modalType: 'editInventoryItem' }));
        dispatch(deleteInventoryItem({ itemId: id }));
      },
    });
  };

  const handleSelectScenes = (ids: string[]) => {
    if (!item) return;

    if (!item.locked) {
      dispatch(
        updateInventoryItem({
          ...item,
          hidden: true,
          locked: {
            type: 'IN_SCENE',
            config: {
              sceneIds: ids,
            },
          },
        }),
      );
    } else if (item.locked.config.sceneIds.length === 0 || ids.length === 0) {
      dispatch(
        updateInventoryItem({
          ...item,
          hidden: false,
          locked: undefined,
        }),
      );
    }
  };

  return (
    <Modal
      opened={!!item}
      shouldCloseOnOverlayClick
      className="ItemEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: 'editInventoryItem' }))}
    >
      {item ? (
        <div className="ItemEdit">
          <h3 className="ItemEdit__title">Item Edit</h3>
          <div className="ItemEdit__buttons">
            <FaTrashAlt
              className="ItemEdit__buttons__removePlace"
              onClick={() => {
                handleDelete(item.id);
              }}
            />
            <IoIosCloseCircleOutline
              className="ItemEdit__buttons__closeModal"
              onClick={() => {
                dispatch(closeModal({ modalType: 'editInventoryItem' }));
              }}
            />
          </div>

          <div className="ItemEdit__form">
            <div className="ItemEdit__form__text">
              <Input
                label="Item name"
                placeHolder="Rose"
                value={item.name}
                onChange={(e) => {
                  dispatch(
                    updateInventoryItem({
                      ...item,
                      name: e.target.value,
                    }),
                  );
                }}
              />
              <Input
                isTextArea
                label="Short item description"
                placeHolder="A beautiful rose"
                value={item.description}
                onChange={(e) => {
                  dispatch(
                    updateInventoryItem({
                      ...item,
                      description: e.target.value,
                    }),
                  );
                }}
              />
            </div>
            <div className="ItemEdit__form__image">
              {isUploading && (
                <div className="ItemEdit__form__image__loaderContainer">
                  <Loader />
                </div>
              )}
              <DragAndDropImages
                handleChange={(file) => handleUploadImage(file)}
                previewImage={item.icon && config.genAssetLink(item.icon, AssetDisplayPrefix.ITEM_IMAGE)}
                placeHolder="Icon for the item (512x512)"
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
              <div className="ItemEdit__form__image__generate-button">
                <Button theme="gradient" onClick={() => setShowGenerateModal(true)}>
                  <BsStars />
                </Button>
              </div>
            </div>
          </div>

          <div className="ItemEdit__actions">
            <div className="ItemEdit__actions__header">
              <div className="ItemEdit__actions__title">
                <h3>Actions</h3>
                <Tooltip id="Info-actions" place="top" />
                <IoInformationCircleOutline
                  data-tooltip-id="Info-actions"
                  data-tooltip-content="Only can create up to 3 actions."
                />
              </div>
              {item.actions.length < 3 && (
                <Button
                  theme="secondary"
                  onClick={() => {
                    const id = randomUUID();
                    dispatch(
                      updateInventoryItem({
                        ...item,
                        actions: [
                          ...item.actions,
                          {
                            name: 'New Action',
                            prompt: '',
                            id: id,
                            usageActions: [],
                          },
                        ],
                      }),
                    );
                    dispatch(openModal({ modalType: 'actionEdit', editId: id }));
                  }}
                >
                  Add Action
                </Button>
              )}
            </div>
            {item.actions.length >= 0 && (
              <div className="ItemEdit__actionList scrollbar">
                {item.actions.map((action) => (
                  <div key={`action-${action.id}`} className="ItemEdit__actionList__action">
                    <FaPencil
                      className="ItemEdit__actionList__edit"
                      onClick={() => {
                        dispatch(
                          openModal({
                            modalType: 'actionEdit',
                            editId: action.id,
                          }),
                        );
                      }}
                    />
                    <p className="ItemEdit__actionList__action__name">{action.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ItemEdit__visibility">
            <div className="ItemEdit__visibility__title">
              <h3 className="ItemEdit__visibility__title">Visibility</h3>
              <div className="ItemEdit__visibility__hidden">
                <CheckBox
                  label="Hidden by default"
                  value={item.hidden}
                  onChange={(e) => {
                    dispatch(
                      updateInventoryItem({
                        ...item,
                        hidden: e.target.checked,
                      }),
                    );
                  }}
                />
                <Tooltip id="Info-Visibility" place="top" />
                <IoInformationCircleOutline
                  data-tooltip-id="Info-Visibility"
                  data-tooltip-content="Hide the item until a condition adds it."
                />
              </div>
            </div>
          </div>
          <div className="ItemEdit__visibility">
            <div className="ItemEdit__visibility__title">
              <h3>Restricted to scenes</h3>
            </div>
            <div className="ItemEdit__visibility__description">
              It will be usable only in the selected scenes.
              <br />
              If no scenes are selected, it will be usable in all scenes if it's not hidden.
            </div>
            <div className="ItemEdit__visibility__sceneLock">
              <SceneSelector
                multiSelect
                value={item.locked?.config.sceneIds || []}
                onChange={(sceneIds: string[]) => handleSelectScenes(sceneIds)}
              />
            </div>
          </div>
        </div>
      ) : null}
      {showGenerateModal && (
        <ItemGenerateModal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} itemId={item?.id} />
      )}
    </Modal>
  );
}
