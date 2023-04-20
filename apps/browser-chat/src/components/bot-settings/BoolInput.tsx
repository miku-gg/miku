import React, { useState, useEffect, ChangeEventHandler } from "react";
import { Tooltip } from "@mui/material";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

const BoolInput: React.FC<{
  value: boolean;
  title: string;
  tooltip?: string;
  onChange: (index: boolean) => void;
}> = (props) => {
  const [value, setValue] = useState<boolean>(props.value);
  return (
    <div className="flex items-center gap-1">
      <input
        type="checkbox"
        checked={value}
        onChange={() => {
          props.onChange?.(!value);
          setValue(!value);
        }}
      />
      {props.title}
      {props.tooltip ? (
        <Tooltip title={props.tooltip} placement="right">
          <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
        </Tooltip>
      ) : null}
    </div>
  );
};

export default BoolInput;
