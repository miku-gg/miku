import React from "react";
import ReactDOM from "react-dom";
import "./styles/main.scss";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { ToastContainer } from "react-toastify";
import Planels from "./panels";
import BackgroundEditModal from "./modals/BackgroundEditModal";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <div className="app">
        <Planels />
      </div>
      <BackgroundEditModal />
      <ToastContainer />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
