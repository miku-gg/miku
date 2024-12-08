import { useEffect, useState } from 'react';
import { useAppSelector } from '../../state/store';
import { selectCurrentMetrics } from '../../state/selectors';
import './MetricsDisplay.scss';
import { Input } from '@mikugg/ui-kit';

const MetricsDisplay = () => {
  const metrics = useAppSelector(selectCurrentMetrics);
  const disabled = useAppSelector((state) => state.narration.input.disabled);
  // const dispatch = useAppDispatch();
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
          }, 1000); // Animation duration
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

  const handleMetricValueChange = (metricId: string, value: string) => {
    // dispatch(updateMetricValue({ metricId, value }));
    console.log('metricId', metricId);
    console.log('value', value);
  };

  return (
    <div className="MetricsDisplay">
      {visibleMetrics.map((metric) => (
        <div key={metric.id} id={`metric-${metric.id}`} className="MetricsDisplay__metric">
          <div className="MetricsDisplay__metric-name">{metric.name}</div>
          {(metric.type === 'percentage' || metric.type === 'amount') && (
            <div className="MetricsDisplay__metric-bar">
              <div
                className="MetricsDisplay__metric-bar-fill"
                style={{
                  width: `${metric.type === 'percentage' ? metric.currentValue + '%' : metric.currentValue}`,
                  backgroundColor: metric.color || '#4caf50',
                }}
              ></div>
            </div>
          )}
          {metric.type === 'discrete' && <div className="MetricsDisplay__metric-value">{metric.currentValue}</div>}
          {metric.editable && (
            <Input
              value={metric.currentValue?.toString() || ''}
              onChange={(e) => handleMetricValueChange(metric.id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricsDisplay;
