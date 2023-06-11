import React from 'react';

import './Steps.scss';

interface Step {
  label: string;
  description: string;
}

interface StepsProps {
  steps: Step[];
  selectedIndex: number;
  onChange?: (newSelectedIndex: number) => void;
}

const Steps = ({ steps, selectedIndex = 0, onChange }: StepsProps) => {
  const handleStepClick = (newSelectedIndex: number) => {
    if (newSelectedIndex <= selectedIndex) {
      onChange && onChange(newSelectedIndex);
    }
  };

  return (
    <div className="steps">
      {steps.map(({ label, description }, index) => {
        const step: number = index + 1;

        return (
          <React.Fragment key={step}>
            <div
              className={`steps__step
            ${step === selectedIndex ? 'steps__stepActive' : ''}
            ${step < selectedIndex ? 'steps__stepCompleted' : ''}
            ${step > selectedIndex ? 'steps__stepDisabled' : ''}
            `}
              onClick={() => handleStepClick(step)}
              title={description}
            >
              {label}
            </div>
            {step < steps.length && <div className="steps__connector" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Steps;
