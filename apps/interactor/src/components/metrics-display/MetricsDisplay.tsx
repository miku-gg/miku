import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectCurrentMetrics } from '../../state/selectors';
import './MetricsDisplay.scss';
import { Button, Dropdown, Modal, Slider } from '@mikugg/ui-kit';
import { GiHeartBeats } from 'react-icons/gi';
import { setPrefillMetrics } from '../../state/slices/narrationSlice';
import { FaPencil } from 'react-icons/fa6';
import { useI18n } from '../../libs/i18n';
import classNames from 'classnames';

const MetricsDisplay = () => {
  const dispatch = useAppDispatch();
  const metrics = useAppSelector(selectCurrentMetrics);
  const disabled = useAppSelector((state) => state.narration.input.disabled);
  const prefillMetrics = useAppSelector((state) => state.narration.input.prefillMetrics || []);
  const { i18n } = useI18n();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [editingMetric, setEditingMetric] = useState<{
    id: string;
    type: 'discrete' | 'percentage' | 'amount';
    name?: string;
    values?: string[];
    min?: number;
    max?: number;
    currentValue: string | number;
  } | null>(null);

  // Filter out hidden metrics
  const visibleMetrics = metrics.filter((metric) => !metric.hidden);

  const [prevMetrics, setPrevMetrics] = useState<Record<string, number | string>>({});

  useEffect(() => {
    if (disabled) return;
    // Compare current metrics with previous metrics to detect changes
    metrics.forEach((metric) => {
      const prevValue = prevMetrics[metric.name];
      if (prevValue !== metric.currentValue) {
        // Trigger animation
        const element = document.getElementById(`metric-${metric.id}`);
        if (element) {
          element.classList.add('metric-change');
          setTimeout(() => {
            element.classList.remove('metric-change');
          }, 1000);
        }
      }
    });
    // Update previous metrics
    const metricValues: Record<string, number | string> = {};
    metrics.forEach((metric) => {
      metricValues[metric.name] = metric.currentValue;
    });
    setPrevMetrics(metricValues);
  }, [metrics, disabled]);

  const handleMetricValueChange = (metricId: string, value: string | number) => {
    if (!editingMetric) return;
    const newPrefillMetrics = prefillMetrics.filter((m) => m.id !== metricId);
    const currentMetric = metrics.find((m) => m.id === metricId);
    if (value.toString() !== currentMetric?.currentValue) {
      newPrefillMetrics.push({
        id: metricId,
        value: value,
      });
    }
    dispatch(setPrefillMetrics(newPrefillMetrics));
    setEditingMetric({
      ...editingMetric,
      currentValue: value,
    });
  };

  if (!visibleMetrics.length) return null;

  return (
    <>
      <div className={`MetricsDisplay ${isOpen ? 'open' : ''}`}>
        <button className="MetricsDisplay__toggle" onClick={() => setIsOpen(!isOpen)} title="Toggle Metrics">
          <GiHeartBeats className={isOpen ? 'open' : ''} />
        </button>
        {visibleMetrics.map((metric) => {
          const prefillValue = prefillMetrics.find((m) => m.id === metric.id)?.value;
          const currentValue = prefillValue || metric.currentValue;

          return (
            <div key={metric.id} id={`metric-${metric.id}`} className="MetricsDisplay__metric">
              <div className="MetricsDisplay__metric-header">
                <div className="MetricsDisplay__metric-name">{metric.name}</div>
                {metric.editable && (
                  <button
                    className="MetricsDisplay__metric-edit"
                    disabled={disabled}
                    onClick={() =>
                      setEditingMetric({
                        id: metric.id,
                        name: metric.name,
                        type: metric.type,
                        values: metric.values,
                        min: metric.min,
                        max: metric.max,
                        currentValue: currentValue,
                      })
                    }
                  >
                    <FaPencil />
                  </button>
                )}
              </div>
              <div className={classNames('MetricsDisplay__metric-value-container', { prefilled: !!prefillValue })}>
                {(metric.type === 'percentage' || metric.type === 'amount') && (
                  <div className="MetricsDisplay__metric-bar">
                    <div
                      className="MetricsDisplay__metric-bar-fill"
                      style={{
                        width: `${
                          ((Number(currentValue) - (metric.min || 0)) / ((metric.max || 100) - (metric.min || 0))) * 100
                        }%`,
                        backgroundColor: metric.color || '#4caf50',
                      }}
                    ></div>
                    <span className="MetricsDisplay__metric-value">{currentValue}</span>
                  </div>
                )}
                {metric.type === 'discrete' && (
                  <div className="MetricsDisplay__metric-discrete">
                    <span style={{ color: metric.color || '#4caf50' }}>{currentValue}</span>
                  </div>
                )}
                {prefillValue && <div className="MetricsDisplay__metric-prefill-indicator" />}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        opened={!!editingMetric}
        onCloseModal={() => setEditingMetric(null)}
        title={`${i18n('edit')} ${editingMetric?.name || 'Metric'}`}
        className="MetricsDisplay__edit-modal"
        hideCloseButton={false}
      >
        {editingMetric?.type === 'discrete' ? (
          <Dropdown
            items={editingMetric.values?.map((value) => ({ name: value })) || []}
            selectedIndex={editingMetric.values?.indexOf(editingMetric.currentValue.toString()) || 0}
            onChange={(index) => handleMetricValueChange(editingMetric.id, editingMetric.values?.[index] || '')}
          />
        ) : (
          <Slider
            continuous
            min={editingMetric?.min || 0}
            max={editingMetric?.max || 100}
            step={1}
            value={Number(editingMetric?.currentValue) || 0}
            onChange={(value) => handleMetricValueChange(editingMetric?.id || '', Number(value))}
          />
        )}
        <div className="MetricsDisplay__edit-modal-actions">
          <Button
            theme="secondary"
            onClick={() => {
              setEditingMetric(null);
              dispatch(setPrefillMetrics(prefillMetrics.filter((m) => m.id !== editingMetric?.id)));
            }}
            disabled={!prefillMetrics.find((m) => m.id === editingMetric?.id)}
          >
            Discard Changes
          </Button>
          <Button
            className="MetricsDisplay__edit-modal-actions-save"
            theme="transparent"
            onClick={() => {
              setEditingMetric(null);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default MetricsDisplay;
