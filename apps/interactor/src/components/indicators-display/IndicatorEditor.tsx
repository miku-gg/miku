import { NovelV3 } from '@mikugg/bot-utils';
import { Button, Input, Dropdown, CheckBox, Tooltip, Slider } from '@mikugg/ui-kit';
import { useState } from 'react';
import './IndicatorEditor.scss';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { TagAutocomplete } from '@mikugg/ui-kit';
import { v4 as uuidv4 } from 'uuid';
import { StepNavigation } from './StepNavigation';
import { OptionButton } from '../common/OptionButton';
import { BsThermometerSnow } from 'react-icons/bs';
//import { LuIdCard } from "react-icons/lu";
import { GiSkills } from 'react-icons/gi';

// import { GiMedicalThermometer } from 'react-icons/gi';

const NUMERIC_TYPE_OPTIONS = [
  {
    name: 'Percentage',
    description: 'A percentage (0-100%)',
  },
  {
    name: 'Amount',
    description: 'A numeric value',
  },
];

const PREDEFINED_COLORS = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Amber
  '#F44336', // Red
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
  '#00BCD4', // Cyan
];

interface IndicatorEditorProps {
  indicator: NovelV3.NovelIndicator;
  onUpdate: (indicator: NovelV3.NovelIndicator) => void;
  onSave: (indicator: NovelV3.NovelIndicator) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

function CheckBoxWithInfo({
  label,
  description,
  ...props
}: {
  description: string;
  id?: string;
  label?: string;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="IndicatorEditor__checkbox-container">
      <CheckBox label={label} {...props} />
      <IoInformationCircleOutline data-tooltip-id={`tooltip-${label}`} className="IndicatorEditor__info-icon" />
      <Tooltip id={`tooltip-${label}`} content={description} place="bottom" />
    </div>
  );
}

export default function IndicatorEditor({ indicator, onUpdate, onSave, onCancel, isEditing }: IndicatorEditorProps) {
  const [currentStep, setCurrentStep] = useState(isEditing ? 2 : 1);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animationKey, setAnimationKey] = useState(0);

  const handleBack = () => {
    setDirection('backward');
    setCurrentStep((prev) => Math.max(1, prev - 1));
    setAnimationKey((prev) => prev + 1);
  };

  const handleNext = () => {
    setDirection('forward');
    setCurrentStep((prev) => Math.min(4, prev + 1));
    setAnimationKey((prev) => prev + 1);
  };

  const handleTypeSelect = (type: 'numeric' | 'discrete') => {
    onUpdate({
      ...indicator,
      type: type === 'numeric' ? 'percentage' : 'discrete',
    });
    handleNext();
  };

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    onUpdate({
      ...indicator,
      [name]: value,
    });
  };

  const handleTypeChange = (selectedIndex: number) => {
    const selectedType = ['percentage', 'amount', 'discrete'][selectedIndex];
    onUpdate({
      ...indicator,
      type: selectedType as 'percentage' | 'amount' | 'discrete',
      inferred: selectedType === 'discrete' ? false : indicator.inferred,
      // Reset values if changing to/from discrete
      values: selectedType === 'discrete' ? [] : undefined,
      // Reset numeric fields if changing to discrete
      step: selectedType === 'discrete' ? undefined : indicator.step,
      min: selectedType === 'discrete' ? undefined : indicator.min,
      max: selectedType === 'discrete' ? undefined : indicator.max,
      // Reset initial value when changing types
      initialValue: '',
      editable: true,
      hidden: false,
    });
  };

  const handleValuesChange = (values: string[]) => {
    onUpdate({
      ...indicator,
      values,
      // Set initial value to first value if not already set
      initialValue: indicator.initialValue || values[0] || '',
    });
  };

  const handleSliderChange = (name: string, value: number) => {
    onUpdate({
      ...indicator,
      [name]: value,
    });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!indicator.name.trim() && !!indicator.description.trim() && !!indicator.color;
      case 3:
        if (indicator.type === 'discrete') {
          return (indicator.values?.length || 0) >= 1;
        } else {
          const min = Number(indicator.min);
          const max = Number(indicator.max);
          const step = Number(indicator.step);
          return !isNaN(min) && !isNaN(max) && (!indicator.inferred ? !isNaN(step) && step > 0 : true) && max > min;
        }
      case 4:
        if (indicator.type === 'discrete') {
          // Check if initialValue exists and is in the values array
          return !!indicator.initialValue && (indicator.values?.includes(indicator.initialValue) || false);
        } else {
          const initialValue = Number(indicator.initialValue);
          const min = Number(indicator.min);
          const max = Number(indicator.max);
          return !isNaN(initialValue) && initialValue >= min && initialValue <= max;
        }
      default:
        return false;
    }
  };

  const steps = {
    1: {
      title: 'Create Indicator',
      subtitle:
        'Indicators are used to represent a value in current scene. They help the AI understand make better responses.',
      content: (
        <div className="IndicatorEditor__type-selection">
          <OptionButton
            title="Numeric Bar"
            description="A value that can be represented in a progress bar."
            icon={<BsThermometerSnow />}
            isSelected={false}
            onClick={() => handleTypeSelect('numeric')}
          />
          <OptionButton
            title="Text Indicator"
            description="A text that represents a discrete state."
            icon={<GiSkills />}
            isSelected={false}
            onClick={() => handleTypeSelect('discrete')}
          />
        </div>
      ),
    },
    2: {
      title: 'Basic Information',
      subtitle: 'Set the name and appearance of your indicator',
      content: (
        <div className="IndicatorEditor__basic-info">
          <div className="IndicatorEditor__name-row">
            <Input
              className="IndicatorEditor__name-field"
              label="Name"
              name="name"
              placeHolder={indicator.type === 'discrete' ? "Eg: Elina's teaching style" : "Eg: Elina's drunk level"}
              value={indicator.name}
              onChange={handleInputChange}
              maxLength={50}
              description="The name of the indicator that will be displayed. Used in the AI prompt."
            />
            <div className="IndicatorEditor__color">
              <label>
                Color
                <IoInformationCircleOutline data-tooltip-id="color-info" className="IndicatorEditor__info-icon" />
                <Tooltip id="color-info" content="The color used to represent this indicator in the UI" />
              </label>
              <div className="IndicatorEditor__color-controls">
                <div
                  className="IndicatorEditor__color-preview"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{ backgroundColor: indicator.color || '#4caf50' }}
                />
                {showColorPicker && (
                  <div className="IndicatorEditor__color-picker-popover">
                    <div className="IndicatorEditor__color-grid">
                      {PREDEFINED_COLORS.map((color) => (
                        <div
                          key={color}
                          className="IndicatorEditor__color-option"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            onUpdate({ ...indicator, color });
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Input
            label="Description"
            name="description"
            placeHolder={
              indicator.type === 'discrete'
                ? 'Eg: Indicates the way Elina teaches {{user}}'
                : 'Eg: Indicates the amount of alcohol Elina has drunk'
            }
            value={indicator.description}
            onChange={handleInputChange}
            isTextArea
            description="Explain the AI what this indicator represents."
          />
          {indicator.type !== 'discrete' && (
            <div className="IndicatorEditor__type-dropdown">
              <label>Type</label>
              <Dropdown
                items={NUMERIC_TYPE_OPTIONS}
                selectedIndex={indicator.type === 'percentage' ? 0 : 1}
                onChange={(index) => handleTypeChange(index)}
              />
            </div>
          )}
          <div className="IndicatorEditor__actions">
            <Button theme="secondary" onClick={handleNext} disabled={!isStepValid(2)}>
              Continue
            </Button>
          </div>
        </div>
      ),
    },
    3: {
      title: 'Configure Values',
      subtitle: indicator.type === 'discrete' ? 'Define the possible values' : 'Set the range and step size',
      content:
        indicator.type === 'discrete' ? (
          <div className="IndicatorEditor__discrete-config">
            <div className="IndicatorEditor__discrete-values">
              <label>
                Possible Values
                <IoInformationCircleOutline data-tooltip-id="values-info" className="IndicatorEditor__info-icon" />
                <Tooltip id="values-info" content="The list of possible values this indicator can take" />
              </label>
              <TagAutocomplete
                tags={[]}
                onChange={(e) => handleValuesChange(e.target.value.map((tag) => tag))}
                allowCustomTag
                value={indicator.values?.map((value) => ({ id: value, label: value, value: value })) || []}
              />
            </div>
            <div className="IndicatorEditor__actions">
              <Button theme="secondary" onClick={handleNext} disabled={!isStepValid(3)}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="IndicatorEditor__numeric-config">
            <div className="IndicatorEditor__row">
              <div className="IndicatorEditor__number-field">
                <Input
                  label="Minimum Value"
                  name="min"
                  value={indicator.min?.toString() || '0'}
                  onChange={handleInputChange}
                  description="The minimum value this indicator can have"
                />
              </div>
              <div className="IndicatorEditor__number-field">
                <Input
                  label="Maximum Value"
                  name="max"
                  value={indicator.max?.toString() || (indicator.type === 'percentage' ? '100' : '1000')}
                  onChange={handleInputChange}
                  description="The maximum value this indicator can have"
                />
              </div>
              {!indicator.inferred && (
                <div className="IndicatorEditor__number-field">
                  <Input
                    label="Step"
                    name="step"
                    value={indicator.step?.toString() || '1'}
                    onChange={handleInputChange}
                    description="The amount to increase/decrease per response"
                  />
                </div>
              )}
            </div>
            <div className="IndicatorEditor__actions">
              <Button theme="secondary" onClick={handleNext} disabled={!isStepValid(3)}>
                Continue
              </Button>
            </div>
          </div>
        ),
    },
    4: {
      title: 'Final Settings',
      subtitle: 'Set the initial value and behavior',
      content: (
        <div className="IndicatorEditor__final-settings">
          {indicator.type === 'discrete' ? (
            <div className="IndicatorEditor__initial-value">
              <label>Initial Value</label>
              <Dropdown
                items={indicator.values?.map((value) => ({ name: value })) || []}
                selectedIndex={indicator.values ? indicator.values.indexOf(indicator.initialValue) : -1}
                onChange={(index) =>
                  onUpdate({
                    ...indicator,
                    initialValue: indicator.values?.[index] || '',
                  })
                }
                placeholder="Select initial value..."
                disabled={!indicator.values?.length}
              />
            </div>
          ) : (
            <div className="IndicatorEditor__slider-group">
              <label>
                Initial Value
                <IoInformationCircleOutline
                  data-tooltip-id="initial-value-info"
                  className="IndicatorEditor__info-icon"
                />
                <Tooltip id="initial-value-info" content="The starting value for this indicator" />
              </label>
              <Slider
                continuous
                min={Number(indicator.min) || 0}
                max={Number(indicator.max) || (indicator.type === 'percentage' ? 100 : 1000)}
                step={1}
                value={Number(indicator.initialValue) || 0}
                onChange={(value) => handleSliderChange('initialValue', value)}
              />
            </div>
          )}
          <div className="IndicatorEditor__row">
            <CheckBoxWithInfo
              label="Inferred"
              value={indicator.inferred}
              onChange={(e) => onUpdate({ ...indicator, inferred: e.target.checked })}
              disabled={indicator.type === 'discrete'}
              description="Whether the value is determined by the AI"
            />
            <CheckBoxWithInfo
              label="Persistent"
              value={indicator.persistent}
              onChange={(e) => onUpdate({ ...indicator, persistent: e.target.checked })}
              description="Carry this indicator to the next scene"
            />
          </div>
          <div className="IndicatorEditor__actions">
            <Button theme="transparent" onClick={() => onCancel()}>
              Cancel
            </Button>
            <Button
              theme="secondary"
              onClick={() => onSave(isEditing ? indicator : { ...indicator, id: uuidv4() })}
              disabled={!isStepValid(4)}
            >
              {isEditing ? 'Save Changes' : 'Create Indicator'}
            </Button>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="IndicatorEditor">
      <StepNavigation
        currentStep={currentStep}
        title={steps[currentStep as keyof typeof steps].title}
        subtitle={steps[currentStep as keyof typeof steps].subtitle}
        onBack={!isEditing ? handleBack : undefined}
      />
      <div key={animationKey} className={`IndicatorEditor__step IndicatorEditor__step--${direction}`}>
        {steps[currentStep as keyof typeof steps].content}
      </div>
    </div>
  );
}
