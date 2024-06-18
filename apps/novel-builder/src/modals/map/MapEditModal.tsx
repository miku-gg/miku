import {
  AreYouSure,
  Button,
  DragAndDropImages,
  Input,
  Modal,
  Tooltip,
} from "@mikugg/ui-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { selectEditingMap } from "../../state/selectors";
import { closeModal } from "../../state/slices/inputSlice";
import {
  createPlace,
  deleteMap,
  deletePlace,
  updateMap,
  updatePlace,
} from "../../state/slices/novelFormSlice";
import { useAppSelector } from "../../state/store";

import { toast } from "react-toastify";
import config from "../../config";
import { checkFileType } from "../../libs/utils";
import "./MapEditModal.scss";

export default function MapEditModal() {
  const dispatch = useDispatch();
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

  const handleUploadMap = async (file: File) => {
    if (file) {
      try {
        const asset = await config.uploadAsset(file);

        dispatch(
          updateMap({
            ...map!,
            source: {
              ...map!.source,
              png: asset.assetId,
            },
          })
        );
      } catch (e) {
        toast.error("Error uploading the image");
        console.error(e);
      }
    }
  };

  const handleDeleteMap = (id: string) => {
    const { openModal } = AreYouSure.useAreYouSure();

    openModal({
      title: "Are you sure?",
      description: "This action cannot be undone",
      onYes: () => {
        dispatch(closeModal({ modalType: "mapEdit" }));
        dispatch(deleteMap(id));
      },
    });
  };

  // const handleUploadMusic = async () => {
  //   const input = document.createElement("input");
  //   input.type = "file";
  //   input.accept = "audio/*";
  //   input.click();
  //   setIsLoading(true);
  //   input.onchange = async (e) => {
  //     const file = (e.target as HTMLInputElement).files?.[0];
  //     if (!file) return;
  //     const { success, assetId } = await config.uploadAsset(file);
  //     if (!success || !assetId) {
  //       toast.error("Failed to upload music");
  //       setIsLoading(false);
  //       return;
  //     }
  //     dispatch(
  //       updateMap({
  //         ...map!,
  //         source: { ...map!.source, music: assetId },
  //       })
  //     );
  //     setIsLoading(false);
  //   };
  // };

  return (
    <Modal
      opened={!!map}
      shouldCloseOnOverlayClick
      onCloseModal={() => dispatch(closeModal({ modalType: "mapEdit" }))}
    >
      {map ? (
        <div className="MapEdit scrollbar">
          <h2 className="MapEdit__title">Edit Map</h2>
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
                description="This is the name for the map."
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
                description="This is the description for the map."
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
              {/* <div className="MapEdit__form__music">
                <label>Music(optional)</label>
                <div className="MapEdit__form__music__content">
                  <p>{isLoading ? "Uploading song.." : map.source.music ? "Song Added" : ""}</p>
                  <Button theme="gradient" onClick={() => handleUploadMusic()}>
                    Upload
                  </Button>
                </div>
              </div> */}
            </div>
            <DragAndDropImages
              size="lg"
              placeHolder="Upload map image."
              className="MapEdit__form__uploadMap"
              handleChange={handleUploadMap}
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
            <Button
              theme="gradient"
              onClick={() => {
                dispatch(createPlace({ mapId: map.id }));
              }}
            >
              + Place
            </Button>
          </div>
          <div
            className="MapEdit__placesContainer scrollbar"
            ref={containerRef}
          >
            {map?.places &&
              map?.places.map((place, index) => (
                <div className="MapEdit__places" key={`place-${index + 1}`}>
                  <div className="MapEdit__places__form">
                    <FaTrashAlt
                      className="MapEdit__removePlace"
                      onClick={() => {
                        dispatch(
                          deletePlace({
                            mapId: map.id,
                            placeId: place.id,
                          })
                        );
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
                              mapId: map.id,
                              place: { ...place, name: e.target.value },
                            })
                          );
                        }}
                      />
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
                          mapId: map.id,
                          place: { ...place, description: e.target.value },
                        })
                      );
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
