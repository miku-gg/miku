import { toast } from "react-toastify";
import { updateHistoryNumber } from "../chat-history/chat-history";
import * as MikuExtensions from "@mikugg/extensions";
import { BotConfigSettings } from "../../libs/botSettingsUtils";

export const BotSettingsFooter = ({ botName, botConfigSettings, onBotConfigSettingsChange }: {
  botName?: string;
  botConfigSettings: BotConfigSettings;
  onBotConfigSettingsChange: (_botConfigSettings: BotConfigSettings) => void;
}) => {

  const handleExport = () => {
    const json = JSON.stringify(botConfigSettings);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `${
      botName || "unknown"
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
        if (!botName) {
          toast.warn("Please, load a bot before uploading a history");
          return;
        }
        let json = reader.result as string;

        const newData = JSON.parse(json) as BotConfigSettings;
        onBotConfigSettingsChange(newData);
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
