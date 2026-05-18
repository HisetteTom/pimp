import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { spawn } from "bun";
import { db } from "../src/db/index";
import { sql } from "drizzle-orm";

async function runCommand(command: string, args: string[]) {
  console.log(`\x1b[34m%s\x1b[0m`, `> ${command} ${args.join(" ")}`);
  const proc = spawn([command, ...args], {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Command ${command} failed with exit code ${exitCode}`);
  }
}

async function main() {
  console.log("\x1b[36m%s\x1b[0m", "Starting Pimp Setup...");

  console.log("\x1b[33m%s\x1b[0m", "Starting Docker containers...");
  await runCommand("docker", ["compose", "up", "-d"]);

  console.log("\x1b[33m%s\x1b[0m", "Waiting for database to be ready...");
  let retries = 10;
  while (retries > 0) {
    try {
      await db.execute(sql`SELECT 1`);
      break;
    } catch (e) {
      retries--;
      if (retries === 0) {
          console.error("Database connection error:", e);
          throw new Error("Database connection timed out");
      }
      console.log(`Retrying... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\x1b[33m%s\x1b[0m", "Enabling pg_trgm extension...");
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    console.log("\x1b[32m%s\x1b[0m", "pg_trgm extension enabled.");
  } catch (e) {
    console.warn("Could not enable pg_trgm extension.");
  }

  console.log("\x1b[33m%s\x1b[0m", "Pushing database schema...");
  await runCommand("bunx", ["drizzle-kit", "push"]);

  console.log(
    "\x1b[32m%s\x1b[0m",
    "\nSetup complete. You can now run 'bun dev'.",
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("\x1b[31m%s\x1b[0m", "Setup failed:");
  console.error(err);
  process.exit(1);
});
