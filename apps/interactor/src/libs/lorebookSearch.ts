interface LorebookEntry {
  keys: string[]
  content: string
}

export const findLorebooks = (
  messages: string[],
  lorebooks: LorebookEntry[]
): LorebookEntry[] => {
  const allKeys: string[] = lorebooks.map((lorebook) => lorebook.keys).flat()
  let lorebookEntry: LorebookEntry[] = []
  //match allKeys on messages and return lorebookEntry
  for (let i = 0; i < messages.length; i++) {
    if (allKeys.includes(messages[i])) {
      lorebookEntry = lorebooks.filter((lorebook) =>
        lorebook.keys.includes(messages[i])
      )
    }
  }

  return lorebookEntry
}
