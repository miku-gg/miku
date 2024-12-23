import { Request, Response } from 'express';
import systemPrompt from './systemPrompt.mjs';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantHandler = async (req: Request<any>, res: Response) => {
  try {
    const { messages, tools, parallel_tool_calls, tool_choice } = req.body;

    // Ensure the system prompt is first in the messages array

    // const allMessages: ChatCompletionMessageParam[] = [
    //   { role: 'system', content: systemPrompt },
    //   ...messages.filter((msg: ChatCompletionMessageParam) => msg.role !== 'system'),
    // ];

    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: allMessages,
    //   tools,
    //   parallel_tool_calls,
    //   tool_choice,
    // });
    // console.log(response);

    // res.status(200).json(response).end();
    res.status(200).json({ message: 'Hello, world!' }).end();
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: 'Failed to process OpenAI request' }).end();
  }
};

export default assistantHandler;
