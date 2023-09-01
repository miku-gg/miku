import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import { Aside } from "./components/aside/Aside";
import { InteractiveChat } from "./components/interactive-chat/InteractiveChat";
import { InteractiveResponsesContextProvider } from "./libs/useResponses";
import BotLoadingModal from "./components/loading/BotLoadingModal";
import { BotLoaderProvider, BotLoaderProps, getBotDataFromURL } from "./libs/botLoader";
import { MikuCard } from "@mikugg/bot-utils";
import { AphroditeSettings, PromptCompleterEndpointType } from './libs/botSettingsUtils';
import plaformAPI from "./libs/platformAPI";

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

export const getAphroditeConfig = () => {
  const botData = getBotDataFromURL();

  if(botData.settings.promptCompleterEndpoint.type !== PromptCompleterEndpointType.APHRODITE) {
    return {
      enabled: false,
      botId: '',
      chatId: '',
      assetsUrl: '',
    }
  }

  const aphroditeConfig = (botData.settings.promptCompleterEndpoint.genSettings as AphroditeSettings)

  return {
    enabled: true,
    botId: aphroditeConfig.botId,
    chatId: aphroditeConfig.chatId,
    assetsUrl: aphroditeConfig.assetsUrl,
  };
}

export const App = () => {
  let fetchMikuCard = async (botHash: string): Promise<MikuCard> => {
    const aphrodite = getAphroditeConfig();
    if (aphrodite.enabled) {
      return plaformAPI.getBotConfig(botHash).then((res) => res.data)
    } else {
      return fetch(`${import.meta.env.VITE_BOT_DIRECTORY_ENDPOINT || 'http://localhost:8585/bot'}/${botHash}`)
        .then((res) => res.json() as Promise<MikuCard>)
    }
  };

  let servicesEndpoint = import.meta.env.VITE_SERVICES_ENDPOINT || "http://localhost:8585";

  let assetLinkLoader = (asset: string, format?: string) => {
    const aphrodite = getAphroditeConfig();
    if (aphrodite.enabled) {
      return `${aphrodite.assetsUrl}/${format ? `${format}_` : ''}${asset}`;
    } else {
      let assetsEndpoint = import.meta.env.VITE_IMAGES_DIRECTORY_ENDPOINT || "http://localhost:8585/image";
      return `${assetsEndpoint}/${asset}${format ? `_${format}` : ''}`;
    }
  }

  return (
    <div
      className="App flex w-screen h-screen p-5 max-lg:p-0 min-w-full text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,10,29,1) 0%, rgb(30 26 65) 100%)",
      }}
    >
      <BrowserChat
        assetLinkLoader={assetLinkLoader}
        servicesEndpoint={servicesEndpoint}
        mikuCardLoader={fetchMikuCard}
      />
    </div>
  );
};

export default App;
