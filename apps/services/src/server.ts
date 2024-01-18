import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import textHandler from "./services/text";
import audioHandler from "./services/audio";
import jwtPermissionMiddleware from "./lib/verifyJWT";
import * as backend_config from "../backend_config.json";

const PORT = process.env.SERVICES_PORT || 8484;

const app: express.Application = express();
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "http://localhost:5100",
      "https://miku.gg",
      "https://dev.miku.gg",
      "https://alpha.miku.gg",
      "https://interactor.miku.gg",
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

app.get("/text/strategy/:model", async (req, res) => {
  try {
    res.send({
      strategy: backend_config.strat,
    });
  } catch (error) {
    res.send({
      strategy: "alpacarp",
    });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
