export const replaceAll = function (
  text: string,
  search: string | RegExp,
  replacement: string
): string {
  // If the search parameter is a string, escape any special characters
  const searchPattern =
    typeof search === 'string'
      ? search.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
      : search.source

  // Create a regular expression with the global flag
  const regex = new RegExp(searchPattern, 'g')

  // Perform the replacement and return the result
  return text.replace(regex, replacement)
}

export const fillTextTemplate = (
  text: string,
  { user, bot }: { user: string; bot: string }
): string => {
  text = replaceAll(text, '{{char}}', bot)
  text = replaceAll(text, '{{Char}}', bot)
  text = replaceAll(text, '{{CHAR}}', bot)
  text = replaceAll(text, '<CHAR>', bot)
  text = replaceAll(text, '<BOT>', bot)
  text = replaceAll(text, '{{BOT}}', bot)
  text = replaceAll(text, '{{bot}}', bot)
  text = replaceAll(text, '{{Bot}}', bot)

  text = replaceAll(text, '{{user}}', user)
  text = replaceAll(text, '{{User}}', user)
  text = replaceAll(text, '{{USER}}', user)
  text = replaceAll(text, '<USER>', user)
  text = replaceAll(text, '<User>', user)
  return text
}
