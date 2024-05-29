import { findLorebooks } from '../lorebookSearch'

const testLorebooks = [
  {
    keys: ['home', 'food', 'hungry'],
    content: 'This is a test lorebook entry',
  },
  {
    keys: ['bathroom'],
    content: 'This is another test lorebook entry',
  },
]

describe.only('test lorebook search', () => {
  it('should return search result', () => {
    const result = findLorebooks(["I'm hungry"], testLorebooks)
    expect(result).toEqual([
      {
        keys: ['home', 'food', 'hungry'],
        content: 'This is a test lorebook entry',
      },
    ])
  })
})
