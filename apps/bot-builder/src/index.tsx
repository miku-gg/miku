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

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AreYouSure.AreYouSureProvider>
        <div className="app">
          <Planels />
        </div>
        <BackgroundEditModal />
        <BackgroundSearchModal />
        <ToastContainer />
      </AreYouSure.AreYouSureProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
