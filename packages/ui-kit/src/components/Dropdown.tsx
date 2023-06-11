import React, { useEffect, useState } from 'react';
import './Dropdown.scss';

interface Item {
  name: string;
  description?: string;
  content?: React.ReactNode;
}

interface DropdownProps {
  items: Item[];
  selectedIndex?: number;
  onChange?: (index: number) => void;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  flavor?: 'default' | 'white';
  placeholder?: string;
}

export const Dropdown = ({
  items,
  selectedIndex: selectedIndexProp = -1,
  onChange,
  expanded: expandedProp = false,
  onToggle,
  flavor = 'default',
  placeholder = 'Select an item...',
}: DropdownProps) => {
  const [selectedIndex, setSelectedIndex] = useState(selectedIndexProp);
  const [expanded, setExpanded] = useState(expandedProp);

  useEffect(() => {
    if (selectedIndexProp !== -1) {
      setSelectedIndex(selectedIndexProp);
    }
  }, [selectedIndexProp]);

  const handleItemClick = (newSelectedIndex: number) => {
    setSelectedIndex(newSelectedIndex);

    onChange && onChange(newSelectedIndex);

    setExpanded(false);

    onToggle && onToggle(false);
  };

  const handleToggleClick = () => {
    setExpanded(!expanded);

    onToggle && onToggle(!expanded);
  };

  const selectedItem = items[selectedIndex];

  return (
    <div className={`dropdown flavor-${flavor}`}>
      <div
        className="dropdown__selected"
        onClick={handleToggleClick}
        aria-haspopup="listbox"
        aria-expanded={expanded}
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
      </div>
      {expanded && (
        <div className="dropdown__list" role="listbox">
          {items.map((item, index) => (
            <div
              key={index}
              className={`dropdown__list-item${
                index === selectedIndex ? '--selected' : ''
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
