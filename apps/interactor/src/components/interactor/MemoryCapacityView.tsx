import { Button, Modal, Tooltip } from '@mikugg/ui-kit';
import { GiBrain } from 'react-icons/gi';
import { useAppContext } from '../../App.context';
import { CustomEventType, postMessage } from '../../libs/stateEvents';
import { selectChatHistory } from '../../state/selectors';
import { setMemoryCapacityModal } from '../../state/slices/settingsSlice';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './MemoryCapacityView.scss';

const REGULAR_USERS_MEMORY_CAPACITY = 3;
const PREMIUM_USERS_MEMORY_CAPACITY = 8;

export default function MemoryCapacityView() {
  const { isProduction } = useAppContext();
  const dispatch = useAppDispatch();
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const chatHistory = useAppSelector(selectChatHistory);
  const narrationMessagesCount = chatHistory.length;
  const isMemoryModalOpen = useAppSelector((state) => state.settings.modals.memoryCapacity);

  if (!isProduction) return null;

  const fillBrain = ({
    isPremium,
    currentMessagesCount,
    sizeInPixels,
    showFillPercent,
    onClick,
    showTooltip,
  }: {
    isPremium: boolean;
    currentMessagesCount: number;
    sizeInPixels: number;
    onClick?: () => void;
    showFillPercent?: boolean;
    showTooltip?: boolean;
  }) => {
    const maxCapacity = isPremium ? PREMIUM_USERS_MEMORY_CAPACITY : REGULAR_USERS_MEMORY_CAPACITY;
    const fillPercentage = Math.min((currentMessagesCount / maxCapacity) * 100, 100);

    const getColorFromPercentage = (percentage: number) => {
      if (percentage < 25) return 'green';
      if (percentage < 50) return 'yellow';
      if (percentage < 75) return 'orange';
      if (percentage <= 100 && percentage > 75) return 'red';
    };
    const fillColor = getColorFromPercentage(fillPercentage);
    return (
      <div
        className={`MemoryCapacityView ${onClick && !isPremium ? 'MemoryCapacityView__clickable' : ''}`}
        data-tooltip-id="character-memory-tooltip"
        data-tooltip-content={`Memory usage: ${Math.round(fillPercentage)}%`}
        style={{ width: sizeInPixels, height: sizeInPixels }}
        onClick={onClick}
      >
        <GiBrain
          className="MemoryCapacityView__unfilled-icon"
          style={{ width: `${sizeInPixels}`, height: `${sizeInPixels}` }}
        />
        {showTooltip && <Tooltip id="character-memory-tooltip" style={{ fontSize: '1rem' }} place="bottom" />}
        <div
          className="MemoryCapacityView__fill"
          style={{
            height: `${fillPercentage}%`,
            filter: `drop-shadow(0 0 1px ${fillColor})`,
          }}
        >
          <GiBrain
            className="MemoryCapacityView__icon"
            style={{ color: fillColor, width: `${sizeInPixels}`, height: `${sizeInPixels}` }}
          />
        </div>
        {showFillPercent && <p className="MemoryCapacityView__percentage">{Math.round(fillPercentage)}%</p>}
      </div>
    );
  };

  return (
    <>
      {fillBrain({
        isPremium: isPremiumUser,
        currentMessagesCount: narrationMessagesCount,
        sizeInPixels: 28,
        showFillPercent: false,
        showTooltip: true,
        onClick: () => {
          dispatch(setMemoryCapacityModal(true));
        },
      })}
      <Modal
        opened={isMemoryModalOpen && !isPremiumUser}
        className="MemoryCapacityViewModal"
        onCloseModal={() => {
          dispatch(setMemoryCapacityModal(false));
        }}
      >
        <div className="MemoryCapacityView__modal">
          <div className="MemoryCapacityView__modal-left">
            <div className="MemoryCapacityView__modal-left__container">
              <div className="MemoryCapacityView__modal-left__icon">
                {fillBrain({
                  isPremium: true,
                  currentMessagesCount: narrationMessagesCount,
                  sizeInPixels: 150,
                  showFillPercent: true,
                })}
              </div>
              <h2>Premium memory capacity</h2>

              <p>
                Upgrading to premium increase significatively the memory of the character. the character can remember
                arround {PREMIUM_USERS_MEMORY_CAPACITY} previous messages
              </p>
            </div>
            <Button
              theme="gradient"
              onClick={() => {
                postMessage(CustomEventType.OPEN_PREMIUM);
              }}
            >
              Upgrade to Premium
            </Button>
          </div>
          <div className="MemoryCapacityView__modal-right">
            <div className="MemoryCapacityView__modal-right__container">
              <div className="MemoryCapacityView__modal-right__icon">
                {fillBrain({
                  isPremium: isPremiumUser,
                  currentMessagesCount: narrationMessagesCount,
                  sizeInPixels: 150,
                  showFillPercent: true,
                })}
              </div>
              <h2>Regular memory capacity</h2>
              <p>
                Using the regular account, the character can remember arround {REGULAR_USERS_MEMORY_CAPACITY} previous
                messages
              </p>
            </div>
            <Button
              theme="transparent"
              onClick={() => {
                dispatch(setMemoryCapacityModal(false));
              }}
            >
              Continue as Regular
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
