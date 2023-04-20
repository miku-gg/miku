import React, { ChangeEventHandler } from "react";
import { Tooltip } from "@mui/material";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

const NumberInput: React.FC<{
  label: string;
  value: number;
  tooltip?: string;
  min: number;
  max: number;
  step: number;
  onInput: ChangeEventHandler<HTMLInputElement>;
}> = (props) => {
  return (
    <div className="flex items-center gap-1 my-4">
      {props.label}
      {props.tooltip ? (
        <Tooltip title={props.tooltip} placement="right">
          <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
        </Tooltip>
      ) : null}
      <input
        className="float-right w-36 inline-block border border-[#7957D2] rounded-md outline-none bg-transparent"
        value={props.value}
        type="number"
        min={props.min}
        max={props.max}
        step={props.step}
        onInput={props.onInput}
      />
    </div>
  );
};

export default NumberInput;
