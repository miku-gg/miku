import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { AreYouSure } from "@mikugg/ui-kit";
import { store } from "./state/store";
import Planels from "./panels";
import BackgroundEditModal from "./modals/BackgroundEditModal";
import BackgroundSearchModal from "./modals/BackgroundSearchModal";
import "./styles/main.scss";
import SongEditModal from "./modals/SongEditModal";
import SongSearchModal from "./modals/SongSearchModal";
import CharacterEditModal from "./modals/character/CharacterEditModal";
import SceneEditModal from "./modals/scene/SceneEditModal";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AreYouSure.AreYouSureProvider>
        <div className="app">
          <Planels />
        </div>
        <SceneEditModal />
        <BackgroundEditModal />
        <BackgroundSearchModal />
        <SongEditModal />
        <SongSearchModal />
        <CharacterEditModal />
        <ToastContainer />
      </AreYouSure.AreYouSureProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
