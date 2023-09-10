import { DropDown } from "../dropdown/Dropdown";
import RangeInput from "./RangeInput";
import BoolInput from "./BoolInput";
import TextInput from "./TextInput";
import DropdownInput from "./DropdownInput";
import { BotConfigSettings, PROMPT_STRATEGIES, VOICE_SERVICES, PromptCompleterEndpointType, PROMPT_COMPLETERS, DEFAULT_OOBABOOGA_SETTINGS, DEFAULT_KOBOLDAI_SETTINGS, DEFAULT_OPENAI_SETTINGS, OobaboogaSettings, OPENAI_MODELS } from "../../libs/botSettingsUtils";

export const BotSettings: React.FC<{
  botConfigSettings: BotConfigSettings;
  onBotConfigSettingsChange: (_botConfigSettings: BotConfigSettings) => void;
}> = ({botConfigSettings, onBotConfigSettingsChange}) => {
  const {
    promptCompleterEndpoint,
    promptStrategy,
    voice,
  } = botConfigSettings;

  const handleSettingsChange = function (updatedSettings: object) {
    onBotConfigSettingsChange({
        ...botConfigSettings,
        // @ts-ignore
        promptCompleterEndpoint: {
            ...botConfigSettings.promptCompleterEndpoint,
            genSettings: {
                ...botConfigSettings.promptCompleterEndpoint.genSettings,
                ...updatedSettings,
            },
        },
    });
  };  

  return (
    <>
      <div className="max-w-96 h-full scrollbar overflow-auto text-clip text-start text-white m-4">
        <p className="pb-2">
          Misc. settings for miku and how the model is prompted.
        </p>
        <DropdownInput
          title="Prompt Strategy"
          index={PROMPT_STRATEGIES.findIndex((_promptStrategy => promptStrategy === _promptStrategy.value))}
          items={PROMPT_STRATEGIES.map(_stategy => _stategy.label)}
          tooltip="How the character definitions are sent to the model."
          onChange={(index) => onBotConfigSettingsChange({
            ...botConfigSettings,
            promptStrategy: PROMPT_STRATEGIES[index].value
          })}
        />
        <BoolInput
          value={voice.enabled}
          title="Voice generation"
          tooltip="What is used to turn the bots speech into text."
          onChange={(_value: boolean) => onBotConfigSettingsChange({
            ...botConfigSettings,
            voice: {
              ...voice,
              enabled: _value
            }
          })}
        />
        {voice.enabled ? (
          <div className="p-4 my-4 bg-[#323232] gap-2">
            <div
              className={`items-center gap-1 pb-4`}
            >
              <BoolInput
                value={voice.readNonSpokenText}
                title="Read non-spoken text"
                tooltip="Read text enclosed in *asteriks*."
                onChange={_value => onBotConfigSettingsChange({
                  ...botConfigSettings,
                  voice: {
                    ...voice,
                    readNonSpokenText: _value
                  }
                })}
              />
              <div>
                <label className="form-label block-block">TTS Service</label>
                <DropDown
                  items={VOICE_SERVICES.map(_voice => _voice.label)}
                  selectedIndex={VOICE_SERVICES.findIndex(_voice => _voice.value === voice.voiceService.type)}
                  onChange={index => onBotConfigSettingsChange({
                    ...botConfigSettings,
                    voice: {
                      ...voice,
                      voiceService: {
                        ...voice.voiceService,
                        type: VOICE_SERVICES[index].value
                      }
                    }
                  })}
                  top={true}
                />
              </div>
              <div>
                <TextInput
                  title="Voice id."
                  value={voice.voiceService.voiceId}
                  tooltip="What voice id to use."
                  onChange={event => onBotConfigSettingsChange({
                    ...botConfigSettings,
                    voice: {
                      ...voice,
                      voiceService: {
                        ...voice.voiceService,
                        voiceId: event.target.value
                      }
                    }
                  })}
                />
              </div>
            </div>
          </div>
        ) : null}
        <DropdownInput
          title="Prompt Completer"
          index={PROMPT_COMPLETERS.findIndex((_promptCompleter => promptCompleterEndpoint.type === _promptCompleter.value))}
          items={PROMPT_COMPLETERS.map(_promptCompleter => _promptCompleter.label)}
          tooltip={"What model is used to generate the text."}
          onChange={(index) => {
            switch (PROMPT_COMPLETERS[index].value) {
              case PromptCompleterEndpointType.OOBABOOGA:
                onBotConfigSettingsChange({
                  ...botConfigSettings,
                  promptCompleterEndpoint: {
                    type: PromptCompleterEndpointType.OOBABOOGA,
                    genSettings: DEFAULT_OOBABOOGA_SETTINGS
                  }
                })
                break;
              case PromptCompleterEndpointType.KOBOLDAI:
                onBotConfigSettingsChange({
                  ...botConfigSettings,
                  promptCompleterEndpoint: {
                    type: PromptCompleterEndpointType.KOBOLDAI,
                    genSettings: DEFAULT_KOBOLDAI_SETTINGS
                  }
                })
                break;
              case PromptCompleterEndpointType.OPENAI:
                onBotConfigSettingsChange({
                  ...botConfigSettings,
                  promptCompleterEndpoint: {
                    type: PromptCompleterEndpointType.OPENAI,
                    genSettings: DEFAULT_OPENAI_SETTINGS
                  }
                })
                break;
            case PromptCompleterEndpointType.APHRODITE:
                onBotConfigSettingsChange({
                  ...botConfigSettings,
                  promptCompleterEndpoint: {
                    type: PromptCompleterEndpointType.APHRODITE,
                    genSettings: {
                      assetsUrl: '',
                      botId: '',
                      chatId: ''
                    }
                  }
                })
                break;
            }
          }}
        />
        {botConfigSettings.promptCompleterEndpoint.type === PromptCompleterEndpointType.OOBABOOGA ? (
          <div className="flex flex-col gap-8">
            <RangeInput
              title="Max New Tokens"
              helperText={`Number of tokens the AI should generate. Higher numbers will take longer to generate. ${botConfigSettings.promptCompleterEndpoint.genSettings.maxTokens}`}
              min={16}
              max={512}
              step={4}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.maxTokens}
              onInput={(value) => handleSettingsChange({ maxTokens: value })}
            />
            <RangeInput
              title="Temperature"
              helperText="Primary factor to control randomness of outputs. 0 = deterministic (only the most likely token is used). Higher value = more randomness."
              min={0.01}
              max={1.99}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.temp}
              onInput={(value) => handleSettingsChange({ temp: value })}
            />
            <RangeInput
              title="Top P"
              helperText="If not set to 1, select tokens with probabilities adding up to less than this number. Higher value = higher range of possible random results."
              min={0}
              max={1}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.topP}
              onInput={(value) => handleSettingsChange({ topP: value })}
            />
            <RangeInput
              title="Top K"
              helperText="Similar to top_p, but select instead only the top_k most likely tokens. Higher value = higher range of possible random results."
              min={0}
              max={200}
              step={1}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.topK}
              onInput={(value) => handleSettingsChange({ topK: value })}
            />
            <RangeInput
              title="Typical P"
              helperText="If not set to 1, select only tokens that are at least this much more likely to appear than random tokens, given the prior text."
              min={0}
              max={1}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.typicalP}
              onInput={(value) => handleSettingsChange({ typicalP: value })}
            />
            <RangeInput
              title="Repetition Penalty"
              helperText="Exponential penalty factor for repeating prior tokens. 1 means no penalty, higher value = less repetition, lower value = more repetition."
              min={1}
              max={1.5}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.repetitionPenalty}
              onInput={(value) => handleSettingsChange({ repetitionPenalty: value })}
            />
            <RangeInput
              title="Encoder Repetition Penalty"
              helperText='Also known as the "Hallucinations filter". Used to penalize tokens that are *not* in the prior text. Higher value = more likely to stay in context, lower value = more likely to diverge.'
              min={0.8}
              max={1.5}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.encoderRepitionPenalty}
              onInput={(value) => handleSettingsChange({ encoderRepitionPenalty: value })}
            />
            <RangeInput
              title="No Repeat Ngram Size"
              helperText="If not set to 0, specifies the length of token sets that are completely blocked from repeating at all. Higher values = blocks larger phrases, lower values = blocks words or letters from repeating. Only 0 or high values are a good idea in most cases."
              min={0}
              max={20}
              step={1}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.noRepeatNgramSize}
              onInput={(value) => handleSettingsChange({ noRepeatNgramSize: value })}
            />
            <RangeInput
              title="Min Length"
              helperText="Minimum generation length in tokens."
              min={0}
              max={2000}
              step={1}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.minLength}
              onInput={(value) => handleSettingsChange({ minLength: value })}
            />
            <BoolInput
              value={botConfigSettings.promptCompleterEndpoint.genSettings.doSample}
              title="Do Sample"
              tooltip="Whether or not to use sampling; use greedy decoding otherwise."
              onChange={(value) => handleSettingsChange({ doSample: value })}
            />
            <TextInput
              value={String(botConfigSettings.promptCompleterEndpoint.genSettings.seed)}
              title="Seed"
              placeholder="-1 for random."
              tooltip='Controls the "random" of the model. If you have the same seed, settings, and input you (should) get the same output.'
              onChange={(event) => handleSettingsChange({ seed: parseInt(event.target.value) })}
            />
            <RangeInput
              title="Penalty Alpha"
              helperText="The alpha coefficient when using contrastive search."
              min={0}
              max={5}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.penaltyAlpha}
              onInput={(value) => handleSettingsChange({ penaltyAlpha: value })}
            />
            <RangeInput
              title="Num Beams"
              helperText="Beam search (uses a lot of VRAM)"
              min={1}
              max={20}
              step={1}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.numBeams}
              onInput={(value) => handleSettingsChange({ numBeams: value })}
            />
            <RangeInput
              title="Length Penalty"
              helperText="Beam search (uses a lot of VRAM)"
              min={-5}
              max={5}
              step={0.1}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.lengthPenalty}
              onInput={(value) => handleSettingsChange({ lengthPenalty: value })}
            />
            <BoolInput
              value={botConfigSettings.promptCompleterEndpoint.genSettings.earlyStopping}
              title="Early Stopping"
              onChange={(value) => handleSettingsChange({ earlyStopping: value })}
            />
            <BoolInput
              value={botConfigSettings.promptCompleterEndpoint.genSettings.addBosToken}
              title="Add BOS Token"
              tooltip="Add the bos_token to the beginning of prompts. Disabling this can make the replies more creative."
              onChange={(value) => handleSettingsChange({ addBosToken: value })}
            />
            <BoolInput
              value={botConfigSettings.promptCompleterEndpoint.genSettings.banEosToken}
              title="Ban EOS Token"
              tooltip="This forces the model to never end the generation prematurely."
              onChange={(value) => handleSettingsChange({ banEosToken: value })}
            />
            <RangeInput
              title="Truncate Prompt"
              helperText="Truncate the prompt up to this length. The leftmost tokens are removed if the prompt exceeds this length. Most models require this to be at most 2048."
              min={0}
              max={4096}
              step={1}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.truncateLength}
              onInput={(value) => handleSettingsChange({ truncateLength: value })}
            />
            <TextInput
              value={botConfigSettings.promptCompleterEndpoint.genSettings.stoppingStrings}
              title="Custom stopping strings"
              tooltip='In addition to the defaults. Written between "" and separated by commas. For instance: "\nYour Assistant:", "\nThe assistant:"'
              onChange={(value) => handleSettingsChange({ stoppingStrings: value })}
            />
            <BoolInput
              value={botConfigSettings.promptCompleterEndpoint.genSettings.skipSpecialTokens}
              title="Skip special tokens"
              tooltip="Some specific models need this unset."
              onChange={(value) => handleSettingsChange({ skipSpecialTokens: value })}
            />
          </div>
        ) : null}
        {botConfigSettings.promptCompleterEndpoint.type === PromptCompleterEndpointType.OPENAI ? (
          <div className="flex flex-col gap-8">
            <DropdownInput
              title="OpenAI model"
              index={OPENAI_MODELS.indexOf(botConfigSettings.promptCompleterEndpoint.genSettings.oaiModel)}
              items={[...OPENAI_MODELS]}
              tooltip="What OpenAI model is used to generate the text."
              onChange={index => handleSettingsChange({
                oaimodel: OPENAI_MODELS[index]
              })}
            />
            <RangeInput
              title="Temperature"
              helperText="Randomness of sampling. High values can increase creativity but may make text less sensible. Lower values will make text more predictable but can become repetitious."
              min={0.1}
              max={2}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.temp}
              onInput={(value) => handleSettingsChange({
                temp: value
              })}
            />
            <RangeInput
              title="Frequency Penalty"
              helperText="Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim."
              min={-2.0}
              max={2.0}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.frequencyPenalty}
              onInput={(value) => handleSettingsChange({
                frequencyPenalty: value
              })}
            />
            <RangeInput
              title="Presence Penalty"
              helperText="Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics."
              min={-2.0}
              max={2.0}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.presencePenalty}
              onInput={(value) => handleSettingsChange({
                presencePenalty: value
              })}
            />
            <RangeInput
              title="Top P"
              helperText="1 to disable. An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We generally recommend altering this or temperature but not both."
              min={0}
              max={1}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.topP}
              onInput={(value) => handleSettingsChange({
                topP: value
              })}
            />
          </div>
        ) : null}
        {botConfigSettings.promptCompleterEndpoint.type === PromptCompleterEndpointType.KOBOLDAI ? (
          <div className="flex flex-col gap-8">
            <RangeInput
              title="Max Context Length"
              helperText="Maximum length the prompt can reach (in tokens) before truncation."
              min={512}
              max={2048}
              step={8}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.maxContextLength}
              onInput={(value) => handleSettingsChange({ maxContextLength: value })}
            />
            <RangeInput
              title="Max New Tokens"
              helperText="Number of tokens the AI should generate. Higher numbers will take longer to generate."
              min={16}
              max={512}
              step={4}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.maxTokens}
              onInput={(value) => handleSettingsChange({ maxTokens: value })}
            />
            <RangeInput
              title="Temperature"
              helperText="Randomness of sampling. High values can increase creativity but may make text less sensible. Lower values will make text more predictable but can become repetitious."
              min={0.1}
              max={2}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.temp}
              onInput={(value) => handleSettingsChange({ temp: value })}
            />
            <RangeInput
              title="Top P"
              helperText="Used to discard unlikely text in the sampling process. Lower values will make text more predictable but can become repetitious. (Put this value on 1 to disable its effect)"
              min={0}
              max={1}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.topP}
              onInput={(value) => handleSettingsChange({ topP: value })}
            />
            <RangeInput
              title="Top K"
              helperText="Alternative sampling method, can be combined with top_p. The number of highest probability vocabulary tokens to keep for top-k-filtering. (Put this value on 0 to disable its effect)"
              min={0}
              max={100}
              step={1}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.topK}
              onInput={(value) => handleSettingsChange({ topK: value })}
            />
            <RangeInput
              title="Top A"
              helperText="Increases the consistency of the output by removing unlikely tokens based on the highest token probability. (Put this value on 1 to disable its effect)"
              min={0}
              max={1}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.topA}
              onInput={(value) => handleSettingsChange({ topA: value })}
            />
            <RangeInput
              title="Tail Free Sampling"
              helperText="Increases the consistency of the output by working from the bottom and trimming the lowest probability tokens. (Put this value on 1 to disable its effect)"
              min={0}
              max={1}
              step={0.001}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.tailFreeSampling}
              onInput={(value) => handleSettingsChange({ tailFreeSampling: value })}
            />
            <RangeInput
              title="Typical P"
              helperText="Alternative sampling method described in the paper 'Typical_p Decoding for Natural Language Generation' (10.48550/ARXIV.2202.00666). The paper suggests 0.2 as a good value for this setting. Set this setting to 1 to disable its effect."
              min={0}
              max={1}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.typicalP}
              onInput={(value) => handleSettingsChange({ typicalP: value })}
            />
            <RangeInput
              title="Repetition Penalty"
              helperText="Used to penalize words that were already generated or belong to the context (Going over 1.2 breaks 6B models. Set to 1.0 to disable)."
              min={0}
              max={3}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.repetitionPenalty}
              onInput={(value) => handleSettingsChange({ repetitionPenalty: value })}
            />
            <RangeInput
              title="Repetition Penalty Range"
              helperText="How many tokens will be considered repeated if they appear in the next output."
              min={0}
              max={2048}
              step={1}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.repetitionPenaltyRange}
              onInput={(value) => handleSettingsChange({ repetitionPenaltyRange: value })}
            />
            <RangeInput
              title="Repetition Penalty Slope"
              helperText="Affects the ramping of the penalty's harshness, starting from the final token. (Set to 0.0 to disable)"
              min={0}
              max={10}
              step={0.01}
              value={botConfigSettings.promptCompleterEndpoint.genSettings.repetitionPenaltySlope}
              onInput={(value) => handleSettingsChange({ repetitionPenaltySlope: value })}
            />
            <TextInput
              value={botConfigSettings.promptCompleterEndpoint.genSettings.order.join(",")}
              title="Sampler Order"
              placeholder="Example: 6,0,1,2,3,4,5"
              tooltip="The order the different samplers (TopP, TopK, TypicalP, etc) are applied."
              onChange={(e) => {
                const order = e.target.value.split(",").map(Number);
                handleSettingsChange({ order });
              }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};
