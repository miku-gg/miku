import { IoArrowBack } from 'react-icons/io5';
import './StepNavigation.scss';

interface StepNavigationProps {
  currentStep: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
}

export function StepNavigation({ currentStep, title, subtitle, onBack }: StepNavigationProps) {
  return (
    <div className="StepNavigation">
      {currentStep > 1 && (
        <button className="StepNavigation__back" onClick={onBack}>
          <IoArrowBack />
        </button>
      )}
      <div className="StepNavigation__content">
        <h2 className="StepNavigation__title">{title}</h2>
        <p className="StepNavigation__subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
