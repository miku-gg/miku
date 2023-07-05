import React from 'react';
import { SquareCheckEmpty, SquareCheckFilled } from '../assets/svg';
import './CheckBox.scss';

interface CheckBoxProps {
  id?: string;
  label?: string;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: boolean;
}

const CheckBox = ({ id, label, name, onChange, value }: CheckBoxProps) => {
  return (
    <label htmlFor={id} className="CheckBox__container">
      <input
        type="checkbox"
        className="CheckBox__field"
        onChange={onChange}
        checked={value}
        value={value ? 'checked' : ''}
        name={name}
        id={id}
      />
      <div className="CheckBox">
        {value ? <SquareCheckFilled /> : <SquareCheckEmpty />}
      </div>
      <span className="CheckBox__label">{label}</span>
    </label>
  );
};

export default CheckBox;
