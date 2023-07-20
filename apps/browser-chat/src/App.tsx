import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Aside } from "./components/aside/Aside";
import { InteractiveChat } from "./components/interactive-chat/InteractiveChat";
import { InteractiveResponsesContextProvider } from "./libs/useResponses";
import BotLoadingModal from "./components/loading/BotLoadingModal";
import { useBot } from "./libs/botLoader";
import { useEffect } from "react";

export const App = () => {
  const { card } = useBot();

  useEffect(() => {
    document.title = `miku.gg - ${card?.data?.name || ''}`;
  }, [card?.data?.name]);

  return (
    <div
      className="App flex w-screen h-screen p-5 max-lg:p-0 min-w-full text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,10,29,1) 0%, rgb(30 26 65) 100%)",
      }}
    >
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
    </div>
  );
};

export default App;
