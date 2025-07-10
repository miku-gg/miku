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

  // console.log(
  //   {
  //     model: process.env.ASSISTANT_API_MODEL || '',
  //     messages: allMessages,
  //     tools,
  //     parallel_tool_calls,
  //     tool_choice,
  //   },
  //   {
  //     headers: {
  //       Authorization: `Bearer ${process.env.ASSISTANT_API_KEY}`,
  //       'Content-Type': 'application/json',
  //     },
  //   },
  // );
  const assitantResponse = await axios
    .post(
      `${process.env.ASSISTANT_API_ENDPOINT || ''}/chat/completions`,
      {
        model: process.env.ASSISTANT_API_MODEL || '',
        messages: allMessages,
        tools,
        parallel_tool_calls,
        tool_choice,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ASSISTANT_API_KEY}`,
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
