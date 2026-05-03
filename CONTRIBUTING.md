# Sokora Contributing Guide

## Prerequisites

- Basic knowledge of [TypeScript](https://typescriptlang.org/) and [discord.js](https://discord.js.org/).
- [Bun](https://bun.sh) installed.

## Get started with contributing

### Getting the code

- Make a fork of this repository.
- Clone your fork.

### Creating your bot

- Head over to the [Discord Developer Portal](https://discord.com/developers/applications) and make a new application.
- Invite your bot to your server.
- Reset and then copy your bot's token.

### Database

Sokora supports **PostgreSQL**, **MySQL**, and **SQLite** through Bun's built-in `bun:sql` API. Pick the one that fits your setup.

#### PostgreSQL

- Get PostgreSQL at https://www.postgresql.org/download/ if you don't have it.
- On Windows keep the default port (`5432`).
- Launch `sudo -u postgres psql` (or SQL Shell on Windows).
- Create a user: `CREATE USER name CREATEDB PASSWORD 'pass';`
  - Absent semicolons cause it to silently fail. Make sure to type them.
  - Verify with `\du`.
- Create a database: `CREATE DATABASE dbname OWNER 'name';`
  - Verify by connecting: `psql -U name -d dbname`.

#### MySQL

- Get MySQL at https://dev.mysql.com/downloads/ if you don't have it.
- Keep the default port (`3306`).
- Create a user and database via the MySQL shell:
  ```sql
  CREATE USER 'name'@'localhost' IDENTIFIED BY 'pass';
  CREATE DATABASE dbname;
  GRANT ALL PRIVILEGES ON dbname.* TO 'name'@'localhost';
  ```

#### SQLite

- No installation required — Bun ships with SQLite support built in.
- Provide either a file path (e.g. `./data.db`) or `:memory:` for an in-memory database.

Follow to the next section to create a .env file that'll let Sokora connect to the database.

### Setting up .env

- Run `bun run setup` and our CLI tool will install dependencies and write `.env` for you. It'll ask you to paste in your bot's token and then which database adapter you want to use.
  - **PostgreSQL / MySQL**: provide your user, password, database name, host (default `localhost`), and port (default `5432` for PG, `3306` for MySQL).
  - **SQLite**: provide a file path (e.g. `./data.db`) or `:memory:` for an in-memory database.
  - If you choose Docker, the CLI will print the correct `docker compose` command to run.

### Running

- Run `bun dev`.

Be sure to open a pull request when you're ready to push your changes. Be descriptive of the changes you've made.

## Contribution guide

A few, simple guidelines onto how to contribute to Sokora.

### Reminders

- Remember to commit changes to `bun.lock` file.

### Code styling guidelines

A few guides onto how code contributed to Sokora should look like.

- Keep a consistent indentation of two spaces. Don't use tabs.
- Use `K&R` style for bracket placement (`function() {}` instead of `function() \n {}`).
- Avoid arrow parenthesis, this means preferring, for example, `.filter(s => s.trim())` above `.filter((s) => s.trim())`. Use parenthesis only if they're necessary, for example when you need to explicitly type a parameter.
- Use `camelCase` for both variables and function names.
- Keep lines reasonably short, don't fear linebreaks. Of course, longer lines are valid where needed.
- Use early returns to avoid nesting.
- Avoid curly braces in one-line `if` statements.
- Non-nullish assertions are valid when needed.
- Use the functions `safeChannel` and `safeMember` from `safeThings` instead of using the cache or fetching.
- Prefer `Promise.all` over having several `await` statements.

### Subete commit system (WIP)

We've created an alternative to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), aimed at improving its functionality. It'll be required to be used to contribute to this project when it gets proper documentation via a website.

Full layout: `![<type>@[scope] [part]] <description>`, where:

- `!` signifies a breaking change.
- `type` is the type of the commit, e.g `fix`, `feat`, `refactor`, etc.
- `scope` is where the changes happened.
- `part` shows the part of the commit.
- And finally, `description` is where the changes are described.

#### Examples

`[fix@settingsEmbed pt3] fixed OBJECT type`
`[chore] Update enhanced-ms to 4.3.0`
`![fix@settings] types have been fixed`

---

![PLEASE SUBMIT A PR, NO DIRECT COMMITS](https://user-images.githubusercontent.com/51555391/176925763-cdfd57ba-ae1e-4bf3-85e9-b3ebd30b1d59.png)
