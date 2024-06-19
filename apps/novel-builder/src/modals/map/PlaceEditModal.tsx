import {
  AreYouSure,
  DragAndDropImages,
  Input,
  Modal,
  Tooltip,
} from "@mikugg/ui-kit";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { selectEditingMap, selectEditingPlace } from "../../state/selectors";
import { closeModal } from "../../state/slices/inputSlice";
import {
  deletePlace,
  updateMap,
  updatePlace,
} from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";

import { toast } from "react-toastify";
import config from "../../config";
import { checkFileType } from "../../libs/utils";
import "./PlaceEditModal.scss";

export default function PlaceEditModal() {
  const dispatch = useDispatch();
  const { openModal } = AreYouSure.useAreYouSure();
  const map = useAppSelector(selectEditingMap);

  const place = useAppSelector(selectEditingPlace);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);

  // const [isLoading, setIsLoading] = useState(false);
  //TODO: replace with scene selector

  const handleUploadImage = async (
    file: File,
    source: "preview" | "mask" | "map",
    place?: {
      id: string;
      sceneId: string;
      name: string;
      description: string;
      previewSource: string;
      maskSource: string;
    }
  ) => {
    if (file) {
      try {
        const asset = await config.uploadAsset(file);
        switch (source) {
          case "preview":
            dispatch(
              updatePlace({
                mapId: map!.id,
                place: { ...place!, previewSource: asset.assetId },
              })
            );
            return;
          case "mask":
            dispatch(
              updatePlace({
                mapId: map!.id,
                place: { ...place!, maskSource: asset.assetId },
              })
            );
            return;
          case "map": {
            dispatch(
              updateMap({
                ...map!,
                source: {
                  ...map!.source,
                  png: asset.assetId,
                },
              })
            );
            return;
          }
        }
      } catch (e) {
        toast.error("Error uploading the image");
        console.error(e);
      }
    }
  };

  const handleDeletePlace = (id: string) => {
    openModal({
      title: "Are you sure?",
      description: "This action cannot be undone",
      onYes: () => {
        dispatch(closeModal({ modalType: "placeEdit" }));
        deletePlace({
          mapId: map!.id,
          placeId: id,
        });
      },
    });
  };

  return (
    <Modal
      opened={!!place}
      shouldCloseOnOverlayClick
      className="PlaceEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: "placeEdit" }))}
    >
      {place ? (
        <div className="PlaceEdit">
          <div className="MapEdit__placesContainer scrollbar">
            <div className="MapEdit__places">
              <div className="MapEdit__places__form">
                <Tooltip id="delete-tooltip" place="bottom" />

                <FaTrashAlt
                  className="MapEdit__removePlace"
                  data-tooltip-id="delete-tooltip"
                  data-tooltip-content="Delete place"
                  onClick={() => {
                    handleDeletePlace(place.id);
                  }}
                />

                <div className="MapEdit__places__input">
                  <Input
                    label="Place name"
                    placeHolder="Place name. E.g. Rose garden."
                    value={place.name}
                    onChange={(e) => {
                      dispatch(
                        updatePlace({
                          mapId: map!.id,
                          place: { ...place, name: e.target.value },
                        })
                      );
                    }}
                  />
                  {/* use scene selector */}
                </div>
              </div>
              <Input
                isTextArea
                label="Place description"
                description="This is the description for the place."
                placeHolder="Description of the place. E.g. A garden with a lot of flowers."
                value={place.description}
                onChange={(e) => {
                  dispatch(
                    updatePlace({
                      mapId: map!.id,
                      place: { ...place, description: e.target.value },
                    })
                  );
                }}
              />
              <div className="MapEdit__places__images">
                <DragAndDropImages
                  placeHolder="Add a Preview Image"
                  previewImage={
                    place.previewSource
                      ? config.genAssetLink(
                          backgrounds.find((b) => b.id === place.previewSource)
                            ?.source.jpg || ""
                        )
                      : ""
                  }
                  handleChange={(file) => {
                    handleUploadImage(file, "preview", place);
                  }}
                  onFileValidate={async (file) => {
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("File size should be less than 1MB");
                      return false;
                    }
                    if (!checkFileType(file, ["image/png", "image/jpeg"])) {
                      toast.error(
                        "Invalid file type. Please upload a valid image file"
                      );
                      return false;
                    }
                    return true;
                  }}
                />
                <DragAndDropImages
                  placeHolder="Add a mask for the place."
                  previewImage={
                    place.maskSource && config.genAssetLink(place.maskSource)
                  }
                  handleChange={(file) => {
                    handleUploadImage(file, "mask", place);
                  }}
                  onFileValidate={async (file) => {
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("File size should be less than 1MB");
                      return false;
                    }
                    if (!checkFileType(file, ["image/png", "image/jpeg"])) {
                      toast.error(
                        "Invalid file type. Please upload a valid image file"
                      );
                      return false;
                    }
                    return true;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
