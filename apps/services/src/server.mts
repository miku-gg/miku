import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import jwtPermissionMiddleware from './lib/verifyJWT.mjs';
import audioHandler from './services/audio/index.mjs';
import textHandler, { tokenizeHandler } from './services/text/index.mjs';
import { TokenizerType, loadTokenizer } from './services/text/lib/tokenize.mjs';
import monitor from 'express-status-monitor';
import modelServerSettingsStore from './services/text/lib/modelServerSettingsStore.mjs';
const PORT = process.env.SERVICES_PORT || 8484;

const app: express.Application = express();
app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:5173',
      'http://localhost:5100',
      'http://localhost:8586',
      'https://miku.gg',
      'https://dev.miku.gg',
      'https://alpha.miku.gg',
      'https://interactor.miku.gg',
      'https://build.miku.gg',
    ],
  }),
);
app.use(bodyParser.json());
app.use(monitor());

if (process.env.JWT_SECRET) {
  app.use(jwtPermissionMiddleware);
}

app.post('/text', async (req: Request<string>, res: Response) => {
  try {
    await textHandler(req, res);
  } catch (error) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.status(error.status || 500).send(error.message);
    } catch (_error) {
      res.end();
    }
  }
});

app.post('/text/tokenize', async (req: Request<string>, res: Response) => {
  try {
    await tokenizeHandler(req, res);
  } catch (error) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.status(error.status || 500).send(error.message);
    } catch (_error) {
      res.end();
    }
  }
});

app.post('/audio', async (req: Request<string>, res: Response) => {
  try {
    await audioHandler(req, res);
  } catch (error) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.status(error.status || 500).send(error.message);
    } catch (_error) {
      res.end();
    }
  }
});

app.get('/', (req, res) => {
  res.status(200).send('Miku Services');
});

app.get('/text/metadata/:model', async (req, res) => {
  try {
    const model = req.params.model as string;
    const models = modelServerSettingsStore.getRPModels();
    const metadata = models.find((m) => m.id === model);
    const secondaryMetadata = models.find((m) => m.id === metadata?.model_id_for_select) || metadata;
    res.send({
      strategy: metadata?.strategy || 'alpacarp',
      tokenizer: metadata?.tokenizer || 'llama',
      truncation_length: metadata?.truncation_length || 4096,
      max_new_tokens: metadata?.new_tokens || 200,
      cost: metadata?.cost || 0,
      secondary: {
        id: secondaryMetadata?.id,
        strategy: secondaryMetadata?.strategy || 'alpacarp',
        tokenizer: secondaryMetadata?.tokenizer || 'llama',
        truncation_length: secondaryMetadata?.truncation_length || 4096,
        max_new_tokens: secondaryMetadata?.new_tokens || 200,
      },
    });
  } catch (error) {
    res.send({
      strategy: 'alpacarp',
      tokenizer: 'llama',
      truncation_length: 4096,
      max_new_tokens: 200,
      cost: 0,
      secondary: {
        strategy: 'alpacarp',
        tokenizer: 'llama',
        truncation_length: 4096,
        max_new_tokens: 200,
        cost: 0,
      },
    });
  }
});

app.get('/text/models', async (req, res) => {
  const models = modelServerSettingsStore.getRPModels();
  res.send(
    models.map((model) => {
      return {
        id: model.id,
        name: model.name,
        description: model.description,
        permission: model.permission,
        cost: model.cost,
      };
    }),
  );
});

console.log('Loading tokenizers...');
Promise.all([
  loadTokenizer(TokenizerType.LLAMA_2),
  loadTokenizer(TokenizerType.LLAMA_3),
  loadTokenizer(TokenizerType.MISTRAL),
  loadTokenizer(TokenizerType.SOLAR),
  loadTokenizer(TokenizerType.COHERE),
  loadTokenizer(TokenizerType.WIZARDLM2),
]).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
