interface LorebookEntry {
  keys: string[];
  content: string;
}

export const findLorebooksEntries = (messages: string[], entries: LorebookEntry[]): LorebookEntry[] => {
  const searchMessages = messages.map((message) => message.toLowerCase().replace(/[^a-z0-9\s']/g, ''));
  const maxKeys = entries.reduce((prev, cur) => Math.max(prev, cur.keys.length), 0);

  const resultEntries: LorebookEntry[] = [];

  for (let i = 0; i < maxKeys; i++) {
    const filteredEntries = entries.filter(
      (entry) => entry.keys[i] && searchMessages.find((message) => message.includes(entry.keys[i].toLowerCase())),
    );

    resultEntries.push(...filteredEntries);

    entries = entries.filter((entry) => !filteredEntries.includes(entry));
  }

  return resultEntries;
};
