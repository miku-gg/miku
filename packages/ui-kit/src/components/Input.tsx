import React from 'react';
import Tooltip from './Tooltip';
import { InfoIcon } from '../assets/svg';
import './Input.scss';

interface InputProps {
  className?: string;
  errors?: string;
  icon?: string;
  iconPosition?: 'left' | 'right' | '';
  id?: string;
  isTextArea?: boolean;
  label?: string;
  maxLength?: number;
  name?: string;
  onChange?: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSubmit?: () => void;
  placeHolder?: string;
  value?: string;
  description?: string;
}

const Input = ({
  className = '',
  errors,
  icon,
  iconPosition = '',
  id,
  isTextArea = false,
  label,
  maxLength,
  name,
  onChange,
  onSubmit,
  placeHolder,
  value,
  description,
}: InputProps) => {
  return (
    <div className={`Input ${className}`}>
      {label && (
        <label htmlFor={id} className="Input__label">
          {label}
          {description && (
            <>
              <div
                className="Input__infoIcon"
                data-tooltip-id={`input-tooltip-${id}`}
                data-tooltip-content={description}
                data-tooltip-varaint="dark"
              >
                <InfoIcon />
              </div>
              <Tooltip
                id={`input-tooltip-${id}`}
                place="right"
                className="Input__tooltip"
              />
            </>
          )}
        </label>
      )}
      <label htmlFor={id} className={`Input__container ${iconPosition}`}>
        {icon ? (
          <button onSubmit={onSubmit} className="Input__button">
            <img src={icon} alt="search-icon" className="Input__icon" />
          </button>
        ) : null}

        {isTextArea ? (
          <textarea
            className="Input__textArea scrollbar"
            onChange={onChange}
            value={value}
            placeholder={placeHolder}
            id={id}
            name={name}
          />
        ) : (
          <input
            type="text"
            className="Input__field"
            placeholder={placeHolder}
            onChange={onChange}
            value={value}
            name={name}
            maxLength={maxLength}
            id={id}
          />
        )}
      </label>
      {errors && <p className="Input__error">{errors}</p>}
    </div>
  );
};

export default Input;
