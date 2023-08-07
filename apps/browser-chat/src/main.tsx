import ReactDOM from "react-dom/client";
import App from "./App";
import { BotLoaderProvider } from "./libs/botLoader";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BotLoaderProvider>
    <App />
  </BotLoaderProvider>
);
