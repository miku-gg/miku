import { Loader } from '@mikugg/ui-kit';
import { useAppSelector } from '../../state/store';
import { FaCoins } from 'react-icons/fa6';
import './CreditsDisplayer.scss';
import { trackEvent } from '../../libs/analytics';

export default function CreditsDisplayer() {
  const { credits, loading } = useAppSelector((state) => state.settings.user);
  return (
    <span className="CreditsDisplayer">
      {loading ? (
        <Loader />
      ) : (
        <span>
          <a
            className="CreditsDisplayer__buy-more"
            href="https://emotions.miku.gg"
            target="_blank"
            onClick={() => trackEvent('credits-buy-click')}
          >
            Buy credits
          </a>
          {credits}{' '}
          <span className="CreditsDisplayer__coins">
            <FaCoins />
          </span>
        </span>
      )}
    </span>
  );
}
