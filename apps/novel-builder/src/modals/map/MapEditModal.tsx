import {
  AreYouSure,
  Button,
  DragAndDropImages,
  Input,
  Modal,
  Tooltip,
} from "@mikugg/ui-kit";
import { useCallback, useEffect, useRef } from "react";
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

import { FaPencil } from "react-icons/fa6";
import { toast } from "react-toastify";
import config from "../../config";
import { checkFileType } from "../../libs/utils";
import "./MapEditModal.scss";

export default function MapEditModal() {
  const dispatch = useDispatch();
  const areYouSure = AreYouSure.useAreYouSure();
  const map = useAppSelector(selectEditingMap);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPlacesLength = useRef(0);

  // const [isLoading, setIsLoading] = useState(false);

  const handleScrollToTop = useCallback(() => {
    if (containerRef.current) {
      if (map?.places && map?.places?.length > prevPlacesLength.current) {
        scrollToTop();
        prevPlacesLength.current = map.places.length;
      }
    }
  }, [map?.places]);

  useEffect(() => {
    handleScrollToTop();
  }, [handleScrollToTop]);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: -containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

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
      onCloseModal={() => dispatch(closeModal({ modalType: "mapEdit" }))}
    >
      {map ? (
        <div className="MapEdit scrollbar">
          <Tooltip id="delete-tooltip" place="bottom" />
          <FaTrashAlt
            className="MapEdit__removeMap"
            data-tooltip-id="delete-tooltip"
            data-tooltip-content="Delete map"
            onClick={() => {
              handleDeleteMap(map.id);
            }}
          />
          <div className="MapEdit__form">
            <div className="MapEdit__form__left">
              <Input
                label="Name"
                placeHolder="Name for the map. E.g. World map."
                value={map?.name}
                onChange={(e) =>
                  dispatch(updateMap({ ...map, name: e.target.value }))
                }
              />
              <Input
                isTextArea
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
          <div className="MapEdit__createPlace">
            <label>Places</label>

            <div
              className="MapEdit__placesContainer scrollbar"
              ref={containerRef}
            >
              {map?.places &&
                map?.places.map((place) => (
                  <div className="MapEdit__places" key={place.id}>
                    <FaPencil
                      className="MapList__container__edit"
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
              <Button
                theme="gradient"
                onClick={() => {
                  dispatch(createPlace({ mapId: map.id }));
                }}
              >
                + Place
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
