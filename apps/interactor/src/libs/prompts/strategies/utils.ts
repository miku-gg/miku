import trim from 'lodash.trim';

export const replaceAll = function (text: string, search: string | RegExp, replacement: string): string {
  // If the search parameter is a string, escape any special characters
  const searchPattern = typeof search === 'string' ? search.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') : search.source;

  // Create a regular expression with the global flag
  const regex = new RegExp(searchPattern, 'g');

  // Perform the replacement and return the result
  return text.replace(regex, replacement);
};

export const fillTextTemplate = (
  text: string,
  { user, bot, characters }: { user: string; bot: string; characters?: Record<string, string> },
): string => {
  text = replaceAll(text, '{{char}}', bot);
  text = replaceAll(text, '{{Char}}', bot);
  text = replaceAll(text, '{{CHAR}}', bot);
  text = replaceAll(text, '<CHAR>', bot);
  text = replaceAll(text, '<BOT>', bot);
  text = replaceAll(text, '{{BOT}}', bot);
  text = replaceAll(text, '{{bot}}', bot);
  text = replaceAll(text, '{{Bot}}', bot);

  text = replaceAll(text, '{{user}}', user);
  text = replaceAll(text, '{{User}}', user);
  text = replaceAll(text, '{{USER}}', user);
  text = replaceAll(text, '<USER>', user);
  text = replaceAll(text, '<User>', user);

  if (characters) {
    Object.keys(characters).forEach((id) => {
      text = replaceAll(text, `{{${id}}}`, characters[id]);
    });
  }

  return text;
};

const buildTextStops = (character: string = ''): string[] => {
  // const subjects: string[] = _subjects.map((subject) => `${subject}:`)
  return [
    '<|endoftext|>',
    '<START>',
    'USER:',
    '\n\n\n',
    '###',
    '<|user|>',
    '<|model|>',
    '<|system|>',
    '<|im_end|>',
    '<|im_start|>',
    'INST',
    ...(character
      ? [`\n${character}'s reaction:`, `\n${character}:`, `\n*${character}:`, `\n*${character}'s reaction:`]
      : []),
  ];
};

export const hasTextStop = (text: string, character = ''): boolean => {
  const stops = buildTextStops(character);
  return stops.reduce((prev, cur) => {
    return prev || text.includes(cur);
  }, false);
};

export const parseLLMResponse = (text: string, character = ''): string => {
  const hasStop = hasTextStop(text, character);
  const removeLastLineBreak = (text: string): string => {
    return text[text.length - 1] === '\n' ? text.substring(0, text.length - 1) : text;
  };

  text = trim(text);
  if (hasStop) {
    const stops = buildTextStops(character);
    const firstStopIndex = stops.reduce((prev, cur) => {
      const subjectTextIndex = text.indexOf(cur);
      return subjectTextIndex === -1 ? prev : Math.min(prev, subjectTextIndex);
    }, text.length);
    if (firstStopIndex !== text.length) {
      text = text.substring(0, firstStopIndex);
      text = removeLastLineBreak(text);
    }
  } else {
    text = trim(text);
    text = removeLastLineBreak(text);
  }

  text = trim(text);
  let _text = text;
  // remove last a special char is present [".", "*", '"', "!", "?"]
  for (let i = 0; i < text.length; i++) {
    const char = text[text.length - 1 - i];
    if (!['.', '*', '"', '!', '?'].includes(char)) {
      _text = _text.substring(0, _text.length - 1);
    } else {
      break;
    }
  }
  if (_text.length > 2) {
    text = _text;
    const lastChar = text[text.length - 1];
    const prevLastChar = text[text.length - 2];
    if (['*', '"'].includes(lastChar) && ['\n', ' '].includes(prevLastChar)) {
      text = text.substring(0, text.length - 1);
    }
  }

  text = trim(text);
  text = trim(text, '\n');
  return text;
};
