import { useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { DropDown } from "../dropdown/Dropdown";
import botFactory from "../../libs/botFactory";
import { Microphone } from "../microphone/Microphone";
import * as MikuCore from "@mikugg/core";
import Tooltip from "@mui/material/Tooltip"

function SmallSpinner(): JSX.Element {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="ml-2 w-4 h-4 mr-2 text-gray-200 animate-spin fill-gr@types/dom-mediacapture-recorday-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

const lastCostId = { id: "" };
export const Chat = ({ sendPrompt }: any): JSX.Element => {
  const [value, setValue] = useState<string>("");
  const [loadingCost, setLoadingCost] = useState<boolean>(false);
  const [cost, setCost] = useState<number>(0);
  const [currentChatValue, setcurrentChatValue] = useState<number>(
    MikuCore.Commands.CommandType.DIALOG
  );

  const updateCost = useCallback(
    debounce((value: string) => {
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
        });
    }, 500),
    []
  );

  useEffect(() => {
    updateCost(value);
  }, [value]);

  const handleChange = (chatType: number) => {
    setcurrentChatValue(chatType);
  };

  return (
    <div className="flex items-end w-full h-1/6 max-lg:pb-5 max-lg:px-5">
      <div className="flex flex-col justify-between h-3/4 w-full rounded-lg max-sm:rounded-none gap-3">
        <form
          onSubmit={(event) => {
            sendPrompt(event, value, currentChatValue);
            setValue("");
          }}
          className="flex justify-between w-full max-h-10 placeholder:italic overflow-x-clip gap-2"
        >
          <DropDown
            handleChange={handleChange}
            currentChatValue={currentChatValue}
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-9/12 button-transparent border outline-none text-md p-3 border-[#7957D2]"
            type="text"
            name="search"
            autoComplete="off"
            placeholder={currentChatValue === MikuCore.Commands.CommandType.DIALOG ? "Type a message..." : "Type a prompt..."}
          />
          <label className="w-1/8 h-1/2 text-blue-700 hidden">
            <input type="submit" className="hidden" />
          </label>
        </form>
        {/* TOKENS // SEND */}
        <div className="flex justify-between items-end md:items-center h-fit">
          <div className="w-3/12 flex">
            <Tooltip title="Amount of credits interaction would consume.">
              <div className="inline-flex items-center h-10 bg-gray-200 rounded-full text-center text-lg p-4 justify-between">
                <div>
                  {loadingCost ? <SmallSpinner /> : null}
                </div>
                <div className={loadingCost ? "text-gray-400" : "text-gray-500"}>
                  {cost}
                </div>
              </div>
            </Tooltip>
          </div>
          <div className="flex justify-end gap-2 items-center h-full w-8/12">
            {/* MICROPHONE: Currently disabled */}
            {/* <Microphone /> */}
            {/* SEND */}
            <input
              type="button"
              value="Send"
              onClick={(event) => {
                sendPrompt(event, value, currentChatValue);
                setValue("");
              }}
              onChange={(e) => setValue(e.target.value)}
              className="button-purple cursor-pointer py-2 px-14"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
