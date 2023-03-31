# Mikugg Project

This is the Mikugg project, which includes multiple applications and services. This README provides instructions on how to set up and run the project on both Windows and Linux.

## Prerequisites

- Python 3.9: Download and install from [https://www.python.org/downloads/](https://www.python.org/downloads/)
- Node.js: Download and install from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- Pip: Download and install from [https://pip.pypa.io/en/stable/installation/](https://pip.pypa.io/en/stable/installation/)

> **Note**
> On windows, Make sure to add Python, Node.js, and pip to your system's **PATH**.

## Installation

### Windows

1. Double-click `install.bat` or run it in the command prompt. This will install the necessary dependencies for both Node.js and Python projects.

2. The script will prompt you for optional API keys. Enter the keys when prompted or leave them blank if you don't have them.

### Linux

1. Open a terminal and navigate to the project root directory.

2. Run `make install`. This will install the necessary dependencies for both Node.js and Python projects.

3. The script will prompt you for optional API keys. Enter the keys when prompted or leave them blank if you don't have them.

## Running the Project

### Windows

1. Double-click `run.bat` or run it in the command prompt. This will start both the Node.js and Python servers.

### Linux

1. Open a terminal and navigate to the project root directory.

2. Run `make run`. This will start both the Node.js and Python servers.

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


# Local Development (Linux)
```
pnpm install
pnpm build
```

### run
```bash
pnpm run

# hotfix for vite not refreshing deps
# need to restart the app with this command if you edit the deps under package/ 
rm -rf apps/browser-chat/node_modules/.vite && pnpm start 
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