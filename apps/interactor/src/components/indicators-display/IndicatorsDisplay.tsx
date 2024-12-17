import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { selectCurrentIndicators } from '../../state/selectors';
import './IndicatorsDisplay.scss';
import { Button, Dropdown, Modal, Slider, Tooltip } from '@mikugg/ui-kit';
import { GiHeartBeats } from 'react-icons/gi';
import {
  setPrefillIndicators,
  addCreatedIndicatorId,
  removeCreatedIndicatorId,
} from '../../state/slices/narrationSlice';
import { FaPencil, FaPlus, FaTrash } from 'react-icons/fa6';
import { useI18n } from '../../libs/i18n';
import classNames from 'classnames';
import { useFillTextTemplateFunction } from '../../libs/hooks';
import IndicatorEditor from './IndicatorEditor';
import { addIndicatorToScene } from '../../state/slices/novelSlice';
import { selectCurrentScene } from '../../state/selectors';
import { NovelIndicator } from '../../state/versioning';
import { setModalOpened, updateIndicator } from '../../state/slices/creationSlice';
import { AreYouSure } from '@mikugg/ui-kit';
import { removeIndicatorFromScene } from '../../state/slices/novelSlice';
import { useAppContext } from '../../App.context';

const IndicatorsDisplay = () => {
  const dispatch = useAppDispatch();
  const indicators = useAppSelector(selectCurrentIndicators);
  const disabled = useAppSelector((state) => state.narration.input.disabled);
  const prefillIndicators = useAppSelector((state) => state.narration.input.prefillIndicators || []);
  const currentScene = useAppSelector(selectCurrentScene);
  const openIndicatorModal = useAppSelector((state) => state.creation.scene.indicator.opened);
  const indicatorToCreate = useAppSelector((state) => state.creation.scene.indicator.item);
  const { i18n } = useI18n();
  const fillText = useFillTextTemplateFunction();
  const { isMobileApp } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<{
    id: string;
    type: 'discrete' | 'percentage' | 'amount';
    name?: string;
    values?: string[];
    min?: number;
    max?: number;
    currentValue: string | number;
  } | null>(null);
  const { openModal } = AreYouSure.useAreYouSure();
  const createdIndicatorIds = useAppSelector((state) => state.narration.createdIndicatorIds);

  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const visibleIndicators = indicators.filter((indicator) => !indicator.hidden);
  const createdIndicatorsCount = createdIndicatorIds?.length || 0;
  const hasReachedLimit = isPremiumUser ? createdIndicatorsCount >= 10 : createdIndicatorsCount >= 1;
  const limitTooltipText = isPremiumUser
    ? 'Max number of custom indicators is 10.'
    : 'Upgrade to premium to add more indicators.';

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

  const handleDeleteIndicator = (indicatorId: string) => {
    if (!currentScene) return;

    openModal({
      title: 'Delete Indicator',
      description: 'Are you sure you want to delete this indicator?',
      yesLabel: 'Delete',
      onYes: () => {
        dispatch(
          removeIndicatorFromScene({
            sceneId: currentScene.id,
            indicatorId: indicatorId,
          }),
        );
        dispatch(removeCreatedIndicatorId(indicatorId));
      },
    });
  };

  return (
    <>
      <div className={`IndicatorsDisplay ${isOpen ? 'open' : ''} ${isMobileApp ? 'mobile' : ''}`}>
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
                {createdIndicatorIds?.includes(indicator.id) && (
                  <button
                    className="IndicatorsDisplay__indicator-delete"
                    disabled={disabled}
                    onClick={() => handleDeleteIndicator(indicator.id)}
                  >
                    <FaTrash />
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

        {visibleIndicators.length === 0 && <div className="IndicatorsDisplay__no-indicators">No indicators found</div>}

        {/* Add the "Create Indicator" button at the end */}
        <div className="IndicatorsDisplay__create-indicator">
          <button
            className="IndicatorsDisplay__create-indicator-button"
            disabled={disabled || hasReachedLimit}
            onClick={() => dispatch(setModalOpened({ id: 'indicator', opened: true }))}
            data-tooltip-id="indicator-limit-tooltip"
            data-tooltip-content={hasReachedLimit ? limitTooltipText : undefined}
          >
            <FaPlus />
          </button>
          {hasReachedLimit && <Tooltip id="indicator-limit-tooltip" place="bottom" />}
        </div>
      </div>

      <Modal
        opened={!!editingIndicator}
        onCloseModal={() => setEditingIndicator(null)}
        title={`${i18n('edit')} ${editingIndicator?.name ? fillText(editingIndicator.name) : 'Indicator'}`}
        className="IndicatorsDisplay__edit-modal"
        hideCloseButton={false}
      >
        <div className="IndicatorsDisplay__edit-modal-content">
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
        </div>
      </Modal>

      {/* Add the modal for creating a new indicator */}
      <Modal
        opened={openIndicatorModal}
        onCloseModal={() => dispatch(setModalOpened({ id: 'indicator', opened: false }))}
        className="IndicatorsDisplay__edit-modal"
        hideCloseButton={false}
      >
        {currentScene && (
          <IndicatorEditor
            onUpdate={(newIndicator: NovelIndicator) => {
              dispatch(updateIndicator(newIndicator));
            }}
            indicator={
              indicatorToCreate || {
                id: '',
                name: '',
                description: '',
                type: 'percentage',
                color: '#4caf50',
                initialValue: '',
                inferred: false,
                min: 0,
                max: 100,
              }
            }
            onSave={(newIndicator: NovelIndicator) => {
              dispatch(
                addIndicatorToScene({
                  sceneId: currentScene.id,
                  indicator: newIndicator,
                }),
              );
              dispatch(addCreatedIndicatorId(newIndicator.id));
              dispatch(setModalOpened({ id: 'indicator', opened: false }));
            }}
            onCancel={() => dispatch(setModalOpened({ id: 'indicator', opened: false }))}
          />
        )}
      </Modal>
    </>
  );
};

export default IndicatorsDisplay;
