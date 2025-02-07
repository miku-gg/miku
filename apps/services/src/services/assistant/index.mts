import { Request, Response } from 'express';
import systemPrompt from './systemPrompt.mjs';
import { ChatCompletionMessageParam } from 'openai/resources/index.js';
import axios from 'axios';

interface ModerationResult {
  flagged: boolean;
  categories: {
    sexual: false;
    'sexual/minors': boolean;
    harassment: boolean;
    'harassment/threatening': boolean;
    hate: boolean;
    'hate/threatening': boolean;
    illicit: boolean;
    'illicit/violent': boolean;
    self_harm: boolean;
    self_harm_intent: boolean;
    self_harm_instructions: boolean;
    violence: boolean;
    violence_graphic: boolean;
  };
}

const assistantHandler = async (req: Request<any>, res: Response) => {
  const { messages, tools, parallel_tool_calls, tool_choice } = req.body;

  const allMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.filter((msg: ChatCompletionMessageParam) => msg.role !== 'system'),
  ];

  const moderation = await axios.post<ModerationResult>(
    'https://api.openai.com/v1/moderations',
    {
      model: 'omni-moderation-latest',
      input: allMessages,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const flagged = moderation.data?.flagged || moderation.data.categories['sexual/minors'];
  if (flagged) {
    return res.json({
      id: '',
      choices: [
        {
          message: {
            content: 'Error: Content was flagged as sensitive',
            role: 'assistant',
            refusal: 'Content was flagged as sensitive',
          },
        },
      ],
      created: 0,
      model: '',
      object: 'chat.completion',
    });
  }

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

  res.json(assitantResponse.data);
};

export default assistantHandler;
