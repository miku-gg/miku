import React, { ChangeEventHandler } from "react";
import { Tooltip } from "@mui/material";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

const TextInput: React.FC<{
  value: string;
  placeholder?: string;
  tooltip?: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}> = (props) => {
  return (
    <div className="flex items-center gap-1">
      <textarea
        id="input-user-textarea"
        value={props.value}
        onChange={props.onChange}
        className="h-10 resize-none scrollbar placeholder:italic overflow-x-clip gap-2 relative border border-[#7957D2] rounded-md outline-none button-transparent aria-disabled:shadow-none aria-disabled:blur-[1px]"
        name="input-user-textarea"
        autoComplete="off"
        placeholder={props.placeholder}
      />
      {props.tooltip ? (
        <Tooltip title={props.tooltip} placement="right">
          <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
        </Tooltip>
      ) : null}
    </div>
  );
};

export default TextInput;
