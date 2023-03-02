import * as MikuExtensions from "@mikugg/extensions";
import React, { useEffect, useReducer, useState } from "react";
import "./conversation.css";

import historyIcon from "../../assets/icons/chat-history.png";
// import settingsIcon from "../../assets/icons/settings.png";
import infoIcon from "../../assets/icons/information.png";
// import backgroundIcon from "../../assets/icons/background.png";

import { Loader } from "../loading/Loader";
import botFactory from "../../libs/botFactory";
import { useBot } from "../../libs/botLoader";
import { PopUp } from "../pup-up/pup-up";
import { ChatHistory, HistoryManagementButtons } from "../chat-history/chat-history";
import { BotDetails } from "../bot-details/BotDetails";
import "./conversation.css";
import { Reload } from "../../assets/icons/svg";
import { UnmuteIcon } from "@primer/octicons-react";

const VITE_IMAGES_DIRECTORY_ENDPOINT = import.meta.env.VITE_IMAGES_DIRECTORY_ENDPOINT || 'http://localhost:8585/images';

const playAudio = (base64: string): void => {
  const snd = new Audio(base64);
  snd.play();
}

export const Conversation = ({ loading, sendPrompt }: any) => {
  const [message, setMessage] = useState<string>();
  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [emotionImage, setEmotionImage] = useState<string>();
  const { botConfig } = useBot();
  const [ showHistory, setShowHistory ] = useState<Boolean>(false)
  const [ handleBotDetailsInfo, setHandleBotDetailsInfo ] = useState<boolean>(false);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [lastAudio, setLastAudio] = useState<string>('');

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
      if (base64) {
        playAudio(base64);
        setLastAudio(base64);  
      }
    });
  }, [botConfig]);

  const handleHistoryButtonClick = () =>{
    setShowHistory(true)
  }
  
  const displayBotDetails = () =>{
    setHandleBotDetailsInfo(true)
  }

  const onRegenerateClick = (event: React.UIEvent) => {
    const bot = botFactory.getInstance();
    const shortTermMemory = bot?.getMemory();
    const memoryLines = shortTermMemory?.getMemory();
    if (shortTermMemory && memoryLines && memoryLines.length >= 2) {
      shortTermMemory.clearMemories();
      memoryLines.forEach((line, index) => {
        if (index < memoryLines.length - 2) {
          shortTermMemory.pushMemory(line);
        }
      })

      const lastMemoryLine = memoryLines[memoryLines.length - 2];

      sendPrompt(event, lastMemoryLine.text, lastMemoryLine.type);
    }
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
            className="absolute bottom-0 h-[80%] z-10 conversation-bot-image object-cover"
            src={`${VITE_IMAGES_DIRECTORY_ENDPOINT}/${emotionImage}`}
            alt="character"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = "/default_character.png";
            }}
          />
        </div>
        {/* RESPONSE CONTAINER */}
        <div
          className={
            (!message && !loading)
              ? "hidden"
              : "absolute bottom-10 z-10 flex justify-center items-center w-full h-1/4"
          }
        >
          <div className="response-container h-3/4 w-10/12 relative">
            <div className="flex justify-left px-8 py-4 items-start scrollbar w-full h-full bg-gradient-to-b from-slate-900/[.7] to-gray-500/50 rounded-md overflow-auto border-[4px] drop-shadow-2xl shadow-black">
              {loading ? (
                <Loader />
              ) : (
                <p className="text-lg font-bold text-white ">{message}</p>
              )}
            </div>
            {
              !loading ? (
                <button
                  className="reload-button absolute top-[-2.5em] right-2 inline-flex items-center gap-2 bg-slate-900/80 p-2 drop-shadow-2xl shadow-black text-white rounded-t-md"
                  onClick={onRegenerateClick}
                >
                  <Reload />
                  Regenerate
                </button>
              ) : null
            }
            {
              (!loading && lastAudio) ? (
                <button
                  className="audio-button absolute bottom-3 left-3 inline-flex items-center gap-2 text-gray-400 rounded-md hover:text-white"
                  onClick={() => playAudio(lastAudio)}
                >
                  <UnmuteIcon size={24} />
                </button>
              ) : null
            }
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
