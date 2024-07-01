import "./AssetsPanel.scss";
import Backgrounds from "./backgrounds/Backgrounds";
import Characters from "./characters/Characters";
import InventoryItems from "./inventory/InventoryItems";
import Songs from "./songs/Songs";

export default function AssetsPanel() {
  return (
    <div className="AssetsPanel">
      <div className="AssetsPanel__header">
        <h1>Assets</h1>
      </div>
      <div className="AssetsPanel__groups">
        <Characters />
        <Backgrounds />
        <Songs />
        <InventoryItems />
      </div>
    </div>
  );
}
