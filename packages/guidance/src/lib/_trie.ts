class TrieNode {
  children: Map<number, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map<number, TrieNode>();
    this.isEndOfWord = false;
  }
}

/**
 * Trie data structure for storing a list of numbers
 */
export default class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Add a prefix to the trie, a list of numbers
   *
   * @param prefix A list of numbers
   */
  addPrefix(prefix: number[]): void {
    let node = this.root;
    prefix.forEach((num) => {
      if (!node.children.has(num)) {
        node.children.set(num, new TrieNode());
      }
      node = node.children.get(num)!;
    });
    node.isEndOfWord = true;
  }

  /**
   * Get the next children of a prefix, a list of numbers
   *
   * @param prefix A list of numbers
   * @returns
   */
  getNextChildren(prefix: number[]): number[] {
    let node = this.root;
    for (const num of prefix) {
      if (node.children.has(num)) {
        node = node.children.get(num)!;
      } else {
        return []; // prefix not found
      }
    }
    return Array.from(node.children.keys());
  }

  /**
   * Returns the word until it find multiple children or isEndOfWord
   *
   * @param prefix A list of numbers
   * @returns
   */
  getNextPrefix(prefix: number[]): number[] {
    let node = this.root;
    const nextPrefix: number[] = [];
    for (const num of prefix) {
      if (node.children.has(num)) {
        nextPrefix.push(num);
        node = node.children.get(num)!;
      } else {
        return []; // prefix not found
      }
    }
    // continue until children > 1 or isEndOfWord
    while (node.children.size === 1 && !node.isEndOfWord) {
      const nextChild = Array.from(node.children.keys())[0];
      nextPrefix.push(nextChild);
      node = node.children.get(nextChild)!;
    }
    return nextPrefix;
  }

  /**
   * Returns the word until the end of the prefix, a list of numbers
   *
   * @param prefix A list of numbers
   * @returns
   */
  getWord(prefix: number[]): number[] {
    let node = this.root;
    const word: number[] = [];
    for (const num of prefix) {
      if (node.children.has(num)) {
        word.push(num);
        node = node.children.get(num)!;
      } else {
        return []; // prefix not found
      }
    }
    // cotinue to get the first child until the end of the word
    while (!node.isEndOfWord && node.children.size > 0) {
      const nextChild = Array.from(node.children.keys())[0];
      word.push(nextChild);
      node = node.children.get(nextChild)!;
    }
    return word;
  }
}
