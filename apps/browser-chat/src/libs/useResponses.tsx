import { createContext, useEffect, useReducer, useState } from "react";
import * as MikuExtensions from "@mikugg/extensions";
import { BotReponse, fillResponse, responsesStore } from "./responsesStore";
import { useBot } from "./botLoader";
import botFactory from "./botFactory";
import { BotConfig } from "@mikugg/bot-utils";

const playAudio = (base64: string): void => {
  const snd = new Audio(base64);
  snd.play();
};

type StateSetter<T> = (input: T | ((_: T) => T)) => void;

export const InteractiveResponsesContext = createContext<{
  responseIds: string[];
  responseIndex: number;
  setResponseIds: StateSetter<string[]>;
  setResponseIndex: StateSetter<number>;
  responsesGenerated: string[];
  setResponsesGenerated: StateSetter<string[]>;
  isAudioSubscribed: boolean;
  setIsAudioSubscribed: StateSetter<boolean>;
  currentContext: string;
  setCurrentContext: StateSetter<string>;
  response: BotReponse | null;
  prevResponse: BotReponse | null;
  loading: boolean;
  playAudio: (base64: string) => void;
  onUpdate: () => void;
  updateBotConfig: (bc: BotConfig) => void;
}>({
  responseIds: [],
  responseIndex: 0,
  setResponseIds: () => {},
  setResponseIndex: () => {},
  responsesGenerated: [],
  setResponsesGenerated: () => {},
  isAudioSubscribed: false,
  setIsAudioSubscribed: () => {},
  currentContext: "",
  setCurrentContext: () => {},
  response: null,
  prevResponse: null,
  loading: false,
  playAudio: () => {},
  onUpdate: () => {},
  updateBotConfig: () => {},
});

export const InteractiveResponsesContextProvider = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  const [responseIds, setResponseIds] = useState<string[]>([]);
  const [responseIndex, setResponseIndex] = useState<number>(0);
  const [responsesGenerated, setResponsesGenerated] = useState<string[]>([]);
  const [isAudioSubscribed, setIsAudioSubscribed] = useState<boolean>(false);
  const [currentContext, setCurrentContext] = useState<string>("");
  const [_, onUpdate] = useReducer((x) => x + 1, 0);
  let { botConfig, card, assetLinkLoader } = useBot();
  const [botNumber, setBotNumber] = useState<number>(0);

  let response: BotReponse | null = null;
  let prevResponse: BotReponse | null = null;
  if (responseIds && responseIndex < responseIds.length) {
    response = responsesStore.get(responseIds[responseIndex]) || null;
    if (responseIds.length > 1 && responseIndex < responseIds.length - 1) {
      prevResponse = responsesStore.get(responseIds[responseIndex + 1]) || null;
    }
  }

  const updateBotConfig = (bc: BotConfig) => {
    botConfig = bc; // this doesn't trigger the useEFfect below for some reason so i have a number too
    setBotNumber(botNumber + 1);
  };

  useEffect(() => {
    const bot = botFactory.getInstance();
    if (botConfig && card && bot) {
      const memory = bot?.getMemory().getMemory() || [];
      const lastMemoryLine = memory.length ? memory[memory.length - 1] : null;

      if (lastMemoryLine?.id) {
        setResponseIds([lastMemoryLine.id]);
        const lastResponse = responsesStore.get(lastMemoryLine.id)
        if (lastResponse?.scene) {
          setCurrentContext(lastResponse.scene);
        }
      } else {
        const firstScenario = card?.data.extensions.mikugg.scenarios.find(scenario => card?.data.extensions.mikugg.start_scenario === scenario.id);
        const firstEmotionGroup = card?.data.extensions.mikugg.emotion_groups.find(emotion_group => firstScenario?.emotion_group === emotion_group.id);
        let firstEmotion = firstEmotionGroup?.template === 'base-emotions' ? firstEmotionGroup.emotions?.find(emotion => emotion?.id === 'happy') : firstEmotionGroup?.emotions[0];
        let firstImage = firstEmotion?.source[0];
        let firstSoundId = firstEmotion?.sound;
        let firstSound = card?.data.extensions.mikugg.sounds?.find(sound => sound.id === firstSoundId)?.source;
        let firstMessage = card?.data.first_mes || '';
        firstMessage = MikuExtensions.Memory.Strategies.fillTextTemplate(firstMessage, {
          bot: card?.data.name || '',
          user: 'Anon'
        });
        fillResponse('first', "text", firstMessage);
        fillResponse('first', "emotion", firstImage || '');
        fillResponse('first', "audio", firstSound);
        if (firstSound) {
          playAudio(assetLinkLoader(firstSound, 'audio'));
        }
        setResponseIds(['first']);  
      }
      setResponseIndex(0);
      onUpdate();

      const sbertEmotionConfig = botConfig?.outputListeners.find(
        (listener) =>
          listener.service ===
          MikuExtensions.Services.ServicesNames.SBertEmotionInterpreter
      );
      if (sbertEmotionConfig) {
        const props =
          sbertEmotionConfig.props as MikuExtensions.Services.SBertEmotionInterpreterProps;
        setCurrentContext(props.start_context || "");
      }
    }
    bot?.subscribePromptSent((command) => {
      fillResponse(command.commandId);
      setResponseIds((responseIds) => [command.commandId, ...responseIds]);
      setResponseIndex(0);
      onUpdate();
    });

    bot?.subscribeDialog((output) => {
      fillResponse(output.commandId, "text", output.text);
      fillResponse(output.commandId, "emotion", output.imgHash);
      onUpdate();


      const audio = card?.data.extensions.mikugg.sounds?.find(sound => sound.id === output.audio)
      if (audio?.source) {
        playAudio(assetLinkLoader(audio.source, 'audio'));
      }
    });

    bot?.subscribePromptSentError((commandId) => {
      setResponseIds((responseIds) =>
        responseIds.filter((id) => id !== commandId)
      );
      setResponseIndex(0);
      onUpdate();
    });

    const audioSubscribed = bot?.subscribeAudio((base64: string, output) => {
      fillResponse(output.commandId, "audio", base64);
      onUpdate();
      if (base64) {
        playAudio(base64);
      }
    });

    if (audioSubscribed) {
      setIsAudioSubscribed(true);
    }
  }, [card, botConfig, botNumber]);

  const loading =
    response?.loadingText ||
    (isAudioSubscribed && response?.loadingAudio) ||
    response?.loadingEmotion ||
    false;

  return (
    <InteractiveResponsesContext.Provider
      value={{
        responseIds,
        responseIndex,
        setResponseIds,
        setResponseIndex,
        responsesGenerated,
        setResponsesGenerated,
        isAudioSubscribed,
        setIsAudioSubscribed,
        response,
        prevResponse,
        loading,
        playAudio,
        onUpdate,
        currentContext,
        setCurrentContext,
        updateBotConfig,
      }}
    >
      {children}
    </InteractiveResponsesContext.Provider>
  );
};
