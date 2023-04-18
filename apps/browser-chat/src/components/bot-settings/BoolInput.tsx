import React, { useState, useEffect, ChangeEventHandler } from "react";
import { Tooltip } from "@mui/material";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

const BoolInput: React.FC<{
  value: boolean;
  title: string;
  tooltip?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}> = (props) => {
  return (
    <div className="flex items-center gap-1">
      <input type="checkbox" checked={props.value} onChange={props.onChange} />
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
