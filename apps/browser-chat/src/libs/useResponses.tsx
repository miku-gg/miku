import { createContext, useEffect, useReducer, useState } from "react";
import * as MikuExtensions from "@mikugg/extensions";
import { BotReponse, fillResponse, responsesStore } from "./responsesStore";
import { useBot } from "./botLoader";
import botFactory from "./botFactory";

const playAudio = (base64: string): void => {
  const snd = new Audio(base64);
  snd.play();
}

type StateSetter<T> = (input: T|((_: T) => T)) => void

export const InteractiveResponsesContext = createContext<{
  responseIds: string[],
  responseIndex: number,
  setResponseIds: StateSetter<string[]>,
  setResponseIndex: StateSetter<number>,
  responsesGenerated: string[],
  setResponsesGenerated: StateSetter<string[]>,
  isAudioSubscribed: boolean,
  setIsAudioSubscribed: StateSetter<boolean>,
  currentContext: string,
  setCurrentContext: StateSetter<string>,
  response: BotReponse | null,
  prevResponse: BotReponse | null,
  loading: boolean,
  playAudio: (base64: string) => void,
  onUpdate: () => void,
}>({
  responseIds: [],
  responseIndex: 0,
  setResponseIds: () => {},
  setResponseIndex: () => {},
  responsesGenerated: [],
  setResponsesGenerated: () => {},
  isAudioSubscribed: false,
  setIsAudioSubscribed: () => {},
  currentContext: '',
  setCurrentContext: () => {},
  response: null,
  prevResponse: null,
  loading: false,
  playAudio: () => {},
  onUpdate: () => {},
});

export const InteractiveResponsesContextProvider = ({ children }: {children: JSX.Element}): JSX.Element => {
  const { botConfig } = useBot();
  const [ responseIds, setResponseIds ] = useState<string[]>([]);
  const [ responseIndex, setResponseIndex ] = useState<number>(0);
  const [ responsesGenerated, setResponsesGenerated ] = useState<string[]>([]);
  const [ isAudioSubscribed, setIsAudioSubscribed ] = useState<boolean>(false);
  const [ currentContext, setCurrentContext ] = useState<string>('');
  const [ _, onUpdate ] = useReducer((x) => x + 1, 0);  

  let response: BotReponse | null = null;
  let prevResponse: BotReponse | null = null;
  if (responseIds && responseIndex < responseIds.length) {
    response = responsesStore.get(responseIds[responseIndex]) || null;
    if (responseIds.length > 1 && responseIndex < responseIds.length - 1) {
      prevResponse = responsesStore.get(responseIds[responseIndex + 1]) || null;
    }
  }

  useEffect(() => {
    if (botConfig) {
      setResponseIds([]);
      setResponseIndex(0);
      onUpdate();

      const sbertEmotionConfig = botConfig?.outputListeners.find(listener => listener.service === MikuExtensions.Services.ServicesNames.SBertEmotionInterpreter)
      if (sbertEmotionConfig) {
        const props = sbertEmotionConfig.props as MikuExtensions.Services.SBertEmotionInterpreterProps;
        setCurrentContext(props.start_context || '');
      }
    }
    const bot = botFactory.getInstance();
    bot?.subscribePromptSent((command) => {
      fillResponse(command.commandId);
      setResponseIds(responseIds => [command.commandId, ...responseIds]);
      setResponseIndex(0);
      onUpdate();
    })
 
    bot?.subscribeDialog((output) => {
      fillResponse(output.commandId, 'text', output.text);
      fillResponse(output.commandId, 'emotion', output.imgHash);
      onUpdate();
    });
    
    const audioSubscribed = bot?.subscribeAudio((base64: string, output) => {
      fillResponse(output.commandId, 'audio', base64);
      onUpdate();
      if (base64) {
        playAudio(base64);
      }
    });

    if (audioSubscribed) {
      setIsAudioSubscribed(true);
    }
  }, [botConfig]);

  const loading = response?.loadingText || (isAudioSubscribed && response?.loadingAudio) || response?.loadingEmotion || false;

  return (
    <InteractiveResponsesContext.Provider value={{
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
    }}>
      {children}
    </InteractiveResponsesContext.Provider>
  );
};