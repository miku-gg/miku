import { Button, Modal, Tooltip } from '@mikugg/ui-kit';
import { useMemo } from 'react';
import { FaCheck } from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import { useAppContext } from '../../App.context';
import { trackEvent } from '../../libs/analytics';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { selectTokensCount } from '../../state/selectors';
import { ModelType, setMemoryCapacityModal, setModel } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './MemoryCapacityView.scss';

const REGULAR_USERS_TOKENS_CAPACITY = 4096;
const PREMIUM_USERS_TOKENS_CAPACITY = 16384;

export default function MemoryCapacityView() {
  const { isProduction, isMobileApp } = useAppContext();
  if (!isProduction) return null;

  const dispatch = useAppDispatch();
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const isMemoryModalOpen = useAppSelector((state) => state.settings.modals.memoryCapacity);
  const state = useAppSelector((state) => state);
  const isSmart = useAppSelector((state) => state.settings.model === ModelType.RP_SMART);

  const inputDisabled = useAppSelector((state) => state.narration.input.disabled);

  const currentTokens = useMemo(() => {
    return selectTokensCount(state);
  }, [inputDisabled]);

  const isMobileSize = isMobileApp || window.innerWidth < 600;

  const handleBrainClick = () => {
    if (!isPremiumUser) {
      dispatch(setMemoryCapacityModal(true));
    } else {
      dispatch(setModel(isSmart ? ModelType.RP : ModelType.RP_SMART));
      trackEvent('smart-toggle-click', {
        modelSet: isSmart ? 'RP' : 'RP_SMART',
      });
    }
  };

  const FillBrain = ({
    isPremium,
    currentTokensCount,
    sizeInPixels,
    showFillPercent,
    onClick,
    showTooltip,
    useColours,
  }: {
    isPremium: boolean;
    currentTokensCount: number;
    sizeInPixels: number;
    onClick?: () => void;
    showFillPercent?: boolean;
    showTooltip?: boolean;
    useColours?: boolean;
  }) => {
    const maxCapacity = isPremium ? PREMIUM_USERS_TOKENS_CAPACITY : REGULAR_USERS_TOKENS_CAPACITY;
    const fillPercentage = Math.min((currentTokensCount / maxCapacity) * 100, 100);
    const fillColor = useColours ? '#ffbe33' : '#fafafa';
    const realFillPercentage = (fillPercentage + 8) * 0.835;
    const uniqueKeyframeName = `fill-${Math.random().toString(36).slice(2, 9)}`;

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
          data-tooltip-content={
            !isPremium
              ? `Smart mode. Only available for premium`
              : `${!isSmart ? 'Switch to smart model' : 'Switch to regular model'}`
          }
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

          {showFillPercent && <p className="MemoryCapacityView__percentage">{Math.round(fillPercentage)}%</p>}
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

  return (
    <>
      <FillBrain
        isPremium={isPremiumUser}
        // currentTokensCount={currentTokens}
        currentTokensCount={isSmart ? PREMIUM_USERS_TOKENS_CAPACITY : 0}
        sizeInPixels={32}
        showFillPercent={false}
        showTooltip={true}
        onClick={handleBrainClick}
      />
      <Modal
        opened={isMemoryModalOpen && !isPremiumUser}
        className={`MemoryCapacityViewModal ${isMobileSize ? 'mobile-view__modal' : ''}`}
        onCloseModal={() => {
          dispatch(setMemoryCapacityModal(false));
        }}
      >
        <div className={`MemoryCapacityView__modal ${isMobileSize ? 'mobile-view' : ''}`}>
          <div className="MemoryCapacityView__modal-header">
            <h3 className="MemoryCapacityView__modal-header_title">Memory Capacity</h3>
            <p className="MemoryCapacityView__modal-header__subtitle">
              The novel information and messages are stored in the AI's memory.
            </p>
          </div>
          <div className="MemoryCapacityView__modal-top">
            <FillBrain
              isPremium={isPremiumUser}
              currentTokensCount={currentTokens || 0}
              sizeInPixels={70}
              showFillPercent={true}
            />
            <div className="MemoryCapacityView__modal-top__text">
              <h4>Free membership</h4>
              <div>
                <FaCheck size={10} color="#9747ff" />
                <p>Characters can remember around the last 10 messages</p>
              </div>
            </div>
          </div>
          <div className="MemoryCapacityView__modal-bottom">
            <FillBrain
              isPremium={true}
              currentTokensCount={currentTokens || 0}
              sizeInPixels={70}
              showFillPercent={true}
              useColours={true}
            />
            <div className="MemoryCapacityView__modal-bottom__text">
              <h4>Premium membership</h4>
              <div>
                <FaCheck size={10} color="#9747ff" />
                <p>New smarter AI model</p>
              </div>
              <div>
                <FaCheck size={10} color="#9747ff" />
                <p>Characters can remember around the last 80 messages</p>
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
              Continue as Regular
            </Button>
            <Button
              theme="gradient"
              onClick={() => {
                postMessage(CustomEventType.OPEN_PREMIUM);
                dispatch(setMemoryCapacityModal(false));
              }}
            >
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
