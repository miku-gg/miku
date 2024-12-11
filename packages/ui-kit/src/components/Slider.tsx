import React from 'react';
import ReactSlider from 'react-slider';
import './Slider.scss';

interface Step {
  label?: string;
  value: number;
}

interface Props {
  steps?: Step[];
  value: number;
  onChange: (value: number) => void;
  continuous?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const Slider: React.FC<Props> = ({ steps, value, onChange, continuous = false, min, max, step = 1 }) => {
  if (continuous) {
    return (
      <div className="slider-container">
        <ReactSlider
          className="horizontal-slider"
          thumbClassName="thumb"
          trackClassName="track"
          min={min || 0}
          max={max || 100}
          step={step}
          value={value}
          onChange={onChange}
        />
        <div className="label-container">
          <span className="label">{min || 0}</span>
          <span className="label">{max || 100}</span>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((step) => step.value === value);

  return (
    <div className="slider-container">
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        max={steps.length - 1}
        value={currentIndex}
        onChange={(index) => onChange(steps[index].value)}
      />
      <div className="label-container">
        {steps?.map((step, index) =>
          step.label ? (
            <span
              key={index}
              className={`label ${currentIndex === index ? 'active' : ''}`}
              onClick={() => onChange(step.value)}
            >
              {step.label}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
};

export default Slider;
