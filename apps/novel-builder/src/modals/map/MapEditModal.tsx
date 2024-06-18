import { AreYouSure, Button, Input, Modal, Tooltip } from "@mikugg/ui-kit";
import { useCallback, useEffect, useRef } from "react";
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

import "./MapEditModal.scss";

export default function MapEditModal() {
  const dispatch = useDispatch();
  const { openModal } = AreYouSure.useAreYouSure();
  const map = useAppSelector(selectEditingMap);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPlacesLength = useRef(0);

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

  const handleDeleteMap = (id: string) => {
    openModal({
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
          <div className="MapEdit__form-top">
            <div className="MapEdit__form-top__name">
              <Input
                label="Map name"
                placeHolder="Name for the map. E.g. World map."
                value={map?.name}
                onChange={(e) =>
                  dispatch(updateMap({ ...map, name: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label>Map description</label>
            <Input
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
