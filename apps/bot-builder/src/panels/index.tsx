import { AreYouSure } from "@mikugg/ui-kit";
import AssetsPanel from "./assets/AssetsPanel";
import ButtonGroup from "../components/ButtonGroup";
import { useState } from "react";
import ScenesPanel from "./scenes/ScenesPanel";

export default function App() {
  const [selectedPanel, setSelectedPanel] = useState<string>("assets");
  return (
    <div className="app">
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
      {selectedPanel === "assets" ? <AssetsPanel /> : <ScenesPanel />}
    </div>
  );
}
