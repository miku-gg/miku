import { withNaming } from '@bem-react/classname';
import React from 'react';
import './Button.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isAnchor?: string;
  theme: 'primary' | 'secondary' | 'transparent' | 'gradient';
  iconSRC?: string;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({ iconPosition = '', iconSRC, isAnchor, theme, children, ...rest }) => {
  const cn = withNaming({ n: 'Button ', e: '-' });
  const cnTheme = cn('theme', theme);
  return (
    <>
      {isAnchor ? (
        <a className={cnTheme()} href={isAnchor}>
          {children}
        </a>
      ) : (
        <button {...rest} className={`${cnTheme()} ${iconPosition} ${rest.className || ''}`}>
          {iconSRC ? <img src={iconSRC} alt="button-icon" /> : null}
          {children}
        </button>
      )}
    </>
  );
};

export default Button;
