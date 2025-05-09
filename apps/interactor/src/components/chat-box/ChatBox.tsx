import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { useAppContext } from '../../App.context';
import { useAppDispatch, useAppSelector } from '../../state/store';
import './ChatBox.scss';
import InputBox from './InputBox';
import ResponseBox from './ResponseBox';
import { ResponseFormat } from '../../state/slices/settingsSlice';
import { activateBattle } from '../../state/slices/narrationSlice';

const ChatBox = (): JSX.Element | null => {
  const { isMobileApp } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastTapTime, setLastTapTime] = useState<number>(0);

  const isDraggable = useAppSelector((state) => state.settings.chatBox.isDraggable);
  const centeredPositionX = (window.innerWidth - window.innerWidth * 0.75) / 2;
  const isVnStyle = useAppSelector((state) => state.settings.text.responseFormat === ResponseFormat.VNStyle);
  const currentBattle = useAppSelector((state) => state.narration.currentBattle);
  const dispatch = useAppDispatch();
  const handleTouch = () => {
    const currentTime = new Date().getTime();
    const tapTimeDiff = currentTime - lastTapTime;

    if (tapTimeDiff < 300 && tapTimeDiff > 0) {
      if (isVnStyle) {
        setIsExpanded(false);
      } else {
        setIsExpanded(!isExpanded);
      }
    }

    setLastTapTime(currentTime);
  };
  const inputboxNode =
    currentBattle && !currentBattle.isActive ? (
      <div className="ChatBox__start-battle-container">
        <button
          className="ChatBox__start-battle-button"
          onClick={() => {
            dispatch(activateBattle());
          }}
        >
          Start Battle
        </button>
      </div>
    ) : (
      <InputBox />
    );

  if (isMobileApp || window.innerWidth < 820) {
    return (
      <div className={`ChatBox ${isExpanded && !isVnStyle ? 'expanded' : ''}`} onTouchEnd={handleTouch}>
        <ResponseBox />
        {inputboxNode}
      </div>
    );
  } else {
    return (
      <div className="ChatBox">
        {/* eslint-disable-next-line  */}
        {/* @ts-ignore */}
        <Rnd
          className={`ChatBox__Rnd ${!isDraggable ? 'static' : ''}`}
          default={{
            x: window.innerWidth > 820 ? centeredPositionX : 0,
            y: 0,
            width: 'unset',
            height: '200px',
          }}
          disableDragging={!isDraggable || isMobileApp}
          enableResizing={isDraggable && !isMobileApp}
        >
          <ResponseBox />
          {inputboxNode}
        </Rnd>
      </div>
    );
  }
};

export default ChatBox;
