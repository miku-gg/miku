import { Tooltip } from '@mikugg/ui-kit';
import { FaCrown } from 'react-icons/fa';
import './PremiumBadge.scss';

interface PremiumBadgeProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  showTooltip?: boolean;
  tooltipText?: string;
}

export const PremiumBadge = ({
  className = '',
  position = 'top-right',
  showTooltip = true,
  tooltipText = 'Premium only (more than two characters)',
}: PremiumBadgeProps) => {
  const tooltipId = `premium-badge-tooltip-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={`PremiumBadge PremiumBadge--${position} ${className}`}
      {...(showTooltip && {
        'data-tooltip-id': tooltipId,
        'data-tooltip-content': tooltipText,
      })}
    >
      <FaCrown className="PremiumBadge__icon" />
      {showTooltip && <Tooltip id={tooltipId} place="top" />}
    </div>
  );
};
