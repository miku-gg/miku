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
import { useI18n } from '../../libs/i18n';

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
  const { i18n } = useI18n();

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
      title: i18n('create_indicator'),
      subtitle: i18n('create_indicator_subtitle'),
      content: (
        <div className="IndicatorEditor__type-selection">
          <OptionButton
            title={i18n('numeric_bar')}
            description={i18n('numeric_bar_description')}
            icon={<BsThermometerSnow />}
            isSelected={false}
            onClick={() => handleTypeSelect('numeric')}
          />
          <OptionButton
            title={i18n('text_indicator')}
            description={i18n('text_indicator_description')}
            icon={<GiSkills />}
            isSelected={false}
            onClick={() => handleTypeSelect('discrete')}
          />
        </div>
      ),
    },
    2: {
      title: i18n('basic_information'),
      subtitle: i18n('basic_information_subtitle'),
      content: (
        <div className="IndicatorEditor__basic-info">
          <div className="IndicatorEditor__name-row">
            <Input
              className="IndicatorEditor__name-field"
              label={i18n('name')}
              name="name"
              placeHolder={
                indicator.type === 'discrete' ? i18n('discrete_name_placeholder') : i18n('numeric_name_placeholder')
              }
              value={indicator.name}
              onChange={handleInputChange}
              maxLength={50}
              description={i18n('name_description')}
            />
            <div className="IndicatorEditor__color">
              <label>
                {i18n('color')}
                <IoInformationCircleOutline data-tooltip-id="color-info" className="IndicatorEditor__info-icon" />
                <Tooltip id="color-info" content={i18n('color_tooltip')} />
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
            label={i18n('description')}
            name="description"
            placeHolder={
              indicator.type === 'discrete'
                ? i18n('discrete_description_placeholder')
                : i18n('numeric_description_placeholder')
            }
            value={indicator.description}
            onChange={handleInputChange}
            isTextArea
            description={i18n('description_description')}
          />
          {indicator.type !== 'discrete' && (
            <div className="IndicatorEditor__type-dropdown">
              <label>{i18n('type')}</label>
              <Dropdown
                items={NUMERIC_TYPE_OPTIONS}
                selectedIndex={indicator.type === 'percentage' ? 0 : 1}
                onChange={(index) => handleTypeChange(index)}
              />
            </div>
          )}
          <div className="IndicatorEditor__actions">
            <Button theme="secondary" onClick={handleNext} disabled={!isStepValid(2)}>
              {i18n('continue')}
            </Button>
          </div>
        </div>
      ),
    },
    3: {
      title: i18n('configure_values'),
      subtitle: indicator.type === 'discrete' ? i18n('configure_values_discrete') : i18n('configure_values_numeric'),
      content:
        indicator.type === 'discrete' ? (
          <div className="IndicatorEditor__discrete-config">
            <div className="IndicatorEditor__discrete-values">
              <label>
                {i18n('possible_values')}
                <IoInformationCircleOutline data-tooltip-id="values-info" className="IndicatorEditor__info-icon" />
                <Tooltip id="values-info" content={i18n('possible_values_tooltip')} />
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
                {i18n('continue')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="IndicatorEditor__numeric-config">
            <div className="IndicatorEditor__row">
              <div className="IndicatorEditor__number-field">
                <Input
                  label={i18n('minimum_value')}
                  name="min"
                  value={indicator.min?.toString() || '0'}
                  onChange={handleInputChange}
                  description={i18n('minimum_value_description')}
                />
              </div>
              <div className="IndicatorEditor__number-field">
                <Input
                  label={i18n('maximum_value')}
                  name="max"
                  value={indicator.max?.toString() || (indicator.type === 'percentage' ? '100' : '1000')}
                  onChange={handleInputChange}
                  description={i18n('maximum_value_description')}
                />
              </div>
              {!indicator.inferred && (
                <div className="IndicatorEditor__number-field">
                  <Input
                    label={i18n('step')}
                    name="step"
                    value={indicator.step?.toString() || '1'}
                    onChange={handleInputChange}
                    description={i18n('step_description')}
                  />
                </div>
              )}
            </div>
            <div className="IndicatorEditor__actions">
              <Button theme="secondary" onClick={handleNext} disabled={!isStepValid(3)}>
                {i18n('continue')}
              </Button>
            </div>
          </div>
        ),
    },
    4: {
      title: i18n('final_settings'),
      subtitle: i18n('final_settings_subtitle'),
      content: (
        <div className="IndicatorEditor__final-settings">
          {indicator.type === 'discrete' ? (
            <div className="IndicatorEditor__initial-value">
              <label>{i18n('initial_value_label')}</label>
              <Dropdown
                items={indicator.values?.map((value) => ({ name: value })) || []}
                selectedIndex={indicator.values ? indicator.values.indexOf(indicator.initialValue) : -1}
                onChange={(index) =>
                  onUpdate({
                    ...indicator,
                    initialValue: indicator.values?.[index] || '',
                  })
                }
                placeholder={i18n('select_initial_value')}
                disabled={!indicator.values?.length}
              />
            </div>
          ) : (
            <div className="IndicatorEditor__slider-group">
              <label>
                {i18n('initial_value_label')}
                <IoInformationCircleOutline
                  data-tooltip-id="initial-value-info"
                  className="IndicatorEditor__info-icon"
                />
                <Tooltip id="initial-value-info" content={i18n('initial_value_tooltip')} />
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
              label={i18n('inferred')}
              value={indicator.inferred}
              onChange={(e) => onUpdate({ ...indicator, inferred: e.target.checked })}
              disabled={indicator.type === 'discrete'}
              description={i18n('inferred_description')}
            />
            <CheckBoxWithInfo
              label={i18n('persistent')}
              value={indicator.persistent}
              onChange={(e) => onUpdate({ ...indicator, persistent: e.target.checked })}
              description={i18n('persistent_description')}
            />
          </div>
          <div className="IndicatorEditor__actions">
            <Button theme="transparent" onClick={() => onCancel()}>
              {i18n('cancel')}
            </Button>
            <Button
              theme="secondary"
              onClick={() => onSave(isEditing ? indicator : { ...indicator, id: uuidv4() })}
              disabled={!isStepValid(4)}
            >
              {isEditing ? i18n('save_changes') : i18n('create_indicator_button')}
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
