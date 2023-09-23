import { BotConfig, EMPTY_MIKU_CARD, MikuCard, mikuCardToBotConfig } from "@mikugg/bot-utils";
import React, { useCallback, useContext, useState } from "react";
import botFactory from './botFactory';
import queryString from "query-string";
import { BotConfigSettings, DEFAULT_BOT_SETTINGS, PromptCompleterEndpointType, VoiceServiceType, VOICE_SERVICES } from "./botSettingsUtils";
import * as MikuCore from "@mikugg/core";
import * as MikuExtensions from "@mikugg/extensions";
import platformAPI from "./platformAPI";
import { fillResponse } from "./responsesStore";
import debounce from "lodash.debounce";

export interface BotLoaderProps {
  assetLinkLoader: (asset: string, format?: string) => string;
  servicesEndpoint: string;
  mikuCardLoader: (botHash: string) => Promise<MikuCard>;
}

async function preLoadImages(imageUrls: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    let images: HTMLImageElement[] = [];
    let imagesLoaded = 0;
    for (var i = 0; i < imageUrls.length; i++) {
      images[i] = new Image();
      images[i].onload = function() {
        imagesLoaded++;
        if (imagesLoaded === imageUrls.length) resolve();
      }
      images[i].onerror = function() {
        imagesLoaded++;
        if (imagesLoaded === imageUrls.length) resolve();
      }
      images[i].src = imageUrls[i];
    }
  });
}

export function loadBotConfig(botHash: string, mikuCardLoader: (botHash: string) => Promise<MikuCard>): Promise<{
  success: boolean,
  bot?: BotConfig,
  card?: MikuCard,
  hash: string,
}> {
  return mikuCardLoader(botHash)
    .then((card: MikuCard) => {
      const bot = mikuCardToBotConfig(card);
      return {
        success: true,
        bot,
        card,
        hash: botHash,
      };
    }).catch((err) => {
      console.warn(err);
      return {
        success: false,
        bot: undefined,
        card: undefined,
        hash: botHash,
      };
    });
}

export function getBotHashFromUrl(): string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('bot') || '';
}

export const BotLoaderContext = React.createContext<{
  botHash: string,
  card: MikuCard | undefined,
  botConfig: BotConfig | undefined,
  botConfigSettings: BotConfigSettings,
  loading: boolean,
  error: boolean,
  setBotHash: (bot: string) => void,
  setCard: (card: MikuCard) => void,
  setBotConfig: (botConfig: BotConfig) => void,
  setBotConfigSettings: (botConfigSettings: BotConfigSettings) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: boolean) => void,
  assetLinkLoader: (asset: string, format?: string) => string;
  servicesEndpoint: string;
  mikuCardLoader: (botHash: string) => Promise<MikuCard>;
}>({
  botHash: '',
  card: undefined,
  botConfig: undefined,
  botConfigSettings: DEFAULT_BOT_SETTINGS,
  loading: true,
  error: false,
  setBotHash: () => {},
  setCard: () => {},
  setBotConfig: () => {},
  setBotConfigSettings: () => {},
  setLoading: () => {},
  setError: () => {},
  assetLinkLoader: () => '',
  servicesEndpoint: '',
  mikuCardLoader: async (botHash: string) => EMPTY_MIKU_CARD,
});

export const BotLoaderProvider = (props: {children: JSX.Element} & BotLoaderProps): JSX.Element => {
  const [card, setCard] = useState<MikuCard | undefined>(undefined);
  const [botHash, setBotHash] = useState<string>('');
  const [botConfig, setBotConfig] = useState<BotConfig | undefined>(undefined);
  const [botConfigSettings, setBotConfigSettings] = useState<BotConfigSettings>(DEFAULT_BOT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  return (
    <BotLoaderContext.Provider value={{
      card, botConfig, loading, error, botHash, botConfigSettings,
      setCard, setBotConfig, setLoading, setError, setBotHash, setBotConfigSettings,
      mikuCardLoader: props.mikuCardLoader,
      assetLinkLoader: props.assetLinkLoader,
      servicesEndpoint: props.servicesEndpoint,
    }}>
      {props.children}
    </BotLoaderContext.Provider>
  );
};

export interface CustomEndpoints {
  oobabooga: string,
  openai: string,
  koboldai: string,
  azure: string,
  elevenlabs: string,
  novelai: string,
}
export interface BotData {
  hash: string
  settings: BotConfigSettings
  endpoints: CustomEndpoints
  disabled: boolean
}

export function getBotDataFromURL(): BotData {
  const searchParams = queryString.parse(location.search);
  return {
    hash: String(searchParams['bot'] || '') || '',
    settings: (function (): BotConfigSettings {
      try {
        const jsonString = MikuCore.Services.decode(String(searchParams['settings'] || '') || '');
        const settings = JSON.parse(jsonString) as BotConfigSettings;
        const voiceProps = settings.voice?.voiceService?.voiceId ? {
          voiceId: settings.voice?.voiceService?.voiceId,
          emotion: settings.voice?.voiceService?.emotion
        } : {
          voiceId: DEFAULT_BOT_SETTINGS.voice.voiceService.voiceId,
          emotion: DEFAULT_BOT_SETTINGS.voice.voiceService.emotion,
        }
        return {
          ...settings,
          text: {
            ...DEFAULT_BOT_SETTINGS.text,
            ...(settings.text || {}),
          },
          voice: {
            ...DEFAULT_BOT_SETTINGS.voice,
            ...(settings.voice || {}),
            voiceService: {
              ...DEFAULT_BOT_SETTINGS.voice.voiceService,
              ...(settings.voice?.voiceService || {}),
              ...voiceProps
            }
          }
        }
      } catch (e) {
        console.warn('Unable to load settings.')
        return DEFAULT_BOT_SETTINGS;
      }
    })(),
    disabled: searchParams['disabled'] === 'true',
    endpoints: {
      oobabooga: String(searchParams['oobabooga'] || '') || '',
      openai: String(searchParams['openai'] || '') || '',
      koboldai: String(searchParams['koboldai'] || '') || '',
      azure: String(searchParams['azure'] || '') || '',
      elevenlabs: String(searchParams['elevenlabs'] || '') || '',
      novelai: String(searchParams['novelai'] || '') || '',
    }
  }
}

export function setBotDataInURL(botData: BotData) {
  const { endpoints, disabled } = botData;
  const newSearchParams = {
    bot: botData.hash,
    settings: MikuCore.Services.encode(JSON.stringify(botData.settings)),
  };

  if (disabled) newSearchParams['disabled'] = 'true';
  
  for (const key in endpoints) {
    if (endpoints[key]) newSearchParams[key] = endpoints[key]
  }

  const newSearchString = queryString.stringify(newSearchParams);
  window.history.replaceState({}, 'bot', `/?${newSearchString}`);
}

export function useBot(): {
  botHash: string,
  card: MikuCard | undefined,
  botConfig: BotConfig | undefined,
  botConfigSettings: BotConfigSettings,
  setBotConfigSettings: (botConfigSettings: BotConfigSettings) => void,
  loading: boolean,
  error: boolean,
  setBotHash: (botHash: string) => void,
  assetLinkLoader: (asset: string, format?: string) => string,
  servicesEndpoint: string,
} {
  const {
    botConfig, setBotConfig, loading, setLoading, card, setCard, error, setError, botHash, setBotHash,
    botConfigSettings, setBotConfigSettings, mikuCardLoader, assetLinkLoader, servicesEndpoint
  } = useContext(BotLoaderContext);

  // Get data from url params

  const _botLoadCallback = useCallback((_hash: string = getBotHashFromUrl(), _botData: BotData = getBotDataFromURL()) =>{
    setBotHash(_hash);
    const isDifferentBot = getBotHashFromUrl() !== _hash;
    let memoryLines = botFactory.getInstance()?.getMemory().getMemory() || [];
    loadBotConfig(_hash, mikuCardLoader).then(async (res) => {
      if (res.success && res.bot && res.card) {
        let decoratedConfig = res.bot;
        decoratedConfig = {
          ...res.bot,
          subject: _botData.settings.text.name,
          prompt_completer: {
            service: (function (): MikuExtensions.Services.ServicesNames {
              switch (_botData.settings.promptCompleterEndpoint.type) {
                case PromptCompleterEndpointType.OPENAI:
                  return MikuExtensions.Services.ServicesNames.OpenAI
                case PromptCompleterEndpointType.KOBOLDAI:
                  return MikuExtensions.Services.ServicesNames.Pygmalion
                case PromptCompleterEndpointType.APHRODITE:
                  return MikuExtensions.Services.ServicesNames.Aphrodite
                case PromptCompleterEndpointType.OOBABOOGA:
                default:
                  return MikuExtensions.Services.ServicesNames.Oobabooga
              }
            })(),
            props: {
              ...(function (): object {
                const settings = JSON.stringify(_botData.settings.promptCompleterEndpoint.genSettings);
                switch (_botData.settings.promptCompleterEndpoint.type) {
                  case PromptCompleterEndpointType.OPENAI:
                    return {
                      openai_key: "",
                      settings,
                      prompt: "",
                      messages: [],
                      stop: [] as string[],
                    }
                  case PromptCompleterEndpointType.KOBOLDAI:
                    return {
                      settings,
                      prompt: "",                  
                    }
                  case PromptCompleterEndpointType.APHRODITE:
                  case PromptCompleterEndpointType.OOBABOOGA:
                  default:
                    return {
                      settings,
                      prompt: "",
                      gradioEndpoint: "",
                      botHash: _hash,
                      userName: _botData.settings.text.name,
                    }
                }
              })()
            }
          },
          short_term_memory: {
            ...res.bot.short_term_memory,
            props: {
              ...res.bot.short_term_memory.props,
              buildStrategySlug: _botData.settings.promptStrategy,
              subjects: [_botData.settings.text.name],
            }
          }
        }

        const tts = decoratedConfig.outputListeners.find(listener => [
          MikuExtensions.Services.ServicesNames.AzureTTS,
          MikuExtensions.Services.ServicesNames.ElevenLabsTTS,
          MikuExtensions.Services.ServicesNames.NovelAITTS,
        ].includes(listener.service))

        if (tts) {
          tts.props = {
            ...tts.props,
            enabled: _botData.settings.voice.enabled,
            readNonSpokenText: _botData.settings.voice.readNonSpokenText,
          };

          if (_botData.settings.voice.voiceService.voiceId) {
            tts.props = {
              voiceId: _botData.settings.voice.voiceService.voiceId,
              readNonSpokenText: _botData.settings.voice.readNonSpokenText,
              enabled: _botData.settings.voice.enabled,
            };
            switch (_botData.settings.voice.voiceService.type) {
              case VoiceServiceType.AZURE_TTS:
                tts.service = MikuExtensions.Services.ServicesNames.AzureTTS;
                break;
              case VoiceServiceType.ELEVENLABS_TTS:
                tts.service = MikuExtensions.Services.ServicesNames.ElevenLabsTTS;
                break;
              case VoiceServiceType.NOVELAI_TTS:
                tts.service = MikuExtensions.Services.ServicesNames.NovelAITTS;
                break;
            }
          }
        }

        // fetch first emotion and backgrounds
        const defaultEmotionGroupId = res.card?.data.extensions?.mikugg.scenarios.find(sn => sn.id === res.card?.data.extensions.mikugg.start_scenario)?.emotion_group || '';
        const defaultBackgound = res.card?.data.extensions?.mikugg.scenarios.find(sn => sn.id === res.card?.data.extensions.mikugg.start_scenario)?.background || '';
        await preLoadImages(res.card?.data.extensions?.mikugg?.backgrounds?.filter(bg => bg.id === defaultBackgound).map(
          (asset) => assetLinkLoader(asset.source, '480p')
        ) || []);
        await preLoadImages(res.card?.data.extensions?.mikugg?.emotion_groups?.find(eg => eg.id === defaultEmotionGroupId)?.emotions?.filter((em, index) => em.id === 'happy' || index === 0).map(
          (asset) => assetLinkLoader(asset.source[0], '480p')
        ) || []);
        
        setBotConfigSettings(_botData.settings);
        setBotDataInURL(_botData);

        botFactory.updateInstance(decoratedConfig, servicesEndpoint, _botData.endpoints);
        
        if (
          _botData.settings.promptCompleterEndpoint.type === PromptCompleterEndpointType.APHRODITE &&
          _botData.settings.promptCompleterEndpoint.genSettings.chatId
        ) {
          const chat = await platformAPI.getChat(_botData.settings.promptCompleterEndpoint.genSettings.chatId);
          memoryLines = chat.data.chatMessages.map((message) => ({
            id: message.id,
            type: MikuCore.Commands.CommandType.DIALOG,
            subject: message.isBot ? decoratedConfig.bot_name : _botData.settings.text.name,
            text: message.text,
          }));
          if (chat.data.chatMessages.length) {
            const lastMessage = chat.data.chatMessages[chat.data.chatMessages.length - 1];
            const firstScenario = res.card?.data.extensions.mikugg.scenarios.find(_scenario => lastMessage.sceneId === _scenario.id);
            const firstEmotionGroup = res.card?.data.extensions.mikugg.emotion_groups.find(emotion_group => firstScenario?.emotion_group === emotion_group.id);
            let firstImage = firstEmotionGroup?.emotions?.find(emotion => emotion?.id === lastMessage.emotionId)?.source[0] || firstEmotionGroup?.emotions[0].source[0];

            fillResponse(lastMessage.id, "text", lastMessage.text);
            fillResponse(lastMessage.id, "emotion", firstImage);
            fillResponse(lastMessage.id, "audio", '');
            fillResponse(lastMessage.id, "scene", lastMessage.sceneId);
          }
        }
        if (!isDifferentBot && memoryLines.length) {
          const memory = botFactory.getInstance()?.getMemory();
          memory?.clearMemories();
          memoryLines.forEach(memoryLine => memory?.pushMemory(memoryLine));
        }
        setCard(res.card);
        setBotConfig(res.bot);
        setBotHash(res.hash);
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [setBotConfig, setError, setLoading, setBotHash]);

  const _setBotConfigSettings = useCallback((_botConfigSettings: BotConfigSettings) => {
    const newBotData = {
      ...getBotDataFromURL(),
      settings: _botConfigSettings,
    };
    _botLoadCallback(newBotData.hash, newBotData);
  }, [setBotConfigSettings, _botLoadCallback])
  

  return {
    card,
    botHash,
    botConfig,
    botConfigSettings,
    setBotConfigSettings: debounce(_setBotConfigSettings, 200),
    loading,
    error,
    setBotHash: (_hash?: string, _botData?: BotData) => {
      setLoading(true);
      _botLoadCallback(_hash, _botData);
    },
    assetLinkLoader,
    servicesEndpoint
  };
}