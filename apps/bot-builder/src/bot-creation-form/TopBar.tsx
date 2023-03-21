import React from 'react';
import { useCharacterCreationForm } from './CharacterCreationFormContext';
import classNames from 'classnames';

interface TopBarProps {
  steps: number[];
}

const TopBar: React.FC<TopBarProps> = ({ steps }) => {
  const { currentStep, setCurrentStep } = useCharacterCreationForm();

  return (
    <div className="topBar">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={classNames('topBar__node', {
              'topBar__node--completed': step < currentStep,
              'topBar__node--active': step === currentStep,
              'topBar__node--disabled': step > currentStep,
            })}
            onClick={() => {
              if (step <= currentStep) {
                setCurrentStep(step);
              }
            }}
          />
          {index < steps.length - 1 && (
            <div
              className={classNames('topBar__connector', {
                'topBar__connector--completed': step < currentStep,
              })}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TopBar;
