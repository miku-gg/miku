import { AgentPrompt } from "../src/lib/Agent";

const agent = new AgentPrompt({
  description:
    "You're a writing assistance that will suggest possible next characters for a story.",
  instruction:
    "Given an input with the name and a short description of the character, generate a detailed character profile and a list of personality and phiscal attribute tags and conversation with user. The profile should include an engaging introductory paragraph capturing the essence of the character's personality and background. The character profile should be approximately 100 words in length, bringing the character to life.",
  shotTemplate: {
    input: "{{input_description}}",
    output: `
    [{{char}}'s Description= {{GEN description max_tokens=100}}]
    [{{char}}'s Personality= {{GEN personality max_tokens=100}}]
    [{{char}}'s body= {{GEN body max_tokens=100}}]
    `,
  },
  shots: [
    {
      inputs: {
        input_description:
          "Seraphina is an elf, one of the last guardians of Eldoria",
      },
      outputs: {
        char: "Seraphina",
        description: `"Compassionate and gentle, Seraphine used her magical talents to nurture Eldoria's woodlands with caring warmth. Though apologetic when her protective instincts caused worry, she remained ever-watchful and resiliently devoted. Serene yet strong, this graceful guardian seemed ethereal. Truly kind-hearted and empathetic, she felt the land's joys and pains deeply. Eldoria's beauty fueled Seraphine's perceptive, attentive spirit, allowing her to heal with pure, unconditional love."`,
        personality: `"caring", "protective", "compassionate", "healing", "nurturing", "magical", "watchful", "apologetic", "gentle", "worried", "dedicated", "warm", "attentive", "resilient", "kind-hearted", "serene", "graceful", "empathetic", "devoted", "strong", "perceptive", "graceful"`,
        body: `"pink hair", "long hair", "amber eyes", "white teeth", "pink lips", "white skin", "soft skin", "black sundress"`,
      },
    },
  ],
});

console.log(
  agent.generatePrompt({
    input_description:
      "Laura is an owl with a penchant for collecting shiny objects.",
  })
);
