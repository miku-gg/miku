import React, { createContext } from 'react';

import { AccordionItemProps } from './AccordionItem';

type AccordionContextType = {
  selectedIndex: number;
  onChange: (index: number) => void;
  items: { [title: string]: number };
};

export const AccordionContext = createContext<AccordionContextType | null>(
  null
);

type AccordionProps = {
  selectedIndex: number;
  onChange: (index: number) => void;
  children: React.ReactNode;
};

const Accordion: React.FC<AccordionProps> = ({
  selectedIndex,
  onChange,
  children,
}) => {
  const handleChange = (index: number) => {
    onChange(index === selectedIndex ? -1 : index);
  };

  const items = React.Children.toArray(children).reduce(
    (_items, child, index) => {
      if (React.isValidElement<AccordionItemProps>(child)) {
        return { ..._items, [child.props.title]: index };
      }

      return _items;
    },
    {}
  );

  return (
    <AccordionContext.Provider
      value={{
        selectedIndex,
        onChange: handleChange,
        items,
      }}
    >
      {children}
    </AccordionContext.Provider>
  );
};

export default Accordion;
