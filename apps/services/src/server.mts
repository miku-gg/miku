import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import monitor from 'express-status-monitor';
import fs from 'fs/promises';
import path from 'path';
import jwtPermissionMiddleware from './lib/verifyJWT.mjs';
import audioHandler from './services/audio/index.mjs';
import textHandler, { tokenizeHandler } from './services/text/index.mjs';
import { TokenizerType, loadTokenizer } from './services/text/lib/tokenize.mjs';
import modelServerSettingsStore from './services/text/lib/modelServerSettingsStore.mjs';
import { checkModelsHealth, getModelHealth } from './services/text/lib/healthChecker.mjs';
import assistantHandler from './services/assistant/index.mjs';
import translationHandler from './services/translation/index.mjs';
const PORT = process.env.SERVICES_PORT || 8484;

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const app: express.Application = express();
app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:5173',
      'http://localhost:5100',
      'https://localhost:5100',
      'http://localhost:8586',
      'https://miku.gg',
      'https://dev.miku.gg',
      'https://alpha.miku.gg',
      'https://interactor.miku.gg',
      'https://build.miku.gg',
    ],
  }),
);
app.use(bodyParser.json({ limit: '512kb' }));
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

app.post('/assistant', async (req: Request<any>, res: Response) => {
  await assistantHandler(req, res);
});

app.post('/translate', async (req: Request<any>, res: Response) => {
  await translationHandler(req, res);
});

app.get('/translate/download/:filename', async (req: Request<any>, res: Response) => {
  try {
    const { filename } = req.params;
    if (!filename.match(/^[a-zA-Z0-9_-]+\.json$/)) {
      res.status(400).send('Invalid filename');
      return;
    }
    const tempDir = path.join(process.cwd(), 'temp');
    const filePath = path.join(tempDir, filename);

    // Check if file exists
    await fs.access(filePath);

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(404).send('File not found');
      }
    });
  } catch (error) {
    res.status(404).send('File not found');
  }
});

app.post('/audio', async (req: Request<any>, res: Response) => {
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

app.get('/health', (req, res) => {
  res.send({
    rp: getModelHealth('RP'),
    rp_smart: getModelHealth('RP_SMART'),
  });
});

app.get('/text/metadata/:model', async (req, res) => {
  try {
    const model = req.params.model as string;
    const models = modelServerSettingsStore.getRPModels();
    const metadata = models.find((m) => m.id === model);
    const secondaryMetadata = models.find((m) => m.id === metadata?.model_id_for_select) || metadata;
    res.send({
      strategy: metadata?.strategy || 'llama3',
      tokenizer: metadata?.tokenizer || 'llama',
      truncation_length: metadata?.truncation_length || 4096,
      max_new_tokens: metadata?.new_tokens || 200,
      cost: metadata?.cost || 0,
      has_reasoning: metadata?.has_reasoning || false,
      secondary: {
        id: secondaryMetadata?.id,
        strategy: secondaryMetadata?.strategy || 'llama3',
        tokenizer: secondaryMetadata?.tokenizer || 'llama',
        truncation_length: secondaryMetadata?.truncation_length || 4096,
        max_new_tokens: secondaryMetadata?.new_tokens || 200,
        has_reasoning: secondaryMetadata?.has_reasoning || false,
      },
    });
  } catch (error) {
    res.send({
      strategy: 'llama3',
      tokenizer: 'llama',
      truncation_length: 4096,
      max_new_tokens: 200,
      cost: 0,
      has_reasoning: false,
      secondary: {
        strategy: 'llama3',
        tokenizer: 'llama',
        truncation_length: 4096,
        max_new_tokens: 200,
        cost: 0,
        has_reasoning: false,
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
        has_reasoning: model.has_reasoning,
      };
    }),
  );
});

app.get('/refresh-settings', async (req, res) => {
  // check header token
  if (req.headers.Authorization !== `Bearer ${process.env.REFRESH_TOKEN}`) {
    res.status(401).send('Unauthorized');
    return;
  }
  await modelServerSettingsStore.retrieveSettings();
  await checkModelsHealth();
  res.send('OK');
});

console.log('Loading tokenizers...');
// Comment tokenizers out to save memory
Promise.all([
  // loadTokenizer(TokenizerType.LLAMA3),
  loadTokenizer(TokenizerType.NEMO),
  // loadTokenizer(TokenizerType.DEEPSEEK),
  loadTokenizer(TokenizerType.QWEN3),
  loadTokenizer(TokenizerType.QWQ),
  loadTokenizer(TokenizerType.MISTRAL_SMALL),
  loadTokenizer(TokenizerType.LLAMA4),
  loadTokenizer(TokenizerType.GEMMA3),
  // loadTokenizer(TokenizerType.CLAUDE),
]).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
