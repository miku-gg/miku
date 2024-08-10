import { ModelType } from '../state/versioning';

function getLastJsonObject(jsonString: string): Record<string, string> {
  // Regular expression to match JSON objects
  const regex = /{[^{}]*}/g;
  const matches = jsonString.match(regex);

  if (matches && matches.length > 0) {
    // Parse the last matched JSON string
    try {
      return JSON.parse(matches[matches.length - 1]);
    } catch (error) {
      throw 'Error parsing JSON:';
    }
  } else {
    throw 'No JSON objects found';
  }
}

export const completionHistory: {
  model: string;
  template: string;
  variables: Record<string, string[] | string>;
  timestamp: number;
}[] = [];

const textCompletion = async function* ({
  serviceBaseUrl,
  template,
  model,
  variables,
  identifier,
}: {
  serviceBaseUrl: string;
  template: string;
  model: ModelType;
  variables: Record<string, string[] | string>;
  identifier: string;
}): AsyncGenerator<Map<string, string>> {
  try {
    completionHistory.push({
      model,
      template,
      variables,
      timestamp: Date.now(),
    });
    const response = await fetch(serviceBaseUrl + '/text', {
      method: 'POST',
      body: JSON.stringify({
        model,
        template,
        variables,
      }),
      headers: {
        'Content-Type': 'application/json',
        Identifier: identifier,
      },
      credentials: 'include',
    });
    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    const result = new Map<string, string>();
    let read;
    while (!read || !read.done) {
      read = await reader?.read();
      if (read?.value) {
        const valueString = decoder.decode(read.value);
        const jsonObject = getLastJsonObject(valueString);
        Object.keys(jsonObject).forEach((key) => result.set(key, jsonObject[key]));
        yield result;
      }
    }
  } catch (error) {
    throw 'Error fetching data:' + error;
  }
};

export default textCompletion;
