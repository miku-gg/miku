import { MdDraw } from "react-icons/md";
import { FaUpload } from "react-icons/fa";

import "./HomePanel.scss";
import { useAppDispatch } from "../state/store";
import { navigatePage, navigatePanel } from "../state/slices/inputSlice";
import { useRef } from "react";
import {
  importAndReplaceNovelStateAssets,
  inputToNovelState,
} from "../libs/importCard";
import { loadCompleteState } from "../state/slices/novelFormSlice";

export default function HomePanel() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result;
      if (typeof result !== "string") return;
      try {
        const data = JSON.parse(result);
        const state = inputToNovelState(data);
        const novelWithUploadedAssets = await importAndReplaceNovelStateAssets(
          state.novel,
          {
            onError: (err, msg) => {
              console.error(err, msg);
            },
            onUpdate: (progress) => {
              console.log(progress);
            },
            uploadAsset: async (asset: string) => {
              // wait for 0.1 second to simulate upload
              await new Promise((resolve) => setTimeout(resolve, 100));
              return {
                success: true,
                assetId: "test.jpg",
              };
            },
            uploadBatchSize: 10,
          }
        );
        dispatch(loadCompleteState(novelWithUploadedAssets));
        dispatch(navigatePage("edit"));
        dispatch(navigatePanel("assets"));
      } catch (e) {
        console.error(e);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="HomePanel">
      <div className="HomePanel__options">
        <div
          className="HomePanel__option"
          tabIndex={0}
          role="button"
          onClick={() => {
            dispatch(navigatePage("edit"));
            dispatch(navigatePanel("assets"));
          }}
        >
          <div className="HomePanel__option__icon">
            <MdDraw />
          </div>
          <div className="HomePanel__option__text">Start from scratch</div>
          <div className="HomePanel__option__description">
            Create an empty novel
          </div>
        </div>
        <div
          className="HomePanel__option"
          tabIndex={0}
          role="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="HomePanel__option__icon">
            <FaUpload />
          </div>
          <div className="HomePanel__option__text">Import novel or card</div>
          <div className="HomePanel__option__description">
            From{" "}
            <span style={{ color: "gray" }}>
              MikuGG, Agnastic, TavernAI, Pygmalion, RisuAI
            </span>
            <br />
            Formats:{" "}
            <span style={{ color: "gray" }}>
              .png, .miku-temp.json, .miku.json, .miku.card.png (old)
            </span>
          </div>
          <input
            type="file"
            accept="application/json, image/png, .miku"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileLoad}
          />
        </div>
      </div>
    </div>
  );
}
