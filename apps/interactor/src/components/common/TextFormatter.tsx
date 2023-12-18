import React, { useEffect, useState } from 'react'
import './TextFormatter.scss'

interface TextFormatterProps {
  text: string
}

const TextFormatterStatic: React.FC<TextFormatterProps> = ({ text }) => {
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
      className="TextFormatter scrollbar"
      ref={textFormatterDiv}
      onScroll={(event) => {
        console.log(
          (textFormatterDiv.current?.scrollTop || 0) +
            (textFormatterDiv.current?.clientHeight || 0),
          textFormatterDiv.current?.scrollHeight
        )
        if (
          (textFormatterDiv.current?.scrollTop || 0) +
            (textFormatterDiv.current?.clientHeight || 0) <
          event.currentTarget.scrollHeight
        ) {
          setUserScrolled(true)
        }
      }}
      onMouseDown={() => {
        console.log('mouse down')
      }}
    >
      {elements}
    </div>
  )
}

const TextFormatter: React.FC<TextFormatterProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!text.startsWith(displayedText)) {
      setDisplayedText('')
      setCurrentIndex(0)
    }
  }, [text, displayedText])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prevText) => prevText + text[currentIndex])
        setCurrentIndex(currentIndex + 1)
      }, 10) // Set typing speed here

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text])

  return <TextFormatterStatic text={displayedText} />
}

export default TextFormatter
