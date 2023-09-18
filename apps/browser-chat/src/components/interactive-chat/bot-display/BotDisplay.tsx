import * as MikuCore from "@mikugg/core";
import * as MikuExtensions from "@mikugg/extensions";
import React, { useContext, useEffect, useState } from "react";
import { TypeAnimation } from 'react-type-animation';
import "./BotDisplay.css";
import { v4 as uuidv4 } from 'uuid';

import historyIcon from "../../../assets/icons/chat-history.png";
import infoIcon from "../../../assets/icons/information.png";
import settingsIcon from "../../../assets/icons/settings.png";

import { Loader } from "../../loading/Loader";
import botFactory from "../../../libs/botFactory";
import { useBot } from "../../../libs/botLoader";
import { PopUp } from "../../pup-up/pup-up";
import {
  ChatHistory,
  HistoryManagementButtons,
} from "../../chat-history/chat-history";
import { BotDetails } from "../../bot-details/BotDetails";
import "./BotDisplay.css";
import { LeftArrow, RightArrow, Dice, Wand } from "../../../assets/icons/svg";
import { UnmuteIcon } from "@primer/octicons-react";
import { InteractiveResponsesContext } from "../../../libs/useResponses";
import { responsesStore } from "../../../libs/responsesStore";
import { Tooltip } from "@mui/material";
import { BotConfigV1, BotConfigV2 } from "@mikugg/bot-utils";
import { BotSettings } from "../../bot-settings/BotSettings";
import { BotSettingsFooter } from "../../bot-settings/BotSettingsFooter";
import ScenarioSelector from "../scenario-selector/ScenarioSelector";
import EmotionRenderer from "../../asset-renderer/EmotionRenderer";
import ProgressiveImage from "react-progressive-graceful-image";
import { trackEvent } from "../../../libs/analytics";
import platformAPI from "../../../libs/platformAPI";
import { getAphroditeConfig } from "../../../App";
import { PromptCompleterEndpointType } from "../../../libs/botSettingsUtils";
import MusicPlayer from "../../music/MusicPlayer";

export type BotSettings = {
  promptStrategy: string;
  sttModel: string;
  voiceGeneration: boolean;
  promptService: string;
  voiceService: string;
  voiceId: string;
  readNonSpokenText: boolean;
  oldVoiceService: string;
};

export type GenSettings = {
  maxContextLength: number;
  temp: number;
  maxTokens: number;
  topP: number;
  topK: number;
  typicalP: number;
  repetitionPenalty: number;
  encoderRepitionPenalty: number;
  noRepeatNgramSize: number;
  minLength: number;
  doSample: boolean;
  seed: number;
  penaltyAlpha: number;
  numBeams: number;
  addBosToken: boolean;
  banEosToken: boolean;
  lengthPenalty: number;
  earlyStopping: boolean;
  truncateLength: number;
  stoppingStrings: string;
  skipSpecialTokens: boolean;

  repetitionPenaltyRange: number;
  repetitionPenaltySlope: number;
  topA: number;
  tailFreeSampling: number;
  order: number[];

  frequencyPenalty: number;
  presencePenalty: number;
  oaiModel: string;
};

export let botSettings: BotSettings = {
  promptStrategy: "",
  sttModel: "Whisper",
  voiceGeneration: true,
  promptService: "llama",
  voiceService: "ElevenLabs",
  voiceId: "",
  readNonSpokenText: false,
  oldVoiceService: "",
};

const alreadyAnimated = new Set<string>();

function AnimateResponse({ text, fast }: { text: string, fast: boolean }): JSX.Element {
  const [parts, setParts] = useState<{content: string, isItalic: boolean, id: string}[]>([]);
  const [partIndex, setPartIndex] = useState<number>(0);

  useEffect(() => {
    const lines = text.split('\n');
    const parts = lines.flatMap(line => line.split('*').map(((part, i) => ({
      content: part,
      isItalic: i % 2 === 1,
      id: uuidv4()
    })))).filter(_ => _.content);
    
    setParts(parts);
    setPartIndex(0);
  }, [text]);

  return (
    <>
      {parts.filter((_, i) => i <= partIndex).map((part, i) => (
        <TypeAnimation
          key={`type-animation-${part.id}`}
          cursor={false}
          className={part.isItalic ? 'animate-response--italic' : 'animate-response'}
          style={{ whiteSpace: 'pre-line' }}
          sequence={[
            part.content,
            () => setPartIndex(index => Math.min(index + 1, parts.length - 1))
          ]}
          wrapper="span"
          speed={fast ? 99 : 70}
        />
      ))}
    </>
  );
}
  
export const BotDisplay = () => {
  const { card, botHash, botConfig, botConfigSettings, setBotConfigSettings, assetLinkLoader } = useBot();
  const [showHistory, setShowHistory] = useState<Boolean>(false);
  const [handleBotDetailsInfo, setHandleBotDetailsInfo] =
    useState<boolean>(false);
  const [showBotSettings, setShowBotSettings] = useState<boolean>(false);
  const {
    responseIds,
    setResponseIds,
    responseIndex,
    setResponseIndex,
    responsesGenerated,
    setResponsesGenerated,
    loading,
    response,
    prevResponse,
    playAudio,
    currentContext,
    setCurrentContext,
    onUpdate,
  } = useContext(InteractiveResponsesContext);
  const [contextSuggestion, setContextSuggestion] = useState<string>("");
  const scenario = card?.data.extensions.mikugg.scenarios.find(scenario => scenario.id === currentContext);
  const music = card?.data?.extensions?.mikugg?.sounds?.find(sound => sound.id === scenario?.music)?.source || scenario?.music || '';

  let backgroundImage = card?.data.extensions.mikugg.backgrounds.find(bg => bg.id === scenario?.background || '')?.source || '';
  let emotionImage = response?.emotion || prevResponse?.emotion || "";
  if (!emotionImage) {
    const openAIEmotionConfig = botConfig?.outputListeners.find(
      (listener: { service: string }) =>
        listener.service ===
        MikuExtensions.Services.ServicesNames.OpenAIEmotionInterpreter
    );
    const sbertEmotionConfig = botConfig?.outputListeners.find(
      (listener: { service: string }) =>
        listener.service ===
        MikuExtensions.Services.ServicesNames.SBertEmotionInterpreter
    );
    if (sbertEmotionConfig) {
      const props =
        sbertEmotionConfig.props as MikuExtensions.Services.SBertEmotionInterpreterProps;
      const images =
        props.contexts.find((context) => context.id === currentContext)
          ?.emotion_images || [];
      const imageCandidates = images.find(
        (image) => image.id === "neutral"
      )?.hashes;
      emotionImage = imageCandidates ? imageCandidates[0] : "";
    } else {
      // @ts-ignore
      emotionImage = openAIEmotionConfig?.props?.images?.neutral || "";
    }
  }

  useEffect(() => {
    const bot = botFactory.getInstance();
    bot?.subscribeContextChangeSuggestion((contextId) => {
      setContextSuggestion(contextId);
    });
  }, [botHash]);

  const updateContext = (_contextId: string) => {
    const bot = botFactory.getInstance();
    const sbertEmotionConfig = botConfig?.outputListeners.find(
      (listener) =>
        listener.service ===
        MikuExtensions.Services.ServicesNames.SBertEmotionInterpreter
    );
    if (bot && sbertEmotionConfig) {
      const props =
        sbertEmotionConfig.props as MikuExtensions.Services.SBertEmotionInterpreterProps;
      const context = props.contexts.find(
        (context) => context.id === _contextId
      );
      if (context) {
        bot.changeContext(_contextId);
        setCurrentContext(_contextId);
        // @ts-ignore
        bot.sendPrompt(
          `*${context.context_change_trigger}*`,
          MikuCore.Commands.CommandType.CONTEXT
        );
      }
    }
  };

  const handleHistoryButtonClick = () => setShowHistory(true);
  const displayBotDetails = () => setHandleBotDetailsInfo(true);
  const handleSettingsButtonClick = () => setShowBotSettings(true);

  const onRightClick = (event: React.UIEvent) => {
    if (responseIndex > 0 && responseIds.length > 0) {
      setResponseIndex(responseIndex - 1);
    }
  };

  const onLeftClick = (event: React.UIEvent) => {
    if (responseIndex < responseIds.length - 1) {
      setResponseIndex(responseIndex + 1);
    }
  };

  const onRegenerateClick = async (event: React.UIEvent) => {
    const bot = botFactory.getInstance();
    const shortTermMemory = bot?.getMemory();
    const memoryLines = shortTermMemory?.getMemory();
    trackEvent("bot_regenerate", {
      bot: card?.data.name
    })
    if (shortTermMemory && memoryLines && memoryLines.length >= 2) {
      shortTermMemory.clearMemories();
      memoryLines.forEach((line, index) => {
        if (index < memoryLines.length - 2) {
          shortTermMemory.pushMemory(line);
        }
      });

      const lastMemoryLine = memoryLines[memoryLines.length - 2];
      const lastResponse = memoryLines[memoryLines.length - 1];

      event.preventDefault();
      setResponseIds((_responseIds) => {
        const responseIds = [..._responseIds];
        responseIds.shift();
        return responseIds;
      });
      const aphrodite = getAphroditeConfig();

      if (aphrodite.enabled && lastMemoryLine.id && lastResponse.id) {
        await platformAPI.deleteChatMessage(aphrodite.chatId, lastResponse?.id || '');
        await platformAPI.deleteChatMessage(aphrodite.chatId, lastMemoryLine?.id || '');
      }

      const result = botFactory
        .getInstance()
        ?.sendPrompt(
          lastMemoryLine.text,
          lastMemoryLine.type
        );
      if (result?.commandId) {
        setResponsesGenerated((_responsesGenerated) => {
          const responsesGenerated = [result.commandId, ..._responsesGenerated];
          return responsesGenerated;
        });
      }
    }
  };

  const onOptionClick = (responseId: string, event: React.UIEvent) => {
    setResponseIds((_ids) => {
      const ids = [..._ids];
      ids.shift();
      return [responseId, ...ids];
    });
    const shortTermMemory = botFactory.getInstance()?.getMemory();
    const memoryLines = shortTermMemory?.getMemory();
    if (shortTermMemory && memoryLines && memoryLines.length >= 2) {
      shortTermMemory.clearMemories();
      memoryLines.forEach((line, index) => {
        if (index < memoryLines.length - 1) {
          shortTermMemory.pushMemory(line);
        }
      });
      const text = responsesStore.get(responseId)?.text;
      if (text) {
        shortTermMemory.pushMemory({
          text,
          type: MikuCore.Commands.CommandType.DIALOG,
          subject: shortTermMemory.getBotSubject(),
        });
      }
    }
  };

  const profileImage = card?.data.extensions?.mikugg?.profile_pic || '';

  return (
    // MAIN CONTAINER
    <>
      <div className="w-full h-full max-lg:w-full flex flex-col bot-display-images-container rounded-xl mb-4">
        <div className="relative flex flex-col w-full h-full items-center">
          <div className="w-full flex flex-row justify-between items-center p-3 bot-display-header rounded-xl z-10">
            <div className="flex items-center gap-4 text-white">
              <div className="w-8 h-8 bg-cover rounded-full" style={{backgroundImage: profileImage ? `url(${assetLinkLoader(profileImage, '480p')})` : ''}} />
              <div className="BotDisplay__header-name">{card?.data.name}</div>
              {
                botConfigSettings.promptCompleterEndpoint.type !== PromptCompleterEndpointType.APHRODITE ? (
                  <div className="inline-flex">
                    <button className="rounded-full" onClick={displayBotDetails}>
                      <img src={infoIcon} />
                    </button>
                  </div>
                ) : null
              }
              <div className="inline-flex">
                {
                  ((card?.data?.extensions?.mikugg?.scenarios?.length || 0) > 1 && responsesGenerated.length) ? (
                    <ScenarioSelector value={currentContext} onChange={updateContext} />
                  ) : null
                }
              </div>
            </div>
            <div className="flex gap-4">
              {
                music ? (
                  <MusicPlayer
                    src={assetLinkLoader(music, 'audio')}
                  />
                ) : null
              }
              <div className="inline-flex">
                <button
                  className="rounded-full"
                  onClick={handleHistoryButtonClick}
                >
                  <img src={historyIcon} />
                </button>
              </div>
              {botConfigSettings.promptCompleterEndpoint.type !== PromptCompleterEndpointType.APHRODITE ? (
                <div className="inline-flex">
                  <button
                    className="rounded-full"
                    onClick={handleSettingsButtonClick}
                  >
                    <img src={settingsIcon} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {/* MAIN IMAGE */}
          <div className="absolute flex flex-col justify-center items-center w-full h-full overflow-hidden main-image-container rounded-xl">          
            <ProgressiveImage src={backgroundImage ? assetLinkLoader(backgroundImage) : ''} placeholder={backgroundImage ? assetLinkLoader(backgroundImage, '480p') : ''}>
              {(src) => <img
                className="h-full w-full z-0 rounded-xl conversation-background-image object-cover"
                src={`${src}`}
                alt="background"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = "/default_background.png";
                }}
              />}
            </ProgressiveImage>
            {emotionImage ? (
              <EmotionRenderer
                assetLinkLoader={assetLinkLoader}
                assetUrl={emotionImage}
                upDownAnimation
                className="absolute bottom-0 h-[90%] z-1 conversation-bot-image object-cover"
              />
            ) : null}
          </div>
          {/* RESPONSE CONTAINER */}
          <div
            className={
              !responseIds.length
                ? "hidden"
                : "absolute bottom-10 z-10 flex justify-center items-center w-full h-1/4"
            }
          >
            <div className="response-container h-3/4 w-10/12 relative">
              <div className="response-container-text flex justify-left px-8 py-4 items-start scrollbar w-full h-full bg-gradient-to-b text-sm from-slate-900/[.9] to-gray-500/50 overflow-auto drop-shadow-2xl shadow-black">
                {!response || loading ? (
                  <Loader />
                ) : (
                  <div className="text-md font-bold text-gray-200 text-left">
                    <AnimateResponse text={response?.text || ''} fast={responseIndex > 0} />
                  </div>
                )}
              </div>
              {!loading && responseIds.length > 1 ? (
                <div className="response-swiping absolute top-[-2em] left-2 inline-flex justify-between gap-4 bg-slate-900/80 p-2 text-white rounded-t-md">
                  <button
                    className="text-gray-300 disabled:text-gray-500 hover:text-white transition-all"
                    onClick={onLeftClick}
                    disabled={responseIndex >= responseIds.length - 1}
                  >
                    <LeftArrow />
                  </button>
                  <button
                    className="text-gray-300 disabled:text-gray-500 hover:text-white transition-all"
                    onClick={onRightClick}
                    disabled={responseIndex <= 0}
                  >
                    <RightArrow />
                  </button>
                </div>
              ) : null}
              {!loading && responseIds.length > 1 &&  responseIndex === 0 ? (
                <button
                  className="reload-button absolute top-[-2.5em] right-2 inline-flex items-center gap-2 bg-slate-900/80 p-2 drop-shadow-2xl shadow-black text-white rounded-t-md"
                  onClick={onRegenerateClick}
                >
                  <Dice />
                  Regenerate
                </button>
              ) : null}
              {!loading && response?.audio ? (
                <button
                  className="audio-button absolute bottom-3 left-3 inline-flex items-center gap-2 text-gray-400 rounded-md hover:text-white"
                  onClick={() => playAudio(response?.audio || "")}
                >
                  <UnmuteIcon size={24} />
                </button>
              ) : null}
              {!loading && contextSuggestion ? (
                <Tooltip title="Randomize character outfit" placement="left">
                  <button
                    className="wand-button absolute bottom-4 right-4 inline-flex items-center gap-2 text-white rounded-md hover:text-white"
                    onClick={updateContext.bind(null, contextSuggestion)}
                  >
                    <Wand />
                  </button>
                </Tooltip>
              ) : null}
              {!loading &&
              responsesGenerated.length > 1 &&
              responseIndex === 0 ? (
                <div className="reload-button absolute bottom-[-3.4em] right-[1em] flex items-center gap-2 bg-slate-900/80 p-2 drop-shadow-2xl shadow-black text-white rounded-b-md text-xs max-w-[90%] overflow-auto">
                  {responsesGenerated.map((responseId, index) => (
                    <button
                      className={`inline-flex transition-all items-center hover:text-white ${
                        responseIds[0] === responseId
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                      key={responseId}
                      onClick={(event) => onOptionClick(responseId, event)}
                    >
                      <Dice />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <PopUp
        closePopUpFunction={() => setShowBotSettings(false)}
        isShowingPupUp={showBotSettings}
        className="gap-2 justify-between"
        darkTheme
      >
        <p className="ml-4 text-start text-2xl text-white">Setings</p>
        <BotSettings botConfigSettings={botConfigSettings} onBotConfigSettingsChange={setBotConfigSettings} />
        <div className="w-full flex justify-center gap-2 flex-wrap red-500 text-red-500">
          <BotSettingsFooter botConfigSettings={botConfigSettings} onBotConfigSettingsChange={setBotConfigSettings} />
        </div>
      </PopUp>
      <PopUp
        className="gap-4 justify-between"
        darkTheme
        closePopUpFunction={() => setShowHistory(false)}
        isShowingPupUp={showHistory}
      >
        <p className="ml-4 text-start text-2xl text-white">
          Conversation History
        </p>
        <ChatHistory />
        {botConfigSettings.promptCompleterEndpoint.type !== PromptCompleterEndpointType.APHRODITE ? (
          <div className="w-full flex justify-center gap-7 pb-3 flex-wrap red-500 text-red-500">
            <HistoryManagementButtons onLoad={() => onUpdate()} />
          </div>
        ) : null}
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
