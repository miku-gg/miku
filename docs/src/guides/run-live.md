---
label: Live demo
icon: container
order: 2000
---

# Live demo

You can interact with bots by using the [text-generation-webui](https://github.com/oobabooga/text-generation-webui) locally.

[https://bots.miku.gg](https://bots.miku.gg) your browser to go to the LLaMA demo.

## Instructions

### 1. Expose a LLaMA model with a public API
To run a LLaMA model, you need to expose it with a public API by `--public-api` option.

For example, to run WizardLM-7B
```bash
python server.py --model wizardLM-7B-GPTQ-4bit-128g --wbits 4 --groupsize 128 --public-api
```

After running it, please copy the non-streaming public url from the terminal. For example, you will see the following message in the terminal:
```bash
Starting non-streaming server at public url https://together-budgets-optimize-distributor.trycloudflare.com/api
```

!!!warning
If you find errors running the public-api, you can take a look this [github issue](https://github.com/oobabooga/text-generation-webui/issues/1524).
!!!

### 2. Paste the API key in the demo
Go to the [Live demo](https://bots.miku.gg) and paste your API key in the text box. Then, click on the bot you want to interact with.

![](/assets/llama-demo.png)
