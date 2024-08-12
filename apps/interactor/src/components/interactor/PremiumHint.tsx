import { useEffect, useState } from 'react';
import { GoAlertFill } from 'react-icons/go';
import { selectChatHistory } from '../../state/selectors';
import { useAppSelector } from '../../state/store';
import './PremiumHint.scss';

const PREMIUM_HINT = `Characters' memory is degrading. Upgrade to premium to have enhanced memory.`;
const DEFAULT_MESSAGES_COUNT = 15;

export default function PremiumHint() {
  const [hidden, setHidden] = useState(false);
  const isPremiumUser = useAppSelector((state) => state.settings.user.isPremium);
  const chatHistory = useAppSelector(selectChatHistory);
  const interactionsCount = chatHistory.filter((message) => message.type === 'interaction').length;

  const speed = 5;
  const position = Math.max(PREMIUM_HINT.length + 10, 20);
  const animationDuration = Math.max(PREMIUM_HINT.length / speed, 3);

  if (interactionsCount < DEFAULT_MESSAGES_COUNT || isPremiumUser) {
    return null;
  }

  useEffect(() => {
    if (interactionsCount >= DEFAULT_MESSAGES_COUNT && interactionsCount % 2 === 0) {
      setHidden(false);
    }
  }, [interactionsCount]);

  return (
    <div
      className={`PremiumHint ${hidden ? 'PremiumHint--hidden' : ''}`}
      onClick={() => {
        setHidden(true);
      }}
    >
      <div className="PremiumHint__content">
        <div className="PremiumHint__icon">
          <GoAlertFill />
        </div>
        <div className="PremiumHint__text">
          <span className="Hint__text-span">
            <span
              className="PremiumHint__text-label"
              style={
                {
                  '--initial-text-position': `0`,
                  '--ending-text-position': `${-position}ch`,
                  '--animation-duration': `${animationDuration}s`,
                } as React.CSSProperties
              }
            >
              {PREMIUM_HINT}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
