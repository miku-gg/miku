import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BotLoadingModal from "./components/loading/BotLoadingModal";
import { Aside } from "./components/aside/Aside";
import { InteractiveChat } from "./components/interactive-chat/InteractiveChat";
import { InteractiveResponsesContextProvider } from "./libs/useResponses";

export const App = () => {
  return (
    <div
      className="App flex w-screen h-screen p-10 max-lg:p-0 min-w-full text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,10,29,1) 0%, rgb(30 26 65) 100%)",
      }}
    >
      <InteractiveResponsesContextProvider>
        <InteractiveChat />
      </InteractiveResponsesContextProvider>
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
