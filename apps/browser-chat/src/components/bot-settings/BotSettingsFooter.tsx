import { toast } from "react-toastify";
import { BotLoaderContext, useBot } from "../../libs/botLoader";
import {
  BotSettings,
  GenSettings,
  ServicesNames,
  botSettings,
  genSettings,
} from "../interactive-chat/bot-display/BotDisplay";
import botFactory from "../../libs/botFactory";
import { updateHistoryNumber } from "../chat-history/chat-history";
import { useContext } from "react";
import { InteractiveResponsesContext } from "../../libs/useResponses";
import { updateBotSettingsNumber } from "./BotSettings";

export const BotSettingsFooter = () => {
  const { botConfig, botHash, loading } = useBot();
  const { updateBotConfig } = useContext(InteractiveResponsesContext);
  const { setBotConfig } = useContext(BotLoaderContext);

  const handleExport = () => {
    const json = JSON.stringify({
      botSettings: botSettings,
      genSettings: genSettings,
    });
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `${
      botConfig?.bot_name || "unknown"
    }_settings_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (!botConfig || !botHash || loading) {
          toast.warn("Please, load a bot before uploading a history");
          return;
        }
        let json = reader.result as string;

        const newData = JSON.parse(json) as {
          botSettings: BotSettings;
          genSettings: GenSettings;
        };

        // there is prolly a better way to do this but i couldnt find out
        genSettings.maxContextLength = newData.genSettings.maxContextLength;
        genSettings.temp = newData.genSettings.temp;
        genSettings.maxTokens = newData.genSettings.maxTokens;
        genSettings.topP = newData.genSettings.topP;
        genSettings.topK = newData.genSettings.topK;
        genSettings.typicalP = newData.genSettings.typicalP;
        genSettings.repetitionPenalty = newData.genSettings.repetitionPenalty;
        genSettings.encoderRepitionPenalty =
          newData.genSettings.encoderRepitionPenalty;
        genSettings.noRepeatNgramSize = newData.genSettings.noRepeatNgramSize;
        genSettings.minLength = newData.genSettings.minLength;
        genSettings.doSample = newData.genSettings.doSample;
        genSettings.seed = newData.genSettings.seed;
        genSettings.penaltyAlpha = newData.genSettings.penaltyAlpha;
        genSettings.numBeams = newData.genSettings.numBeams;
        genSettings.addBosToken = newData.genSettings.addBosToken;
        genSettings.banEosToken = newData.genSettings.banEosToken;
        genSettings.lengthPenalty = newData.genSettings.lengthPenalty;
        genSettings.earlyStopping = newData.genSettings.earlyStopping;
        genSettings.truncateLength = newData.genSettings.truncateLength;
        genSettings.stoppingStrings = newData.genSettings.stoppingStrings;
        genSettings.skipSpecialTokens = newData.genSettings.skipSpecialTokens;
        genSettings.repetitionPenaltyRange =
          newData.genSettings.repetitionPenaltyRange;
        genSettings.repetitionPenaltySlope =
          newData.genSettings.repetitionPenaltySlope;
        genSettings.topA = newData.genSettings.topA;
        genSettings.tailFreeSampling = newData.genSettings.tailFreeSampling;
        genSettings.order = newData.genSettings.order;
        genSettings.frequencyPenalty = newData.genSettings.frequencyPenalty;
        genSettings.presencePenalty = newData.genSettings.presencePenalty;
        genSettings.oaiModel = newData.genSettings.oaiModel;

        botSettings.promptStrategy = newData.botSettings.promptStrategy;
        botSettings.sttModel = newData.botSettings.sttModel;
        botSettings.voiceGeneration = newData.botSettings.voiceGeneration;
        botSettings.promptService = newData.botSettings.promptService;
        botSettings.voiceService = newData.botSettings.voiceService;
        botSettings.voiceId = newData.botSettings.voiceId;
        botSettings.readNonSpokenText = newData.botSettings.readNonSpokenText;
        newData.botSettings.oldVoiceService == ""
          ? (botSettings.oldVoiceService = newData.botSettings.voiceService)
          : (botSettings.oldVoiceService = newData.botSettings.oldVoiceService);

        const newConfig = JSON.parse(JSON.stringify(botConfig));
        if (newConfig.short_term_memory.service != botSettings.promptStrategy) {
          switch (botSettings.promptStrategy) {
            case "wpp":
              newConfig.short_term_memory.props.buildStrategySlug = "wpp";
              break;
            case "sbf":
              newConfig.short_term_memory.props.buildStrategySlug = "sbf";
              break;
            case "rpbt":
              newConfig.short_term_memory.props.buildStrategySlug = "rpbt";
              break;
          }
        }
        newConfig.outputListeners[0].service = botSettings.voiceService;
        if (!botSettings.voiceGeneration) {
          botSettings.voiceService = "";
        }

        newConfig.outputListeners[0].props.voiceId = botSettings.voiceId;
        switch (botSettings.promptService) {
          case "llama":
            newConfig.prompt_completer.service = ServicesNames.LLaMA;
            break;
          case "openai":
            newConfig.prompt_completer.service = ServicesNames.OpenAI;
            newConfig.prompt_completer.props.model = genSettings.oaiModel;
            if (!genSettings.oaiModel) {
              genSettings.topP = 1.0;
              genSettings.oaiModel = "gpt-3.5-turbo";
            }
            break;
          case "pygmalion":
            newConfig.prompt_completer.service = ServicesNames.Pygmalion;
            break;
        }

        botFactory.updateInstance(newConfig);
        updateBotConfig(newConfig);
        setBotConfig(newConfig);
        updateHistoryNumber();
        toast.success(`Settings loaded!`);
      } catch (e) {
        toast.error("Error reading json file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <button
        className="button-transparent min-w-[10em] py-1"
        onClick={handleExport}
      >
        Export settings
      </button>
      <label className="button-purple min-w-[10em] flex items-center justify-center cursor-pointer py-1">
        Import settings
        <input
          id="load-history-input"
          className="hidden"
          type="file"
          accept="application/json"
          onChange={handleImport}
        />
      </label>
    </>
  );
};
