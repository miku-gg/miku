import AssetsPanel from "./assets/AssetsPanel";
import ButtonGroup from "../components/ButtonGroup";
import SceneGraph from "./scenes/SceneGraph";
import StartsPanel from "./starts/StartsPanel";
import PreviewPanel from "./preview/PreviewPanel";
import HomePanel from "./HomePanel";
import { useAppDispatch, useAppSelector } from "../state/store";
import {
  closeModal,
  isPanelType,
  navigatePanel,
  openModal,
} from "../state/slices/inputSlice";
import { downloadNovelState } from "../libs/utils";
import config from "../config";
import { toast } from "react-toastify";
import { NovelV3 } from "@mikugg/bot-utils";
import { MdOutlinePermMedia } from "react-icons/md";
import { BiCameraMovie } from "react-icons/bi";
import { TbBoxMultiple } from "react-icons/tb";
import { LuMonitorPlay } from "react-icons/lu";
import { BiSolidSave } from "react-icons/bi";
import DetailsPanel from "./details/DetailsPanel";

const allowUntilStep = (novel: NovelV3.NovelState): number => {
  if (
    novel.backgrounds.length === 0 ||
    novel.characters.length === 0 ||
    novel.songs.length === 0
  )
    return 0;
  if (novel.scenes.length === 0) return 1;
  if (novel.starts.length === 0) return 2;
  return 3;
};

function PanelExplorer() {
  const novel = useAppSelector((state) => state.novel);
  const selectedPanel = useAppSelector((state) => state.input.navigation.panel);
  const dispatch = useAppDispatch();

  const maxStep = allowUntilStep(novel);
  return (
    <div className="panels">
      <ButtonGroup
        buttons={[
          {
            content: (
              <>
                <MdOutlinePermMedia /> <span>Details</span>
              </>
            ),
            value: "details",
          },
          {
            content: (
              <>
                <MdOutlinePermMedia /> <span>Assets</span>
              </>
            ),
            value: "assets",
          },
          {
            content: (
              <>
                <BiCameraMovie /> <span>Scenes</span>
              </>
            ),
            value: "scenes",
            disabled: maxStep < 1,
            tooltip:
              maxStep < 1 ? "Please add at least one asset for each" : "",
          },
          {
            content: (
              <>
                <TbBoxMultiple /> <span>Starts</span>
              </>
            ),
            value: "starts",
            disabled: maxStep < 2,
            tooltip: maxStep < 2 ? "Please add a scene" : "",
          },
          {
            content: (
              <>
                <LuMonitorPlay /> <span>Preview</span>
              </>
            ),
            value: "preview",
            disabled: maxStep < 3,
            tooltip: maxStep < 3 ? "Please add a start" : "",
          },
          {
            content: (
              <>
                <BiSolidSave /> <span>Save</span>
              </>
            ),
            value: "save",
          },
        ]}
        selected={selectedPanel}
        onButtonClick={async (value) => {
          if (isPanelType(value)) {
            dispatch(navigatePanel(value));
          } else if (value === "save") {
            try {
              await downloadNovelState(
                novel,
                config.genAssetLink,
                (text: string) => {
                  dispatch(
                    openModal({
                      modalType: "loading",
                      text,
                    })
                  );
                }
              );
            } catch (e) {
              toast.error("Failed to save novel");
            }
            dispatch(closeModal({ modalType: "loading" }));
          }
        }}
      />
      {selectedPanel === "details" ? <DetailsPanel /> : null}
      {selectedPanel === "assets" ? <AssetsPanel /> : null}
      {selectedPanel === "scenes" ? <SceneGraph /> : null}
      {selectedPanel === "starts" ? <StartsPanel /> : null}
      {selectedPanel === "preview" ? <PreviewPanel /> : null}
    </div>
  );
}

export default function App() {
  const page = useAppSelector((state) => state.input.navigation.page);
  return page === "homepage" ? <HomePanel /> : <PanelExplorer />;
}
