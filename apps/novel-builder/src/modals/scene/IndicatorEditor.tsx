import { NovelV3 } from '@mikugg/bot-utils';
import { Button, Input, Dropdown, CheckBox, Tooltip, Slider } from '@mikugg/ui-kit';
import { useState } from 'react';
import './IndicatorEditor.scss';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { TagAutocomplete } from '@mikugg/ui-kit';

const TYPE_OPTIONS = [
  {
    name: 'Percentage',
    description: 'A value that represents a percentage (0-100%)',
  },
  {
    name: 'Amount',
    description: 'A numeric value within a custom range',
  },
  {
    name: 'Discrete',
    description: 'A value from a predefined set of options',
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
  onDelete: () => void;
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

export function IndicatorEditor({ indicator, onUpdate, onDelete }: IndicatorEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

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
      // Force editable true and hidden false for discrete type
      editable: selectedType === 'discrete' ? true : indicator.editable,
      hidden: selectedType === 'discrete' ? false : indicator.hidden,
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

  const colorPickerSection = (
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
  );

  return (
    <div className="IndicatorEditor">
      <div className="IndicatorEditor__header">
        <h3>{indicator.name || 'Indicator'}</h3>
        <Button theme="transparent" onClick={onDelete}>
          Remove Indicator
        </Button>
      </div>

      <div className="IndicatorEditor__content">
        <div className="IndicatorEditor__row">
          <div className="IndicatorEditor__name-field">
            <Input
              label="Name"
              name="name"
              value={indicator.name}
              onChange={handleInputChange}
              maxLength={50}
              description="The name of the indicator that will be displayed. Used in the AI prompt."
            />
            <div className="IndicatorEditor__type-color">{colorPickerSection}</div>
          </div>

          <div className="IndicatorEditor__type-dropdown">
            <label>Type</label>
            <Dropdown
              items={TYPE_OPTIONS}
              selectedIndex={indicator.type === 'percentage' ? 0 : indicator.type === 'amount' ? 1 : 2}
              onChange={handleTypeChange}
            />
          </div>
        </div>

        <Input
          label="Description"
          name="description"
          value={indicator.description}
          onChange={handleInputChange}
          isTextArea
          description="A description of what this indicator represents. This WILL be used in the AI prompt."
        />

        {indicator.type === 'discrete' ? (
          <>
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

            <div className="IndicatorEditor__initial-value">
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
          </>
        ) : (
          <>
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
          </>
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
            label="Editable"
            value={indicator.editable || false}
            onChange={(e) => onUpdate({ ...indicator, editable: e.target.checked })}
            disabled={indicator.type === 'discrete'} // Disable for discrete type
            description="Whether users can modify this value"
          />
          <CheckBoxWithInfo
            label="Hidden"
            value={indicator.hidden || false}
            onChange={(e) => onUpdate({ ...indicator, hidden: e.target.checked })}
            disabled={indicator.type === 'discrete'} // Disable for discrete type
            description="Whether this indicator is visible to users"
          />
        </div>
      </div>
    </div>
  );
}
