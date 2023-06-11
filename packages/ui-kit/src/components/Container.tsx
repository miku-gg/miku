import React, { ReactNode } from 'react';

import './Container.scss';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={`container ${className}`}>
      <div className="container__scroll">
        <div className="container__scroll__children">{children}</div>
      </div>
    </div>
  );
};

export default Container;
