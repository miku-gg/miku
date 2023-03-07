import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Conversation } from "./components/conversation/Conversation";
import { Chat } from "./components/chat/Chat";
import { Aside } from "./components/aside/Aside";
import BotLoadingModal from "./components/loading/BotLoadingModal";

export const App = () => {
  return (
    <div
      className="flex w-screen h-screen p-10 max-lg:p-0 min-w-full text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(12,10,29,1) 0%, rgb(30 26 65) 100%)",
      }}
    >
      <div className="w-5/12 h-full max-lg:w-full flex flex-col gap-3">
        <Conversation />
        <Chat />
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
