# Guidance-like library for Node.js
This library is a port of the [Guidance](https://github.com/guidance-ai/guidance) library for Node.js. It allows you to generate text from templates using a Language Model (LLM) and an endpoint that can generate text from a prompt.

## Installation
```bash
npm install @mikugg/guidance
```

## Usage
You can use end OpenAI endpoint to generate text from templates. The template processor will generate text from the template and then use the generated text as a prompt to the OpenAI endpoint. The generated text will be appended to the template and the process will repeat until the stop condition is met.

For serving LLaMA or Mistral models, I recommend using [Aphrodite Engine](https://github.com/PygmalionAI/aphrodite-engine), since it has `logit_bias` support.

```javascript
import * as Guidance from '@mikugg/guidance';

const tokenizer = new Guidance.Tokenizer.LLaMATokenizer();
const generator = new Guidance.TokenGenerator.OpenAITokenGenerator({
  apiKey: 'sk-EMPTY',
  baseURL: 'http://localhost:2242/v1',
  model: 'mistralai/Mistral-7B-v0.1',
});
const templateProcessor = new Guidance.Template.TemplateProcessor(tokenizer, generator);

let result = await templateProcessor.processTemplate(
  `Common sense question and answer, with short answers
  Question: What is your favorite food?
  Answer: "Sushi."
  Question: What is your favorite color?
  Answer: "Blue."
  Question: What is your favorite animal?
  Answer: "{{GEN response stop=" }}"`,
  new Map([])
).then((result) => {
  console.log(result.entries()); // {"response": "Elephant."}
});
```

### Select from a list of options
You can provide an array of options to select the next text. The TemplateProcessor will increase the probability of one of those options being selected by the LLM.

```javascript
import * as Guidance from '@mikugg/guidance';

const tokenizer = new Guidance.Tokenizer.LLaMATokenizer();
const generator = new Guidance.TokenGenerator.OpenAITokenGenerator({
  apiKey: 'sk-EMPTY',
  baseURL: 'http://localhost:2242/v1',
  model: 'mistralai/Mistral-7B-v0.1',
});
const templateProcessor = new Guidance.Template.TemplateProcessor(tokenizer, generator);

let result = await templateProcessor.processTemplate(
  `RPG Game Character specification
  {
    "name": "{{name}}",
    "job": "{{GEN job stop=",}}",
    "armor": "{{SEL armor options=valid_armors}}",
    "weapon": "{{SEL weapon options=valid_weapons}}",
    "pants": "{{SEL pants options=valid_pants}}"
  }`,
  new Map<string, string[] | string>([
    ['name', 'Rudeus'],
    ['valid_armors', ['plate', 'leather']],
    ['valid_weapons', ["axe", "mace", "spear", "sword", "bow", "crossbow"]],
    ['valid_pants', ['leather_jacket', 'leather_shorts', 'hat']], // Should select leather_shorts
  ])
).then((result) => {
  console.log(result.entries());
});
```

You can check more examples in the [this file](./demo/index.ts).