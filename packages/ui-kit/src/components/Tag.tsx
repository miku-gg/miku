import React from 'react';
import './Tag.scss';

export type Colors = '#FF0000' | '#4BBA2D' | '#2F80ED' | '#FF4E67' | '#9747FF' | '#56CCF2' | '#828282';

interface TagProps {
  backgroundColor: Colors;
  className?: string;
  isSquircle?: boolean;
  text: string;
  iconSRC?: string;
  iconPosition?: 'left' | 'right';
}

const Tag = ({ text, isSquircle, backgroundColor, className = '', iconSRC, iconPosition = 'left' }: TagProps) => {
  return (
    <span
      className={`Tag ${className} ${iconPosition}`}
      style={{ backgroundColor, borderRadius: isSquircle ? '6px' : '16px' }}
    >
      {iconSRC && <img src={iconSRC} />}
      {text}
    </span>
  );
};

export default Tag;
