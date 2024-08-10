import React from 'react';
import Tooltip from './Tooltip';
import './Blocks.scss';
import Loader from './Loader';
import { classnames } from '@bem-react/classnames';

export interface BlockProps {
  tooltipId?: string;
  items: {
    id: string;
    highlighted?: boolean;
    tooltip?: string;
    loading?: boolean;
    disabled?: boolean;
    onEditClick?: () => void;
    editIcon?: React.ReactNode;
    content:
      | { image: string }
      | {
          text: string;
          icon?: React.ReactNode;
        };
    onClick: () => void;
  }[];
}

const Blocks = ({ tooltipId, items }: BlockProps) => {
  return (
    <div className="Blocks">
      {items.map((item) => {
        const contentImage = item.content as {
          image: string;
          asBackground: boolean;
        };
        const contentText = item.content as {
          icon?: React.ReactNode;
          text: string;
        };
        const className = classnames(
          'Blocks__item',
          item.highlighted ? 'Blocks__item--highlighted' : null,
          item.onClick && !item.disabled ? 'Blocks__item--clickable' : null,
        );

        return (
          <div
            className={className}
            onClick={!item.disabled ? item.onClick : null}
            aria-disabled={item.disabled}
            key={item.id}
            data-tooltip-id={tooltipId ? `blocks-tooltip-${tooltipId}` : undefined}
            data-tooltip-html={item.tooltip}
            data-tooltip-varaint="dark"
            role="button"
            tabIndex={0}
          >
            {item.loading ? (
              <Loader />
            ) : (
              <>
                {contentImage.image ? <img src={contentImage.image} alt={item.tooltip} /> : null}
                {contentText.icon ? <div className="Blocks__item-icon">{contentText.icon}</div> : null}
                {contentText.text ? <div className="Blocks__item-text">{contentText.text}</div> : null}
                {item.editIcon ? (
                  <div
                    className="Blocks__item-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onEditClick?.();
                    }}
                  >
                    {item.editIcon}
                  </div>
                ) : null}
              </>
            )}
          </div>
        );
      })}
      {tooltipId ? <Tooltip id={`blocks-tooltip-${tooltipId}`} place="bottom" /> : null}
    </div>
  );
};

export default Blocks;
