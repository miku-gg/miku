import { cleanTTSText } from '../TTSOutputListener';

describe.only('CleanTTSText', () => {
  test('should transform *content* into (content)', () => {
    const inputText = 'This is a *test* message *test2*.';
    const expectedOutput = 'This is a (test) message (test2).';
    const actualOutput = cleanTTSText(inputText);
    expect(actualOutput).toEqual(expectedOutput);
  })
  test('should transform *content* into (content)', () => {
    const inputText = "Well, well. You're even cuter in person than I imagined. *I chuckle softly, trying to put him at ease.* Don't worry about it. We'll get started right away, alright? *I lead you over to a clear spot in the yard and sit down on a nearby stool.* First things first, let me take a look at your magic potential..\n\n Hmm.. interesting.. Your magic is quite strong for someone your age. It seems to be mostly focused on elemental manipulation, specifically water and wind. That's quite rare for someone so young.. *I frown slightly as I continue my examination of Anon's magical energy.* But there are some... irregularities as well.. Your control over both elements is rather unstable and erratic at times. It almost feels like you have trouble focusing your energy properly... Have you ever had any issues with concentration or focus before?";
    const expectedOutput = "Well, well. You're even cuter in person than I imagined. (I chuckle softly, trying to put him at ease.) Don't worry about it. We'll get started right away, alright? (I lead you over to a clear spot in the yard and sit down on a nearby stool.) First things first, let me take a look at your magic potential..\n\n Hmm.. interesting.. Your magic is quite strong for someone your age. It seems to be mostly focused on elemental manipulation, specifically water and wind. That's quite rare for someone so young.. (I frown slightly as I continue my examination of Anon's magical energy.) But there are some... irregularities as well.. Your control over both elements is rather unstable and erratic at times. It almost feels like you have trouble focusing your energy properly... Have you ever had any issues with concentration or focus before?";
    const actualOutput = cleanTTSText(inputText);
    expect(actualOutput).toEqual(expectedOutput);
  })
})