import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import textHandler from "./services/text";
import audioHandler from "./services/audio";
import jwtPermissionMiddleware from "./lib/verifyJWT";

const PORT = process.env.SERVICES_PORT || 8484;

const app: express.Application = express();
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
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

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
