import * as MikuCore from "@mikugg/core";
import * as MikuExtensions from "@mikugg/extensions";
import { BotConfig } from "@mikugg/bot-validator";
import queryString from "query-string";
import { toast } from 'react-toastify';
import { IS_ALPHA_LIVE } from "../components/loading/BotLoadingModal";

const MOCK_PRIVATE_KEY = '2658e4257eaaf9f72295ce012fa8f8cc4a600cdaf4051884d2c02593c717c173';

interface BotFactoryConfig {
  servicesEndpoint: string;
}

interface BotInstanceInterface {
  subscribeContextChangeSuggestion(cb: (contextId: string) => void): void;
  changeContext(contextId: string): boolean;
  subscribeDialog(cb: (output: MikuExtensions.OutputListeners.EmotionRendererOutput) => void): void;
  subscribeAudio(cb: (base64: string, command: MikuCore.OutputListeners.OutputEnvironment) => void): void;
  subscribePromptSent(cb: (command: MikuCore.Commands.Command) => void): () => void;
  subscribePromptSentError(cb: (commandId: string) => void): () => void;
  speechToText(audioFile: Blob): Promise<string>;
  sendPrompt(text: string, type: number, subject?: string): {wait: Promise<void[]>, commandId: string};
  getCurrentPrompt(): string;
  getMemory(): MikuCore.Memory.ShortTermMemory;
  computeCost(prompt: string): Promise<number>;
}

class BotFactory {
  private config: BotFactoryConfig;
  private signer: MikuCore.Services.ServiceQuerySigner;

  constructor(config: BotFactoryConfig) {
    this.config = config;
    this.signer = new MikuCore.Services.ServiceQuerySigner(MOCK_PRIVATE_KEY);
  }

  private getMemory({service, props}: {
    service: MikuExtensions.Services.ServicesNames,
    props: object,
  }): MikuCore.Memory.ShortTermMemory {
    let memory: MikuCore.Memory.ShortTermMemory | null = null;
    switch (service) {
      
      case MikuExtensions.Services.ServicesNames.GPTShortTermMemory:
        memory = new MikuExtensions.Memory.GPTShortTermMemory(
          props as MikuExtensions.Memory.GPTShortTermMemoryConfig
        );
        break;
    }

    if(!memory) throw `Memory '${service}' not found`;

    return memory;
  }

  private getPromptCompleter({service, props, memory, signer}: {
    service: MikuExtensions.Services.ServicesNames,
    props: object,
    memory: MikuCore.Memory.ShortTermMemory
    signer: MikuCore.Services.ServiceQuerySigner
  }): MikuCore.ChatPromptCompleters.ChatPromptCompleter {
    let chatPromptCompleter: MikuCore.ChatPromptCompleters.ChatPromptCompleter | null = null;

    // for alpha demo
    const searchParams = queryString.parse(location.search);

    switch (service) {
      case MikuExtensions.Services.ServicesNames.OpenAI:
        chatPromptCompleter = new MikuExtensions.ChatPromptCompleters.OpenAIPromptCompleter({
          serviceEndpoint: `${this.config.servicesEndpoint}/${service}`,
          props: {
            ...props,
            openai_key: String(searchParams['openai'] || '') || ''
          },
          signer: signer,
          memory: memory,
        });
        break;
      case MikuExtensions.Services.ServicesNames.Pygmalion:
        chatPromptCompleter = new MikuExtensions.ChatPromptCompleters.PygmalionPromptCompleter({
          serviceEndpoint: `${this.config.servicesEndpoint}/${service}`,
          props: props,
          signer: signer,
          memory: memory,
        });
        break;
      case MikuExtensions.Services.ServicesNames.LLaMA:
        chatPromptCompleter = new MikuExtensions.ChatPromptCompleters.LLaMAPromptCompleter({
          serviceEndpoint: `${this.config.servicesEndpoint}/${service}`,
          props: {
            ...props,
            gradioEndpoint: String(searchParams['llama'] || '') || ''
          },
          signer: signer,
          memory: memory,
        });
        break;
    }

    if(!chatPromptCompleter) throw `Chat completer '${service}' not found`;

    return chatPromptCompleter;
  }

  private getOutputListener({service, props, signer}: {
    service: MikuExtensions.Services.ServicesNames,
    props: object,
    signer: MikuCore.Services.ServiceQuerySigner
  }): MikuCore.OutputListeners.OutputListener<MikuCore.OutputListeners.OutputEnvironment, any> {
    let outputListener: MikuCore.OutputListeners.OutputListener<MikuCore.OutputListeners.OutputEnvironment, any> | null = null;

    // for alpha demo
    const searchParams = queryString.parse(location.search);
    
    switch (service) {
      case MikuExtensions.Services.ServicesNames.OpenAIEmotionInterpreter:
        outputListener = new MikuExtensions.OutputListeners.EmotionRenderer({
          serviceEndpoint: `${this.config.servicesEndpoint}/${service}`,
          signer: signer,
          props: {
            ...props,
            openai_key: String(searchParams['openai'] || '') || ''
          } as MikuExtensions.Services.EmotionInterpreterProps,
        });
        break;
      case MikuExtensions.Services.ServicesNames.SBertEmotionInterpreter:
        outputListener = new MikuExtensions.OutputListeners.SBertEmotionRenderer({
          serviceEndpoint: `${this.config.servicesEndpoint}/${service}`,
          signer: signer,
          props: {
            ...props,
          } as MikuExtensions.Services.SBertEmotionInterpreterProps,
        });
        break;
      case MikuExtensions.Services.ServicesNames.AzureTTS:
      case MikuExtensions.Services.ServicesNames.ElevenLabsTTS:
        let apiKey = searchParams[
          MikuExtensions.Services.ServicesNames.AzureTTS === service ?
          'azure' : 'elevenlabs'
        ] || '';
        apiKey = apiKey ? String(apiKey): '';
        outputListener = new MikuExtensions.OutputListeners.TTSOutputListener({
          serviceEndpoint: `${this.config.servicesEndpoint}/${service}`,
          signer: signer,
          props: {
            ...props,
            apiKey
          }
        }, service);
        break;
      case MikuExtensions.Services.ServicesNames.NovelAITTS:
        outputListener = new MikuExtensions.OutputListeners.TTSOutputListener({
          serviceEndpoint: `${this.config.servicesEndpoint}/${service}`,
          signer: signer,
          props: {
            ...props,
            apiKey: String(searchParams['novelai'] || '') || ''
          }
        }, service);
        break;
    }

    if(!outputListener) throw `Output listener '${service}' not found`;

    outputListener.subscribeError((error) => {
      toast.error('Error calling service: ' + service);
      console.error(error);
    })

    return outputListener;
  }

  public create(botConfig: BotConfig): BotInstanceInterface {
    const searchParams = queryString.parse(location.search);
    const whisper = new MikuExtensions.CommandGenerators.WhisperServiceClient(
      `${this.config.servicesEndpoint}/audio-upload`,
      `${this.config.servicesEndpoint}/${MikuExtensions.Services.ServicesNames.WhisperSTT}`,
      this.signer,
      String(searchParams['openai'] || '') || ''  
    );
    const textWriter = new MikuCore.CommandGenerators.TextCommandGenerator();
    const memory = this.getMemory(botConfig.short_term_memory);
    const promptCompleter = this.getPromptCompleter({
      service: botConfig.prompt_completer.service,
      props: botConfig.prompt_completer.props,
      memory: memory,
      signer: this.signer,
    });
    let outputListenerConfigs = botConfig.outputListeners;


    // HOTFIX for alpha demo
    if (IS_ALPHA_LIVE) {
      outputListenerConfigs = botConfig.outputListeners.filter((listener: {service: MikuExtensions.Services.ServicesNames}) => {
        // allow azure requirement for now
        // if (
        //   listener.service === MikuExtensions.Services.ServicesNames.AzureTTS &&
        //   !queryString.parse(location.search)['azure']
        // ) {
        //   return false;
        // }

        if (
          listener.service === MikuExtensions.Services.ServicesNames.ElevenLabsTTS &&
          !queryString.parse(location.search)['elevenlabs']
        ) {
          return false;
        }

        if (
          listener.service === MikuExtensions.Services.ServicesNames.NovelAITTS &&
          !queryString.parse(location.search)['novelai']
        ) {
          return false;
        }
        
        
        return true;
      })
    }

    const dialogOutputListeners = outputListenerConfigs.map((outputListenerConfig) => {
      return this.getOutputListener({
        service: outputListenerConfig.service,
        props: outputListenerConfig.props,
        signer: this.signer,
      });
    });

    new MikuCore.ChatBot({
      promptCompleter: promptCompleter,
      commandGenerators: [textWriter],
      outputListeners: {
        dialogOutputListeners,
      },
    });
    const promptSentErrorCallbacks: ((commandId: string) => void)[] = [];

    return {
      subscribeContextChangeSuggestion(
        cb: (contextId: string) => void
      ): boolean {
        const listener = dialogOutputListeners.find((listener) => listener instanceof MikuExtensions.OutputListeners.SBertEmotionRenderer) as MikuExtensions.OutputListeners.SBertEmotionRenderer;
        listener?.subscribe(function (output: MikuExtensions.OutputListeners.SBertEmotionRendererOutput) {
          if (!output.shouldContextChange) return;
          if (output.nextContextId !== listener.getCurrentContextId()) {
            cb(output.nextContextId);
          } else {
            const contextId = listener.contextIds.find((contextId) => contextId !== listener.getCurrentContextId());
            cb(contextId || output.nextContextId);
          }
        });
        return !!listener;
      },

      changeContext(contextId: string): boolean {
        const listener = dialogOutputListeners.find((listener) => listener instanceof MikuExtensions.OutputListeners.SBertEmotionRenderer);
        if (!listener) return false;
        (listener as MikuExtensions.OutputListeners.SBertEmotionRenderer).setContextId(contextId);
        return true;
      },

      subscribeDialog(
        cb: (output: MikuExtensions.OutputListeners.EmotionRendererOutput) => void
      ): boolean {
        const listener = dialogOutputListeners.find((listener) => listener instanceof MikuExtensions.OutputListeners.SBertEmotionRenderer || listener instanceof MikuExtensions.OutputListeners.EmotionRenderer);
        listener?.subscribe(cb);
        return !!listener;
      },

      subscribeAudio(cb: (base64: string, output: MikuCore.OutputListeners.OutputEnvironment) => void): boolean {
        const listener =  dialogOutputListeners.find((listener) => listener instanceof MikuExtensions.OutputListeners.TTSOutputListener);
        listener?.subscribe(cb);
        return !!listener;
      },

      subscribePromptSent(cb: (command: MikuCore.Commands.Command) => void): () => void {
        return textWriter.subscribe(cb);
      },

      subscribePromptSentError(cb: (commandId: string) => void): () => void {
        promptSentErrorCallbacks.push(cb)
        return () => {
          promptSentErrorCallbacks.splice(promptSentErrorCallbacks.indexOf(cb), 1);
        };
      },

      async speechToText(file: Blob): Promise<string> {
        return whisper.query(file);
      },

      sendPrompt(text: string, type: number, subject: string = botConfig.subject): {wait: Promise<void[]>, commandId: string} {
        const { wait, commandId } = textWriter.emit({
          type,
          input: {
            text,
            subject,
          },
        });
        return {
          wait: wait.catch((error) => {
            toast.error('Error sending prompt');
            promptSentErrorCallbacks.forEach(cb => cb(commandId));
            throw error;
          }),
          commandId,
        }
      },

      getCurrentPrompt() {
        return memory.buildMemoryPrompt();
      },

      getMemory() {
        return memory;
      },

      async computeCost(prompt: string): Promise<number> {
        const dialogOutputListenersCosts = await Promise.all(dialogOutputListeners.map(listener => listener.getCost()));
        return dialogOutputListenersCosts.reduce((prev, cur) => prev + cur, await promptCompleter.getCost(prompt));
      },
    }
  }
}

const VITE_SERVICES_ENDPOINT = import.meta.env.VITE_SERVICES_ENDPOINT || 'http://localhost:8484';

const botFactory = new BotFactory({
  servicesEndpoint: VITE_SERVICES_ENDPOINT,
});

export default (function () {
  let botInstance: BotInstanceInterface | null = null;

  return {
    getInstance: (): BotInstanceInterface | null => {
      return botInstance;
    },
    updateInstance: (botConfig: BotConfig) => {
      botInstance = botFactory.create(botConfig);
      return botInstance;
    }
  }
})();