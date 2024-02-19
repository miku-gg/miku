import React from "react";
import "./ButtonGroup.scss";

interface ButtonProps {
  text: string;
  icon?: React.ReactNode;
  value: string; // Unique identifier for each button
  className?: string;
}

interface ButtonGroupProps {
  buttons: ButtonProps[];
  selected: string; // Now expecting a value for the selected button
  onButtonClick: (value: string) => void; // Callback function uses value
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  selected,
  onButtonClick,
}) => {
  return (
    <div className="ButtonGroup">
      {buttons.map(({ text, icon, value, className }, index) => (
        <button
          key={index}
          className={`ButtonGroup__Button ${className || ""} ${
            selected === value ? "ButtonGroup__Button--selected" : ""
          }`}
          onClick={() => onButtonClick(value)}
        >
          {icon && <span className="ButtonGroup__Icon">{icon}</span>}
          <span className="ButtonGroup__Text">{text}</span>
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
