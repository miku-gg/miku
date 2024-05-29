import { findLorebooks } from '../lorebookSearch'

const testChatToArray = [
  'I',
  'am',
  'hungry',
  'I',
  'want',
  'to',
  'eat',
  'food',
  'and',
  'drink',
  'water',
  'I',
  'want',
  'to',
  'go',
  'to',
  'the',
  'bathroom',
  'I',
  'want',
  'to',
  'go',
  'home',
]

const testLorebooks = [
  {
    keys: ['home', 'food'],
    content: 'This is a test lorebook entry',
  },
  {
    keys: ['bathroom'],
    content: 'This is another test lorebook entry',
  },
]

describe.only('test lorebook search', () => {
  it('should return search result', () => {
    const result = findLorebooks(testChatToArray, testLorebooks)
    expect(result).toEqual([
      {
        keys: ['home', 'food'],
        content: 'This is a test lorebook entry',
      },
    ])
  })
})
