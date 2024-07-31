import { Request, Response } from 'express';
import * as Guidance from '@mikugg/guidance';
import { presets } from './data/presets.mjs';
import { GuidanceQuery, validateGuidanceQuery } from './lib/queryValidation.mjs';
import { TokenizerType, tokenizers } from './lib/tokenize.mjs';
import modelServerSettingsStore from './lib/modelServerSettingsStore.mjs';

const getTokenizer = (_tokenizer: string): Guidance.Tokenizer.AbstractTokenizer => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (_tokenizer === 'mistral') return tokenizers.get(TokenizerType.MISTRAL)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (_tokenizer === 'solar') return tokenizers.get(TokenizerType.SOLAR)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (_tokenizer === 'llama3') return tokenizers.get(TokenizerType.LLAMA_3)!;
  if (_tokenizer === 'wizardlm2')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return tokenizers.get(TokenizerType.WIZARDLM2)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (_tokenizer === 'cohere') return tokenizers.get(TokenizerType.COHERE)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return tokenizers.get(TokenizerType.LLAMA_2)!;
};

export default async (req: Request<string>, res: Response) => {
  const guidanceQuery: GuidanceQuery = req.body;
  validateGuidanceQuery(guidanceQuery);
  const models = modelServerSettingsStore.getRPModels();
  const modelSettings = models.find((model) => model.id === guidanceQuery.model);
  if (!modelSettings) {
    throw { message: 'Model not found.', status: 404 };
  }
  const templateProcessor = new Guidance.Template.TemplateProcessor(
    getTokenizer(modelSettings.tokenizer),
    new Guidance.TokenGenerator.OpenAITokenGenerator(
      {
        apiKey: modelSettings.endpoint.api_key,
        baseURL: modelSettings.endpoint.url,
        model: modelSettings.endpoint.model,
      },
      {},
      {
        ...presets.get(modelSettings.preset),
        max_tokens: modelSettings.new_tokens,
        truncation_length: modelSettings.truncation_length,
      },
    ),
  );
  const stream = templateProcessor.processTemplateStream(
    guidanceQuery.template,
    new Map(Object.entries(guidanceQuery.variables || {})),
    {
      headers: {
        chatid: String(req.headers.identifier || Date.now().toString()),
      },
    },
  );
  if (!stream) {
    throw { message: 'Error completing guidance.', status: 500 };
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.write(JSON.stringify({}));
  for await (const result of stream) {
    const keys = Array.from(result.keys());
    const values = Array.from(result.values());
    const json: Record<string, string> = {};
    for (let i = 0; i < keys.length; i++) {
      json[keys[i]] = values[i];
    }
    res.write(JSON.stringify(json));
  }
  res.end();
};

export const tokenizeHandler = async (req: Request<string>, res: Response) => {
  const query = req.body as {
    text: string;
    onlyAmount: boolean;
    model: TokenizerType;
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tokenizer = tokenizers.get(query.model)!;
  if (!tokenizer) {
    throw new Error(`Tokenizer ${query.model} not found`);
  }
  const tokens = tokenizer.encodeString(query.text);

  if (query.onlyAmount) {
    res.send(tokens.length);
  } else {
    res.send(tokens);
  }
};
