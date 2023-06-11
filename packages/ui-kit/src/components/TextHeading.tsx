import React from 'react';
import './TextHeading.scss';

type sizesType = 'h1' | 'h2' | 'h3' | 'h4';

interface TextHeadingProps {
  children: string;
  size: sizesType;
  className?: string;
}
const TextHeading = ({ children, size, className = '' }: TextHeadingProps) => {
  const Heading = size;
  return <Heading className={`TextHeading ${className}`}>{children}</Heading>;
};
export default TextHeading;
