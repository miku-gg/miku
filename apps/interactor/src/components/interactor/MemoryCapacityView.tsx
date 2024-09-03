import { Button, Modal, Tooltip } from '@mikugg/ui-kit';
import { useMemo } from 'react';
import { GiBrain } from 'react-icons/gi';
import { useAppContext } from '../../App.context';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { selectTokensCount } from '../../state/selectors';
import { setMemoryCapacityModal } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './MemoryCapacityView.scss';

const REGULAR_USERS_TOKENS_CAPACITY = 4096;
const PREMIUM_USERS_TOKENS_CAPACITY = 32768;

export default function MemoryCapacityView() {
  const { isProduction, isMobileApp } = useAppContext();
  const dispatch = useAppDispatch();
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const isMemoryModalOpen = useAppSelector((state) => state.settings.modals.memoryCapacity);
  const state = useAppSelector((state) => state);
  const inputDisabled = useAppSelector((state) => state.narration.input.disabled);

  const currentTokens = useMemo(() => {
    return selectTokensCount(state);
  }, [inputDisabled]);

  const isMobileSize = isMobileApp || window.innerWidth < 600;

  // if (!isProduction) return null;

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

    const getColorFromPercentage = (percentage: number) => {
      if (!useColours) return 'white';
      if (percentage < 25) return '#16a34a';
      if (percentage < 50) return '#f7b500';
      if (percentage < 75) return '#ff8c00';
      if (percentage <= 100 && percentage > 75) return '#ff4e67';
    };
    const fillColor = getColorFromPercentage(fillPercentage);
    const uniqueKeyframeName = `fill-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div
        className={`MemoryCapacityView ${onClick && !isPremium ? 'clickable' : ''}`}
        data-tooltip-id={`character-memory-tooltip${showTooltip ? '-yes' : ''}`}
        data-tooltip-content={`Memory usage: ${Math.round(fillPercentage)}%`}
        style={{ width: sizeInPixels, height: sizeInPixels, minWidth: sizeInPixels, minHeight: sizeInPixels }}
        onClick={onClick}
      >
        <GiBrain
          className="MemoryCapacityView__unfilled-icon"
          style={{ width: `${sizeInPixels}`, height: `${sizeInPixels}`, color: `${!useColours ? '#121a36' : 'white'}` }}
        />

        <style>
          {`
            @keyframes ${uniqueKeyframeName} {
              0% {
                height: ${fillPercentage}%;
                border-radius: 30% 25% 0;

              }
              25% {
                height: ${fillPercentage - 1}%;
                 border-radius: 10% 30% 0 0;
              }
              50% {
                height: ${fillPercentage + 1}%;
                border-radius: 0 0 0 0;
              }
              75% {
                height: ${fillPercentage - 0.5}%;
                border-radius: 20% 0 0 0;
              }
              100% {
                height: ${fillPercentage}%;
                border-radius: 30% 25% 0 0;
              }
            }
          `}
        </style>

        <div
          className="MemoryCapacityView__fill"
          style={{
            height: `${fillPercentage}%`,
            filter: `drop-shadow(0 0 1px ${fillColor})`,
            animation: `${uniqueKeyframeName} 2s infinite ease-in-out`,
          }}
        >
          <GiBrain
            className="MemoryCapacityView__icon"
            style={{
              color: fillColor,
              width: `${sizeInPixels}`,
              height: `${sizeInPixels}`,
            }}
          />
        </div>
        {showTooltip && (
          <Tooltip
            id={`character-memory-tooltip${showTooltip ? '-yes' : ''}`}
            style={{ fontSize: '1rem' }}
            place="bottom"
          />
        )}
        {showFillPercent && <p className="MemoryCapacityView__percentage">{Math.round(fillPercentage)}%</p>}
      </div>
    );
  };

  return (
    <>
      <FillBrain
        isPremium={isPremiumUser}
        currentTokensCount={currentTokens || 0}
        sizeInPixels={28}
        showFillPercent={false}
        showTooltip={true}
        onClick={() => {
          dispatch(setMemoryCapacityModal(true));
        }}
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
              The character can remember a certain number of previous messages.
            </p>
          </div>
          <div className="MemoryCapacityView__modal-top">
            <FillBrain
              isPremium={isPremiumUser}
              currentTokensCount={currentTokens || 0}
              sizeInPixels={70}
              showFillPercent={true}
              useColours={true}
            />
            <div className="MemoryCapacityView__modal-top__text">
              <h4>Free membership</h4>
              <p>Using the regular account, the character can remember up the last 15 messages</p>
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
              <p>Using the premium account, the character can remember up the last 170 messages</p>
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
