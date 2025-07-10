import { Request, Response } from 'express';
import systemPrompt from './systemPrompt.mjs';
import { ChatCompletionMessageParam } from 'openai/resources/index.js';
import axios from 'axios';
import modelServerSettingsStore from '../text/lib/modelServerSettingsStore.mjs';

const assistantHandler = async (req: Request<any>, res: Response) => {
  const { messages, tools, parallel_tool_calls, tool_choice } = req.body;

  const allMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.filter((msg: ChatCompletionMessageParam) => msg.role !== 'system'),
  ];
  const modelConfig = modelServerSettingsStore.getNovelAssistant();
  const { url, api_key, model } = modelConfig.endpoint;
  const assitantResponse = await axios
    .post(
      `${url}/chat/completions`,
      {
        model,
        messages: allMessages,
        tools,
        parallel_tool_calls,
        tool_choice,
      },
      {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      },
    )
    .catch((e) => {
      // check the body of the error axios response
      console.log(e.response.data);
      throw e;
    });
  // console.log(assitantResponse.data.error);

  res.json(assitantResponse.data);
};

export default assistantHandler;
