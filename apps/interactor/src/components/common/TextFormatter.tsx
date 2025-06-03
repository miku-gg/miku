import classNames from 'classnames';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GiFastForwardButton } from 'react-icons/gi';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { FontSize, Speed } from '../../state/versioning';
import { ShareConversation } from '../chat-box/ShareConversation';
import './TextFormatter.scss';
import { ResponseFormat } from '../../state/slices/settingsSlice';
import { setDisplayingLastSentence } from '../../state/slices/settingsSlice';

interface TextFormatterProps {
  text: string;
  children?: React.ReactNode;
  noAnimation?: boolean;
  doNotSplit?: boolean;
}

interface TextElement {
  text: string;
  type: 'dialogue' | 'description' | 'paragraph' | 'newline';
}

const parseTextElements = (text: string): TextElement[] => {
  const elements: TextElement[] = [];
  let buffer = '';
  const stack: ('em' | 'q')[] = [];

  const flushBuffer = (endTag?: 'em' | 'q') => {
    if (buffer) {
      let type: 'description' | 'dialogue' | 'paragraph' = 'paragraph';
      if (stack.includes('q')) {
        type = 'dialogue';
      }
      if (stack.includes('em')) {
        type = 'description';
      }
      elements.push({ text: buffer, type });
      buffer = '';
    }
    if (endTag) {
      const index = stack.lastIndexOf(endTag);
      if (index !== -1) {
        stack.splice(index, 1);
      }
    }
  };

  for (const char of text) {
    switch (char) {
      case '*':
        if (stack[stack.length - 1] === 'em') {
          flushBuffer('em');
        } else {
          flushBuffer();
          stack.push('em');
        }
        break;
      case '"':
        if (stack[stack.length - 1] === 'q') {
          flushBuffer('q');
        } else {
          flushBuffer();
          stack.push('q');
        }
        break;
      case '\n':
        flushBuffer();
        elements.push({ text: '\n', type: 'newline' });
        break;
      default:
        buffer += char;
    }
  }

  flushBuffer(); // Flush remaining buffer

  // After parsing the elements, further split them into sentences
  const sentenceElements: TextElement[] = [];
  elements.forEach((element) => {
    if (element.type !== 'newline') {
      // Split text into sentences
      const sentences = element.text.match(/[^.!?]+[.!?]*/g) || [element.text];
      sentences.forEach((sentence) => {
        sentenceElements.push({ text: sentence.trim(), type: element.type });
      });
    } else {
      sentenceElements.push(element);
    }
  });

  return sentenceElements;
};

// Existing SpeedToMs Map
const SpeedToMs = new Map<Speed, number>([
  [Speed.Presto, 2],
  [Speed.Fast, 10],
  [Speed.Normal, 20],
  [Speed.Slow, 30],
]);

// Custom hook to animate text
const useAnimatedText = (text: string) => {
  const speed = useAppSelector((state) => state.settings.text.speed);
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const previousTextRef = useRef('');

  useEffect(() => {
    if (text.startsWith(previousTextRef.current)) {
      // If the new text is an extension of the previous text,
      // continue from where we left off
      setCurrentCharIndex(previousTextRef.current.length);
      setDisplayedText(previousTextRef.current);
    } else {
      // If it's a completely new text, reset animation
      setDisplayedText('');
      setCurrentCharIndex(0);
    }
    previousTextRef.current = text;
  }, [text]);

  useEffect(() => {
    if (currentCharIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(() => text.slice(0, currentCharIndex + 1));
        setCurrentCharIndex(currentCharIndex + 1);
      }, SpeedToMs.get(speed) || 20);

      return () => clearTimeout(timer);
    }
  }, [currentCharIndex, text, speed]);

  const isAnimationComplete = currentCharIndex >= text.length;

  const skipAnimation = () => {
    setDisplayedText(text);
    setCurrentCharIndex(text.length);
  };

  return { displayedText, isAnimationComplete, skipAnimation };
};

export const TextFormatterStatic: React.FC<TextFormatterProps> = ({ text, children, noAnimation, doNotSplit }) => {
  const fontSize = useAppSelector((state) => state.settings.text.fontSize);
  const textFormatterDiv = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const { displayedText, isAnimationComplete, skipAnimation } = useAnimatedText(text);

  const elements = useMemo(() => {
    if (doNotSplit) {
      return <q key={0}>{displayedText}</q>;
    }
    const parsedElements = parseTextElements(displayedText);
    return parsedElements.map((element, index) => {
      if (element.type === 'dialogue') {
        return <q key={index}>{element.text}</q>;
      } else if (element.type === 'description') {
        return <em key={index}>{element.text}</em>;
      } else if (element.type === 'newline') {
        return <br key={index} />;
      } else if (element.type === 'paragraph') {
        return <p key={index}>{element.text}</p>;
      } else {
        return <span key={index}>{element.text}</span>;
      }
    });
  }, [displayedText]);

  useEffect(() => {
    if (noAnimation) {
      skipAnimation();
    }
  }, [noAnimation, skipAnimation]);

  useEffect(() => {
    if (textFormatterDiv.current) {
      if (textFormatterDiv.current.scrollHeight <= textFormatterDiv.current.clientHeight) {
        setUserScrolled(false);
      } else if (!userScrolled) {
        textFormatterDiv.current.scrollTop = textFormatterDiv.current.scrollHeight;
      }
    }
  }, [displayedText, userScrolled]);

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
          (textFormatterDiv.current?.scrollTop || 0) + (textFormatterDiv.current?.clientHeight || 0) <
          event.currentTarget.scrollHeight
        ) {
          setUserScrolled(true);
        }
      }}
    >
      <ShareConversation>
        <>
          {elements}
          {isAnimationComplete && children}
        </>
      </ShareConversation>
    </div>
  );
};

export const TextFormatter: React.FC<TextFormatterProps> = ({ text, children }) => {
  const responseFormat = useAppSelector((state) => state.settings.text.responseFormat);

  if (responseFormat === ResponseFormat.VNStyle) {
    return <VNStyleTextFormatter text={text} children={children} />;
  } else {
    return <TextFormatterStatic text={text} children={children} />;
  }
};
interface VNStyleTextFormatterProps extends TextFormatterProps {
  onIsLastElementChanged?: (isLastElement: boolean) => void;
}

const VNStyleTextFormatter: React.FC<VNStyleTextFormatterProps> = ({ text, children }) => {
  const fontSize = useAppSelector((state) => state.settings.text.fontSize);
  const isInputDisabled = useAppSelector((state) => state.narration.input.disabled);
  const dispatch = useAppDispatch();

  const elements = useMemo(() => {
    // Parse and filter out newline and empty elements
    return parseTextElements(text).filter((element) => element.type !== 'newline' && element.text.trim() !== '');
  }, [text]);

  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const currentElement = elements[currentElementIndex];

  const { displayedText, isAnimationComplete, skipAnimation } = useAnimatedText(currentElement?.text || '');

  const previousTextRef = useRef<string>('');

  useEffect(() => {
    if (!text.startsWith(previousTextRef.current)) {
      // Reset to first element
      setCurrentElementIndex(0);
    }
    previousTextRef.current = text;
  }, [text]);

  const handleAdvanceClick = () => {
    if (isAnimationComplete) {
      if (currentElementIndex < elements.length - 1) {
        setCurrentElementIndex(currentElementIndex + 1);
      }
    } else {
      // Skip animation
      skipAnimation();
    }
  };

  const handleBackClick = () => {
    if (currentElementIndex > 0) {
      setCurrentElementIndex(currentElementIndex - 1);
    }
  };

  const isFirstElement = currentElementIndex === 0;
  const isLastElement = currentElementIndex === elements.length - 1;

  useEffect(() => {
    // Update to use the new state name
    dispatch(setDisplayingLastSentence(!isLastElement || !isAnimationComplete));
  }, [isLastElement, isAnimationComplete, dispatch]);

  return (
    <div
      className={classNames({
        TextFormatter: true,
        [`TextFormatter--small`]: FontSize.Small === fontSize,
        [`TextFormatter--large`]: FontSize.Large === fontSize,
      })}
    >
      {/* Display current element */}
      {currentElement && (
        <div className="TextFormatter__content">
          {currentElement.type === 'dialogue' ? (
            <q>{displayedText}</q>
          ) : currentElement.type === 'description' ? (
            <em>{displayedText}</em>
          ) : (
            <p>{displayedText}</p>
          )}
        </div>
      )}
      {isInputDisabled && isLastElement ? <em className="elipsisLoading"></em> : null}

      {/* Show 'Back' button if not first element */}
      {!isFirstElement && (
        <button className="TextFormatter__back-button" onClick={handleBackClick}>
          <GiFastForwardButton />
        </button>
      )}

      {/* Show 'Advance' button unless on the last element and animation is complete */}
      {!(isLastElement && isAnimationComplete) && (
        <button className="TextFormatter__advance-button" onClick={handleAdvanceClick}>
          <GiFastForwardButton />
        </button>
      )}

      {/* Show children after last element and animation complete */}
      {isAnimationComplete && isLastElement && children}
    </div>
  );
};

export default TextFormatter;
