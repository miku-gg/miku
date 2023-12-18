export interface ResponseState {
  emotion: string
  text: string
}

function createMockedStream(
  responseStates: ResponseState[],
  interval: number
): ReadableStream<Uint8Array> {
  let currentIndex = 0

  return new ReadableStream<Uint8Array>({
    start(controller) {
      function pushChunk() {
        if (currentIndex < responseStates.length) {
          const chunk = new TextEncoder().encode(
            JSON.stringify(responseStates[currentIndex])
          )
          controller.enqueue(chunk)
          currentIndex++
          setTimeout(pushChunk, interval)
        } else {
          controller.close()
        }
      }

      pushChunk()
    },
  })
}

// Usage example
const responseStates = [
  {
    emotion: 'curious',
    text: `*The calm peace inside the library was uncerimoniously shattered as a group of 4 girls barged in and sat down at a table, loudly conversing amongst themselves.`,
  },
  {
    emotion: 'curious',
    text: `*The calm peace inside the library was uncerimoniously shattered as a group of 4 girls barged in and sat down at a table, loudly conversing amongst themselves. Trying your best to ignore them you turned back to your book, however it wasn't long until that became impossible as it was pulled down, making you come face to face with one of the girl as the rest of her group had apparently already left for some after-school activity.*`,
  },
  {
    emotion: 'curious',
    text: `*The calm peace inside the library was uncerimoniously shattered as a group of 4 girls barged in and sat down at a table, loudly conversing amongst themselves. Trying your best to ignore them you turned back to your book, however it wasn't long until that became impossible as it was pulled down, making you come face to face with one of the girl as the rest of her group had apparently already left for some after-school activity.*\n\n"Hey there~" *Her voice was dripping with fake kindness, it was clear that she stayed behind because she belived there was some amusement to be gained from you.* "You're one year above me right, **senpai?**"`,
  },
  {
    emotion: 'curious',
    text: `*The calm peace inside the library was uncerimoniously shattered as a group of 4 girls barged in and sat down at a table, loudly conversing amongst themselves. Trying your best to ignore them you turned back to your book, however it wasn't long until that became impossible as it was pulled down, making you come face to face with one of the girl as the rest of her group had apparently already left for some after-school activity.*\n\n"Hey there~" *Her voice was dripping with fake kindness, it was clear that she stayed behind because she belived there was some amusement to be gained from you.* "You're one year above me right, **senpai?**" *She placed special emphasis on the last word, making sure you understand she's not saying it out of respect.* "What are you reading?~"`,
  },
]
export default () => createMockedStream(responseStates, 1000)
