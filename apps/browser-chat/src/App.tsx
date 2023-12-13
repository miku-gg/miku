import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import { Aside } from "./components/aside/Aside";
import { InteractiveChat } from "./components/interactive-chat/InteractiveChat";
import { InteractiveResponsesContextProvider } from "./libs/useResponses";
import BotLoadingModal from "./components/loading/BotLoadingModal";
import { BotLoaderProvider, BotLoaderProps, getConfigFromURL } from "./libs/botLoader";
import { EMPTY_MIKU_CARD, MikuCard } from "@mikugg/bot-utils";
import axios from "axios";

export const BrowserChat = (props: BotLoaderProps): JSX.Element => {
  return (
    <BotLoaderProvider {...props}>
        <>
          <InteractiveResponsesContextProvider>
            <>
              <InteractiveChat />
              {/* <Aside /> */}
            </>
          </InteractiveResponsesContextProvider>
          <BotLoadingModal />
          <ToastContainer
            position="top-left"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </>
    </BotLoaderProvider>
  );
}

export const App = () => {
  const config = getConfigFromURL();

  let fetchMikuCard = async (botHash: string): Promise<MikuCard> => {
    return axios.get<MikuCard>(`${config.botDirectoryEndpoint}/${botHash}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then((res) => res.data).catch((err) => {
      console.log(err);
      return EMPTY_MIKU_CARD;
    });
  }

  let assetLinkLoader = (asset: string, format?: string) => {
    if (format === 'audio') {
      format = '';
    }
    return `${config.assetDirectoryEndpoint}/${(format && format !== '720p') ? `${format}_` : ''}${asset}`;
  }

  return (
    <div
      className="App flex w-screen h-screen p-5 max-lg:p-0 min-w-full text-center"
      style={{
        background:
          config.productionMode ? "transparent" : "linear-gradient(180deg, rgba(12,10,29,1) 0%, rgb(30 26 65) 100%)",
      }}
    >
      <BrowserChat
        assetLinkLoader={assetLinkLoader}
        servicesEndpoint={config.servicesEndpoint}
        mikuCardLoader={fetchMikuCard}
      />
    </div>
  );
};

export default App;
