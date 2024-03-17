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
  navigatePage,
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
import { LuTextQuote } from "react-icons/lu";
import DetailsPanel from "./details/DetailsPanel";
import "./PanelExplorer.scss";
import { AreYouSure } from "@mikugg/ui-kit";
import cloneDeep from "lodash.clonedeep";
import { clearNovelState } from "../state/slices/novelFormSlice";

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
  const { openModal: openAreYouSure } = AreYouSure.useAreYouSure();

  const maxStep = allowUntilStep(novel);
  return (
    <div className="PanelExplorer">
      <div className="PanelExplorer__header">
        <ButtonGroup
          buttons={[
            {
              content: (
                <>
                  <LuTextQuote /> <span>Details</span>
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
          ]}
          selected={selectedPanel}
          onButtonClick={async (value) => {
            if (isPanelType(value)) {
              dispatch(navigatePanel(value));
            }
          }}
        />
        <ButtonGroup
          buttons={[
            {
              content: (
                <>
                  <BiSolidSave /> <span>Restart</span>
                </>
              ),
              value: "restart",
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
            if (value === "save") {
              try {
                await downloadNovelState(
                  cloneDeep(novel),
                  false,
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
                console.error(e);
                toast.error("Failed to save novel");
              }
              dispatch(closeModal({ modalType: "loading" }));
            } else if (value === "restart") {
              openAreYouSure({
                title: "Are you sure you want to restart?",
                description: "This will delete your current progress.",
                onYes: () => {
                  dispatch(clearNovelState());
                  dispatch(navigatePage("homepage"));
                },
              });
            }
          }}
        />
      </div>
      <div className="PanelExplorer__content">
        {selectedPanel === "details" ? <DetailsPanel /> : null}
        {selectedPanel === "assets" ? <AssetsPanel /> : null}
        {selectedPanel === "scenes" ? <SceneGraph /> : null}
        {selectedPanel === "starts" ? <StartsPanel /> : null}
        {selectedPanel === "preview" ? <PreviewPanel /> : null}
      </div>
    </div>
  );
}

export default function App() {
  const page = useAppSelector((state) => state.input.navigation.page);
  return page === "homepage" ? <HomePanel /> : <PanelExplorer />;
}
