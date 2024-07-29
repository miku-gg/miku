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
import ButtonGroup from "../components/ButtonGroup";
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
  const [selectedTab, setSelectedTab] = useState<string>("image");

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

  const handleUploadMP4 = (isForMobile: boolean) => {
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
        if (!isForMobile) {
          dispatch(
            updateBackground({
              ...background,
              source: { ...background.source, mp4: assetId },
            })
          );
          setSelectedTab("video");
        } else {
          dispatch(
            updateBackground({
              ...background,
              source: { ...background.source, mp4Mobile: assetId },
            })
          );
          setSelectedTab("mobileVideo");
        }
        setBackgroundUploading(false);
      });
    };
    a.click();
  };

  const handleRemoveVideo = (isForMobile: boolean) => {
    if (!background) return;
    if (isForMobile) {
      dispatch(
        updateBackground({
          ...background,
          source: { ...background.source, mp4Mobile: "" },
        })
      );
      setSelectedTab("video");
    } else {
      dispatch(
        updateBackground({
          ...background,
          source: { ...background.source, mp4: "", mp4Mobile: "" },
        })
      );
      setSelectedTab("image");
    }
  };

  const getBackgroundSteps = () => {
    const steps = [
      {
        content: "Image",
        value: "image",
      },
    ];
    if (background?.source.mp4) {
      steps.push({
        content: "Video",
        value: "video",
      });
    }
    if (background?.source.mp4Mobile) {
      steps.push({
        content: "Mobile Video",
        value: "mobileVideo",
      });
    }
    return steps;
  };

  return (
    <Modal
      opened={!!background}
      className="BackgroundEditModal"
      shouldCloseOnOverlayClick
      onCloseModal={() => dispatch(closeModal({ modalType: "background" }))}
    >
      {background ? (
        <div className="BackgroundEditModal_content">
          <div className="BackgroundEditModal__buttons">
            <h2>Edit Background</h2>
            {background.source.mp4 ? (
              <ButtonGroup
                selected={selectedTab}
                onButtonClick={(value) => setSelectedTab(value)}
                buttons={getBackgroundSteps()}
              />
            ) : null}{" "}
          </div>
          {background.source.jpg.length > 0 && selectedTab === "image" ? (
            <div
              className="BackgroundEditModal__background"
              style={{
                backgroundImage: `url(${config.genAssetLink(
                  background.source.jpg
                )})`,
              }}
            />
          ) : null}
          {background.source.mp4 && selectedTab === "video" ? (
            <div className="BackgroundEditModal__video">
              <IoIosCloseCircleOutline
                className="BackgroundEditModal__video-remove"
                onClick={() => handleRemoveVideo(false)}
              />
              <video autoPlay loop muted>
                <source
                  src={config.genAssetLink(background.source.mp4)}
                  type="video/mp4"
                />
              </video>
            </div>
          ) : null}
          {background.source.mp4Mobile && selectedTab === "mobileVideo" ? (
            <div className="BackgroundEditModal__video mobileVideo">
              <IoIosCloseCircleOutline
                className="BackgroundEditModal__video-remove"
                onClick={() => handleRemoveVideo(true)}
              />
              <video autoPlay loop muted>
                <source
                  src={config.genAssetLink(background.source.mp4Mobile)}
                  type="video/mp4"
                />
              </video>
            </div>
          ) : null}
          <div>
            <Input
              label="Name"
              placeHolder="Forest"
              className="BackgroundEditModal__input"
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
              className="BackgroundEditModal__input"
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

            {!background.source.mp4 ? (
              <div className="BackgroundEditModal__animated">
                <div className="BackgroundEditModal__animated-label">
                  <p>Animated background</p>
                  <Tooltip id="Info-animated-bg" place="top" />
                  <IoInformationCircleOutline
                    data-tooltip-id="Info-animated-bg"
                    data-tooltip-content="[OPTIONAL] Add a MP4 background, it will be displayed remplacing the static image."
                  />
                </div>
                <Button
                  disabled={backgroundUploading}
                  theme="gradient"
                  onClick={() => handleUploadMP4(false)}
                >
                  {backgroundUploading ? <Loader /> : "Add background"}
                </Button>
              </div>
            ) : null}
            {background.source.mp4 && !background.source.mp4Mobile ? (
              <div className="BackgroundEditModal__animated">
                <div className="BackgroundEditModal__animated-label">
                  <p>Animated mobile background</p>
                  <Tooltip id="Info-animated-bg-mobile" place="top" />
                  <IoInformationCircleOutline
                    data-tooltip-id="Info-animated-bg-mobile"
                    data-tooltip-content="[OPTIONAL] This would be a vertical background for the mobile use case"
                  />
                </div>
                <Button
                  disabled={backgroundUploading}
                  theme="gradient"
                  onClick={() => handleUploadMP4(true)}
                >
                  {backgroundUploading ? <Loader /> : "Add mobile background"}
                </Button>
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
