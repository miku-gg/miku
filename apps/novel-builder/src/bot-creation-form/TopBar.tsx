import React from "react";

import { Steps } from "@mikugg/ui-kit";
import { useCharacterCreationForm } from "./CharacterCreationFormContext";

import "./Topbar.scss";

export interface Step {
  label: string;
  description: string;
}
interface TopBarProps {
  steps: Step[];
  handleChange?: (newStep: number) => void;
}

const TopBar: React.FC<TopBarProps> = ({ steps, handleChange }) => {
  const { currentStep, setCurrentStep } = useCharacterCreationForm();

  const onStepChange = (newSelectedIndex: number) => {
    setCurrentStep && setCurrentStep(newSelectedIndex);

    handleChange && handleChange(newSelectedIndex);
  };

  return (
    <div className="topBar">
      <Steps
        steps={steps}
        onChange={onStepChange}
        selectedIndex={currentStep}
      />
    </div>
  );
};

export default TopBar;
