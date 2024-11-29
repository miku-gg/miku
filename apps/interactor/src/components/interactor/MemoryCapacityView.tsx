import { Button, Modal, Tooltip } from '@mikugg/ui-kit';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import { useAppContext } from '../../App.context';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { setMemoryCapacityModal, setSummariesEnabled } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './MemoryCapacityView.scss';
import { useMemo, useState } from 'react';
import { selectTokensCount } from '../../state/selectors';
import { trackEvent } from '../../libs/analytics';
import SummaryView from '../history/SummaryView';
import { useI18n } from '../../libs/i18n';

const REGULAR_USERS_TOKENS_CAPACITY = 4096;
const PREMIUM_USERS_TOKENS_CAPACITY = 16384;

const FillBrain = ({
  maxCapacity,
  currentTokensCount,
  sizeInPixels,
  showFillPercent,
  onClick,
  showTooltip,
  fillColor = '#fafafa',
}: {
  maxCapacity: number;
  currentTokensCount: number;
  sizeInPixels: number;
  onClick?: () => void;
  showFillPercent?: boolean;
  showTooltip?: boolean;
  fillColor?: string;
}) => {
  const fillPercentage = Math.min((currentTokensCount / maxCapacity) * 100, 100);
  const realFillPercentage = (fillPercentage + 8) * 0.835;
  const uniqueKeyframeName = `fill-${Math.random().toString(36).slice(2, 9)}`;
  const { isMobileApp } = useAppContext();

  const keyframes = [
    `@keyframes ${uniqueKeyframeName}wave1 {
      0%, 100% { height: ${realFillPercentage}%; border-radius: 0 0 0 0; }
      50% { height: ${realFillPercentage + 2}%; border-radius: 5% 5% 0 0; }
    }`,
    `@keyframes ${uniqueKeyframeName}wave2 {}`,
    `@keyframes ${uniqueKeyframeName}wave3 {
      0%, 100% { height: ${realFillPercentage}%; border-radius: 0 0 0 0; }
      50% { height: ${realFillPercentage + 1.5}%; border-radius: 5% 5% 0 0; }
    }`,
    `@keyframes ${uniqueKeyframeName}wave4 {}`,
    `@keyframes ${uniqueKeyframeName}wave5 {
      0%, 100% { height: ${realFillPercentage}%; border-radius: 0 0 0 0; }
      50% { height: ${realFillPercentage + 1}%; border-radius: 5% 5% 0 0; }
    }`,
  ];

  return (
    <>
      <div
        className={`MemoryCapacityView ${onClick ? 'clickable' : ''}`}
        data-tooltip-id={`character-memory-tooltip${showTooltip ? '-yes' : ''}`}
        data-tooltip-content={!isMobileApp ? 'Memory Usage' : ''}
        style={{ width: sizeInPixels, height: sizeInPixels, minWidth: sizeInPixels, minHeight: sizeInPixels }}
        onClick={onClick}
      >
        <GiBrain
          className="MemoryCapacityView__unfilled-icon"
          style={{
            width: `${sizeInPixels}`,
            height: `${sizeInPixels}`,
            color: '#121a36',
          }}
        />

        <style>
          {keyframes.map((keyframe, index) => (
            <style key={index}>{keyframe}</style>
          ))}
        </style>

        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="MemoryCapacityView__fill"
            style={{
              height: `${realFillPercentage}%`,
              filter: `drop-shadow(0 0 1px ${fillColor})`,
              animation: `${uniqueKeyframeName}wave${index + 1} 1.5s infinite ease-in-out`,
              width: '22%',
              left: `${sizeInPixels * index * 0.2}px`,
            }}
          >
            <GiBrain
              className="MemoryCapacityView__icon"
              style={{
                color: fillColor,
                width: `${sizeInPixels}`,
                height: `${sizeInPixels}`,
                left: `-${sizeInPixels * index * 0.2}px`,
              }}
            />
          </div>
        ))}

        {showFillPercent && <p className="MemoryCapacityView__percentage">{Math.round(fillPercentage)}% Used</p>}
      </div>
      {showTooltip && (
        <Tooltip
          id={`character-memory-tooltip${showTooltip ? '-yes' : ''}`}
          style={{ fontSize: '0.8rem' }}
          place="bottom"
        />
      )}
    </>
  );
};

function FreeMemoryModal({ currentTokens }: { currentTokens: number }) {
  const { isMobileApp } = useAppContext();
  const dispatch = useAppDispatch();
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const isMemoryModalOpen = useAppSelector((state) => state.settings.modals.memoryCapacity);
  const { i18n } = useI18n();

  const isMobileSize = isMobileApp || window.innerWidth < 600;

  return (
    <Modal
      opened={isMemoryModalOpen && !isPremiumUser}
      className={`MemoryCapacityViewModal ${isMobileSize ? 'mobile-view__modal' : ''}`}
      onCloseModal={() => {
        dispatch(setMemoryCapacityModal(false));
      }}
    >
      <div className={`MemoryCapacityView__modal ${isMobileSize ? 'mobile-view' : ''}`}>
        <div className="MemoryCapacityView__modal-header">
          <h3 className="MemoryCapacityView__modal-header_title">{i18n('memory_capacity')}</h3>
          <p className="MemoryCapacityView__modal-header__subtitle">
            {i18n('upgrade_to_premium_for_long_term_memory')}
          </p>
        </div>
        <div className="MemoryCapacityView__modal-top">
          <FillBrain
            maxCapacity={REGULAR_USERS_TOKENS_CAPACITY}
            currentTokensCount={currentTokens}
            sizeInPixels={isMobileSize ? 35 : 70}
            showFillPercent={true}
            fillColor="#6f7396"
          />
          <div className="MemoryCapacityView__modal-top__text">
            <h4>{i18n('free_membership')}</h4>
            <div>
              <FaTimes size={10} color="#9747ff" />
              <p>{i18n('characters_remember_last_15_messages')}</p>
            </div>
            <div>
              <FaTimes size={10} color="#9747ff" />
              <p>{i18n('characters_dont_remember_old_messages')}</p>
            </div>
          </div>
        </div>
        <div className="MemoryCapacityView__modal-bottom">
          <FillBrain
            maxCapacity={PREMIUM_USERS_TOKENS_CAPACITY}
            currentTokensCount={currentTokens}
            sizeInPixels={isMobileSize ? 35 : 70}
            showFillPercent={true}
            fillColor="white"
          />
          <div className="MemoryCapacityView__modal-bottom__text">
            <h4>{i18n('long_term_memory')}</h4>
            <div>
              <FaCheck size={10} color="#9747ff" />
              <p>{i18n('characters_have_5x_more_memory')}</p>
            </div>
            <div>
              <FaCheck size={10} color="#9747ff" />
              <p>{i18n('characters_remember_old_messages')}</p>
            </div>
          </div>
        </div>
        <div className="MemoryCapacityView__modal-buttons">
          <Button
            theme="transparent"
            onClick={() => {
              dispatch(setMemoryCapacityModal(false));
            }}
          >
            {i18n('continue_as_regular')}
          </Button>
          <Button
            theme="gradient"
            onClick={() => {
              postMessage(CustomEventType.OPEN_PREMIUM);
              dispatch(setMemoryCapacityModal(false));
              trackEvent('memory-premium-click');
            }}
          >
            {i18n('upgrade_to_premium')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const PremiumMemoryModal: React.FC<{
  currentTokensNoSummary: number;
  currentTokensSummary: number;
}> = ({ currentTokensNoSummary, currentTokensSummary }) => {
  const dispatch = useAppDispatch();
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const isMemoryModalOpen = useAppSelector((state) => state.settings.modals.memoryCapacity);
  const usingSummary = useAppSelector((state) => !!state.settings.summaries?.enabled);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const { i18n } = useI18n();

  return (
    <>
      <Modal
        opened={isMemoryModalOpen && isPremiumUser}
        className={`PremiumMemoryModal`}
        onCloseModal={() => {
          dispatch(setMemoryCapacityModal(false));
        }}
      >
        <div className="MemoryCapacityView__modal-header">
          <h3 className="MemoryCapacityView__modal-header_title">{i18n('memory_options')}</h3>
          <p className="MemoryCapacityView__modal-header__subtitle">{i18n('configure_long_term_memory')}</p>
        </div>

        <div className="PremiumMemoryModal__options">
          <OptionButton
            title={i18n('standard_mode')}
            description={[i18n('ai_stores_entire_messages'), i18n('remembers_last_75_messages')]}
            isSelected={!usingSummary}
            onClick={() => {
              dispatch(setSummariesEnabled(false));
              trackEvent('activate-standard-mode');
            }}
            currentTokens={currentTokensNoSummary}
          />
          <OptionButton
            title={i18n('summary_mode')}
            description={[i18n('ai_summarizes_old_messages'), i18n('remembers_last_900_messages')]}
            isSelected={usingSummary}
            onClick={() => {
              dispatch(setSummariesEnabled(true));
              trackEvent('activate-summary-mode');
            }}
            experimental
            currentTokens={currentTokensSummary}
          />
        </div>

        <div className={`PremiumMemoryModal__advanced-settings ${!usingSummary ? 'disabled' : ''}`}>
          <div className="PremiumMemoryModal__advanced-settings-info">
            <h4 className="PremiumMemoryModal__advanced-settings-title">{i18n('summary_settings')}</h4>
            <p className="PremiumMemoryModal__advanced-settings-description">
              {i18n('manage_edit_character_memories')}
            </p>
          </div>
          <Button onClick={() => setShowSummaryModal(true)} theme="secondary" disabled={!usingSummary}>
            {i18n('manage_memories')}
          </Button>
        </div>
      </Modal>

      <Modal
        opened={showSummaryModal}
        onCloseModal={() => setShowSummaryModal(false)}
        title={i18n('memories')}
        className="SummaryViewModal"
      >
        <SummaryView />
      </Modal>
    </>
  );
};

interface OptionButtonProps {
  title: string;
  description: [string, string];
  isSelected: boolean;
  onClick: () => void;
  experimental?: boolean;
  currentTokens: number;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  title,
  description,
  isSelected,
  onClick,
  experimental = false,
  currentTokens,
}) => (
  <button
    className={`PremiumMemoryModal__option ${isSelected ? 'PremiumMemoryModal__option--selected' : ''}`}
    onClick={onClick}
  >
    <div className="PremiumMemoryModal__option-icon">
      <FillBrain
        fillColor={experimental ? '#ffbe33' : 'white'}
        currentTokensCount={currentTokens}
        maxCapacity={PREMIUM_USERS_TOKENS_CAPACITY}
        sizeInPixels={80}
      />
    </div>
    <div className="PremiumMemoryModal__option-content">
      <h3 className="PremiumMemoryModal__option-title">
        {title}
        {experimental && <span className="PremiumMemoryModal__option-badge">Experimental</span>}
      </h3>
      <p className="PremiumMemoryModal__option-description">{description[0]}</p>
      <p className="PremiumMemoryModal__option-description PremiumMemoryModal__option-description--highlighted">
        {description[1]}
      </p>
    </div>
  </button>
);

export default function MemoryCapacityView() {
  const { isProduction } = useAppContext();
  const dispatch = useAppDispatch();
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const state = useAppSelector((state) => state);
  const inputDisabled = useAppSelector((state) => state.narration.input.disabled);
  const summaryEnabled = useAppSelector((state) => !!state.settings.summaries?.enabled);
  const currentTokensNoSummary = useMemo(
    () =>
      selectTokensCount({
        ...state,
        settings: {
          ...state.settings,
          summaries: {
            enabled: false,
          },
        },
      }),
    [inputDisabled, summaryEnabled],
  );
  const currentTokensSummary = useMemo(
    () =>
      selectTokensCount({
        ...state,
        settings: {
          ...state.settings,
          summaries: {
            enabled: true,
          },
        },
      }),
    [inputDisabled, summaryEnabled],
  );
  const handleBrainClick = () => {
    dispatch(setMemoryCapacityModal(true));
    trackEvent('memory-toggle-click');
  };

  if (!isProduction) return null;
  return (
    <>
      <FillBrain
        maxCapacity={isPremiumUser ? PREMIUM_USERS_TOKENS_CAPACITY : REGULAR_USERS_TOKENS_CAPACITY}
        currentTokensCount={summaryEnabled ? currentTokensSummary : currentTokensNoSummary}
        sizeInPixels={32}
        showFillPercent={false}
        showTooltip={true}
        fillColor={isPremiumUser ? (summaryEnabled ? '#ffbe33' : 'white') : '#bbc2d8'}
        onClick={handleBrainClick}
      />
      <FreeMemoryModal currentTokens={currentTokensNoSummary} />
      <PremiumMemoryModal currentTokensNoSummary={currentTokensNoSummary} currentTokensSummary={currentTokensSummary} />
    </>
  );
}
