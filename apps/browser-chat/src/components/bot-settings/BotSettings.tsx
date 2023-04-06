import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { DropDown } from "../dropdown/Dropdown";
import { useState } from "react";
import { Tooltip } from "@mui/material";

export const BotSettings = () => {
  const completionModels = ["Llama", "Pygmalion", "OpenAI"];
  const [completionModelIndex, setCompletionModelIndex] = useState<number>(0);

  const promptMethods = ["RPBT", "Miku", "Pygmalion", "OpenAI"];
  const [promptMethod, setPromptMethod] = useState<number>(0);

  const sttModels = ["Whisper"];
  const [sttModelIndex, setSttModelIndex] = useState<number>(0);

  const [useVoiceGeneration, setUseVoiceGeneration] = useState<boolean>(false);

  const voiceModels = ["ElevenLabs", "Azure", "Novel"];
  const [voiceModelIndex, setVoiceModelIndex] = useState<number>(0);

  const [voideId, setVoiceId] = useState<string>("");

  const [readNonSpokenText, setReadNonSpokenText] = useState<boolean>(false);

  const [quality, setQuality] = useState<number>(0);

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuality = parseFloat(e.target.value);
    setQuality(newQuality);
  };

  return (
    <>
      <p className="text-white text-2xl text-start m-4">Bot Settings</p>
      <div className="max-w-96 h-full scrollbar overflow-auto text-clip text-start text-white m-4">
        Misc. settings for miku and how the model is prompted.
        <div className="flex items-center gap-1 my-4">
          Completion Model
          <Tooltip
            title="What model is used to generate the text."
            placement="right"
          >
            <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
          </Tooltip>
          <div className="ml-auto">
            <DropDown
              items={completionModels}
              onChange={(index) => setCompletionModelIndex(index)}
              selectedIndex={completionModelIndex}
              top={true}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 my-4">
          Prompt Method
          <Tooltip
            title="How the character definitions are sent to the model."
            placement="right"
          >
            <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
          </Tooltip>
          <div className="ml-auto">
            <DropDown
              items={promptMethods}
              onChange={(index) => setPromptMethod(index)}
              selectedIndex={promptMethod}
              top={true}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 my-4">
          Speech-to-text
          <Tooltip
            title="What is used to turn your speech into text."
            placement="right"
          >
            <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
          </Tooltip>
          <div className="ml-auto">
            <DropDown
              items={sttModels}
              onChange={(index) => setSttModelIndex(index)}
              selectedIndex={sttModelIndex}
              top={true}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={useVoiceGeneration}
            onChange={() => setUseVoiceGeneration(!useVoiceGeneration)}
          />
          Voice generation
          <Tooltip
            title="What is used to turn your speech into text."
            placement="right"
          >
            <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
          </Tooltip>
        </div>
        {useVoiceGeneration ? (
          <div className="p-4 my-4 bg-[#323232]">
            <div className="flex items-center gap-1">
              <DropDown
                items={voiceModels}
                onChange={(index) => setVoiceModelIndex(index)}
                selectedIndex={voiceModelIndex}
                top={true}
              />

              <div className="flex items-center gap-1 ml-auto">
                <textarea
                  id="input-user-textarea"
                  value={voideId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="h-10 resize-none scrollbar placeholder:italic overflow-x-clip gap-2 relative border border-[#7957D2] rounded-md outline-none button-transparent aria-disabled:shadow-none aria-disabled:blur-[1px]"
                  name="input-user-textarea"
                  autoComplete="off"
                  placeholder="Voice id."
                />
                <Tooltip
                  title="What voice id to use. Only used for ElevenLabs."
                  placement="right"
                >
                  <InformationCircleIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </Tooltip>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <input
                type="checkbox"
                checked={readNonSpokenText}
                onChange={() => setReadNonSpokenText(!readNonSpokenText)}
              />
              Read non-spoken text
              <Tooltip
                title="Read text enclosed in *asteriks*."
                placement="right"
              >
                <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
              </Tooltip>
            </div>
          </div>
        ) : null}
        <div className="flex my-4">
          Quality
          <div className="ml-auto">{quality}</div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={quality}
          className="w-full"
          onChange={handleQualityChange}
        />
      </div>
    </>
  );
};
