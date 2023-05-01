import React from "react";
import { Tooltip } from "@mui/material";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { DropDown } from "../dropdown/Dropdown";

const DropdownInput: React.FC<{
  index: number;
  items: string[];
  title: string;
  onChange: (index: number) => void;
  tooltip?: string;
  helperText?: string;
}> = (props) => {
  return (
    <div className="flex items-center gap-1 my-4">
      <ul className="w-full">
        <div className="flex items-center">
          {props.title}
          {props.tooltip ? (
            <Tooltip title={props.tooltip} placement="right">
              <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
            </Tooltip>
          ) : null}
        </div>
        {props.helperText ? (
          <p className="mt-[-0.125rem] pb-2 text-sm text-gray-500">
            {props.helperText}
          </p>
        ) : null}
      </ul>

      <div className="ml-auto">
        <DropDown
          items={props.items}
          onChange={(i) => {
            props.onChange(i);
          }}
          selectedIndex={props.index}
          top={true}
        />
      </div>
    </div>
  );
};

export default DropdownInput;
