---
label: Get endpoints
icon: cloud
order: 1700
---

# Prompt completers

You need to have a LLM (large language model) service to use the bots. A LLM is a machine learning model that is able to predict and generate the bot responses. You can use the following services:

- [Aphrodite](https://github.com/PygmalionAI/aphrodite-engine). The most modern and update open-source local server for LLMs written with parallelization in mind. This is the recommended option, as it's compatiable with most local models and the fastest engine.

- [TabbyAPI](https://github.com/theroyallab/tabbyAPI). An open-source local server for LLMs with native exllama support, if you cannot use Aphrodite it is reccomended to use this.

- [text-generation-webui](https://github.com/oobabooga/text-generation-webui). An open-source local server for LLMs, also known as **oobabooga**. It has been around for awhile and is compatible with most open source model. They can be run using a GPU or CPU (but it's slower).

### Get an Aphrodite endpoint

First, download and install [Aphrodite](https://github.com/PygmalionAI/aphrodite-engine) and run a model.
To run a local model, you can use cloudflared to publish your API by downloading it from [here](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64) and doing `./cloudflared-linux-amd64 tunnel --url localhost:<YOUR PORT HERE>`. You might have to give execution permission to the file by doing `chmod +x cloudflared-linux-amd64`.

For example, to run a model like `ludis/tsukasa-120b-qlora-gptq`

```
./runtime.sh python -m aphrodite.endpoints.openai.api_server --port <YOUR PORT HERE> --model ludis/tsukasa-120b-qlora-gptq -q gptq --dtype float16 --api-keys <YOUR_API_PASSWORD_HERE> -gmu 0.88 -tp 2
```

### Get a TabbyAPI endpoint

First, download and install [TabbyAPI](https://github.com/theroyallab/tabbyAPI) and run a model.
To use the API with miku, you might need to use cloudflared to publish the API endpoint, follow the same instructions for using cloudflared with Aphrodite.

TabbyAPI uses YAML configs for loading models, you should read their documentation for how load a model.

### Get an ooobabooga API endpoint

First, download and install [text-generation-webui](https://github.com/oobabooga/text-generation-webui) and run a model.
To use your oobabooga api endpoint with miku, you might need to expose it with a public API by `--public-api` option.

For example, to run a model like `WizardLM-7B`

```bash
python server.py --model wizardLM-7B-GPTQ-4bit-128g --wbits 4 --groupsize 128 --public-api
```

After running it, please copy the non-streaming public url from the terminal. For example, you will see the following message in the terminal:

```bash
Starting non-streaming server at public url https://together-budgets-optimize-distributor.trycloudflare.com/api
```

If you're running everything locally. Please use the `--api` flag only. For example:

```bash
python server.py --model wizardLM-7B-GPTQ-4bit-128g --wbits 4 --groupsize 128 --api
```

!!!warning
If you find errors running the public-api, you can take a look this [github issue](https://github.com/oobabooga/text-generation-webui/issues/1524).
!!!

For more information about runnning local LLMs, hardware requirements and test different ones for role-playing, please check these links:

```
https://rentry.org/lmg_models
https://rentry.org/lmg-resources#quick-rundown-on-large-language-models
https://rentry.org/ayumi_erp_rating
https://www.youtube.com/watch?v=lb_lC4XFedU
```
