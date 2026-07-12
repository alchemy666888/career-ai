import { execFileSync } from "node:child_process";


const target = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
const vercelEnv = process.env.VERCEL_ENV ?? "development";

if (process.env.NODE_ENV === "production" || vercelEnv === "production" || /prod|production/i.test(target)) {
  throw new Error("Refusing to reset a Production database. Use a dedicated local or Preview database only.");
}

execFileSync("npx", ["drizzle-kit", "migrate"], { stdio: "inherit", env: { ...process.env, DATABASE_URL: target } });
