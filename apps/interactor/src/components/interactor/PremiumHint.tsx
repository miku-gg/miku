import { useEffect, useState } from 'react';
import { GiLightBulb } from 'react-icons/gi';
import { selectChatHistory } from '../../state/selectors';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './Hint.scss';

const PREMIUM_HINT = `Characters' memory is degrading. Upgrade to premium to have long term memory.`;
const DEFAULT_MESSAGES_COUNT = 15;

export default function Hint() {
  const [hidden, setHidden] = useState(false);
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const chatHistory = useAppSelector(selectChatHistory);
  const interactionsCount = chatHistory.filter((message) => message.type === 'interaction').length;

  if (interactionsCount < DEFAULT_MESSAGES_COUNT || isPremiumUser) {
    return null;
  }

  useEffect(() => {
    if (interactionsCount >= DEFAULT_MESSAGES_COUNT && interactionsCount % 5 === 0) {
      setHidden(false);
    }
  }, [interactionsCount]);

  return (
    <div
      className={`Hint ${hidden ? 'Hint--hidden' : ''}`}
      onClick={() => {
        setHidden(true);
      }}
    >
      <div className="Hint__content">
        <div className="Hint__icon">
          <GiLightBulb />
        </div>
        <div className="Hint__text">
          <span className="Hint__text-span">
            <span className="Hint__text-label">{PREMIUM_HINT}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
