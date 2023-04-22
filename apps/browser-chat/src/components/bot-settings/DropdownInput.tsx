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
}> = (props) => {
  return (
    <div className="flex items-center gap-1 my-4">
      {props.title}
      {props.tooltip ? (
        <Tooltip title={props.tooltip} placement="right">
          <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
        </Tooltip>
      ) : null}
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
