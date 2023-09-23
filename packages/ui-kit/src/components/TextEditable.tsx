import React, { useEffect, useState } from 'react';

import Input, { InputProps } from './Input';
import { CheckIcon, EditIcon } from '../assets/svg';

import './TextEditable.scss';

interface TextEditableProps extends InputProps {
  className?: string;
  label: string;
  value: string;
}

const TextEditable = (props: TextEditableProps) => {
  const { value, onChange, className = '' } = props;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempValue, setTempValue] = useState<string>('');
  useEffect(() => {
    setTempValue(value);
  }, [value]);
  return (
    <div className={`textEditable ${className} ${isEditing ? 'editing' : ''}`}>
      <Input
        {...props}
        value={tempValue}
        onChange={(event) => setTempValue(event.target.value)}
        disabled={!isEditing}
        className="textEditable__input"
      />
      <button
        onClick={() => {
          setIsEditing(!isEditing);
          onChange &&
            onChange({
              target: {
                value: tempValue,
                name: props.name,
              },
            });
        }}
      >
        {isEditing ? <CheckIcon /> : <EditIcon />}
      </button>
    </div>
  );
};
export default TextEditable;
