import * as fs from "fs";
import { createInterface } from "readline";

const readHiddenInput = async (prompt: string): Promise<string> => {
  console.log(prompt);

  return new Promise(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    if (stdin.isTTY) stdin.setRawMode(true);

    stdin.on("data", data => {
      if (data.toString() == "\n" || data.toString() == "\r") {
        if (stdin.isTTY) stdin.setRawMode(false);
        process.stdout.moveCursor(0, -1);
        process.stdout.clearLine(1);
        process.stdout.moveCursor(0, 1);
        rl.close();
      }
    });

    rl.question("", input => resolve(input));
  });
};

const replaceInEnv = (key: string, value: string) => {
  try {
    const envContent = fs.readFileSync(".env", "utf-8");
    const updatedContent = envContent.replace(key, value);
    fs.writeFileSync(".env", updatedContent, "utf-8");
  } catch (error) {
    console.error(`Error updating .env file: ${error}`);
  }
};

const buildNetworkUrl = async (scheme: string, defaultPort: string): Promise<string> => {
  const user = await readHiddenInput(`Enter your ${scheme} user below`);
  const pass = await readHiddenInput(`Enter your ${scheme} password below`);
  const name = await readHiddenInput(`Enter your ${scheme} database name below`);
  const host = await readHiddenInput(
    'IF using a host different than "localhost", enter it here, otherwise hit Return',
  );
  const port = await readHiddenInput(
    `IF using a port different than "${defaultPort}", enter it here, otherwise hit Return`,
  );
  const h = host.trim() == "" ? "localhost" : host.trim();
  const p = port.trim() == "" ? defaultPort : port.trim();
  return `${scheme}://${user}:${pass}@${h}:${p}/${name}`;
};

const main = async () => {
  fs.copyFileSync("example.env", ".env");
  const token = await readHiddenInput(
    "Paste your bot token below: (you can get one from https://discord.com/developers/applications)",
  );
  replaceInEnv("YOUR_TOKEN", token);

  const useDocker = confirm(
    "Are you going to use Docker (Y) or setup manually (N, or any other key)?",
  );

  if (useDocker) {
    console.log(
      "Pick a profile when starting: `docker compose --profile postgres up` or `docker compose --profile mysql up`.\nFor SQLite, no extra service is needed — just set DATABASE_URL to a sqlite:// path in your .env.",
    );
  } else {
    console.log("Which database adapter? (1) PostgreSQL  (2) MySQL  (3) SQLite");
    const adapter = await readHiddenInput("Enter 1, 2, or 3:");

    if (adapter.trim() == "1") {
      const url = await buildNetworkUrl("postgres", "5432");
      replaceInEnv("postgres://user:pass@localhost:5432/dbname", url);
    } else if (adapter.trim() == "2") {
      const url = await buildNetworkUrl("mysql", "3306");
      replaceInEnv("postgres://user:pass@localhost:5432/dbname", url);
    } else {
      const filePath = await readHiddenInput(
        'Enter the SQLite file path (e.g. ./data.db) or ":memory:" for an in-memory database:',
      );
      const url = filePath.trim() == ":memory:" ? ":memory:" : `sqlite://${filePath.trim()}`;
      replaceInEnv("postgres://user:pass@localhost:5432/dbname", url);
    }
  }

  const errorsId = await readHiddenInput(
    "Enter an error channel ID. Sokora will send detailed error logs here whenever a command breaks. (Optional.)",
  );
  if (errorsId.trim() != "") replaceInEnv("YOUR_CHANNEL_ID", errorsId);
  const ownerId = await readHiddenInput(
    "Enter your user ID. Sokora might give it some use. (Optional.)",
  );
  if (ownerId.trim() != "") replaceInEnv("YOUR_USER_ID", ownerId);
  console.log("You're good to go, happy coding!");
};

main().catch(console.error);
