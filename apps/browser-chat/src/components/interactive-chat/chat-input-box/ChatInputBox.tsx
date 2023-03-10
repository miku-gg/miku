import React, { useCallback, useContext, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import botFactory from "../../../libs/botFactory";
import { Microphone } from "../../microphone/Microphone";
import * as MikuCore from "@mikugg/core";
import Tooltip from "@mui/material/Tooltip"
import { PaperPlane } from "../../../assets/icons/svg";
import './ChatInputBox.css';
import { InteractiveResponsesContext } from "../../../libs/useResponses";

function SmallSpinner(): JSX.Element {
  return (
    <div className="absolute left-2 top-[0.1em]">
        <span className="loader"></span>
    </div>
  );
}

const lastCostId = { id: "" };
export const ChatInputBox = (): JSX.Element => {
  const [value, setValue] = useState<string>("");
  const [loadingCost, setLoadingCost] = useState<boolean>(false);
  const [cost, setCost] = useState<number>(0);
  const {responseIndex, loading, setResponsesGenerated} = useContext(InteractiveResponsesContext);

  const disabled = loading || responseIndex > 0;

  const onFormSubmit = (event: React.UIEvent | React.FormEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  
    if (value) {
      const result = botFactory.getInstance()?.sendPrompt(value, MikuCore.Commands.CommandType.DIALOG);
      setResponsesGenerated(result ? [result.commandId] : []);
      setValue("");
    }
  }  

  const updateCost = useCallback(
    debounce((value: string) => {
      if (value) {
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

  return (
    <div className="flex items-end w-full h-1/6 max-lg:pb-5 max-lg:px-5">
      <div className="flex flex-col justify-between w-full rounded-lg max-sm:rounded-none gap-3">
        <form
          onSubmit={onFormSubmit}
          onClick={() => document.getElementById("input-user-textarea")?.focus()}
          aria-disabled={disabled}
          className="flex justify-between w-full placeholder:italic overflow-x-clip gap-2 relative border border-[#7957D2] pb-10 rounded-md outline-none button-transparent aria-disabled:shadow-none aria-disabled:blur-[1px]"
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
                onFormSubmit(e)
              }
            }}
            className="w-full bg-transparent outline-none border-none text-md p-3 resize-none scrollbar max-lg:h-12 aria-disabled:caret-transparent"
            name="input-user-textarea"
            autoComplete="off"
            placeholder="Type a message..."
          />
          <Microphone onInputText={(text: string) => setValue(text)} />
          <button className="absolute right-3 bottom-3 text-violet-400 hover:text-violet-300 transition-all disabled:hover:text-violet-400" disabled={disabled}>
            <PaperPlane />
          </button>
          <div className="absolute bottom-2 left-3 flex items-center">
            <Tooltip title="Amount of credits interaction would consume." placement="right" disableHoverListener={disabled}>
              <div className="inline-flex items-left rounded-full text-center text-sm justify-between text-violet-400 font-mono select-none">
                <div className={loadingCost ? "text-violet-300" : ""}>
                  {cost}
                </div>
                <div className="h-4 relative">
                  {loadingCost ? <SmallSpinner /> : null}
                </div>
              </div>
            </Tooltip>
          </div>
        </form>
      </div>
    </div>
  );
};
