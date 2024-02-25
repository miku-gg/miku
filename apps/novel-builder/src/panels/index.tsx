import AssetsPanel from "./assets/AssetsPanel";
import ButtonGroup from "../components/ButtonGroup";
import SceneGraph from "./scenes/SceneGraph";
import StartsPanel from "./starts/StartsPanel";
import PreviewPanel from "./preview/PreviewPanel";
import HomePanel from "./HomePanel";
import { useAppDispatch, useAppSelector } from "../state/store";
import { isPanelType, navigatePanel } from "../state/slices/inputSlice";
import { downloadNovelState } from "../libs/utils";

function PanelExplorer() {
  const novel = useAppSelector((state) => state.novel);
  const selectedPanel = useAppSelector((state) => state.input.navigation.panel);
  const dispatch = useAppDispatch();
  return (
    <div className="panels">
      <ButtonGroup
        buttons={[
          {
            text: "Assets",
            value: "assets",
          },
          {
            text: "Scenes",
            value: "scenes",
          },
          {
            text: "Starts",
            value: "starts",
          },
          {
            text: "Preview",
            value: "preview",
          },
          {
            text: "Save",
            value: "save",
          },
        ]}
        selected={selectedPanel}
        onButtonClick={(value) => {
          if (isPanelType(value)) {
            dispatch(navigatePanel(value));
          } else if (value === "save") {
            downloadNovelState(novel);
          }
        }}
      />
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
