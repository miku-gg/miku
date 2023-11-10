import {describe, expect, test} from '@jest/globals';
import { parsePygmalionResponse } from '../PygmalionPromptCompleter';


const testCasesToParse = [
  [
    'I am Elaina, a witch. A traveler. I was hoping to rest my weary bones in your abode.\nYou: *I smile.*\nElaina: Thank you. I\'d love a room for the night.\n"',
    'I am Elaina, a witch. A traveler. I was hoping to rest my weary bones in your abode.'
  ],
  [
    ` "Thank you kindly, sir." She looks around, then takes off her pointy hat and throws it over her shoulder onto the porch. \n\n"I'm Elaina, and I've come to stay here for the`,
    `"Thank you kindly, sir." She looks around, then takes off her pointy hat and throws it over her shoulder onto the porch.`
  ],
  [
    ` "I hail from a small village called Morinville. What brings you to these parts?"\nYou: I am a colonist who has just arrived here in the colonies.\nElaina: "Oh, what is this place like?" She asks`,
    `"I hail from a small village called Morinville. What brings you to these parts?"`
  ],
  [
    `\n\n"I am Elaina, a traveler."\n\nShe takes off her hood to reveal ashen hair drenched in rainwater. She takes off her pointy hat and places it on the table.\n\n\"My apologies, I`,
    `"I am Elaina, a traveler.\"\n\nShe takes off her hood to reveal ashen hair drenched in rainwater. She takes off her pointy hat and places it on the table.`
  ],
  [
    `\nElaina: \nElaina: I'm a traveler who needs a place to stay.\nElaina: I can pay for food and board, if that's what you're offering.\nElaina: I have some magic potions too`,
    `I'm a traveler who needs a place to stay.\n I can pay for food and board, if that's what you're offering.`
  ]
];


describe("PygmalionPromptCompleter", () => {
  test("Example cases should work", () => {
    testCasesToParse.forEach(([input, output]) => {
      expect(parsePygmalionResponse(input, 'Elaina', ['You'])).toEqual(output);
    })
  });

  test('should remove botSubject prefix', () => {
    const inputText = 'BotSubject: This is a test message.';
    const expectedOutput = 'This is a test message.';
    const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', []);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('should remove text after any stop', () => {
    const inputText = 'BotSubject: This is a test message. SubjectA: This should be removed.';
    const expectedOutput = 'This is a test message.';
    const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', ['SubjectA']);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('should remove 3 consecutive line breaks', () => {
    const inputText = 'BotSubject: This is a test message.\n\n\nAnother line.';
    const expectedOutput = 'This is a test message.';
    const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', []);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('should work with consecutive line breaks', () => {
    const inputText = ' This is a test message.\n\nAnother line.';
    const expectedOutput = 'This is a test message.\n\nAnother line.';
    const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', []);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('should remove leading and trailing whitespace', () => {
    const inputText = '  BotSubject: This is a test message.  ';
    const expectedOutput = 'This is a test message.';
    const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', []);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('should remove leading exclamation and question marks', () => {
    const inputText = 'BotSubject: This is a test message.';
    const expectedOutput = 'This is a test message.';
    const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', []);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test('should handle complex input', () => {
    const inputText = '  BotSubject: This is a test message.\n\nSubjectA: This should be removed.\nSubjectB: Also remove this.  ';
    const expectedOutput = 'This is a test message.';
    const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', ['SubjectA', 'SubjectB']);
    expect(actualOutput).toEqual(expectedOutput);
  });

  describe('should trim unfinished sentences', () => {
    test('should remove if finished with a number', () => {
      const inputText = ' This is a test message.\n\nThis is part 2. This is part 3';
      const expectedOutput = 'This is a test message.\n\nThis is part 2.';
      const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', ['SubjectA', 'SubjectB']);
      expect(actualOutput).toEqual(expectedOutput);
    });

    test('should remove if finished with a letter', () => {
      const inputText = ' This is a test message.\n\nThis is part a. This is part b';
      const expectedOutput = 'This is a test message.\n\nThis is part a.';
      const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', ['SubjectA', 'SubjectB']);
      expect(actualOutput).toEqual(expectedOutput);
    });
    
    test('should remove if finished with a letter', () => {
      const inputText = ` Meow, mistress... Meow... meow... meow..." She sobs brokenly between each word. "Me-me-meow..."`;
      const expectedOutput = `Meow, mistress... Meow... meow... meow..." She sobs brokenly between each word. "Me-me-meow..."`;
      const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', ['SubjectA', 'SubjectB']);
      expect(actualOutput).toEqual(expectedOutput);
    });

    test('should remove until it finish with a special char', () => {
      const testCases = [
        [
          ' This is a test message.\n\n*This is part a.*',
          'This is a test message.\n\n*This is part a.*'
        ],
        [
          ' This is a test message.\n\n"This is part a." I exclamed',
          'This is a test message.\n\n"This is part a."'
        ],
        [
          ' This is a test message.\n\nThis is part a. I exclamed',
          'This is a test message.\n\nThis is part a.'
        ],
        [
          ' This is a test message.\n\nThis is part a.\n I exclamed',
          'This is a test message.\n\nThis is part a.'
        ]
      ]
      for (const [inputText, expectedOutput] of testCases) {
        const actualOutput = parsePygmalionResponse(inputText, 'BotSubject', ['SubjectA', 'SubjectB']);
        expect(actualOutput).toEqual(expectedOutput);
      }
    });
  })
})
