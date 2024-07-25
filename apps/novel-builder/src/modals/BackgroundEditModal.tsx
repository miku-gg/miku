import {
  AreYouSure,
  Button,
  Input,
  Loader,
  Modal,
  Tooltip,
} from "@mikugg/ui-kit";
import { useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import config from "../config";
import { selectEditingBackground } from "../state/selectors";
import { closeModal } from "../state/slices/inputSlice";
import {
  deleteBackground,
  updateBackground,
} from "../state/slices/novelFormSlice";
import { useAppSelector } from "../state/store";
import "./BackgroundEditModal.scss";

export default function BackgroundEditModal() {
  const background = useAppSelector(selectEditingBackground);
  const dispatch = useDispatch();
  const { openModal } = AreYouSure.useAreYouSure();
  const [backgroundUploading, setBackgroundUploading] =
    useState<boolean>(false);

  const handleDeleteBackground = () => {
    openModal({
      title: "Are you sure?",
      description: "This action cannot be undone",
      onYes: () => {
        dispatch(closeModal({ modalType: "background" }));
        if (background) {
          dispatch(deleteBackground(background.id));
        }
      },
    });
  };

  const handleUploadMP4 = () => {
    if (!background) return;
    const a = document.createElement("input");
    a.type = "file";
    a.accept = ".mp4";
    a.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 1500000) {
        toast.error("File size must be less than 1.5MB");
        return;
      }
      setBackgroundUploading(true);
      config.uploadAsset(file).then(({ success, assetId }) => {
        if (!success || !assetId) {
          setBackgroundUploading(false);
          return;
        }
        dispatch(
          updateBackground({
            ...background,
            source: { ...background.source, mp4: assetId },
          })
        );
        setBackgroundUploading(false);
      });
    };
    a.click();
  };

  const handleRemoveVideo = () => {
    if (!background) return;
    dispatch(
      updateBackground({
        ...background,
        source: { ...background.source, mp4: "" },
      })
    );
  };

  return (
    <Modal
      opened={!!background}
      title="Edit Background"
      className="BackgroundEditModal"
      shouldCloseOnOverlayClick
      onCloseModal={() => dispatch(closeModal({ modalType: "background" }))}
    >
      {background ? (
        <div className="BackgroundEditModal_content">
          {background.source.jpg.length > 0 ? (
            <div
              className="BackgroundEditModal__background"
              style={{
                backgroundImage: `url(${config.genAssetLink(
                  background.source.jpg
                )})`,
              }}
            />
          ) : null}
          <div>
            <Input
              label="Name"
              placeHolder="Forest"
              value={background.name}
              onChange={(e) =>
                dispatch(
                  updateBackground({ ...background, name: e.target.value })
                )
              }
            />
            <Input
              label="Description"
              placeHolder="forest at night, with trees and animals"
              value={background.description}
              onChange={(e) =>
                dispatch(
                  updateBackground({
                    ...background,
                    description: e.target.value,
                  })
                )
              }
            />

            <div className="BackgroundEditModal__animated">
              <div className="BackgroundEditModal__animated-label">
                <p>Animated background</p>
                <Tooltip id="Info-animated-bg" place="top" />
                <IoInformationCircleOutline
                  data-tooltip-id="Info-animated-bg"
                  data-tooltip-content="[OPTIONAL] Add a MP4 background, it will be desplayed remplacing the static image."
                />
              </div>
              <Button
                disabled={backgroundUploading}
                theme="gradient"
                onClick={handleUploadMP4}
              >
                {backgroundUploading ? <Loader /> : "Add background"}
              </Button>
            </div>

            {background.source.mp4 ? (
              <div className="BackgroundEditModal__video">
                <IoIosCloseCircleOutline
                  className="BackgroundEditModal__video-remove"
                  onClick={handleRemoveVideo}
                />
                <video autoPlay loop muted>
                  <source
                    src={config.genAssetLink(background.source.mp4)}
                    type="video/mp4"
                  />
                </video>
              </div>
            ) : null}
          </div>
          <div className="BackgroundEditModal__delete">
            <Button onClick={handleDeleteBackground} theme="primary">
              Delete background
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
