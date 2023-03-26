import React from 'react';
import { cn } from '@bem-react/classname';
import './Button.scss';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ theme, children, ...rest }) => {
  const cnButton = cn('Button');
  const cnTheme = cnButton({ theme });
  return (
    <button className={cnTheme} {...rest}>
      {children}
    </button>
  );
};

export default Button;
