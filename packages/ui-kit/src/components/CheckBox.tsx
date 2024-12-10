import React from 'react';
import { SquareCheckEmpty, SquareCheckFilled } from '../assets/svg';
import './CheckBox.scss';

interface CheckBoxProps {
  id?: string;
  label?: string;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: boolean;
  disabled?: boolean;
}

const CheckBox = ({ id, label, name, onChange, value, disabled }: CheckBoxProps) => {
  return (
    <label htmlFor={id} className={`CheckBox__container ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        className="CheckBox__field"
        onChange={onChange}
        checked={value}
        value={value ? 'checked' : ''}
        name={name}
        id={id}
        disabled={disabled}
      />
      <div className="CheckBox">{value ? <SquareCheckFilled /> : <SquareCheckEmpty />}</div>
      <span className="CheckBox__label">{label}</span>
    </label>
  );
};

export default CheckBox;
