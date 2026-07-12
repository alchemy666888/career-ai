import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { getServerEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

export type Database = ReturnType<typeof createDb>;

export function createDb(url = getServerEnv().DATABASE_URL) {
  const client = postgres(url, { max: 1, prepare: false });
  return drizzle(client, { schema });
}

let singleton: Database | undefined;

export function getDb() {
  singleton ??= createDb();
  return singleton;
}
