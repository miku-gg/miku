import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import jwtPermissionMiddleware from "./lib/verifyJWT";
import audioHandler from "./services/audio";
import textHandler, { modelsMetadata } from "./services/text";
import { ModelType } from "./services/text/lib/queryValidation";

const PORT = process.env.SERVICES_PORT || 8484;

const app: express.Application = express();
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "http://localhost:5100",
      "http://localhost:8586",
      "https://miku.gg",
      "https://dev.miku.gg",
      "https://alpha.miku.gg",
      "https://interactor.miku.gg",
      "https://build.miku.gg",
    ],
  })
);
app.use(bodyParser.json());

if (process.env.JWT_SECRET) {
  app.use(jwtPermissionMiddleware);
}

app.post("/text", async (req: Request<string>, res: Response) => {
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

app.post("/audio", async (req: Request<string>, res: Response) => {
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

app.get("/", (req, res) => {
  res.status(200).send("Miku Services");
});

app.get("/text/metadata/:model", async (req, res) => {
  try {
    const model = req.params.model as ModelType;
    const metadata = modelsMetadata.get(model);
    res.send({
      strategy: metadata?.strategy || "alpacarp",
      tokenizer: metadata?.tokenizer || "llama",
      trucation_length: metadata?.truncation_length || 4096,
      max_new_tokens: metadata?.max_new_tokens || 200,
    });
  } catch (error) {
    res.send({
      strategy: "alpacarp",
      tokenizer: "llama",
      trucation_length: 4096,
      max_new_tokens: 200,
    });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
