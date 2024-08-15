import { findLorebooksEntries } from '../lorebookSearch';

const testLorebooks = [
  {
    keys: ['home', 'food', 'hungry'],
    content: 'This is a test lorebook entry',
  },
  {
    keys: ['bathroom'],
    content: 'This is another test lorebook entry',
  },
];

describe('test lorebook search', () => {
  it('should return search result', () => {
    const result = findLorebooksEntries(["I'm hungry"], testLorebooks);
    expect(result).toEqual([
      {
        keys: ['home', 'food', 'hungry'],
        content: 'This is a test lorebook entry',
      },
    ]);
  });
});
