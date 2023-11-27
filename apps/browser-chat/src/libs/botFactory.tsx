import * as MikuCore from "@mikugg/core";
import * as MikuExtensions from "@mikugg/extensions";
import { BotConfig } from "@mikugg/bot-utils";
import { toast } from "react-toastify";
import { CustomEndpoints, getBotDataFromURL, setBotDataInURL } from "./botLoader";
import platformAPI from "./platformAPI";
import { getAphroditeConfig } from "../App";
import { AphroditeSettings, PromptCompleterEndpointType } from "./botSettingsUtils";
import { ChatMessageInput, newChat, updateChat } from "./postMessage";
import { v4 as uuidv4 } from 'uuid';
import { responsesStore } from "./responsesStore";

const MOCK_PRIVATE_KEY =
  "2658e4257eaaf9f72295ce012fa8f8cc4a600cdaf4051884d2c02593c717c173";

interface BotInstanceInterface {
  changeScenario(scenarioId: string): boolean;
  subscribeDialog(
    cb: (output: MikuExtensions.OutputListeners.EmotionOutput) => void
  ): void;
  subscribeAudio(
    cb: (
      base64: string,
      command: MikuCore.OutputListeners.OutputEnvironment
    ) => void
  ): void;
  subscribePromptSent(
    cb: (command: MikuCore.Commands.Command) => void
  ): () => void;
  subscribePromptSentError(cb: (commandId: string) => void): () => void;
  speechToText(audioFile: Blob): Promise<string>;
  sendPrompt(
    text: string,
    type: number,
    subject?: string
  ): { wait: Promise<void[]>; commandId: string };
  getMemory(): MikuCore.Memory.ShortTermMemory;
  getBotConfig(): BotConfig;
  computeCost(prompt: string): Promise<number>;
}

class BotFactory {
  private signer: MikuCore.Services.ServiceQuerySigner;

  constructor() {
    this.signer = new MikuCore.Services.ServiceQuerySigner(MOCK_PRIVATE_KEY);
  }

  private getMemory({
    service,
    props,
  }: {
    service: MikuExtensions.Services.ServicesNames;
    props: object;
  }): MikuCore.Memory.ShortTermMemory {
    let memory: MikuCore.Memory.ShortTermMemory | null = null;
    switch (service) {
      case MikuExtensions.Services.ServicesNames.GPTShortTermMemoryV2:
        // const _props = ;
        // const strategySlugFromURL = String(searchParams["strategy"] || "");
        // const buildStrategySlug = MikuExtensions.Memory.Strategies.isOfTypeStrategySlug(strategySlugFromURL) ?
        //   strategySlugFromURL :
        //   _props.buildStrategySlug;
        memory = new MikuExtensions.Memory.GPTShortTermMemoryV2(
          props as MikuExtensions.Memory.GPTShortTermMemoryV2Config
        );
        break;
    }

    if (!memory) throw `Memory '${service}' not found`;

    return memory;
  }

  private getPromptCompleter({
    service,
    props,
    memory,
    signer,
    servicesEndpoint,
    endpoints,
  }: {
    service: MikuExtensions.Services.ServicesNames;
    props: object;
    memory: MikuCore.Memory.ShortTermMemory;
    signer: MikuCore.Services.ServiceQuerySigner;
    servicesEndpoint: string;
    endpoints?: CustomEndpoints;
  }): MikuCore.ChatPromptCompleters.ChatPromptCompleter {
    let chatPromptCompleter: MikuCore.ChatPromptCompleters.ChatPromptCompleter | null =
      null;

    // for alpha demo

    switch (service) {
      case MikuExtensions.Services.ServicesNames.OpenAI:
        chatPromptCompleter =
          new MikuExtensions.ChatPromptCompleters.OpenAIPromptCompleter({
            serviceEndpoint: `${servicesEndpoint}/${service}`,
            props: {
              ...props,
              openai_key: String(endpoints?.openai || "") || "",
            },
            signer: signer,
            memory: memory,
          });
        break;
      case MikuExtensions.Services.ServicesNames.Pygmalion:
        chatPromptCompleter =
          new MikuExtensions.ChatPromptCompleters.PygmalionPromptCompleter({
            serviceEndpoint: `${servicesEndpoint}/${service}`,
            props: props,
            signer: signer,
            memory: memory,
          });
        break;
      case MikuExtensions.Services.ServicesNames.Oobabooga:
        chatPromptCompleter =
          new MikuExtensions.ChatPromptCompleters.OobaboogaPromptCompleter({
            serviceEndpoint: `${servicesEndpoint}/${service}`,
            props: {
              ...props,
              gradioEndpoint: String(endpoints?.oobabooga || "") || "",
            },
            signer: signer,
            memory: memory,
          });
          break;
      case MikuExtensions.Services.ServicesNames.Aphrodite:
        chatPromptCompleter =
          new MikuExtensions.ChatPromptCompleters.AphroditePromptCompleter({
            serviceEndpoint: `${servicesEndpoint}/${service}`,
            props: {
              ...props,
            },
            signer: signer,
            memory: memory,
          });
        break;
    }

    if (!chatPromptCompleter) throw `Chat completer '${service}' not found`;

    return chatPromptCompleter;
  }

  private getOutputListener({
    service,
    props,
    memory,
    signer,
    servicesEndpoint,
    endpoints,
  }: {
    service: MikuExtensions.Services.ServicesNames;
    props: object;
    memory: MikuCore.Memory.ShortTermMemory;
    signer: MikuCore.Services.ServiceQuerySigner;
    servicesEndpoint: string;
    endpoints?: CustomEndpoints;
  }): MikuCore.OutputListeners.OutputListener<
    MikuCore.OutputListeners.OutputEnvironment,
    any
  > {
    let outputListener: MikuCore.OutputListeners.OutputListener<
      MikuCore.OutputListeners.OutputEnvironment,
      any
    > | null = null;

    switch (service) {
      case MikuExtensions.Services.ServicesNames.EmotionGuidance:
        // @ts-ignore
        const scneario = props.scenarios.find((scenario: any) => scenario.id === props.start_scenario);
        const emotionImages = scneario?.emotion_images || [];
        outputListener =
          new MikuExtensions.OutputListeners.EmotionOutputListener({
            serviceEndpoint: `${servicesEndpoint}/${MikuExtensions.Services.ServicesNames.EmotionGuidance}`,
            signer: signer,
            scene: {
              id: scneario.id,
              emotionGroupId: scneario.template,
              emotions: emotionImages.map(({ id, hashes}) => ({ id, hash: hashes[0]}))
            }
          });
          outputListener.subscribe(async (output: { text: string, emotion: string, audio?: string}) => {
            const aphrodite = getAphroditeConfig();
            if (aphrodite.enabled) {
              const memoryLines = memory.getMemory();
              const lastSentMessage = memoryLines[memoryLines.length - 2];
              const firstMessage: ChatMessageInput = {
                text: lastSentMessage.text,
                isBot: false,
                emotionId: output.emotion,
                sceneId: props['start_scenario'],
                audioId: '',
              };
              const secondMessage: ChatMessageInput = {
                text: output.text,
                isBot: true,
                emotionId: output.emotion,
                sceneId: props['start_scenario'],
                audioId: '',
              }
              let chatId = aphrodite.chatId;
              if (!chatId) {
                chatId = uuidv4();
                newChat(aphrodite.botId, chatId, [
                  firstMessage,
                  secondMessage
                ]);
                const botData = getBotDataFromURL();
                setBotDataInURL({
                  ...botData,
                  settings: {
                    ...botData.settings,
                    promptCompleterEndpoint: {
                      type: PromptCompleterEndpointType.APHRODITE,
                      genSettings: {
                        ...(botData.settings.promptCompleterEndpoint.genSettings as AphroditeSettings),
                        chatId,
                      }
                    }
                  }
                })
              } else {
                updateChat(chatId, [
                  ...memoryLines.slice(0, memoryLines.length - 2).map((line) => {
                    const response = responsesStore.get(line.id || '');
                    return {
                      id: line.id,
                      text: line.text,
                      subject: line.subject,
                      type: line.type,
                      emotionId: response?.emotion || '',
                      isBot: !!response,
                      sceneId: response?.scene || '',
                      audioId: response?.audio || '',
                    };
                  }),
                  firstMessage,
                  secondMessage
                ], true);
              }
            }
          })
        break;
      case MikuExtensions.Services.ServicesNames.AzureTTS:
      case MikuExtensions.Services.ServicesNames.ElevenLabsTTS:
        let apiKey =
          (MikuExtensions.Services.ServicesNames.AzureTTS === service ? endpoints?.azure : endpoints?.elevenlabs) || '';
        apiKey = apiKey ? String(apiKey || "") : "";
        outputListener = new MikuExtensions.OutputListeners.TTSOutputListener(
          {
            serviceEndpoint: `${servicesEndpoint}/${service}`,
            signer: signer,
            props: {
              ...props,
              apiKey,
            },
          },
          service
        );
        break;
      case MikuExtensions.Services.ServicesNames.NovelAITTS:
        outputListener = new MikuExtensions.OutputListeners.TTSOutputListener(
          {
            serviceEndpoint: `${servicesEndpoint}/${service}`,
            signer: signer,
            props: {
              ...props,
              apiKey: String(endpoints?.novelai || "") || "",
            },
          },
          service
        );
        break;
      case MikuExtensions.Services.ServicesNames.None:
        outputListener = new MikuExtensions.OutputListeners.TTSOutputListener(
          {
            serviceEndpoint: `${servicesEndpoint}/${service}`,
            signer: signer,
            props: {
              ...props,
              apiKey: "",
            },
          },
          service
        );
        break;
    }

    if (!outputListener) {
      toast.error(`Output listener '${service}' not found`);
      throw `Output listener '${service}' not found`;
    }

    outputListener.subscribeError((error) => {
      if (service != "") {
        toast.error("Error calling service: " + service);
        console.error(error);
      }
    });

    return outputListener;
  }

  public create(botConfig: BotConfig, servicesEndpoint: string, endpoints?: CustomEndpoints): BotInstanceInterface {
    const whisper = new MikuExtensions.CommandGenerators.WhisperServiceClient(
      `${servicesEndpoint}/audio-upload`,
      `${servicesEndpoint}/${MikuExtensions.Services.ServicesNames.WhisperSTT}`,
      this.signer,
      endpoints?.openai || ''
    );
    const textWriter = new MikuCore.CommandGenerators.TextCommandGenerator();
    const memory = this.getMemory(botConfig.short_term_memory);
    const promptCompleter = this.getPromptCompleter({
      service: botConfig.prompt_completer.service,
      props: botConfig.prompt_completer.props,
      memory,
      signer: this.signer,
      servicesEndpoint,
      endpoints,
    });
    let outputListenerConfigs = botConfig.outputListeners;

    const dialogOutputListeners = outputListenerConfigs.map(
      (outputListenerConfig) => {
        return this.getOutputListener({
          service: outputListenerConfig.service,
          props: outputListenerConfig.props,
          memory,
          signer: this.signer,
          servicesEndpoint,
        });
      }
    );

    new MikuCore.ChatBot({
      promptCompleter: promptCompleter,
      commandGenerators: [textWriter],
      outputListeners: {
        dialogOutputListeners,
      },
    });
    const promptSentErrorCallbacks: ((commandId: string) => void)[] = [];

    return {
      getBotConfig(): BotConfig {
        return botConfig;
      },

      changeScenario(scenarioId: string): boolean {
        const listener = dialogOutputListeners.find(
          (listener) =>
            listener instanceof MikuExtensions.OutputListeners.EmotionOutputListener
        ) as MikuExtensions.OutputListeners.EmotionOutputListener;
        if (!listener) return false;
        const listenerConfig = botConfig.outputListeners.find(
          (listenerConfig) => listenerConfig.service === MikuExtensions.Services.ServicesNames.EmotionGuidance
        );
        // @ts-ignore
        const scenario = listenerConfig?.props.scenarios.find((scenario: any) => scenario.id === scenarioId);
        const emotionImages = scenario?.emotion_images || [];

        listener.setScene({
          id: scenarioId,
          emotionGroupId: scenario.template,
          emotions: emotionImages.map(({ id, hashes}) => ({ id, hash: hashes[0]}))
        });
        return true;
      },

      subscribeDialog(
        cb: (
          output: MikuExtensions.OutputListeners.EmotionOutput
        ) => void
      ): boolean {
        const listener = dialogOutputListeners.find(
          (listener) =>
            listener instanceof MikuExtensions.OutputListeners.EmotionOutputListener
        );
        listener?.subscribe(cb);
        return !!listener;
      },

      subscribeAudio(
        cb: (
          base64: string,
          output: MikuCore.OutputListeners.OutputEnvironment
        ) => void
      ): boolean {
        const listener = dialogOutputListeners.find(
          (listener) =>
            listener instanceof MikuExtensions.OutputListeners.TTSOutputListener
        );
        listener?.subscribe(cb);
        return !!listener;
      },

      subscribePromptSent(
        cb: (command: MikuCore.Commands.Command) => void
      ): () => void {
        return textWriter.subscribe(cb);
      },

      subscribePromptSentError(cb: (commandId: string) => void): () => void {
        promptSentErrorCallbacks.push(cb);
        return () => {
          promptSentErrorCallbacks.splice(
            promptSentErrorCallbacks.indexOf(cb),
            1
          );
        };
      },

      async speechToText(file: Blob): Promise<string> {
        return whisper.query(file);
      },

      sendPrompt(
        text: string,
        type: number,
        subject: string = botConfig.subject
      ): { wait: Promise<void[]>; commandId: string } {
        const { wait, commandId } = textWriter.emit({
          type,
          input: {
            text,
            subject,
          },
        });
        return {
          wait: wait.catch((error) => {
            toast.error("Error sending prompt");
            promptSentErrorCallbacks.forEach((cb) => cb(commandId));
            throw error;
          }),
          commandId,
        };
      },

      getMemory() {
        return memory;
      },

      async computeCost(prompt: string): Promise<number> {
        const dialogOutputListenersCosts = await Promise.all(
          dialogOutputListeners.map((listener) => listener.getCost())
        );
        return dialogOutputListenersCosts.reduce(
          (prev, cur) => prev + cur,
          await promptCompleter.getCost(prompt)
        );
      },
    };
  }
}

const botFactory = new BotFactory();

export default (function () {
  let botInstance: BotInstanceInterface | null = null;

  return {
    getInstance: (): BotInstanceInterface | null => {
      return botInstance;
    },
    updateInstance: (botConfig: BotConfig, servicesEndpoint: string, endpoints?: CustomEndpoints) => {
      botInstance = botFactory.create(botConfig, servicesEndpoint, endpoints);
      return botInstance;
    },
  };
})();
