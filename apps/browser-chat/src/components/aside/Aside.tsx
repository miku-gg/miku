import { useEffect, useState, useReducer } from "react";
import "./aside.css";
import botFactory from "../../libs/botFactory";
import { useBot } from "../../libs/botLoader";
import { PopUp } from "../pup-up/pup-up";
import { BotDetails } from "../bot-details/BotDetails";
import { toast } from "react-toastify";
import { HistoryConsole, HistoryManagementButtons } from "../chat-history/chat-history";

export const Aside = () => {
  const history = botFactory.getInstance()?.getMemory();
  const { botConfig, botHash, loading } = useBot();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [chatHistoryToggle, setChatHistoryToggle] = useState<boolean>(true);
  const [handleBotDetails, setHandleBotDetails] = useState<boolean>(false);

  useEffect(() => {
    botFactory.getInstance()?.subscribeDialog(() => {
      forceUpdate();
    });
  }, [botConfig]);

  const displayChatHistory = () => {
    setChatHistoryToggle(!chatHistoryToggle);
  };

  const displayBotDetails = () => {
    setHandleBotDetails(true);
  };

  return (
    <>
      {/* BURGUER MENU */}
      {/* <button
        className={`absolute top-0 mt-10 mr-5 z-40 right-0 hidden max-sm:block`}
        onClick={displayChatHistory}
      ><img src={menuIcon}/></button> */}
      {/* ASIDE CONTAINER */}
      <div
        className={`flex flex-col justify-between items-center w-7/12 h-full px-5 max-h-screen text-white ${
          chatHistoryToggle == true
            ? "max-lg:hidden"
            : "max-lg:block max-sm:absolute max-sm:pt-16 max-sm:bg-white max-sm:w-full max-sm:z-10"
        }`}
      >
        {/* BUTTONS // CONSOLE */}
        <div className="flex flex-col justify-between items-center w-full flex-grow pb-10 overflow-auto">
          {/* BUTTONS */}
          <div className="flex justify-between items-center w-full h-[3rem] flex-wrap gap-y-3 mb-4">
            <div className="flex w-auto h-full gap-4">
              <button
                className="button-transparent min-w-[10em]"
                onClick={displayBotDetails}
              >
                Bot details
              </button>
              <button className="button-purple min-w-[10em]" onClick={() => toast.warn("Feature not available yet. Please read the docs to do it manually.")}>Load bot</button>
            </div>
            {/* USERNAME // TOKENS */}
            <div className="h-full w-auto text-right pr-2">
              <p className="text-xs text-zinc-400">Credits</p>
              <p className="text-white font-bold text-2xl">∞</p>
            </div>
          </div>
          {/* CONSOLE */}
          <div className="scrollbar flex flex-3 w-full overflow-auto min-h-[10em] flex-grow h-fit">
            <HistoryConsole />
          </div>
        </div>
        {/* HISTORY // LOGS // FINISH CONVERSATION */}
        <div className="flex justify-between items-center w-full h-[3rem]">
          <div className="flex w-2/6 h-full gap-4">
            <HistoryManagementButtons onLoad={() => forceUpdate()} />
          </div>
        </div>
      </div>
      <PopUp
        closePopUpFunction={() => setHandleBotDetails(false)}
        isShowingPupUp={handleBotDetails}
        className="w-6/12"
        darkTheme
      >
        <BotDetails />
      </PopUp>
    </>
  );
};
