import { useEffect, useState, useReducer, useRef } from "react";
import "./aside.css";
import botFactory from "../../libs/botFactory";
import { useBot } from "../../libs/botLoader";
import { PopUp } from "../pup-up/pup-up";
import { BotDetails } from "../bot-details/BotDetails";
import { toast } from "react-toastify";
import {
  HistoryConsole,
  HistoryManagementButtons,
} from "../chat-history/chat-history";
import { DropDown } from "../dropdown/Dropdown";
import { MuteIcon, PlayIcon } from "@primer/octicons-react";
import { BotSettings } from "../bot-settings/BotSettings";
import { BotSettingsFooter } from "../bot-settings/BotSettingsFooter";

interface CustomAudioPlayerProps {
  src: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(1);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Autoplay error:", error);
        setPlaying(false);
      });
    }
  }, [src]);

  return (
    <div className="custom-audio-player">
      <audio ref={audioRef} src={src} autoPlay loop />
      <button onClick={togglePlay}>
        {playing ? <MuteIcon /> : <PlayIcon />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
      />
    </div>
  );
};

export default CustomAudioPlayer;

export const Aside = () => {
  const history = botFactory.getInstance()?.getMemory();
  const { botConfig, botHash, loading } = useBot();
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [chatHistoryToggle, setChatHistoryToggle] = useState<boolean>(true);
  const [handleBotDetails, setHandleBotDetails] = useState<boolean>(false);
  const [handleBotSettings, setHandleBotSettings] = useState<boolean>(false);
  const musicPieces = [
    "devonshire",
    "folk_round",
    "lobby",
    "yumemi",
    "waltz",
    "gymnopedie",
    "calmant",
    "canon_d",
    "air_prelude",
  ];
  const [musicIndex, setMusicIndex] = useState<number>(0);

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

  const displayBotSettings = () => {
    setHandleBotSettings(true);
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
              <button
                className="button-purple min-w-[10em]"
                onClick={() =>
                  toast.warn(
                    "Feature not available yet. Please read the docs to do it manually."
                  )
                }
              >
                Load bot
              </button>
              <button
                className="button-transparent min-w-[10em]"
                onClick={displayBotSettings}
              >
                Settings
              </button>
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
          <div className="flex gap-4">
            <DropDown
              items={musicPieces}
              onChange={(index) => setMusicIndex(index)}
              selectedIndex={musicIndex}
            />
            <CustomAudioPlayer src={`music/${musicPieces[musicIndex]}.mp3`} />
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
      <PopUp
        closePopUpFunction={() => setHandleBotSettings(false)}
        isShowingPupUp={handleBotSettings}
        className="w-6/12"
        darkTheme
      >
        <p className="ml-4 text-start text-2xl text-white">Setings</p>
        <BotSettings mobile={true} />
        <div className="w-full flex justify-center gap-7 pb-3 flex-wrap red-500 text-red-500">
          <BotSettingsFooter />
        </div>
      </PopUp>
    </>
  );
};
