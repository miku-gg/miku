import { AreYouSure } from "@mikugg/ui-kit";
import AssetsPanel from "./assets/AssetsPanel";
import ButtonGroup from "../components/ButtonGroup";
import { useState } from "react";
import SceneGraph from "./scenes/SceneGraph";

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
        ]}
        selected={selectedPanel}
        onButtonClick={(value) => setSelectedPanel(value)}
      />
      {selectedPanel === "assets" ? <AssetsPanel /> : <SceneGraph />}
    </div>
  );
}
