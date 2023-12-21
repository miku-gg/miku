import * as Guidance from "../src";

const tokenizer = new Guidance.Tokenizer.LLaMATokenizer();
const generator = new Guidance.TokenGenerator.OpenAITokenGenerator({
  apiKey: "sk-EMPTY",
  baseURL: "http://localhost:2242/v1",
  model: "mistralai/Mistral-7B-v0.1",
});
const templateProcessor = new Guidance.Template.TemplateProcessor(
  tokenizer,
  generator
);

(async function examples() {
  let result = await templateProcessor.processTemplate(
    `Common sense question and answer, with short answers
    Question: What is your favorite food?
    Answer: "Sushi."
    Question: What is your favorite color?
    Answer: "Blue."
    Question: What is your favorite animal?
    Answer: "{{GEN response stop=" }}"`,
    new Map([])
  );
  console.log(result.entries());

  result = await templateProcessor.processTemplate(
    `I will show you an email and a response, and you will tell me if it's offensive.
    Email: {{email}}.
    Response: I also don't{{GEN response stop=.}}.
    Is the response above offensive in any way? Please answer with a single word, either "Yes" or "No".
    Answer:{{SEL answer options=answers}}`,
    new Map<string, string[] | string>([
      ["email", "I hate tacos."],
      ["answers", [" Yes", " No"]],
    ])
  );
  console.log(result.entries());

  result = await templateProcessor.processTemplate(
    `Common sense question and answer
    Question: What is the besto waifu in domekano?
    Answer: {{SEL waifu options=waifus}}`,
    new Map<string, string[] | string>([
      ["waifus", [" Rui", " Hina.", " Hina"]],
    ])
  );
  console.log(result.entries());

  result = await templateProcessor.processTemplate(
    `RPG Game Character specification
    {
      "name": "{{name}}",
      "job": "{{GEN job stop=",}}",
      "armor": "{{SEL armor options=valid_armors}}",
      "weapon": "{{SEL weapon options=valid_weapons}}",
      "pants": "{{SEL pants options=valid_pants}}"
    }`,
    new Map<string, string[] | string>([
      ["name", "Rudeus"],
      ["valid_armors", ["plate", "leather"]],
      ["valid_weapons", ["axe", "mace", "spear", "sword", "bow", "crossbow"]],
      ["valid_pants", ["leather_jacket", "leather_shorts", "hat"]], // Should select leather_shorts
    ])
  );
  console.log(result.entries());

  // example with streaming
  const stream = templateProcessor.processTemplateStream(
    `RPG Game Character specification
    {
      "name": "{{name}}",
      "job": "{{GEN job stop=",}}",
      "armor": "{{SEL armor options=valid_armors}}",
      "weapon": "{{SEL weapon options=valid_weapons}}",
      "pants": "{{SEL pants options=valid_pants}}"
    }`,
    new Map<string, string[] | string>([
      ["name", "Rudeus"],
      ["valid_armors", ["plate", "leather"]],
      ["valid_weapons", ["axe", "mace", "spear", "sword", "bow", "crossbow"]],
      ["valid_pants", ["leather_jacket", "trousers", "hat"]], // Should select leather_shorts
    ])
  );
  for await (const result of stream) {
    console.log(result.entries());
  }
})();
