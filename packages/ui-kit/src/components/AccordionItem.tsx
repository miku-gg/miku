import React, { useContext } from 'react';

import { AccordionContext } from './Accordion';
import TextHeading from './TextHeading';

import { DashIcon, RemoveIcon } from '../assets/svg';

import './AccordionItem.scss';

export type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, className = '' }) => {
  const accordionContext = useContext(AccordionContext);
  const { selectedIndex, onChange, onRemoveItem, items } = accordionContext || {};
  const index = items ? items[title] : -1;

  const handleRemoveItem = () => {
    onRemoveItem && onRemoveItem(index);
  };

  const handleToggleAccordionItem = () => {
    onChange && onChange(selectedIndex === index ? -1 : index);
  };

  return (
    <div className={`AccordionItem ${className}`}>
      <div className="AccordionItem__header">
        <TextHeading size="h3">{title}</TextHeading>
        <div className="AccordionItem__buttonsContainer">
          {onRemoveItem && (
            <button onClick={handleRemoveItem} className="removeButton">
              <RemoveIcon />
            </button>
          )}
          <button onClick={handleToggleAccordionItem} className="closeButton">
            <DashIcon />
          </button>
        </div>
      </div>
      {selectedIndex === index && <div className="AccordionItem__content">{children}</div>}
    </div>
  );
};

export default AccordionItem;
