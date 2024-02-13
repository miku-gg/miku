import { Request, Response } from "express";
import * as Guidance from "@mikugg/guidance";
import { presets, PresetType } from "./data/presets";
import {
  ModelType,
  GuidanceQuery,
  validateGuidanceQuery,
} from "./lib/queryValidation";
import * as backend_config from "../../../backend_config.json";

const APHRODITE_API_KEY =
  backend_config.apiKey || process.env.APHRODITE_API_KEY || "";
const APHRODITE_API_URL =
  backend_config.apiUrl ||
  process.env.APHRODITE_API_URL ||
  "http://localhost:2242/v1";
const APHRODITE_API_MODEL = process.env.APHRODITE_API_MODEL || "default";
const APHRODITE_API_PRESET =
  (process.env.APHRODITE_API_PRESET as PresetType) ||
  PresetType.DIVINE_INTELECT;
const APHRODITE_API_MAX_TOKENS =
  Number(process.env.APHRODITE_API_MAX_TOKENS || 0) || 200;
const APHRODITE_API_TRUNCATION_LENGTH =
  Number(process.env.APHRODITE_API_TRUNCATION_LENGTH || 0) || 8192;

const APHRODITE_SMART_API_KEY =
  process.env.APHRODITE_SMART_API_KEY || APHRODITE_API_KEY;
const APHRODITE_SMART_API_URL =
  process.env.APHRODITE_SMART_API_URL || APHRODITE_API_URL;
const APHRODITE_SMART_API_MODEL =
  process.env.APHRODITE_SMART_API_MODEL || APHRODITE_API_MODEL;
const APHRODITE_SMART_API_PRESET =
  (process.env.APHRODITE_SMART_API_PRESET as PresetType) ||
  APHRODITE_API_PRESET;
const APHRODITE_SMART_API_MAX_TOKENS =
  Number(process.env.APHRODITE_SMART_API_MAX_TOKENS || 0) ||
  APHRODITE_API_MAX_TOKENS;
const APHRODITE_SMART_API_TRUNCATION_LENGTH =
  Number(process.env.APHRODITE_SMART_API_TRUNCATION_LENGTH || 0) ||
  APHRODITE_API_TRUNCATION_LENGTH;

const templateProcessors = new Map<
  ModelType,
  Guidance.Template.TemplateProcessor
>([
  [
    ModelType.RP,
    new Guidance.Template.TemplateProcessor(
      new Guidance.Tokenizer.LLaMATokenizer(),
      new Guidance.TokenGenerator.OpenAITokenGenerator(
        {
          apiKey: APHRODITE_API_KEY,
          baseURL: APHRODITE_API_URL,
          model: APHRODITE_API_MODEL,
        },
        {},
        {
          ...presets.get(APHRODITE_API_PRESET),
          max_tokens: APHRODITE_API_MAX_TOKENS,
          truncation_length: APHRODITE_API_TRUNCATION_LENGTH,
        }
      )
    ),
  ],
  [
    ModelType.RP_SMART,
    new Guidance.Template.TemplateProcessor(
      new Guidance.Tokenizer.LLaMATokenizer(),
      new Guidance.TokenGenerator.OpenAITokenGenerator(
        {
          apiKey: APHRODITE_SMART_API_KEY,
          baseURL: APHRODITE_SMART_API_URL,
          model: APHRODITE_SMART_API_MODEL,
        },
        {},
        {
          ...presets.get(APHRODITE_SMART_API_PRESET),
          max_tokens: APHRODITE_SMART_API_MAX_TOKENS,
          truncation_length: APHRODITE_SMART_API_TRUNCATION_LENGTH,
        }
      )
    ),
  ],
]);

export default async (req: Request<string>, res: Response) => {
  const guidanceQuery: GuidanceQuery = req.body;
  validateGuidanceQuery(guidanceQuery);
  const stream = templateProcessors
    .get(guidanceQuery.model)
    ?.processTemplateStream(
      guidanceQuery.template,
      new Map(Object.entries(guidanceQuery.variables || {}))
    );
  if (!stream) {
    throw { message: "Error completing guidance.", status: 500 };
  }
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");
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
