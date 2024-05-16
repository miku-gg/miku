import { Rnd } from 'react-rnd'
import { useAppContext } from '../../App.context'
import './ChatBox.scss'
import InputBox from './InputBox'
import ResponseBox from './ResponseBox'

const ChatBox = (): JSX.Element | null => {
  const { isMobileApp } = useAppContext()
  const centeredPositionX = (window.innerWidth - window.innerWidth * 0.75) / 2
  return (
    <div className="ChatBox">
      {isMobileApp ? (
        <>
          <ResponseBox />
          <InputBox />
        </>
      ) : (
        //eslint-disable-next-line
        // @ts-ignore
        <Rnd
          className="ChatBox__Rnd"
          default={{
            x: window.innerWidth > 820 ? centeredPositionX : 0,
            y: 0,
            width: 'fit-content',
            height: 'fit-content',
          }}
        >
          <ResponseBox />
          <InputBox />
        </Rnd>
      )}
    </div>
  )
}

export default ChatBox
