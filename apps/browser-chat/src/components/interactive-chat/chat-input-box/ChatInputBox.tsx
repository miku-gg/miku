import React, { useCallback, useContext, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import botFactory from "../../../libs/botFactory";
import { Microphone } from "../../microphone/Microphone";
import * as MikuCore from "@mikugg/core";
import Tooltip from "@mui/material/Tooltip";
import { PaperPlane } from "../../../assets/icons/svg";
import "./ChatInputBox.css";
import { InteractiveResponsesContext } from "../../../libs/useResponses";
import queryString from "query-string";
import { IS_ALPHA_LIVE } from "../../loading/BotLoadingModal";
import { botSettings } from "../bot-display/BotDisplay";
import { getBotDataFromURL, useBot } from "../../../libs/botLoader";
import { trackEvent } from "../../../libs/analytics";
import { toast } from "react-toastify";

export function SmallSpinner(): JSX.Element {
  return (
    <div className="absolute left-2 top-[0.1em]">
      <span className="loader"></span>
    </div>
  );
}

const lastCostId = { id: "" };
let lastInteractionTime = Date.now();
export const ChatInputBox = (): JSX.Element => {
  const [value, setValue] = useState<string>("");
  const [loadingCost, setLoadingCost] = useState<boolean>(false);
  const [cost, setCost] = useState<number>(0);
  const { botConfigSettings, card } = useBot();
  const { responseIndex, loading, setResponsesGenerated } = useContext(
    InteractiveResponsesContext
  );

  const disabled = loading || responseIndex > 0;

  const onFormSubmit = (event: React.UIEvent | React.FormEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    if (value) {
      const {disabled: shouldPreventSubmit} = getBotDataFromURL();
      trackEvent('bot_interact', {
        bot: card?.data.name || 'unknown',
        time: Date.now() - lastInteractionTime,
        prevented: shouldPreventSubmit,
      });
      if (shouldPreventSubmit) {
        window?.parent?.postMessage({
          type: 'prevented',
        }, '*');
        toast.warn('Please sign in to interact.', {position: 'top-center', style: {marginTop: '2em'}});
        return;
      }
      lastInteractionTime = Date.now();
      const result = botFactory
        .getInstance()
        ?.sendPrompt(
          value,
          MikuCore.Commands.CommandType.DIALOG
        );
      setResponsesGenerated(result ? [result.commandId] : []);
      setValue("");
    }
  };

  const updateCost = useCallback(
    debounce((value: string) => {
      if (value && botSettings.voiceGeneration) {
        setLoadingCost(true);
        const update_id = Math.random().toString(36).substring(2, 15);
        lastCostId.id = update_id;
        botFactory
          .getInstance()
          ?.computeCost(value)
          .then((cost) => {
            if (lastCostId.id === update_id) {
              setLoadingCost(false);
              setCost(cost);
            }
          })
          .catch(() => setLoadingCost(false));
      }
    }, 1000),
    []
  );

  useEffect(() => {
    updateCost(value);
  }, [value]);
  const searchParams = queryString.parse(location.search);

  return (
    <div className="flex items-end w-full bg-slate-900/[.9]">
      <div className="flex flex-row justify-between w-full max-sm:rounded-none">
        <form
          onSubmit={onFormSubmit}
          onClick={() =>
            document.getElementById("input-user-textarea")?.focus()
          }
          aria-disabled={disabled}
          className="flex justify-between w-full placeholder:italic overflow-x-clip gap-2 relative border border-[#7957D2] outline-none button-transparent aria-disabled:shadow-none aria-disabled:blur-[1px]"
          style={{borderRadius: 0}}
        >
          <textarea
            id="input-user-textarea"
            value={value}
            aria-disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (disabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (e.key === "Enter" && !e.shiftKey) {
                onFormSubmit(e);
              }
            }}
            className="w-full bg-transparent outline-none border-none text-md p-3 pr-16 resize-none scrollbar aria-disabled:caret-transparent"
            name="input-user-textarea"
            autoComplete="off"
            rows={1}
            placeholder="Type a message..."
          />
          {/* {searchParams["openai"] || !IS_ALPHA_LIVE ? (
            <div className="absolute right-10 top-[0.4em]">
              <Microphone
                onInputText={(text: string) =>
                  setValue((_text) => (_text ? _text + " " + text : text))
                }
                disabled={disabled}
              />
            </div>
          ) : null} */}
          <button
            className="absolute right-3 top-4 text-violet-400 hover:text-violet-300 transition-all disabled:hover:text-violet-400"
            disabled={disabled}
          >
            <PaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};
