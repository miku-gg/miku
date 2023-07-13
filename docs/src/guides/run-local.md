---
label: Run locally
icon: terminal
order: 1900
---

The preferred way to run the project is to download the source code and run it locally. This way, you can customize the bot to your liking and you don't have to worry about the servers going offline.


## Instructions

[!embed](https://www.youtube.com/watch?v=zEiH9TqZjF8)

### Requirements
You need to have `node v16+`, `python v3.10` and `git` installed on your machine. You can download them from the following links:

-   [Node.js](https://nodejs.org/en/download/)
-   [Python](https://www.python.org/downloads/)
-   [Git](https://git-scm.com/downloads)

The project should work on Windows, Linux and MacOS. If you have any issues please report it in the github issues page.

### 1. Clone the source code

First, you need to clone the source code. You can do this by running the following command:

```bash
git clone https://github.com/miku-gg/miku.git
```

### 2. Installing dependencies

Next, you need to run `make install` to install the dependencies. You can do this by running the following commands:

```bash
cd miku
make install
```

This command will check the dependencies and install the required packages for `npm` and `pip`.

Next, you will be prompted for the environment variables

* `OPENAI_API_KEY`, a valid API for querying OpenAI models
* `KOBOLD_AI_API_ENDPOINT`, a valid API for querying Kobold AI models
* `AZURE_API_KEY`, a valid API for querying Azure TTS models
* `ELEVENLABS_API_KEY`, a valid API for querying ElevenLabs TTS models
* `PYGMALION_ENDPOINT`, an endpoint URL for querying the KoboldAI prompt completer
* `OOBABOOGA_ENDPOINT`, an endpoint URL for querying the text-generation-webui prompt completer. Should end in `/api`

At least one of `OPENAI_API_KEY`, `PYGMALION_ENDPOINT` and `OOBABOOGA_ENDPOINT` must be provided for the bots to generate responses. You can take a look at the [How to use the endpoints](/guides/how-to-endpoints) guide for getting one of these values.

### 3. Run the project
After setting up the `.env` file, you can run the project by running the following command:

```bash
make run
```

This should run up 6 servers:
```
http://localhost:5173 - the web app for interacting with the bots (NodeJS)
http://localhost:8484 - the services server for querying the external services (NodeJS)
http://localhost:8585 - the bot directory server for installing and listing bots (NodeJS)
http://localhost:8586 - the bot builder server for creating and editing bots (NodeJS)
http://localhost:8601 - the SBERT server for analyzing emotions (embeddings similarity) (Python)
http://localhost:8600 - the SBERT server for embedding text (Python)
```

Your initial place should be `http://localhost:8585` to install the bots. It should open automatically in your default browser.