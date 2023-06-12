import React, { useContext } from 'react';

import { AccordionContext } from './Accordion';

export type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  className = '',
}) => {
  const accordionContext = useContext(AccordionContext);
  const { selectedIndex, onChange, items } = accordionContext || {};
  const index = items ? items[title] : -1;

  const handleClick = () => {
    onChange && onChange(selectedIndex === index ? -1 : index);
  };

  return (
    <div className={`AccordionItem ${className}`} onClick={handleClick}>
      <h3>{title}</h3>
      {selectedIndex === index && (
        <div className="AccordionItem__content">{children}</div>
      )}
    </div>
  );
};

export default AccordionItem;
