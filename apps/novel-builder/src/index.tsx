import { AreYouSure } from "@mikugg/ui-kit";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackgroundEditModal from "./modals/BackgroundEditModal";
import BackgroundSearchModal from "./modals/BackgroundSearchModal";
import LoadingModal from "./modals/LoadingModal";
import LorebookEditModal from "./modals/LorebookEditModal";
import SongEditModal from "./modals/SongEditModal";
import SongSearchModal from "./modals/SongSearchModal";
import CharacterEditModal from "./modals/character/CharacterEditModal";
import MapEditModal from "./modals/map/MapEditModal";
import SceneEditModal from "./modals/scene/SceneEditModal";
import Planels from "./panels";
import { store } from "./state/store";
import "./styles/main.scss";
import PlaceEditModal from "./modals/map/PlaceEditModal";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AreYouSure.AreYouSureProvider>
        <div className="app">
          <div className="app__header">
            <div>Novel Builder</div>
          </div>
          <Planels />
        </div>
        <SceneEditModal />
        <BackgroundEditModal />
        <BackgroundSearchModal />
        <SongEditModal />
        <SongSearchModal />
        <CharacterEditModal />
        <LorebookEditModal />
        <LoadingModal />
        <MapEditModal />
        <PlaceEditModal />
        <ToastContainer />
      </AreYouSure.AreYouSureProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
