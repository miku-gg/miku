import "./AssetsPanel.scss";
import Backgrounds from "./backgrounds/Backgrounds";
import Characters from "./characters/Characters";
import Songs from "./songs/Songs";

export default function AssetsPanel() {
  return (
    <div className="AssetsPanel page-container">
      <div className="AssetsPanel__header">
        <div className="AssetsPanel__title title">Assets</div>
        <div className="AssetsPanel__description description">sadfasdf</div>
      </div>
      <div className="AssetsPanel__groups">
        <Characters />
        <Backgrounds />
        <Songs />
      </div>
    </div>
  );
}
