import { Request, Response } from 'express';
import systemPrompt from './systemPrompt.mjs';
import { ChatCompletionMessageParam } from 'openai/resources/index.js';
import axios from 'axios';

const assistantHandler = async (req: Request<any>, res: Response) => {
  const { messages, tools, parallel_tool_calls, tool_choice } = req.body;

  const allMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.filter((msg: ChatCompletionMessageParam) => msg.role !== 'system'),
  ];

  const assitantResponse = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: allMessages,
      tools,
      parallel_tool_calls,
      tool_choice,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );
  console.log(assitantResponse.data);
  // print currently sent headers
  console.log('headers', res.getHeaders());

  res.json(assitantResponse.data);
};

export default assistantHandler;
