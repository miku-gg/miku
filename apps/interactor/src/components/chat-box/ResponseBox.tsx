import { useEffect, useRef } from 'react'
import { selectLastLoadedCharacters } from '../../state/selectors'
import { useAppSelector } from '../../state/store'
import TextFormatter from '../common/TextFormatter'
import './ResponseBox.scss'

const ResponseBox = (): JSX.Element | null => {
  const responseDiv = useRef<HTMLDivElement>(null)
  const lastCharacters = useAppSelector(selectLastLoadedCharacters)

  useEffect(() => {
    if (responseDiv.current) {
      responseDiv.current.scrollTop = responseDiv.current.scrollHeight
    }
  }, [lastCharacters])

  if (!lastCharacters.length) {
    return null
  }

  return (
    <div className="ResponseBox" ref={responseDiv}>
      <TextFormatter text={lastCharacters[0].text} />
    </div>
  )
}

export default ResponseBox
