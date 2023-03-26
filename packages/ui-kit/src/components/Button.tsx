import React from "react";
import classNames from "classnames";
import "./Button.scss";

export interface ButtonProps {
  theme: "primary" | "secondary";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ theme, children }) => {
  const classes = classNames({
    Button: true,
    [`Button--${theme}`]: true,
  });
  return <div className={classes}>{children}</div>;
};

export default Button;
