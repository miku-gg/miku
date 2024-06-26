import { AreYouSure, Modal } from "@mikugg/ui-kit";

import { useDispatch } from "react-redux";
import { selectEditingInventoryItem } from "../../state/selectors";
import { closeModal } from "../../state/slices/inputSlice";
import { deleteMap } from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";

import { FaTrashAlt } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { toast } from "react-toastify";
import config from "../../config";
import "./ItemEditModal.scss";

export default function ItemEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const item = useAppSelector(selectEditingInventoryItem);

  const handleUploadImage = async (file: File) => {
    if (file && item) {
      try {
        const asset = await config.uploadAsset(file);
      } catch (e) {
        toast.error("Error uploading the image");
        console.error(e);
      }
    }
  };

  const handleDelete = (id: string) => {
    areYouSure.openModal({
      title: "Are you sure?",
      description: "This map will be deleted. This action cannot be undone.",
      onYes: () => {
        dispatch(closeModal({ modalType: "mapEdit" }));
        dispatch(deleteMap(id));
      },
    });
  };

  return (
    <Modal
      opened={!!item}
      shouldCloseOnOverlayClick
      className="ItemEditModal"
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
              
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
