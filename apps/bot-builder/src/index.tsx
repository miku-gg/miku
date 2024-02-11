import React from "react";
import ReactDOM from "react-dom";
import "./styles/main.scss";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { ToastContainer } from "react-toastify";
import Planels from "./panels";
import BackgroundEditModal from "./modals/BackgroundEditModal";
import { AreYouSure } from "@mikugg/ui-kit";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AreYouSure.AreYouSureProvider>
        <div className="app">
          <Planels />
        </div>
        <BackgroundEditModal />
        <ToastContainer />
      </AreYouSure.AreYouSureProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
