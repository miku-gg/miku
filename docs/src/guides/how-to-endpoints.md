---
label: How to use the endpoints
icon: cloud
order: 1700
---

# Prompt completers

You need to have a LLM (large language model) service to use the bots. A LLM is a machine learning model that is able to predict and generate the bot responses. You can use the following services:

* [text-generation-webui](https://github.com/oobabooga/text-generation-webui). An open-source local server for LLMs, also known as **oobabooga**. This is the recommended option, as it's compatible with the LLaMA-based models. They can be run using a GPU or CPU (but it's slower).

* [OpenAI](https://openai.com/). A paid service that provides censored LLMs. You need to have an API key to use it. The model that is compatible with MikuGG is `gpt3.5-turbo`. *Note: NSFW content is not allowed for this API because the model censors it. Unless you can bypass it with a jailbrak but that's up to your own risk.*

* [Kobold AI](https://koboldai.com/). An open-source local server for LLMs. Compatible with Pygmalion 6B and uncensored. But it requires a GPU to run it.



### Get an ooobabooga API endpoint (for LLaMA models)
First, download and install [text-generation-webui](https://github.com/oobabooga/text-generation-webui) and run a model.
To run a LLaMA model, you need to expose it with a public API by `--public-api` option.

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

## Get a Kobold AI API endpoint (for Pygmalion 6B)

You have two options:
- [Run Kobold AI locally](https://github.com/KoboldAI/KoboldAI-Client) (Requires a powerful GPU to run `Pygmalion6B`)
- [Run Kobold AI on Google Colab](https://colab.research.google.com/github/KoboldAI/KoboldAI-Client/blob/main/colab/GPU.ipynb) (free tier for a limited time)

If you choose to do use the Google Colab option (recommended one for noobs), make sure to select the "Pygmalion 6B" option in the dropdown menu.

![](/assets/colab_select.png)

After you have it running, copy the link in the output console and add `/api`.

![](/assets/colab_output.png)

In this example, the endpoint environment variable should be:

```
https://categories-gen-incoming-condos.trycloudflare.com/api
```


# Get an OpenAI API key
To get an OpenAI Key. First create an account and the go to https://platform.openai.com/account/api-keys

The click on create new API key and this should popup:

![](/assets/openai_key.png)
