import ReactDOM from "react-dom/client";
import App from "./App";
import { BotLoaderProvider } from "./libs/botLoader";
import "./index.css";
import ReactGA from "react-ga4";

const GA_KEY = import.meta.env.VITE_GA_KEY || '';
if (GA_KEY) ReactGA.initialize(GA_KEY);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BotLoaderProvider>
    <App />
  </BotLoaderProvider>
);
