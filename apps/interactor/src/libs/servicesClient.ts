export enum ModelType {
  RP = 'RP',
  RP_SMART = 'RP_SMART',
}

function getLastJsonObject(jsonString: string): Record<string, string> {
  // Regular expression to match JSON objects
  const regex = /{[^{}]*}/g
  const matches = jsonString.match(regex)

  if (matches && matches.length > 0) {
    // Parse the last matched JSON string
    try {
      return JSON.parse(matches[matches.length - 1])
    } catch (error) {
      throw 'Error parsing JSON:'
    }
  } else {
    throw 'No JSON objects found'
  }
}

class ServicesClient {
  private baseUrl: string

  constructor(params: { baseUrl: string }) {
    this.baseUrl = params.baseUrl
  }

  async *textCompletion({
    template,
    model,
    variables,
  }: {
    template: string
    model: ModelType
    variables: Record<string, string[] | string>
  }): AsyncGenerator<Map<string, string>> {
    try {
      const response = await fetch(this.baseUrl + '/text', {
        method: 'POST',
        body: JSON.stringify({
          model,
          template,
          variables,
        }),
        headers: {
          // Authorization: "Bearer sk-EMPTY",
          'Content-Type': 'application/json',
        },
      })
      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')

      const result = new Map<string, string>()
      let read
      while (!read || !read.done) {
        read = await reader?.read()
        if (read?.value) {
          const valueString = decoder.decode(read.value)
          const jsonObject = getLastJsonObject(valueString)
          Object.keys(jsonObject).forEach((key) =>
            result.set(key, jsonObject[key])
          )
          yield result
        }
      }
    } catch (error) {
      throw 'Error fetching data:' + error
    }
  }
}

export default new ServicesClient({
  baseUrl: 'http://localhost:8484',
})
