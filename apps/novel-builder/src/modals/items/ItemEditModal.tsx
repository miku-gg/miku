import {
  AreYouSure,
  Button,
  DragAndDropImages,
  Input,
  Loader,
  Modal,
  Tooltip,
} from "@mikugg/ui-kit";
import { v4 as randomUUID } from "uuid";

import { useDispatch } from "react-redux";
import { selectEditingInventoryItem } from "../../state/selectors";
import { closeModal } from "../../state/slices/inputSlice";
import {
  deleteInventoryItem,
  updateInventoryItem,
} from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";

import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoInformationCircleOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import config from "../../config";
import "./ItemEditModal.scss";

export default function ItemEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const item = useAppSelector(selectEditingInventoryItem);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadImage = async (file: File) => {
    if (file && item) {
      setIsUploading(true);
      try {
        const asset = await config.uploadAsset(file);
        dispatch(
          updateInventoryItem({
            ...item,
            icon: asset.assetId,
          })
        );
        setIsUploading(false);
      } catch (e) {
        toast.error("Error uploading the image");
        setIsUploading(false);
        console.error(e);
      }
    }
  };

  const handleRemoveAction = (id: string) => {
    if (!item) return;
    const newActions = item.actions.filter((action) => action.id !== id);
    dispatch(
      updateInventoryItem({
        ...item,
        actions: newActions,
      })
    );
  };

  const handleUpdateAction = (actionId: string, action: {}) => {
    if (!item) return;
    const newActions = item.actions.map((a) =>
      a.id === actionId ? { ...a, ...action } : a
    );

    dispatch(
      updateInventoryItem({
        ...item,
        actions: newActions,
      })
    );
  };

  const handleDelete = (id: string) => {
    areYouSure.openModal({
      title: "Are you sure?",
      description: "This Item will be deleted. This action cannot be undone.",
      onYes: () => {
        dispatch(closeModal({ modalType: "editInventoryItem" }));
        dispatch(deleteInventoryItem({ itemId: id }));
      },
    });
  };

  return (
    <Modal
      opened={!!item}
      shouldCloseOnOverlayClick
      className="ItemEditModal"
      title="Edit Item"
      onCloseModal={() =>
        dispatch(closeModal({ modalType: "editInventoryItem" }))
      }
    >
      {item ? (
        <div className="ItemEdit">
          <div className="ItemEdit__buttons">
            <FaTrashAlt
              className="ItemEdit__buttons__removePlace"
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Delete place"
              onClick={() => {
                handleDelete(item.id);
              }}
            />
            <IoIosCloseCircleOutline
              className="ItemEdit__buttons__closeModal"
              onClick={() => {
                dispatch(closeModal({ modalType: "editInventoryItem" }));
              }}
            />
          </div>
          <div className="ItemEdit__form">
            <div className="ItemEdit__form__image">
              {isUploading && (
                <div className="ItemEdit__form__image__loaderContainer">
                  <Loader />
                </div>
              )}
              <DragAndDropImages
                handleChange={(file) => handleUploadImage(file)}
                previewImage={item.icon && config.genAssetLink(item.icon)}
                placeHolder="Upload an Icon for the Item"
              />
            </div>
            <div className="ItemEdit__form__text">
              <Input
                label="Name"
                description="Name for the item."
                placeHolder="Rose"
              />
              <Input
                isTextArea
                label="Description"
                description="Description for the item."
                placeHolder="A beautiful rose"
              />
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
                    dispatch(
                      updateInventoryItem({
                        ...item,
                        actions: [
                          ...item.actions,
                          { name: "", prompt: "", id: randomUUID() },
                        ],
                      })
                    );
                  }}
                >
                  Add Action
                </Button>
              )}
            </div>

            {item.actions.length >= 0 && (
              <div className="ItemEdit__actions__container scrollbar">
                {item.actions.map((action) => (
                  <div
                    key={`action-${action.id}`}
                    className="ItemEdit__actions__action"
                  >
                    <FaTrashAlt
                      onClick={() => handleRemoveAction(action.id || "")}
                      className="ItemEdit__actions__remove"
                    />
                    <Input
                      label="Action Name"
                      placeHolder="E.g. Give"
                      description="Action for the item."
                      value={action.name}
                      onChange={(e) =>
                        handleUpdateAction(action.id || "", {
                          name: e.target.value,
                        })
                      }
                    />
                    <Input
                      isTextArea
                      label="Prompt"
                      description="Prompt for the action."
                      placeHolder="E.g. *I pull out a rose flower and hand it over to {{char}}*"
                      value={action.prompt}
                      onChange={(e) =>
                        handleUpdateAction(action.id || "", {
                          prompt: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}