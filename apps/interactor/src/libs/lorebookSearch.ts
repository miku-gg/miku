interface LorebookEntry {
  keys: string[]
  content: string
}

export const findLorebooks = (
  messages: string[],
  lorebooks: LorebookEntry[]
): LorebookEntry[] => {
  const searchKeys = messages
    .map((message) =>
      message
        .toLowerCase()
        .replace(/[^a-z0-9\s']/g, '')
        .split(' ')
    )
    .flat()
  const maxKeys = lorebooks.reduce(
    (prev, cur) => Math.max(prev, cur.keys.length),
    0
  )

  const resultLorebooks: LorebookEntry[] = []

  for (let i = 0; i < maxKeys; i++) {
    const filteredLorebooks = lorebooks.filter(
      (lorebook) => lorebook.keys[i] && searchKeys.includes(lorebook.keys[i])
    )

    resultLorebooks.push(...filteredLorebooks)

    lorebooks = lorebooks.filter(
      (lorebook) => !filteredLorebooks.includes(lorebook)
    )
  }

  return resultLorebooks
}
