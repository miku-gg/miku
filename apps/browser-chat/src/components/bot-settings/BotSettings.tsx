import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { DropDown } from "../dropdown/Dropdown";
import { useState } from "react";
import { Tooltip } from "@mui/material";
import RangeInput from "./RangeInput";
import BoolInput from "./BoolInput";
import TextInput from "./TextInput";

export const BotSettings = () => {
  const completionModels = ["LLaMA-30B", "GPT-3.5 Turbo", "Pygmalion"];
  const [completionModelIndex, setCompletionModelIndex] = useState<number>(0);

  const promptMethods = ["RPBT", "Miku", "Pygmalion", "OpenAI"];
  const [promptMethod, setPromptMethod] = useState<number>(0);

  const sttModels = ["Whisper"];
  const [sttModelIndex, setSttModelIndex] = useState<number>(0);

  const [useVoiceGeneration, setUseVoiceGeneration] = useState<boolean>(false);

  const voiceModels = ["ElevenLabs", "Azure", "Novel"];
  const [voiceModelIndex, setVoiceModelIndex] = useState<number>(0);

  const [voiceId, setVoiceId] = useState<string>("");

  const [readNonSpokenText, setReadNonSpokenText] = useState<boolean>(false);

  return (
    <>
      <p className="text-white text-2xl text-start m-4">Bot Settings</p>
      <div className="max-w-96 h-full scrollbar overflow-auto text-clip text-start text-white m-4">
        Misc. settings for miku and how the model is prompted.
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
        <BoolInput
          value={useVoiceGeneration}
          title="Voice generation"
          tooltip="What is used to turn the bots speech into text."
          onChange={() => setUseVoiceGeneration(!useVoiceGeneration)}
        />
        {useVoiceGeneration ? (
          <div className="p-4 my-4 bg-[#323232]">
            <div className="flex items-center gap-1">
              <DropDown
                items={voiceModels}
                onChange={(index) => setVoiceModelIndex(index)}
                selectedIndex={voiceModelIndex}
                top={true}
              />
              {voiceModelIndex === 0 ? (
                <div className="ml-auto">
                  <TextInput
                    value={voiceId}
                    placeholder="Voice id."
                    tooltip="What voice id to use."
                    onChange={(e) => setVoiceId(e.target.value)}
                  />
                </div>
              ) : null}
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
        {completionModelIndex === 0 ? (
          <div className="flex flex-col gap-8">
            <RangeInput
              label="Max New Tokens"
              helperText="Number of tokens the AI should generate. Higher numbers will take longer to generate."
              min={16}
              max={512}
              step={4}
              value={196}
            />
            <RangeInput
              label="Temperature"
              helperText="Primary factor to control randomness of outputs. 0 = deterministic (only the most likely token is used). Higher value = more randomness."
              min={0.01}
              max={1.99}
              step={0.01}
              value={0.7}
            />
            <RangeInput
              label="Top P"
              helperText="If not set to 1, select tokens with probabilities adding up to less than this number. Higher value = higher range of possible random results."
              min={0}
              max={1}
              step={0.01}
              value={0.5}
            />
            <RangeInput
              label="Top K"
              helperText="Similar to top_p, but select instead only the top_k most likely tokens. Higher value = higher range of possible random results."
              min={0}
              max={200}
              step={1}
              value={40}
            />
            <RangeInput
              label="Typical P"
              helperText="If not set to 1, select only tokens that are at least this much more likely to appear than random tokens, given the prior text."
              min={0}
              max={1}
              step={0.01}
              value={1}
            />
            <RangeInput
              label="Repetition Penalty"
              helperText="Exponential penalty factor for repeating prior tokens. 1 means no penalty, higher value = less repetition, lower value = more repetition."
              min={1}
              max={1.5}
              step={0.01}
              value={1.2}
            />
            <RangeInput
              label="Encoder Repetition Penalty"
              helperText={
                'Also known as the "Hallucinations filter". Used to penalize tokens that are *not* in the prior text. Higher value = more likely to stay in context, lower value = more likely to diverge.'
              }
              min={0.8}
              max={1.5}
              step={0.01}
              value={1}
            />
            <RangeInput
              label="No Repeat Ngram Size"
              helperText="If not set to 0, specifies the length of token sets that are completely blocked from repeating at all. Higher values = blocks larger phrases, lower values = blocks words or letters from repeating. Only 0 or high values are a good idea in most cases."
              min={0}
              max={20}
              step={1}
              value={0}
            />
            <RangeInput
              label="Min Length"
              helperText="Minimum generation length in tokens."
              min={0}
              max={2000}
              step={1}
              value={0}
            />
            <BoolInput
              value={true}
              title="Do Sample"
              tooltip="Whether or not to use sampling; use greedy decoding otherwise."
            />
            <ul className="w-full">
              <label className="form-label block-block">Seed</label>
              <p className="mt-[-0.125rem] pb-2 text-sm text-gray-500">
                -1 for random
              </p>
              <input
                className="w-36 inline-block border border-[#7957D2] rounded-md outline-none bg-transparent"
                value={"-1"}
                type="number"
                onInput={() => console.log("bleh")}
              />
            </ul>
            <RangeInput
              label="Penalty Alpha"
              helperText="Contrastive Search."
              min={0}
              max={5}
              step={0.01}
              value={0}
            />
            <RangeInput
              label="Num Beams"
              helperText="Beam search (uses a lot of VRAM)"
              min={1}
              max={20}
              step={1}
              value={1}
            />
            <RangeInput
              label="Length Penalty"
              helperText="Beam search (uses a lot of VRAM)"
              min={-5}
              max={5}
              step={0.1}
              value={1}
            />
            <BoolInput value={false} title="Early Stopping" />
            <BoolInput
              value={true}
              title="Add BOS Token"
              tooltip="Add the bos_token to the beginning of prompts. Disabling this can make the replies more creative."
            />
            <BoolInput
              value={true}
              title="Ban EOS Token"
              tooltip="This forces the model to never end the generation prematurely."
            />
            <RangeInput
              label="Truncate Prompt"
              helperText="Truncate the prompt up to this length. The leftmost tokens are removed if the prompt exceeds this length. Most models require this to be at most 2048."
              min={0}
              max={4096}
              step={1}
              value={2048}
            />
            <TextInput
              value={""}
              placeholder="Custom stopping strings"
              tooltip={
                'In addition to the defaults. Written between "" and separated by commas. For instance: "\nYour Assistant:", "\nThe assistant:"'
              }
              onChange={(e) => console.log(e.target.value)}
            />
          </div>
        ) : null}
        {completionModelIndex === 1 ? (
          <div className="flex flex-col gap-8">
            <RangeInput
              label="Temperature"
              helperText="Randomness of sampling. High values can increase creativity but may make text less sensible. Lower values will make text more predictable but can become repetitious."
              min={0.1}
              max={2}
              step={0.01}
              value={0.5}
            />
            <RangeInput
              label="Frequency Penalty"
              helperText="Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim."
              min={-2.0}
              max={2.0}
              step={0.01}
              value={0.5}
            />
            <RangeInput
              label="Presence Penalty"
              helperText="Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics."
              min={-2.0}
              max={2.0}
              step={0.01}
              value={0.5}
            />
          </div>
        ) : null}
        {completionModelIndex === 2 ? (
          <div className="flex flex-col gap-8">
            <RangeInput
              label="Max New Tokens"
              helperText="Number of tokens the AI should generate. Higher numbers will take longer to generate."
              min={16}
              max={512}
              step={4}
              value={196}
            />
            <RangeInput
              label="Temperature"
              helperText="Randomness of sampling. High values can increase creativity but may make text less sensible. Lower values will make text more predictable but can become repetitious."
              min={0.1}
              max={2}
              step={0.01}
              value={0.5}
            />
            <RangeInput
              label="Top P"
              helperText="Used to discard unlikely text in the sampling process. Lower values will make text more predictable but can become repetitious. (Put this value on 1 to disable its effect)"
              min={0}
              max={1}
              step={0.01}
              value={0.9}
            />
            <RangeInput
              label="Top K"
              helperText="Alternative sampling method, can be combined with top_p. The number of highest probability vocabulary tokens to keep for top-k-filtering. (Put this value on 0 to disable its effect)"
              min={0}
              max={100}
              step={1}
              value={0}
            />
            <RangeInput
              label="Typical P"
              helperText="Alternative sampling method described in the paper 'Typical_p Decoding for Natural Language Generation' (10.48550/ARXIV.2202.00666). The paper suggests 0.2 as a good value for this setting. Set this setting to 1 to disable its effect."
              min={0}
              max={1}
              step={0.01}
              value={1}
            />
            <RangeInput
              label="Repetition Penalty"
              helperText="Used to penalize words that were already generated or belong to the context (Going over 1.2 breaks 6B models. Set to 1.0 to disable)."
              min={0}
              max={3}
              step={0.01}
              value={1.05}
            />
            <RangeInput
              label="Penalty Alpha"
              helperText="The alpha coefficient when using contrastive search."
              min={0}
              max={1}
              step={0.05}
              value={0.6}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};
