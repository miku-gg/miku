import React from 'react';
import { cn } from '@bem-react/classname';
import './Button.scss';

export interface ButtonProps {
  theme: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ theme, children }) => {
  const cnButton = cn('Button');
  const cnTheme = cnButton({ theme });
  return <div className={cnTheme}>{children}</div>;
};

export default Button;
