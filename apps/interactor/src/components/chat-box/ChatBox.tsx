import InputBox from './InputBox'
import ResponseBox from './ResponseBox'
import './ChatBox.scss'

const ChatBox = (): JSX.Element | null => {
  return (
    <div className="ChatBox">
      <ResponseBox />
      <InputBox />
    </div>
  )
}

export default ChatBox
