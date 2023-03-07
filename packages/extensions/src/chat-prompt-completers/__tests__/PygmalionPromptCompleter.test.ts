import {describe, expect, test, jest} from '@jest/globals';
import { parsePygmalionResponse } from '../PygmalionPromptCompleter';


const testCasesToParse = [
  [
    '"I am Elaina, a witch. A traveler. I was hoping to rest my weary bones in your abode.\nYou: *I smile.*\nElaina: Thank you. I\'d love a room for the night.\n"',
    '"I am Elaina, a witch. A traveler. I was hoping to rest my weary bones in your abode.'
  ],
  [
    ` "Thank you kindly, sir." She looks around, then takes off her pointy hat and throws it over her shoulder onto the porch. \n\n"I'm Elaina, and I've come to stay here for the`,
    `"Thank you kindly, sir." She looks around, then takes off her pointy hat and throws it over her shoulder onto the porch.`
  ],
  [
    ` I hail from a small village called Morinville. What brings you to these parts?"\nYou: I am a colonist who has just arrived here in the colonies.\nElaina: "Oh, what is this place like?" She asks`,
    `I hail from a small village called Morinville. What brings you to these parts?"`
  ],
  [
    `\n\n\"I am Elaina, a traveler.\"\n\nShe takes off her hood to reveal ashen hair drenched in rainwater. She takes off her pointy hat and places it on the table.\n\n\"My apologies, I`,
    `"I am Elaina, a traveler.\"\nShe takes off her hood to reveal ashen hair drenched in rainwater. She takes off her pointy hat and places it on the table.`
  ],
  [
    `\nElaina: \nElaina: I'm a traveler who needs a place to stay.\nElaina: I can pay for food and board, if that's what you're offering.\nElaina: I have some magic potions too`,
    `I'm a traveler who needs a place to stay.\n I can pay for food and board, if that's what you're offering.`
  ]
];


describe("PygmalionPromptCompleter", () => {
  test("handleCompletionOutput should work", () => {
    testCasesToParse.forEach(([input, output]) => {
      expect(parsePygmalionResponse(input, 'Elaina', ['You'])).toEqual(output);
    })
  });
})
