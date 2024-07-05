# MikuGG

MikuGG is a generative visual novel platform. This is the open source interactor code for the website miku.gg. You can set up miku locally or develop features using this respository instructions.

![](/docs/src/assets/overview.png)

## Prerequisites

- Node.js: Download and install from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- An [Aphrodite engine](https://github.com/PygmalionAI/aphrodite-engine#quickstart) running instance.
- A GPU for running a large language model.
- Any missing packages required by the install script. Packages (ex: distutils) may be missing from more recent version of Pythons. Therefore, you may need to install such packages manually:
```bash
# Example installing distutils manually
pip install setuptools
```

> **Note**
> On windows, Make sure to add Node.js to your system's **PATH**.

### LLM endpoint setup

We only support the OpenAI-like APIs

- [Aphrodite](https://github.com/PygmalionAI/aphrodite-engine#quickstart) with an OpenAI API endpoint.
- [text-generation-webui](https://github.com/oobabooga/text-generation-webui/?tab=readme-ov-file#how-to-install) with exposed api.

**Recommended models**
We recommend using GPTQ quants to get the best possible model with the less GPU power. The more parameters (7B, 13B, etc..), the better the model will be (in this examples). But it will require more GPU power. It only supports NVIDIA cards.

> This are recommendations based on December 2023.
> Also, You can use oobabooga to run llama.cpp models without GPU.

- RTX 1660, 2060, RTX 3050, 3060
  - 7B models
    - [TheBloke/airoboros-l2-7B-gpt4-m2.0-GPTQ](https://huggingface.co/TheBloke/airoboros-l2-7B-gpt4-m2.0-GPTQ)
    - [TheBloke/zephyr-7B-beta-GPTQ](https://huggingface.co/TheBloke/zephyr-7B-beta-GPTQ)
    - [TheBloke/Airoboros-M-7B-3.1.2-GPTQ](https://huggingface.co/TheBloke/Airoboros-M-7B-3.1.2-GPTQ)
    - [TheBloke/OpenHermes-2.5-Mistral-7B-GPTQ](https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GPTQ)
- RTX 2060 12GB, 3060 12GB, 3080, A2000
  - 13B models
    - [TheBloke/Xwin-MLewd-13B-v0.2-GPTQ](https://huggingface.co/TheBloke/Xwin-MLewd-13B-v0.2-GPTQ)
    - [TheBloke/LLaMA2-13B-Tiefighter-GPTQ](https://huggingface.co/TheBloke/LLaMA2-13B-Tiefighter-GPTQ)
    - [TheBloke/MythoMax-L2-13B-GPTQ](https://huggingface.co/TheBloke/MythoMax-L2-13B-GPTQ)
- RTX 3080 20GB, A4500, A5000, 3090, 4090, 6000, Tesla V100
  - 20B models
    - [TheBloke/MLewd-ReMM-L2-Chat-20B-GPTQ](https://huggingface.co/TheBloke/MLewd-ReMM-L2-Chat-20B-GPTQ)
    - [TheBloke/Noromaid-20B-v0.1.1-GPTQ](https://huggingface.co/TheBloke/Noromaid-20B-v0.1.1-GPTQ)
  - 30B models (old llama v1, not recommended)
    - [TheBloke/Wizard-Vicuna-30B-Uncensored-GPTQ](https://huggingface.co/TheBloke/Wizard-Vicuna-30B-Uncensored-GPTQ)
    - [TheBloke/Chronoboros-33B-GPTQ](https://huggingface.co/TheBloke/Chronoboros-33B-GPTQ)
- A100 40GB, 2x3090, 2x4090, A40, RTX A6000, 8000, Titan Ada
  - 70B
    - [TheBloke/lzlv_70B-GPTQ](https://huggingface.co/TheBloke/lzlv_70B-GPTQ)
    - [TheBloke/Euryale-1.3-L2-70B-GPTQ](https://huggingface.co/TheBloke/Euryale-1.3-L2-70B-GPTQ)

```bash
# Example with Aphrodite
python -m aphrodite.endpoints.openai.api_server --model TheBloke/MythoMax-L2-13B-GPTQ -q gptq --api-keys sk-EMPTY
# Endpoint will be http://localhost:2242/v1

# Example with text-generation-webui
./start_linux.sh --api
# Then, load the model
# Endpoint will be http://localhost:5000/v1
```

## Installation

### Windows

1. Double-click `install.bat` or run it in the command prompt. This will install the necessary dependencies for Node.js.

2. The script will prompt you for optional API keys. Enter the keys when prompted or leave them blank if you don't have them.

### Linux / MacOS

1. Open a terminal and navigate to the project root directory.

2. Run `make install`. This will install the necessary dependencies.

3. The script will prompt you for optional API keys. Enter the keys when prompted or leave them blank if you don't have them.

## Running the Project

### Windows

1. Double-click `run.bat` or run it in the command prompt.

### Linux / MacOS

1. Open a terminal and navigate to the project root directory.

2. Run `make run`

## Servers

The UIs that are up an running are

```
# Bot directory UI
http://localhost:8585/

# Chat interactor UI
http://localhost:5173/

# Bot Builder UI
http://localhost:8586/
```

## Documentation

For more information on how to use the Mikugg project, please refer to the official documentation at [https://docs.miku.gg](https://docs.miku.gg).

# Local Development (Linux / MacOS)

```
pnpm install
pnpm build
```

### run

```bash
pnpm run

# hotfix for vite not refreshing deps
# need to restart the app with this command if you edit the deps under package/
rm -rf apps/interactor/node_modules/.vite && pnpm start
```

#### Pull new changes

To sync with the lastest version from git, just run

```bash
pnpm pull
```

#### publish

```bash
# publish public packages to npm
npx lerna publish --no-private
```
