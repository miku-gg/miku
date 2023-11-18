import Trie from '../_trie'; // replace './Trie' with the actual path of your Trie class

describe('Trie', () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
  });

  test('addPrefix should add numbers to the trie', () => {
    trie.addPrefix([1, 2, 3]);
    expect(trie.root.children.has(1)).toBeTruthy();
    expect(trie.root.children.get(1)?.children.has(2)).toBeTruthy();
    expect(trie.root.children.get(1)?.children.get(2)?.children.has(3)).toBeTruthy();
  });

  test('getNextChildren should return correct next children', () => {
    trie.addPrefix([1, 2, 3]);
    trie.addPrefix([1, 2, 4]);
    expect(trie.getNextChildren([1, 2])).toEqual([3, 4]);
  });

  test('getNextPrefix should return correct next prefix', () => {
    trie.addPrefix([1, 2, 3]);
    trie.addPrefix([1, 2, 3, 4]);
    expect(trie.getNextPrefix([1, 2])).toEqual([1, 2, 3]);
  });

  test('getNextPrefix should return correct next prefix', () => {
    trie.addPrefix([1, 2, 3, 4, 5]);
    trie.addPrefix([1, 2, 3, 4, 7]);
    expect(trie.getNextPrefix([1, 2])).toEqual([1, 2, 3, 4]);
  });

  test('getWord should return correct word until the end of the prefix', () => {
    trie.addPrefix([1, 2, 3]);
    trie.addPrefix([1, 2, 3, 4]);
    expect(trie.getWord([1, 2])).toEqual([1, 2, 3]);
  });

  test('getWord should return empty array if prefix not found', () => {
    trie.addPrefix([1, 2, 3]);
    expect(trie.getWord([4])).toEqual([]);
  });
});
