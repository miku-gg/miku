import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Conversation } from "./components/conversation/Conversation";
import { Chat } from "./components/chat/Chat";
import { Aside } from "./components/aside/Aside";
import { useBot } from "./libs/botLoader";
import BotLoadingModal from "./components/loading/BotLoadingModal";
import botFactory from "./libs/botFactory";

export const App = () => {
  const [loading, setLoading] = useState<number>(0);
  const [subscribedToAudio, setSubscribedToAudio] = useState<boolean>(false);
  const { loading: loadingBot, botHash, botConfig } = useBot();

  const sendPrompt = (
    event: React.UIEvent,
    value: string,
    type: number
  ): void => {
    event.preventDefault();
    setLoading(subscribedToAudio ? 2 : 1);
    botFactory.getInstance()?.sendPrompt(value, type, botConfig?.subject || 'You').catch(() => setLoading(0));
  };

  useEffect(() => {
    botFactory.getInstance()?.subscribeDialog(() => {
      setLoading((prev) => Math.max(prev - 1, 0));
    });
  }, [botConfig]);

  useEffect(() => {
    const _subscribedToAudio = botFactory.getInstance()?.subscribeAudio(() => {
      setLoading((prev) => Math.max(prev - 1, 0));
    }) || false;
    setSubscribedToAudio(_subscribedToAudio);
  }, [botConfig]);

  return (
    <div
      className="flex w-screen h-screen p-10 max-lg:p-0 min-w-full text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,10,29,1) 0%, rgb(30 26 65) 100%)",
      }}
    >
      <div className="w-5/12 h-full max-lg:w-full flex flex-col gap-3">
        <Conversation loading={loading} sendPrompt={sendPrompt}/>
        <Chat sendPrompt={sendPrompt} />
      </div>
      <Aside />
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
    </div>
  );
};

export default App;
