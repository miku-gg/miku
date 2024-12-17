import React from 'react';
import './OptionButton.scss';

interface OptionButtonProps {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ title, description, isSelected, onClick, icon }) => (
  <button className={`OptionButton ${isSelected ? 'OptionButton--selected' : ''}`} onClick={onClick}>
    {icon && <div className="OptionButton__icon">{icon}</div>}
    <div className="OptionButton__content">
      <h3 className="OptionButton__title">{title}</h3>
      <p className="OptionButton__description">{description}</p>
    </div>
  </button>
);
