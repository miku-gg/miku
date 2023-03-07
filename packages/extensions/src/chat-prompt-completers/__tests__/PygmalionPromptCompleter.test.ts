import {describe, expect, test, jest} from '@jest/globals';
import { parsePygmalionResponse } from '../PygmalionPromptCompleter';


const testCasesToParse = [
  [
    '"I am Elaina, a witch. A traveler. I was hoping to rest my weary bones in your abode.\nYou: *I smile.*\nElaina: Thank you. I\'d love a room for the night.\n"',
    'I am Elaina, a witch. A traveler. I was hoping to rest my weary bones in your abode.'
  ]
];


describe("PygmalionPromptCompleter", () => {
  test("handleCompletionOutput should work", () => {
    testCasesToParse.forEach(([input, output]) => {
      expect(parsePygmalionResponse(input, 'Elaina', ['You'])).toEqual(output);
    })
  });
})
