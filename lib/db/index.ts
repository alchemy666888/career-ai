import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getServerEnv } from "@/lib/config/env";
import * as schema from "./schema";

export function getDb() {
  const sql = neon(getServerEnv().DATABASE_URL);
  return drizzle(sql, { schema });
}
