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

  const moderation = await axios.post<{ results: ModerationResult[] }>(
    'https://api.openai.com/v1/moderations',
    {
      model: 'omni-moderation-latest',
      input: allMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n'),
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  // console.log(moderation.data?.results);
  const flagged = moderation.data?.results?.some((result) => result.flagged);
  if (flagged) {
    const categories = Object.keys(moderation.data?.results[0].categories || {});
    const flaggedCategories = categories.filter((category) => {
      return moderation.data?.results.some((result) => result.categories[category as keyof typeof result.categories]);
    });
    return res.json({
      id: '',
      choices: [
        {
          message: {
            content: `Content was flagged as sensitive: ${flaggedCategories.join(', ')}`,
            role: 'assistant',
            refusal: `Content was flagged as sensitive: ${flaggedCategories.join(', ')}`,
          },
        },
      ],
      created: 0,
      model: 'gpt-4o-mini',
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
