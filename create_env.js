const fs = require("fs");
const path = require("path");
const readline = require("readline");
require("dotenv").config();

async function main() {
  const envFilePath = path.join(process.cwd(), ".env");
  const envExampleFilePath = path.join(process.cwd(), ".env.example");

  const envExampleContent = fs.readFileSync(envExampleFilePath, "utf-8");
  const envExampleLines = envExampleContent.split("\n");

  const env = {};
  for (const line of envExampleLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes("=")) {
      const [keyName, defaultValue = ""] = trimmedLine.split("=");
      let currentValue = process.env[keyName];

      if (
        currentValue === undefined &&
        defaultValue.includes("<") &&
        defaultValue.includes(">")
      ) {
        const new_value = await prompt(
          `Enter value for ${keyName} (default: ${defaultValue}): `
        );
        currentValue = new_value === "" ? "" : new_value;
      } else {
        currentValue = currentValue !== undefined ? currentValue : defaultValue;
      }
      env[keyName] = currentValue;
    }
  }

  saveEnvFile(env, envFilePath);

  const browserChatEnvFilePath = path.join(
    process.cwd(),
    "apps",
    "interactor",
    ".env"
  );
  saveEnvFile(env, browserChatEnvFilePath);
}

function saveEnvFile(env, filePath) {
  const content = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  fs.writeFileSync(filePath, content);
}

function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

main()
  .then(() => console.log("Environment setup complete."))
  .catch(console.error);
