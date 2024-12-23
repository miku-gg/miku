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

    const allMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.filter((msg: ChatCompletionMessageParam) => msg.role !== 'system'),
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: allMessages,
      tools,
      parallel_tool_calls,
      tool_choice,
    });
    console.log(response);

    // Set headers explicitly
    res.setHeader('Content-Type', 'application/json');
    // Send the response
    res.write(JSON.stringify(response));
    res.end();
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).write(JSON.stringify({ error: 'Failed to process OpenAI request' }));
      res.end();
    }
  }
};

export default assistantHandler;
