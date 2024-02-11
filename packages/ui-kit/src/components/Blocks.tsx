import React from 'react';
import Tooltip from './Tooltip';
import './Blocks.scss';
import Loader from './Loader';

export interface BlockProps {
  tooltipId?: string;
  items: {
    id: string;
    tooltip?: string;
    loading?: boolean;
    disabled?: boolean;
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
        return (
          <div
            className="Blocks__item"
            onClick={!item.disabled ? item.onClick : null}
            aria-disabled={item.disabled}
            key={item.id}
            data-tooltip-id={
              tooltipId ? `blocks-tooltip-${tooltipId}` : undefined
            }
            data-tooltip-html={item.tooltip}
            data-tooltip-varaint="dark"
            role="button"
            tabIndex={0}
          >
            {item.loading ? (
              <Loader />
            ) : (
              <>
                {contentImage.image ? (
                  <img src={contentImage.image} alt={item.tooltip} />
                ) : null}
                {contentText.icon ? (
                  <div className="Blocks__item-icon">{contentText.icon}</div>
                ) : null}
                {contentText.text ? (
                  <div className="Blocks__item-text">{contentText.text}</div>
                ) : null}
              </>
            )}
          </div>
        );
      })}
      {tooltipId ? (
        <Tooltip id={`blocks-tooltip-${tooltipId}`} place="bottom" />
      ) : null}
    </div>
  );
};

export default Blocks;
