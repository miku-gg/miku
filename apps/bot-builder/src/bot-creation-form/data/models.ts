import { Colors } from "../Components/ModelTag";

export const validModels = [
  "davinci",
  "gpt-3.5-turbo",
  "pygmalion-6b",
  "llama-30b",
] as const;
export type Model = (typeof validModels)[number];

export type ModelCatalog = Record<
  Model,
  {
    label: string;
    price: "cheap" | "normal" | "expensive";
    color: Colors;
    description: string;
  }
>;

export const models: ModelCatalog = {
  "llama-30b": {
    label: "LLaMA",
    price: "normal",
    color: "#FF0000",
    description:
      "Any variant of LLaMA running in oobabooga/text-generation-webui. Self hosted.",
  },
  davinci: {
    label: "Davinci",
    price: "expensive",
    color: "#56CCF2",
    description:
      "An advanced model, capable of understanding complex prompts and generating detailed responses. Censored, cloud hosted.",
  },
  "gpt-3.5-turbo": {
    label: "GPT-3.5 Turbo",
    price: "normal",
    color: "#4BBA2D",
    description:
      "A powerful model with a balance of capabilities and affordability. Censored, cloud hosted.",
  },
  "pygmalion-6b": {
    label: "Pygmalion 6B (KoboldAI)",
    price: "cheap",
    color: "#2F80ED",
    description:
      "An economical model suitable for simpler tasks and understanding basic prompts. Uses a self-hosted KoboldAI API.",
  },
};
