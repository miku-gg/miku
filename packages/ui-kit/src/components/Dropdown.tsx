import React, { useState } from 'react';

import { DownArrow } from '../assets/svg';

import './Dropdown.scss';

interface Item {
  content?: React.ReactNode;
  description?: string;
  name: string;
  value?: string;
}

interface DropdownProps {
  className?: string;
  expanded?: boolean;
  flavor?: 'default' | 'white';
  items: Item[];
  onChange: (index: number) => void;
  onToggle?: (expanded: boolean) => void;
  placeholder?: string;
  selectedIndex: number;
}

const Dropdown = ({
  className = '',
  expanded,
  flavor = 'default',
  items,
  onChange,
  onToggle,
  placeholder = 'Select an item...',
  selectedIndex = -1,
}: DropdownProps) => {
  const [_expanded, setExpanded] = useState<boolean>(false);
  const isExpanded = expanded === undefined ? _expanded : expanded;

  const handleItemClick = (newSelectedIndex: number) => {
    onChange && onChange(newSelectedIndex);
    onToggle && onToggle(false);
    setExpanded(false);
  };

  const handleToggleClick = () => {
    onToggle && onToggle(!isExpanded);
    setExpanded(!isExpanded);
  };

  const selectedItem = items[selectedIndex];

  return (
    <div tabIndex={0} className={`dropdown flavor-${flavor} ${className}`}>
      <div
        className="dropdown__selected"
        onClick={handleToggleClick}
        aria-haspopup="listbox"
        aria-expanded={isExpanded}
      >
        {selectedItem ? (
          <>
            <div className="dropdown__selected-name">{selectedItem.name}</div>
            {selectedItem.description && (
              <div className="dropdown__selected-description">
                {selectedItem.description}
              </div>
            )}
          </>
        ) : (
          <div className="dropdown__selected-placeholder">{placeholder}</div>
        )}
        <DownArrow />
      </div>
      {isExpanded && (
        <div className="dropdown__list scrollbar" role="listbox">
          {items.map((item, index) => (
            <div
              key={index}
              className={`dropdown__list-item${
                index === selectedIndex ? '-selected' : ''
              }`}
              onClick={() => handleItemClick(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="dropdown__list-item-name">{item.name}</div>
              {item.description && (
                <div className="dropdown__list-item-description">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
