import React from 'react';
import { useCharacterCreationForm } from './CharacterCreationFormContext';

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
            className={`topBar__node${currentStep === step ? ' topBar__node--active' : ''}`}
            onClick={() => setCurrentStep(step)}
          />
          {index < steps.length - 1 && <div className="topBar__connector" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TopBar;
