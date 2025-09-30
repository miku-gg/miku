import React from 'react';
import { Rnd } from 'react-rnd';
import TTSPlayer from '../chat-box/TTSPlayer';
import { IoIosCloseCircleOutline } from "react-icons/io";
import './InnerThoughtsBox.scss';
import { useAppContext } from '../../App.context';

interface InnerThoughtsBoxProps {
  isVisible: boolean;
  thoughts: string;
  onClose?: () => void;
  className?: string;
}

const InnerThoughtsBox: React.FC<InnerThoughtsBoxProps> = ({
  isVisible,
  thoughts,
  onClose,
  className = '',
}) => {
  if (!isVisible) return null;

  const { isMobileApp } = useAppContext();

  return (
    <div className={`InnerThoughtsBox ${className}`}>
      <div className="InnerThoughtsBox__container">
        <div className="InnerThoughtsBox__header">
          <TTSPlayer text={thoughts || undefined} />
          {onClose && (
            <IoIosCloseCircleOutline 
              className="InnerThoughtsBox__close-button"
              onClick={onClose}
              aria-label="Close inner thoughts"
            />
          )}
        </div>
        <div className='InnerThoughtsBox__body'>
          <div className='InnerThoughtsBox__bg'></div>
          <div className="InnerThoughtsBox__content">
            {!thoughts ? (
              <p className="InnerThoughtsBox__empty">No thoughts generated.</p>
            ) : (
              isMobileApp || window.innerWidth < 1024 ? (
                <Rnd
                  className="InnerThoughtsBox__rnd"
                  bounds=".InnerThoughtsBox__content"
                  enableResizing={false}
                  dragAxis="y"
                  default={{
                    x: 0,
                    y: 0,
                    width: 'unset',
                    height: 120, 
                  }}
                >
                  <div className="InnerThoughtsBox__thoughts-text">
                    {thoughts}
                  </div>
                </Rnd>
              ) : (
                <div className="InnerThoughtsBox__thoughts-text">
                  {thoughts}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InnerThoughtsBox;
