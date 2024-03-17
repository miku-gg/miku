import React from "react";
import "./ButtonGroup.scss";
import { Tooltip } from "@mikugg/ui-kit";

interface ButtonProps {
  content: React.ReactNode;
  icon?: React.ReactNode;
  value: string; // Unique identifier for each button
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

interface ButtonGroupProps {
  id?: string;
  tooltipPlace?: "top" | "bottom" | "left" | "right";
  buttons: ButtonProps[];
  selected: string; // Now expecting a value for the selected button
  onButtonClick: (value: string) => void; // Callback function uses value
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  id: buttonGroupId,
  tooltipPlace,
  buttons,
  selected,
  onButtonClick,
}) => {
  const tooltipId = `button-group-tooltip-${buttonGroupId || ""}`;
  return (
    <div className="ButtonGroup scrollbar">
      {buttons.map(
        ({ content, value, className, tooltip, disabled }, index) => (
          <button
            key={index}
            className={`ButtonGroup__button ${className || ""} ${
              selected === value ? "selected" : ""
            }`}
            onClick={() => onButtonClick(value)}
            data-tooltip-id={tooltipId}
            data-tooltip-html={tooltip}
            data-tooltip-varaint="light"
            disabled={disabled}
          >
            {content}
          </button>
        )
      )}
      <Tooltip id={tooltipId} place={tooltipPlace || "bottom"} />
    </div>
  );
};

export default ButtonGroup;
