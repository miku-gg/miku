import { DragAndDropImages, Input } from "@mikugg/ui-kit";
import { useAppDispatch, useAppSelector } from "../../state/store";
import config from "../../config";
import { checkFileType } from "../../libs/utils";
import { toast } from "react-toastify";
import { updateDetails } from "../../state/slices/novelFormSlice";

import "./DetailsPanel.scss";

export default function DetailsPanel() {
  const dispatch = useAppDispatch();
  const { title, description, author, logoPic } = useAppSelector(
    (state) => state.novel
  );

  const handleLogoPicChange = async (file: File) => {
    console.log("file", file);
    if (file) {
      try {
        const asset = await config.uploadAsset(file);
        dispatch(
          updateDetails({
            name: "logoPic",
            value: asset.assetId,
          })
        );
      } catch (e) {
        toast.error("Error uploading the image");
        console.error(e);
      }
    }
  };

  return (
    <div className="DetailsPanel">
      <h1>Details</h1>
      <div className="DetailsPanel__form">
        <div className="DetailsPanel__texts">
          <div className="DetailsPanel__formGroup">
            <Input
              placeHolder="The title of your Novel"
              id="title"
              name="title"
              label="Novel Title"
              description="The title of your Novel"
              value={title}
              onChange={(e) => {
                dispatch(
                  updateDetails({
                    name: "title",
                    value: e.target.value,
                  })
                );
              }}
            />
          </div>
          <div className="DetailsPanel__formGroup">
            <Input
              placeHolder="The description of your Novel"
              id="description"
              name="description"
              label="Novel Description"
              description="The description of your Novel"
              value={description}
              onChange={(e) => {
                dispatch(
                  updateDetails({
                    name: "description",
                    value: e.target.value,
                  })
                );
              }}
            />
          </div>
          <div className="DetailsPanel__formGroup">
            <Input
              placeHolder="The author of the Novel"
              id="author"
              name="author"
              label="Author"
              description="The author of the Novel"
              value={author}
              onChange={(e) => {
                dispatch(
                  updateDetails({
                    name: "author",
                    value: e.target.value,
                  })
                );
              }}
            />
          </div>
        </div>
        <div className="DetailsPanel__formGroup">
          <label>Upload novel icon (256x256)</label>
          <DragAndDropImages
            size="lg"
            className="DetailsPanel__logoPic"
            handleChange={handleLogoPicChange}
            previewImage={logoPic && config.genAssetLink(logoPic)}
            placeHolder="(256x256)"
            onFileValidate={async (file) => {
              if (file.size > 1000000) {
                toast.error("File size should be less than 1MB");
                return false;
              }
              if (!checkFileType(file)) {
                toast.error(
                  "Invalid file type. Please upload a valid image file"
                );
                return false;
              }
              // check size
              return new Promise((resolve) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = function () {
                  if (img.width !== 256 || img.height !== 256) {
                    toast.error(
                      "Please upload an image with dimensions of 256x256 pixels."
                    );
                    resolve(false);
                  } else {
                    resolve(true);
                  }
                };
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
