import { useState } from 'react';
import { GiBrain } from 'react-icons/gi';
import { selectChatHistory } from '../../state/selectors';
import { useAppSelector } from '../../state/store';
import './PremiumHint.scss';

const PREMIUM_HINT = `Characters will forget old messages. Upgrade to premium for long term memory.`;
const DEFAULT_MESSAGES_COUNT = 15;

export default function PremiumHint() {
  const [hidden, setHidden] = useState(false);
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const chatHistory = useAppSelector(selectChatHistory);
  const interactionsCount = chatHistory.filter((message) => message.type === 'interaction').length;

  if (interactionsCount < DEFAULT_MESSAGES_COUNT || isPremiumUser) {
    return null;
  }

  return (
    <div
      className={`PremiumHint ${hidden ? 'PremiumHint--hidden' : ''}`}
      onClick={() => {
        setHidden(true);
      }}
    >
      <div className="PremiumHint__content">
        <div className="PremiumHint__icon">
          <GiBrain />
        </div>
        <div className="PremiumHint__text">
          <span className="Hint__text-span">
            <span className="PremiumHint__text-label">{PREMIUM_HINT}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
