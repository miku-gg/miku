import React, { useEffect, useState } from 'react'
import './TextFormatter.scss'
import { useAppSelector } from '../../state/store'
import { FontSize, Speed } from '../../state/versioning'
import classNames from 'classnames'

interface TextFormatterProps {
  text: string
}

export const TextFormatterStatic: React.FC<TextFormatterProps> = ({ text }) => {
  const fontSize = useAppSelector((state) => state.settings.text.fontSize)
  const textFormatterDiv = React.useRef<HTMLDivElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)
  const elements: JSX.Element[] = []
  let buffer = ''
  const stack: ('em' | 'q')[] = []

  const flushBuffer = (endTag?: 'em' | 'q') => {
    if (buffer) {
      let element: JSX.Element = <span key={elements.length}>{buffer}</span>

      if (!stack.length) {
        // Wrap in <p> if not within em or q
        element = <p key={elements.length}>{buffer}</p>
      }

      while (stack.length) {
        const tag = stack.pop()
        if (tag === 'em') {
          element = <em key={elements.length}>{element}</em>
        } else if (tag === 'q') {
          element = <q key={elements.length}>{element}</q>
        }
        if (tag === endTag) break
      }

      elements.push(element)
      buffer = ''
    }
  }

  for (const char of text) {
    switch (char) {
      case '*':
        if (stack[stack.length - 1] === 'em') {
          flushBuffer('em')
        } else {
          flushBuffer()
          stack.push('em')
        }
        break
      case '"':
        if (stack[stack.length - 1] === 'q') {
          flushBuffer('q')
        } else {
          flushBuffer()
          stack.push('q')
        }
        break
      case '\n':
        flushBuffer()
        elements.push(<br key={elements.length} />)
        break
      default:
        buffer += char
    }
  }

  flushBuffer() // Flush remaining buffer

  useEffect(() => {
    if (textFormatterDiv.current) {
      if (
        textFormatterDiv.current.scrollHeight <=
        textFormatterDiv.current.clientHeight
      ) {
        setUserScrolled(false)
      } else if (!userScrolled) {
        textFormatterDiv.current.scrollTop =
          textFormatterDiv.current.scrollHeight
      }
    }
  }, [text, userScrolled])

  return (
    <div
      className={classNames({
        'TextFormatter scrollbar': true,
        [`TextFormatter--small`]: FontSize.Small === fontSize,
        [`TextFormatter--large`]: FontSize.Large === fontSize,
      })}
      ref={textFormatterDiv}
      onScroll={(event) => {
        if (
          (textFormatterDiv.current?.scrollTop || 0) +
            (textFormatterDiv.current?.clientHeight || 0) <
          event.currentTarget.scrollHeight
        ) {
          setUserScrolled(true)
        }
      }}
    >
      {elements}
    </div>
  )
}

const SpeedToMs = new Map<Speed, number>([
  [Speed.Presto, 2],
  [Speed.Fast, 10],
  [Speed.Normal, 20],
  [Speed.Slow, 30],
])

const TextFormatter: React.FC<TextFormatterProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const speed = useAppSelector((state) => state.settings.text.speed)

  useEffect(() => {
    if (!text.startsWith(displayedText)) {
      if (displayedText.startsWith(text)) {
        setDisplayedText(text)
        setCurrentIndex(text.length)
      } else {
        setDisplayedText('')
        setCurrentIndex(0)
      }
    }
  }, [text, displayedText])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prevText) => prevText + text[currentIndex])
        setCurrentIndex(currentIndex + 1)
      }, SpeedToMs.get(speed)) // Set typing speed here

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed])

  return <TextFormatterStatic text={displayedText} />
}

export default TextFormatter
