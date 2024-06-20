import {
  AreYouSure,
  DragAndDropImages,
  Input,
  Modal,
  Tooltip,
} from "@mikugg/ui-kit";
import { HiOutlinePlus } from "react-icons/hi";

import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { selectEditingMap } from "../../state/selectors";
import { closeModal, openModal } from "../../state/slices/inputSlice";
import {
  createPlace,
  deleteMap,
  updateMap,
  updatePlace,
} from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";

import { useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { toast } from "react-toastify";
import config from "../../config";
import { checkFileType } from "../../libs/utils";
import "./MapEditModal.scss";

export default function MapEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const map = useAppSelector(selectEditingMap);
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);

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

  const handleDeleteMap = (id: string) => {
    areYouSure.openModal({
      title: "Are you sure?",
      description: "This action cannot be undone",
      onYes: () => {
        dispatch(closeModal({ modalType: "mapEdit" }));
        dispatch(deleteMap(id));
      },
    });
  };

  return (
    <Modal
      opened={!!map}
      shouldCloseOnOverlayClick
      className="MapEditModal"
      onCloseModal={() => dispatch(closeModal({ modalType: "mapEdit" }))}
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
                dispatch(closeModal({ modalType: "mapEdit" }));
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
                onChange={(e) =>
                  dispatch(updateMap({ ...map, name: e.target.value }))
                }
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
                    })
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
                        className={`MapEdit__form__placePreview ${
                          place.id === hoveredPlace ? "hovered" : ""
                        }`}
                        src={config.genAssetLink(place.maskSource || "")}
                      />
                    )
                )}
              <DragAndDropImages
                placeHolder="Upload map image."
                className="MapEdit__form__uploadMap"
                handleChange={(file) => handleUploadImage(file, "map")}
                previewImage={
                  map?.source.png && config.genAssetLink(map.source.png)
                }
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
          <div className="MapEdit__createPlace">
            <label>Places</label>

            {map?.places.length > 0 && (
              <div className="MapEdit__placesContainer scrollbar">
                {map?.places.map((place) => (
                  <div
                    className="MapEdit__place"
                    data-tooltip-id="place-tooltip"
                    data-tooltip-content={place.name}
                    key={place.id}
                    onMouseEnter={() => setHoveredPlace(place.id)}
                    onMouseLeave={() => setHoveredPlace(null)}
                  >
                    {place.previewSource && (
                      <img
                        className="MapEdit__place__previewImage"
                        src={config.genAssetLink(place.previewSource || "")}
                      />
                    )}
                    <FaPencil
                      className="MapEdit__place__edit"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dispatch(
                          openModal({
                            modalType: "placeEdit",
                            editId: place.id,
                          })
                        );
                      }}
                    />
                  </div>
                ))}
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
