import { NovelV3 } from '@mikugg/bot-utils';
import { Button, Input, Dropdown, CheckBox, Tooltip, Slider } from '@mikugg/ui-kit';
import { SketchPicker } from 'react-color';
import { useState } from 'react';
import './MetricEditor.scss';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { TagAutocomplete } from '@mikugg/ui-kit';
import range from 'lodash.range';

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

interface MetricEditorProps {
  metric: NovelV3.NovelMetric;
  onUpdate: (metric: NovelV3.NovelMetric) => void;
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
    <div className="MetricEditor__checkbox-container">
      <CheckBox label={label} {...props} />
      <IoInformationCircleOutline data-tooltip-id={`tooltip-${label}`} className="MetricEditor__info-icon" />
      <Tooltip id={`tooltip-${label}`} content={description} place="bottom" />
    </div>
  );
}

export function MetricEditor({ metric, onUpdate, onDelete }: MetricEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    onUpdate({
      ...metric,
      [name]: value,
    });
  };

  const handleTypeChange = (selectedIndex: number) => {
    const selectedType = ['percentage', 'amount', 'discrete'][selectedIndex];
    onUpdate({
      ...metric,
      type: selectedType as 'percentage' | 'amount' | 'discrete',
      inferred: selectedType === 'discrete' ? false : metric.inferred,
      // Reset values if changing to/from discrete
      values: selectedType === 'discrete' ? [] : undefined,
      // Reset numeric fields if changing to discrete
      step: selectedType === 'discrete' ? undefined : metric.step,
      min: selectedType === 'discrete' ? undefined : metric.min,
      max: selectedType === 'discrete' ? undefined : metric.max,
      // Reset initial value when changing types
      initialValue: '',
      // Force editable true and hidden false for discrete type
      editable: selectedType === 'discrete' ? true : metric.editable,
      hidden: selectedType === 'discrete' ? false : metric.hidden,
    });
  };

  const handleValuesChange = (values: string[]) => {
    onUpdate({
      ...metric,
      values,
      // Set initial value to first value if not already set
      initialValue: metric.initialValue || values[0] || '',
    });
  };

  const handleSliderChange = (name: string, value: number) => {
    onUpdate({
      ...metric,
      [name]: value,
    });
  };

  return (
    <div className="MetricEditor">
      <div className="MetricEditor__header">
        <h3>{metric.name || 'Metric'}</h3>
        <Button theme="transparent" onClick={onDelete}>
          Remove Metric
        </Button>
      </div>

      <div className="MetricEditor__content">
        <div className="MetricEditor__row">
          <div className="MetricEditor__name-field">
            <Input
              label="Name"
              name="name"
              value={metric.name}
              onChange={handleInputChange}
              maxLength={50}
              description="The name of the metric that will be displayed. Used in the AI prompt."
            />
          </div>

          <div className="MetricEditor__type-color">
            <div className="MetricEditor__color">
              <label>
                Color
                <IoInformationCircleOutline data-tooltip-id="color-info" className="MetricEditor__info-icon" />
                <Tooltip id="color-info" content="The color used to represent this metric in the UI" />
              </label>
              <div className="MetricEditor__color-controls">
                <div
                  className="MetricEditor__color-preview"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{ backgroundColor: metric.color || '#4caf50' }}
                />
                {showColorPicker && (
                  <div className="MetricEditor__color-picker-popover">
                    <SketchPicker
                      color={metric.color || '#4caf50'}
                      onChangeComplete={(color) => {
                        onUpdate({ ...metric, color: color.hex });
                        setShowColorPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="MetricEditor__type-dropdown">
            <label>Type</label>
            <Dropdown
              items={TYPE_OPTIONS}
              selectedIndex={metric.type === 'percentage' ? 0 : metric.type === 'amount' ? 1 : 2}
              onChange={handleTypeChange}
            />
          </div>
        </div>

        <Input
          label="Description"
          name="description"
          value={metric.description}
          onChange={handleInputChange}
          isTextArea
          description="A description of what this metric represents. This WILL be used in the AI prompt."
        />

        {metric.type === 'discrete' ? (
          <>
            <div className="MetricEditor__discrete-values">
              <label>
                Possible Values
                <IoInformationCircleOutline data-tooltip-id="values-info" className="MetricEditor__info-icon" />
                <Tooltip id="values-info" content="The list of possible values this metric can take" />
              </label>
              <TagAutocomplete
                tags={[]}
                onChange={(e) => handleValuesChange(e.target.value.map((tag) => tag))}
                allowCustomTag
                value={metric.values?.map((value) => ({ id: value, label: value, value: value })) || []}
              />
            </div>

            <div className="MetricEditor__initial-value">
              <Dropdown
                items={metric.values?.map((value) => ({ name: value })) || []}
                selectedIndex={metric.values ? metric.values.indexOf(metric.initialValue) : -1}
                onChange={(index) =>
                  onUpdate({
                    ...metric,
                    initialValue: metric.values?.[index] || '',
                  })
                }
                placeholder="Select initial value..."
                disabled={!metric.values?.length}
              />
            </div>
          </>
        ) : (
          <>
            <div className="MetricEditor__row">
              <div className="MetricEditor__number-field">
                <Input
                  label="Minimum Value"
                  name="min"
                  value={metric.min?.toString() || '0'}
                  onChange={handleInputChange}
                  description="The minimum value this metric can have"
                />
              </div>
              <div className="MetricEditor__number-field">
                <Input
                  label="Maximum Value"
                  name="max"
                  value={metric.max?.toString() || (metric.type === 'percentage' ? '100' : '1000')}
                  onChange={handleInputChange}
                  description="The maximum value this metric can have"
                />
              </div>
              {!metric.inferred && (
                <div className="MetricEditor__number-field">
                  <Input
                    label="Step"
                    name="step"
                    value={metric.step?.toString() || '1'}
                    onChange={handleInputChange}
                    description="The amount to increase/decrease per step"
                  />
                </div>
              )}
            </div>

            <div className="MetricEditor__slider-group">
              <label>
                Initial Value
                <IoInformationCircleOutline data-tooltip-id="initial-value-info" className="MetricEditor__info-icon" />
                <Tooltip id="initial-value-info" content="The starting value for this metric" />
              </label>

              <Slider
                continuous
                min={Number(metric.min) || 0}
                max={Number(metric.max) || (metric.type === 'percentage' ? 100 : 1000)}
                step={1}
                value={Number(metric.initialValue) || 0}
                onChange={(value) => handleSliderChange('initialValue', value)}
              />
            </div>
          </>
        )}

        <div className="MetricEditor__row">
          <CheckBoxWithInfo
            label="Inferred"
            value={metric.inferred}
            onChange={(e) => onUpdate({ ...metric, inferred: e.target.checked })}
            disabled={metric.type === 'discrete'}
            description="Whether the value is determined by the AI"
          />
          <CheckBoxWithInfo
            label="Editable"
            value={metric.editable || false}
            onChange={(e) => onUpdate({ ...metric, editable: e.target.checked })}
            disabled={metric.type === 'discrete'} // Disable for discrete type
            description="Whether users can modify this value"
          />
          <CheckBoxWithInfo
            label="Hidden"
            value={metric.hidden || false}
            onChange={(e) => onUpdate({ ...metric, hidden: e.target.checked })}
            disabled={metric.type === 'discrete'} // Disable for discrete type
            description="Whether this metric is visible to users"
          />
        </div>
      </div>
    </div>
  );
}
