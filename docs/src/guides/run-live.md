---
label: Live demo
icon: container
order: 2000
---

# Live demo

![](/assets/llama-demo.png)

You can interact with bots in the [Live demo](https://bots.miku.gg) for free using our LLaMA server. But the recommended way is to use your own endpoint.

!!!warning Only for testing
The live demo is only intended for testing purposes. The recommended way to run your own bot is to download the source code and run it locally.
[!ref Run locally](/guides/run-local.md)
!!!

## Instruction

![](/assets/live-settings.png)

If you want use a custom endpoint, you can click on the burger menu on the top right corner and select "Custom endpoint". Then, paste your endpoint URL in the text box. You can also set a custom OpenAI API key if you want to use `gpt3.5-turbo` for responses instead.

In order to set up a custom endpoint, you can follow the [How to use the endpoints](/guides/how-to-endpoints) guide.

!!!information What is *Prompt Stragety*?
Prompt strategy is the method used to describe the conversation to the language model. Some models are more sentive to some strategies than others. You can try different strategies to see which one works best for your model. As a rule, `SBF` and `W++` work well for OpenAI, `Pygmalion style` works good for `Pygmalion 6b,7b and 13b`. `Alpaca` and`Vicuna 1.1` generally work well for `LLaMA` instruct models like WizardLM.
!!!
