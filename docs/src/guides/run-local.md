---
label: Run locally
icon: terminal
order: 1900
---

The preferred way to run the project is to download the source code and run it locally. This way, you can customize the bot to your liking and you don't have to worry about the servers going offline.

### Requirements

You need to have `node v16+` and `git` installed on your machine. You can download them from the following links:

- [Node.js](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/downloads)

The project should work on _Windows_, _Linux_ and _MacOS_. If you have any issues please report them in the github issues page.

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

- `AZURE_API_KEY`, a valid API for querying Azure TTS models
- `ELEVENLABS_API_KEY`, a valid API for querying ElevenLabs TTS models

Backend API keys and URLs are set in the bot directory config. You can take a look at the [How to use the endpoints](/guides/how-to-endpoints) guide for getting one of these values.

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
```

Your initial place should be `http://localhost:8585` to install the bots. It should open automatically in your default browser.
