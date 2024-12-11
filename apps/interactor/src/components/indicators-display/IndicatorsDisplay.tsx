import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectCurrentIndicators } from '../../state/selectors';
import './IndicatorsDisplay.scss';
import { Button, Dropdown, Modal, Slider } from '@mikugg/ui-kit';
import { GiHeartBeats } from 'react-icons/gi';
import { setPrefillIndicators } from '../../state/slices/narrationSlice';
import { FaPencil } from 'react-icons/fa6';
import { useI18n } from '../../libs/i18n';
import classNames from 'classnames';
import { useFillTextTemplateFunction } from '../../libs/hooks';

const IndicatorsDisplay = () => {
  const dispatch = useAppDispatch();
  const indicators = useAppSelector(selectCurrentIndicators);
  const disabled = useAppSelector((state) => state.narration.input.disabled);
  const prefillIndicators = useAppSelector((state) => state.narration.input.prefillIndicators || []);
  const { i18n } = useI18n();
  const fillText = useFillTextTemplateFunction();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [editingIndicator, setEditingIndicator] = useState<{
    id: string;
    type: 'discrete' | 'percentage' | 'amount';
    name?: string;
    values?: string[];
    min?: number;
    max?: number;
    currentValue: string | number;
  } | null>(null);

  // Filter out hidden indicators
  const visibleIndicators = indicators.filter((indicator) => !indicator.hidden);

  const [prevIndicators, setPrevIndicators] = useState<Record<string, number | string>>({});

  useEffect(() => {
    if (disabled) return;
    // Compare current indicators with previous indicators to detect changes
    indicators.forEach((indicator) => {
      const prevValue = prevIndicators[indicator.name];
      if (prevValue !== indicator.currentValue) {
        // Trigger animation
        const element = document.getElementById(`indicator-${indicator.id}`);
        if (element) {
          element.classList.add('indicator-change');
          setTimeout(() => {
            element.classList.remove('indicator-change');
          }, 1000);
        }
      }
    });
    // Update previous indicators
    const indicatorValues: Record<string, number | string> = {};
    indicators.forEach((indicator) => {
      indicatorValues[indicator.name] = indicator.currentValue;
    });
    setPrevIndicators(indicatorValues);
  }, [indicators, disabled]);

  const handleIndicatorValueChange = (indicatorId: string, value: string | number) => {
    if (!editingIndicator) return;
    const newPrefillIndicators = prefillIndicators.filter((m) => m.id !== indicatorId);
    const currentIndicator = indicators.find((m) => m.id === indicatorId);
    if (value.toString() !== currentIndicator?.currentValue) {
      newPrefillIndicators.push({
        id: indicatorId,
        value: value,
      });
    }
    dispatch(setPrefillIndicators(newPrefillIndicators));
    setEditingIndicator({
      ...editingIndicator,
      currentValue: value,
    });
  };

  if (!visibleIndicators.length) return null;

  return (
    <>
      <div className={`IndicatorsDisplay ${isOpen ? 'open' : ''}`}>
        <button className="IndicatorsDisplay__toggle" onClick={() => setIsOpen(!isOpen)} title="Toggle Indicators">
          <GiHeartBeats className={isOpen ? 'open' : ''} />
        </button>
        {visibleIndicators.map((indicator) => {
          const prefillValue = prefillIndicators.find((m) => m.id === indicator.id)?.value;
          const currentValue = prefillValue || indicator.currentValue;

          return (
            <div key={indicator.id} id={`indicator-${indicator.id}`} className="IndicatorsDisplay__indicator">
              <div className="IndicatorsDisplay__indicator-header">
                <div className="IndicatorsDisplay__indicator-name">{fillText(indicator.name)}</div>
                {indicator.editable && (
                  <button
                    className="IndicatorsDisplay__indicator-edit"
                    disabled={disabled}
                    onClick={() =>
                      setEditingIndicator({
                        id: indicator.id,
                        name: indicator.name,
                        type: indicator.type,
                        values: indicator.values,
                        min: indicator.min,
                        max: indicator.max,
                        currentValue: currentValue,
                      })
                    }
                  >
                    <FaPencil />
                  </button>
                )}
              </div>
              <div
                className={classNames('IndicatorsDisplay__indicator-value-container', { prefilled: !!prefillValue })}
              >
                {(indicator.type === 'percentage' || indicator.type === 'amount') && (
                  <div className="IndicatorsDisplay__indicator-bar">
                    <div
                      className="IndicatorsDisplay__indicator-bar-fill"
                      style={{
                        width: `${
                          ((Number(currentValue) - (indicator.min || 0)) /
                            ((indicator.max || 100) - (indicator.min || 0))) *
                          100
                        }%`,
                        backgroundColor: indicator.color || '#4caf50',
                      }}
                    ></div>
                    <span className="IndicatorsDisplay__indicator-value">{currentValue}</span>
                  </div>
                )}
                {indicator.type === 'discrete' && (
                  <div className="IndicatorsDisplay__indicator-discrete">
                    <span style={{ color: indicator.color || '#4caf50' }}>{currentValue}</span>
                  </div>
                )}
                {prefillValue && <div className="IndicatorsDisplay__indicator-prefill-indicator" />}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        opened={!!editingIndicator}
        onCloseModal={() => setEditingIndicator(null)}
        title={`${i18n('edit')} ${editingIndicator?.name ? fillText(editingIndicator.name) : 'Indicator'}`}
        className="IndicatorsDisplay__edit-modal"
        hideCloseButton={false}
      >
        {editingIndicator?.type === 'discrete' ? (
          <Dropdown
            items={editingIndicator.values?.map((value) => ({ name: fillText(value), value: value })) || []}
            selectedIndex={editingIndicator.values?.indexOf(editingIndicator.currentValue.toString()) || 0}
            onChange={(index) =>
              handleIndicatorValueChange(editingIndicator.id, editingIndicator.values?.[index] || '')
            }
          />
        ) : (
          <Slider
            continuous
            min={editingIndicator?.min || 0}
            max={editingIndicator?.max || 100}
            step={1}
            value={Number(editingIndicator?.currentValue) || 0}
            onChange={(value) => handleIndicatorValueChange(editingIndicator?.id || '', Number(value))}
          />
        )}
        <div className="IndicatorsDisplay__edit-modal-actions">
          <Button
            theme="secondary"
            onClick={() => {
              setEditingIndicator(null);
              dispatch(setPrefillIndicators(prefillIndicators.filter((m) => m.id !== editingIndicator?.id)));
            }}
            disabled={!prefillIndicators.find((m) => m.id === editingIndicator?.id)}
          >
            Discard Changes
          </Button>
          <Button
            className="IndicatorsDisplay__edit-modal-actions-save"
            theme="transparent"
            onClick={() => {
              setEditingIndicator(null);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default IndicatorsDisplay;
