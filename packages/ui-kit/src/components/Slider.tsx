import React from 'react';
import ReactSlider from 'react-slider';
import './Slider.scss';

interface Step {
  label: string;
  value: number;
}

interface Props {
  steps: Step[];
  value: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<Props> = ({ steps, value, onChange }) => {
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
        {steps.map((step, index) => (
          <span
            key={index}
            className={`label ${currentIndex === index ? 'active' : ''}`}
            onClick={() => onChange(step.value)}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Slider;
