import { Request, Response } from "express";
import * as Guidance from "@mikugg/guidance";
import { OpenAIAphroditeTokenGenerator } from "./lib/aphroditeTokenGenerator";
import { presets, PresetType } from "./data/presets";
import {
  ModelType,
  GuidanceQuery,
  validateGuidanceQuery,
} from "./lib/queryValidation";

const templateProcessors = new Map<
  ModelType,
  Guidance.Template.TemplateProcessor
>([
  [
    ModelType.RP,
    new Guidance.Template.TemplateProcessor(
      new Guidance.Tokenizer.LLaMATokenizer(),
      new OpenAIAphroditeTokenGenerator({
        apiKey: "sk-EMPTY",
        baseURL: "http://localhost:2242/v1",
        model: "default",
        defaultConfig: {
          ...presets.get(PresetType.DIVINE_INTELECT),
          max_tokens: 200,
          truncation_length: 4096,
        },
      })
    ),
  ],
  [
    ModelType.RP_SMART,
    new Guidance.Template.TemplateProcessor(
      new Guidance.Tokenizer.LLaMATokenizer(),
      new OpenAIAphroditeTokenGenerator({
        apiKey: "sk-EMPTY",
        baseURL: "http://localhost:2242/v1",
        model: "default",
        defaultConfig: {
          ...presets.get(PresetType.DIVINE_INTELECT),
          max_tokens: 200,
          truncation_length: 8192,
        },
      })
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
