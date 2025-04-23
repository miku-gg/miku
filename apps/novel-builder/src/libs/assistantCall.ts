import {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatCompletionToolChoiceOption,
} from 'openai/src/resources/index.js';
import axios from 'axios';

import { SERVICES_ENDPOINT } from './utils';

export type FunctionHandler = (...args: any[]) => Promise<string>;

export type FunctionAction = 'created' | 'updated' | 'removed' | 'connected' | 'deleted';

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: FunctionHandler;
  displayData:
    | { isSetter: false }
    | {
        isSetter: true;
        action: FunctionAction;
        subject: string;
      };
}

export const callChatCompletion = async (
  messages: ChatCompletionMessageParam[],
  tools: { type: 'function'; function: FunctionDefinition }[],
  parallel_tool_calls: boolean,
  tool_choice: ChatCompletionToolChoiceOption,
): Promise<ChatCompletion> => {
  const response = await axios.post(
    SERVICES_ENDPOINT + '/assistant',
    {
      messages,
      tools: tools.map((tool) => ({
        type: 'function',
        function: {
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        },
      })),
      parallel_tool_calls,
      tool_choice,
    },
    {
      method: 'POST',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status !== 200) {
    throw new Error('Failed to get completion from proxy');
  }

  return response.data;
};
