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

import { useState } from "react";
import { toast } from "react-toastify";
import config from "../../config";
import { checkFileType } from "../../libs/utils";
import SceneSelector from "../scene/SceneSelector";
import "./PlaceEditModal.scss";

export default function PlaceEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const map = useAppSelector(selectEditingMap);
  const [selectSceneOpened, setSelectSceneOpened] = useState(false);
  const place = useAppSelector(selectEditingPlace);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);
  const scenes = useAppSelector((state) => state.novel.scenes);

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
    areYouSure.openModal({
      title: "Are you sure?",
      description: "This action cannot be undone",
      onYes: () => {
        dispatch(closeModal({ modalType: "placeEdit" }));
        dispatch(deletePlace({
          mapId: map!.id,
          placeId: id,
        }));
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
      onCloseModal={() => dispatch(closeModal({ modalType: "placeEdit" }))}
    >
      {place ? (
        <div className="PlaceEdit">
          <div className="PlaceEdit__maskImage">
            {map?.source.png && (
              <img
                className="PlaceEdit__maskImage__map"
                src={config.genAssetLink(map.source.png)}
                alt="map"
              />
            )}

            <DragAndDropImages
              placeHolder="Add a mask for the place."
              className="PlaceEdit__maskImage__mask"
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
          <div className="PlaceEdit__form">
            <FaTrashAlt
              className="PlaceEdit__removePlace"
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Delete place"
              onClick={() => {
                handleDeletePlace(place.id);
              }}
            />
            <div className="PlaceEdit__sceneSelect">
              <SceneSelector
                opened={selectSceneOpened}
                onCloseModal={() => setSelectSceneOpened(false)}
                selectedSceneId={place.sceneId}
                onSelectScene={(id) => {
                  dispatch(
                    updatePlace({
                      mapId: map!.id,
                      place: {
                        ...place,
                        sceneId: id,
                      },
                    })
                  );
                }}
              />
              <label>Select a scene</label>
              <div className="PlaceEdit__sceneSelect__container">
                <p className="PlaceEdit__sceneSelect__name">
                  {place.sceneId ? getSceneData(place.sceneId)?.name : ""}
                </p>
                <button
                  className="PlaceEdit__sceneSelect__button"
                  onClick={() => setSelectSceneOpened(true)}
                >
                  Select scene
                </button>
              </div>
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
                  })
                );
              }}
            />
            {/* use scene selector */}
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
                  })
                );
              }}
            />
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
          </div>

          <Tooltip id="delete-tooltip" place="bottom" />
        </div>
      ) : null}
    </Modal>
  );
}
