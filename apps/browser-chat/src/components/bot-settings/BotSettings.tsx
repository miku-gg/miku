import { DropDown } from "../dropdown/Dropdown";
import { useState } from "react";
import RangeInput from "./RangeInput";
import BoolInput from "./BoolInput";
import TextInput from "./TextInput";
import DropdownInput from "./DropdownInput";

type mikuSettings = {
  // promptMethod: "RPBT" | "Miku" | "Pygmalion" | "OpenAI";
  promptMethod: string;
  // sttModel: "Whisper";
  sttModel: string;
  voiceGeneration: boolean;
  // completionModel: "LLaMA-30B" | "GPT-3.5 Turbo" | "Pygmalion";
  modelService: string;
  // voiceModel: "ElevenLabs" | "Azure" | "Novel";
  voiceModel: string;
  voiceId: string;
  readNonSpokenText: boolean;
  // llamaMode: "llama-7b" | "llama-13b" | "llama-30b" | "llama-65b" | "alpaca-7b" | "alpaca-13b" | "gpt4all-13b";
  llamaModel: string;
};

type chatGenSettings = {
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

  repetitionPenaltyRange: number;
  repetitionPenaltySlope: number;
  topA: number;
  tailFreeSampling: number;
  order: number[];

  frequencyPenalty: number;
  presencePenalty: number;
};

let botSettings: mikuSettings = {
  promptMethod: "RPBT",
  sttModel: "Whisper",
  voiceGeneration: true,
  modelService: "llama",
  voiceModel: "ElevenLabs",
  voiceId: "",
  readNonSpokenText: false,
  llamaModel: "llama-30b",
};

let genSettings: chatGenSettings = {
  temp: 0.7,
  maxTokens: 200,
  topP: 0.5,
  topK: 40,
  typicalP: 1,
  repetitionPenalty: 1.2,
  encoderRepitionPenalty: 1,
  noRepeatNgramSize: 0,
  minLength: 0,
  doSample: true,
  seed: -1,
  penaltyAlpha: 0,
  numBeams: 1,
  lengthPenalty: 1,
  earlyStopping: false,
  addBosToken: true,
  banEosToken: false,
  truncateLength: 2048,
  stoppingStrings: "",
  repetitionPenaltyRange: 1024,
  repetitionPenaltySlope: 0.9,
  topA: 0,
  tailFreeSampling: 0.9,
  order: [6, 0, 1, 2, 3, 4, 5],
  frequencyPenalty: 0.7,
  presencePenalty: 0.7,
};

export const BotSettings = () => {
  const modelServices = ["llama", "openai", "pygmalion"];
  const llamaModels = [
    "llama-7b",
    "llama-13b",
    "llama-30b",
    "llama-65b",
    "alpaca-7b",
    "alpaca-13b",
    "gpt4all-13b",
  ];
  const promptMethods = ["RPBT", "Miku", "Pygmalion", "OpenAI"];
  const sttModels = ["Whisper"];
  const voiceModels = ["ElevenLabs", "Azure", "Novel"];

  const [voiceGeneration, setVoiceGeneration] = useState<boolean>(
    botSettings.voiceGeneration
  );

  const [modelServiceIndex, setServiceModelIndex] = useState<number>(0);

  return (
    <>
      <p className="text-white text-2xl text-start m-4">Bot Settings</p>
      <div className="max-w-96 h-full scrollbar overflow-auto text-clip text-start text-white m-4">
        Misc. settings for miku and how the model is prompted.
        <DropdownInput
          title="Prompt Method"
          index={promptMethods.indexOf(botSettings.promptMethod)}
          items={promptMethods}
          tooltip="How the character definitions are sent to the model."
          onChange={(i) => (botSettings.promptMethod = promptMethods[i])}
        />
        <DropdownInput
          title="Speech-to-text"
          index={sttModels.indexOf(botSettings.sttModel)}
          items={sttModels}
          tooltip={"Used to turn your speech into text to prompt the model."}
          onChange={(i) => (botSettings.sttModel = sttModels[i])}
        />
        <BoolInput
          value={botSettings.voiceGeneration}
          title="Voice generation"
          tooltip="What is used to turn the bots speech into text."
          onChange={(e) => {
            botSettings.voiceGeneration = e;
            setVoiceGeneration(e);
          }}
        />
        {voiceGeneration ? (
          <div className="p-4 my-4 bg-[#323232]">
            <div className="flex items-center gap-1">
              <DropDown
                items={voiceModels}
                selectedIndex={voiceModels.indexOf(botSettings.voiceModel)}
                onChange={(i) => (botSettings.voiceModel = voiceModels[i])}
                top={true}
              />
              {voiceModels.indexOf(botSettings.voiceModel) === 0 ? (
                <div className="ml-auto">
                  <TextInput
                    value={botSettings.voiceId}
                    placeholder="Voice id."
                    tooltip="What voice id to use."
                    onChange={(e) => (botSettings.voiceId = e.target.value)}
                  />
                </div>
              ) : null}
            </div>
            <BoolInput
              value={botSettings.readNonSpokenText}
              title="Read non-spoken text"
              tooltip="Read text enclosed in *asteriks*."
              onChange={(e) => (botSettings.readNonSpokenText = e)}
            />
          </div>
        ) : null}
        <DropdownInput
          title="Model Service"
          index={modelServiceIndex}
          items={modelServices}
          tooltip={"What model is used to generate the text."}
          onChange={(i) => {
            botSettings.modelService = modelServices[i];
            setServiceModelIndex(i);
          }}
        />
        {modelServiceIndex === 0 ? (
          <div className="flex flex-col gap-8">
            <DropdownInput
              title="LLaMA model"
              index={llamaModels.indexOf(botSettings.llamaModel)}
              items={llamaModels}
              tooltip={"What llama model is used to generate the text."}
              onChange={(i) => {
                botSettings.llamaModel = llamaModels[i];
              }}
            />
            <RangeInput
              title="Max New Tokens"
              helperText={`Number of tokens the AI should generate. Higher numbers will take longer to generate. ${genSettings.maxTokens}`}
              min={16}
              max={512}
              step={4}
              value={genSettings.maxTokens}
              onInput={(value) => (genSettings.maxTokens = value)}
            />
            <RangeInput
              title="Temperature"
              helperText="Primary factor to control randomness of outputs. 0 = deterministic (only the most likely token is used). Higher value = more randomness."
              min={0.01}
              max={1.99}
              step={0.01}
              value={genSettings.temp}
              onInput={(value) => (genSettings.temp = value)}
            />
            <RangeInput
              title="Top P"
              helperText="If not set to 1, select tokens with probabilities adding up to less than this number. Higher value = higher range of possible random results."
              min={0}
              max={1}
              step={0.01}
              value={genSettings.topP}
              onInput={(value) => (genSettings.topP = value)}
            />
            <RangeInput
              title="Top K"
              helperText="Similar to top_p, but select instead only the top_k most likely tokens. Higher value = higher range of possible random results."
              min={0}
              max={200}
              step={1}
              value={genSettings.topK}
              onInput={(value) => (genSettings.topK = value)}
            />
            <RangeInput
              title="Typical P"
              helperText="If not set to 1, select only tokens that are at least this much more likely to appear than random tokens, given the prior text."
              min={0}
              max={1}
              step={0.01}
              value={genSettings.typicalP}
              onInput={(value) => (genSettings.typicalP = value)}
            />
            <RangeInput
              title="Repetition Penalty"
              helperText="Exponential penalty factor for repeating prior tokens. 1 means no penalty, higher value = less repetition, lower value = more repetition."
              min={1}
              max={1.5}
              step={0.01}
              value={genSettings.repetitionPenalty}
              onInput={(value) => (genSettings.repetitionPenalty = value)}
            />
            <RangeInput
              title="Encoder Repetition Penalty"
              helperText={
                'Also known as the "Hallucinations filter". Used to penalize tokens that are *not* in the prior text. Higher value = more likely to stay in context, lower value = more likely to diverge.'
              }
              min={0.8}
              max={1.5}
              step={0.01}
              value={genSettings.encoderRepitionPenalty}
              onInput={(value) => (genSettings.encoderRepitionPenalty = value)}
            />
            <RangeInput
              title="No Repeat Ngram Size"
              helperText="If not set to 0, specifies the length of token sets that are completely blocked from repeating at all. Higher values = blocks larger phrases, lower values = blocks words or letters from repeating. Only 0 or high values are a good idea in most cases."
              min={0}
              max={20}
              step={1}
              value={genSettings.noRepeatNgramSize}
              onInput={(value) => (genSettings.noRepeatNgramSize = value)}
            />
            <RangeInput
              title="Min Length"
              helperText="Minimum generation length in tokens."
              min={0}
              max={2000}
              step={1}
              value={genSettings.noRepeatNgramSize}
              onInput={(value) => (genSettings.noRepeatNgramSize = value)}
            />
            <BoolInput
              value={genSettings.doSample}
              title="Do Sample"
              tooltip="Whether or not to use sampling; use greedy decoding otherwise."
              onChange={(e) => (genSettings.doSample = e)}
            />
            <TextInput
              value={genSettings.seed.toString()}
              placeholder="-1 for random."
              onChange={(e) => (genSettings.seed = parseInt(e.target.value))}
            />
            <RangeInput
              title="Penalty Alpha"
              helperText="The alpha coefficient when using contrastive search."
              min={0}
              max={5}
              step={0.01}
              value={genSettings.penaltyAlpha}
              onInput={(value) => (genSettings.penaltyAlpha = value)}
            />
            <RangeInput
              title="Num Beams"
              helperText="Beam search (uses a lot of VRAM)"
              min={1}
              max={20}
              step={1}
              value={genSettings.numBeams}
              onInput={(value) => (genSettings.numBeams = value)}
            />
            <RangeInput
              title="Length Penalty"
              helperText="Beam search (uses a lot of VRAM)"
              min={-5}
              max={5}
              step={0.1}
              value={genSettings.lengthPenalty}
              onInput={(value) => (genSettings.lengthPenalty = value)}
            />
            <BoolInput
              value={genSettings.earlyStopping}
              title="Early Stopping"
              onChange={(e) => (genSettings.earlyStopping = e)}
            />
            <BoolInput
              value={genSettings.addBosToken}
              title="Add BOS Token"
              tooltip="Add the bos_token to the beginning of prompts. Disabling this can make the replies more creative."
              onChange={(e) => (genSettings.addBosToken = e)}
            />
            <BoolInput
              value={genSettings.banEosToken}
              title="Ban EOS Token"
              tooltip="This forces the model to never end the generation prematurely."
              onChange={(e) => (genSettings.banEosToken = e)}
            />
            <RangeInput
              title="Truncate Prompt"
              helperText="Truncate the prompt up to this length. The leftmost tokens are removed if the prompt exceeds this length. Most models require this to be at most 2048."
              min={0}
              max={4096}
              step={1}
              value={genSettings.truncateLength}
              onInput={(value) => (genSettings.truncateLength = value)}
            />
            <TextInput
              value={genSettings.stoppingStrings}
              placeholder="Custom stopping strings"
              tooltip={
                'In addition to the defaults. Written between "" and separated by commas. For instance: "\nYour Assistant:", "\nThe assistant:"'
              }
              onChange={(e) => (genSettings.stoppingStrings = e.target.value)}
            />
          </div>
        ) : null}
        {modelServiceIndex === 1 ? (
          <div className="flex flex-col gap-8">
            <RangeInput
              title="Temperature"
              helperText="Randomness of sampling. High values can increase creativity but may make text less sensible. Lower values will make text more predictable but can become repetitious."
              min={0.1}
              max={2}
              step={0.01}
              value={genSettings.temp}
              onInput={(value) => (genSettings.temp = value)}
            />
            <RangeInput
              title="Frequency Penalty"
              helperText="Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim."
              min={-2.0}
              max={2.0}
              step={0.01}
              value={genSettings.frequencyPenalty}
              onInput={(value) => (genSettings.frequencyPenalty = value)}
            />
            <RangeInput
              title="Presence Penalty"
              helperText="Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics."
              min={-2.0}
              max={2.0}
              step={0.01}
              value={genSettings.presencePenalty}
              onInput={(value) => (genSettings.presencePenalty = value)}
            />
          </div>
        ) : null}
        {modelServiceIndex === 2 ? (
          <div className="flex flex-col gap-8">
            <RangeInput
              title="Max New Tokens"
              helperText="Number of tokens the AI should generate. Higher numbers will take longer to generate."
              min={16}
              max={512}
              step={4}
              value={genSettings.maxTokens}
              onInput={(value) => (genSettings.maxTokens = value)}
            />
            <RangeInput
              title="Temperature"
              helperText="Randomness of sampling. High values can increase creativity but may make text less sensible. Lower values will make text more predictable but can become repetitious."
              min={0.1}
              max={2}
              step={0.01}
              value={genSettings.temp}
              onInput={(value) => (genSettings.temp = value)}
            />
            <RangeInput
              title="Top P"
              helperText="Used to discard unlikely text in the sampling process. Lower values will make text more predictable but can become repetitious. (Put this value on 1 to disable its effect)"
              min={0}
              max={1}
              step={0.01}
              value={genSettings.topP}
              onInput={(value) => (genSettings.topP = value)}
            />
            <RangeInput
              title="Top K"
              helperText="Alternative sampling method, can be combined with top_p. The number of highest probability vocabulary tokens to keep for top-k-filtering. (Put this value on 0 to disable its effect)"
              min={0}
              max={100}
              step={1}
              value={genSettings.topK}
              onInput={(value) => (genSettings.topK = value)}
            />
            <RangeInput
              title="Top A"
              helperText="Increases the consistency of the output by removing unlikely tokens based on the highest token probability. (Put this value on 1 to disable its effect)"
              min={0}
              max={1}
              step={0.01}
              value={genSettings.topA}
              onInput={(value) => (genSettings.topA = value)}
            />
            <RangeInput
              title="Tail Free Sampling"
              helperText="Increases the consistency of the output by working from the bottom and trimming the lowest probability tokens. (Put this value on 1 to disable its effect)"
              min={0}
              max={1}
              step={0.001}
              value={genSettings.tailFreeSampling}
              onInput={(value) => (genSettings.tailFreeSampling = value)}
            />
            <RangeInput
              title="Typical P"
              helperText="Alternative sampling method described in the paper 'Typical_p Decoding for Natural Language Generation' (10.48550/ARXIV.2202.00666). The paper suggests 0.2 as a good value for this setting. Set this setting to 1 to disable its effect."
              min={0}
              max={1}
              step={0.01}
              value={genSettings.typicalP}
              onInput={(value) => (genSettings.typicalP = value)}
            />
            <RangeInput
              title="Repetition Penalty"
              helperText="Used to penalize words that were already generated or belong to the context (Going over 1.2 breaks 6B models. Set to 1.0 to disable)."
              min={0}
              max={3}
              step={0.01}
              value={genSettings.repetitionPenalty}
              onInput={(value) => (genSettings.repetitionPenalty = value)}
            />
            <RangeInput
              title="Repetition Penalty Range"
              helperText="How many tokens will be considered repeated if they appear in the next output."
              min={0}
              max={2048}
              step={1}
              value={genSettings.repetitionPenaltyRange}
              onInput={(value) => (genSettings.repetitionPenaltyRange = value)}
            />
            <RangeInput
              title="Repetition Penalty Slope"
              helperText="Affects the ramping of the penalty's harshness, starting from the final token. (Set to 0.0 to disable)"
              min={0}
              max={10}
              step={0.01}
              value={genSettings.repetitionPenaltySlope}
              onInput={(value) => (genSettings.repetitionPenaltySlope = value)}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};
