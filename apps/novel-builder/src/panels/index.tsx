import AssetsPanel from "./assets/AssetsPanel";
import ButtonGroup from "../components/ButtonGroup";
import { useState } from "react";
import SceneGraph from "./scenes/SceneGraph";
import StartsPanel from "./starts/StartsPanel";
import PreviewPanel from "./preview/PreviewPanel";

export default function App() {
  const [selectedPanel, setSelectedPanel] = useState<string>("scenes");
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
        ]}
        selected={selectedPanel}
        onButtonClick={(value) => setSelectedPanel(value)}
      />
      {selectedPanel === "assets" ? <AssetsPanel /> : null}
      {selectedPanel === "scenes" ? <SceneGraph /> : null}
      {selectedPanel === "starts" ? <StartsPanel /> : null}
      {selectedPanel === "preview" ? <PreviewPanel /> : null}
    </div>
  );
}
