import { Rnd } from 'react-rnd';
import { useAppContext } from '../../App.context';
import { useAppSelector } from '../../state/store';
import './ChatBox.scss';
import InputBox from './InputBox';
import ResponseBox from './ResponseBox';

const ChatBox = (): JSX.Element | null => {
  const { isMobileApp } = useAppContext();
  const isDraggable = useAppSelector((state) => state.settings.chatBox.isDraggable);
  const centeredPositionX = (window.innerWidth - window.innerWidth * 0.75) / 2;

  if (isMobileApp || window.innerWidth < 820) {
    return (
      <div className="ChatBox">
        <ResponseBox />
        <InputBox />
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
          <InputBox />
        </Rnd>
      </div>
    );
  }
};

export default ChatBox;
