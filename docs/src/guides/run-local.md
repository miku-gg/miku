---
label: Run locally
icon: terminal
order: 1900
---

The preferred way to run the project is to download the source code and run it locally. This way, you can customize the bot to your liking and you don't have to worry about the servers going offline.

!!!
The following guide is linux-only. For Windows 10, [check this guide](https://rentry.org/ukim) (credits to some anon).
!!!


## Instructions

[!embed](https://www.youtube.com/watch?v=zEiH9TqZjF8)

### Requirements
You need to have `node v16+` and `git` installed on your machine. You can download them from the following links:

-   [Node.js](https://nodejs.org/en/download/)
-   [Git](https://git-scm.com/downloads)

### 1. Clone the source code

First, you need to clone the source code. You can do this by running the following command:

```bash
git clone https://github.com/miku-gg/miku.git
```

### 2. Create the .env file

Next, you need to create an `.env` file. You can do this by running the following commands:

```bash
cd miku
cp .env.example .env
gedit .env
```

The `.env` file should look like this. Please replace the api key values with your own.

```bash
# browser-directory env
VITE_SERVICES_ENDPOINT=http://localhost:8484
VITE_BOT_DIRECTORY_ENDPOINT=http://localhost:8585/bot
VITE_IMAGES_DIRECTORY_ENDPOINT=http://localhost:8585/image

# services-server env
OPENAI_API_KEY=<OPENAI_API_KEY>
ELEVENLABS_API_KEY=<ELEVENLABS_API_KEY>
AZURE_API_KEY=<AZURE_API_KEY>
PYGMALION_ENDPOINT=<KOBOLD_AI_API_ENDPOINT>
EMOTIONS_ENDPOINT=http://localhost:8585/emotion
SERVICES_PORT=8484

# bot-directory env
BOT_DIRECTORY_PORT=8585
```

* For OpenAI bots you need provide `OPENAI_API_KEY`
* For pymalion bots you need provide `KOBOLD_AI_API_ENDPOINT` (same as for *TavernAI*, see below how to get one)
* For emotions you need provide `OPENAI_API_KEY` (another open source option will be added later)
* For azure-tts voice you need provide `AZURE_API_KEY`
* For azure-tts voice you need provide `ELEVENLABS_API_KEY`

### 3. Run the project
After setting up the `.env` file, you can run the project by running the following command:

```bash
npm i -g pnpm
pnpm i
pnpm start
```

This should set up three servers:
```
http://localhost:5173 - the web app
http://localhost:8484 - the services server
http://localhost:8585 - the bot directory server
```

## How to get a Kobold AI API endpoint (for Pygmalion)

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