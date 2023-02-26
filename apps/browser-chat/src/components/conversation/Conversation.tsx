import * as MikuExtensions from "@mikugg/extensions";
import { useEffect, useReducer, useState } from "react";
import "./conversation.css";

import historyIcon from "../../assets/icons/chat-history.png";
import settingsIcon from "../../assets/icons/settings.png";
import infoIcon from "../../assets/icons/information.png";
import backgroundIcon from "../../assets/icons/background.png";

import { Loader } from "../loading/Loader";
import botFactory from "../../libs/botFactory";
import { useBot } from "../../libs/botLoader";
import { PopUp } from "../pup-up/pup-up";
import { ChatHistory, HistoryManagementButtons } from "../chat-history/chat-history";
import { BotDetails } from "../bot-details/BotDetails";
import "./conversation.css";

const VITE_IMAGES_DIRECTORY_ENDPOINT = import.meta.env.VITE_IMAGES_DIRECTORY_ENDPOINT || 'http://localhost:8585/images';

export const Conversation = ({ loading }: any) => {
  const [message, setMessage] = useState<string>();
  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [emotionImage, setEmotionImage] = useState<string>();
  const { botConfig } = useBot();
  const [ showHistory, setShowHistory ] = useState<Boolean>(false)
  const [ handleBotDetailsInfo, setHandleBotDetailsInfo ] = useState<boolean>(false);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (botConfig) {
      setBackgroundImage(botConfig.background_pic);
      const emotionInterpreterConfig = botConfig.outputListeners.find(listener => listener.service === MikuExtensions.Services.ServicesNames.OpenAIEmotionInterpreter)
      if (emotionInterpreterConfig) {
        // @ts-ignore
        setEmotionImage(emotionInterpreterConfig.props?.images?.neutral || '');
      }
    }
    botFactory.getInstance()?.subscribeDialog((output) => {
      setMessage(output.text);
      setEmotionImage(output.imgHash);
    });
  }, [botConfig]);

  useEffect(() => {
    botFactory.getInstance()?.subscribeAudio((base64: string) => {
      const snd = new Audio(base64);
      snd.play();
    });
  }, [botConfig]);

  const handleHistoryButtonClick = () =>{
    setShowHistory(true)
  }
  
  const displayBotDetails = () =>{
    setHandleBotDetailsInfo(true)
  }

  return (
    // MAIN CONTAINER
    <>
      <div className="relative flex flex-col w-full h-5/6 items-center">
        {/* MAIN IMAGE */}
        <div className="relative flex flex-col justify-center items-center w-full h-full">
          <div className="flex items-center justify-between pt-3 px-3 absolute z-10 top-0 w-full">
            <div className="flex gap-3">
              <button className="rounded-full" onClick={displayBotDetails}><img src={infoIcon}/></button>
              {/* <button className="rounded-full"><img src={backgroundIcon}/></button> */}
            </div>
            <div className="flex gap-3">
              <button className="rounded-full" onClick={handleHistoryButtonClick}><img src={historyIcon}/></button>
              {/* <button className="rounded-full"><img src={settingsIcon}/></button> */}
            </div>
          </div>
          <img className="h-full w-full z-0 rounded-xl conversation-background-image object-cover"
            src={`${VITE_IMAGES_DIRECTORY_ENDPOINT}/${backgroundImage}`}
            alt="background"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = "/default_background.png";
            }}
          />
          <img
            className="absolute bottom-0 h-[25rem] z-10 conversation-bot-image object-cover"
            src={`${VITE_IMAGES_DIRECTORY_ENDPOINT}/${emotionImage}`}
            alt="character"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = "/default_character.png";
            }}
          />
        </div>
        {/* CONVERSATION CONTAINER */}
        <div
          className={
            (!message && !loading)
              ? "hidden"
              : "absolute bottom-10 z-10 flex justify-center items-center w-full h-1/4"
          }
        >
          <div className="flex justify-left px-8 py-4 items-start scrollbar w-10/12 h-3/4 bg-gradient-to-b from-slate-900/[.7] to-gray-500/50 rounded-md overflow-auto border-[4px] drop-shadow-2xl shadow-black">
            {loading ? (
              <Loader />
            ) : (
              <p className="text-xl font-bold text-white ">{message}</p>
            )}
          </div>
        </div>
      </div>
      <PopUp 
        className ="gap-4 justify-between" 
        darkTheme closePopUpFunction={()=>setShowHistory(false)} 
        isShowingPupUp={showHistory}
        >
        <p className="ml-4 text-start text-2xl text-white">Conversation History</p>
        <ChatHistory />
        <div className="w-full flex justify-center gap-7 pb-3 flex-wrap">
          <HistoryManagementButtons onLoad={() => forceUpdate()} />
        </div>
      </PopUp> 
      <PopUp 
        closePopUpFunction={() => setHandleBotDetailsInfo(false)} 
        isShowingPupUp={handleBotDetailsInfo}
        className="w-6/12"
        darkTheme
        >
          <BotDetails />
      </PopUp>
    </>
  );
};
