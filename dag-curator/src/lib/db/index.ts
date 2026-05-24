import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

function createDbClient() {
  // Production: Turso distributed SQLite
  if (process.env.TURSO_DATABASE_URL) {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return drizzle(client, { schema });
  }

  // Local development: SQLite file
  const url = process.env.DATABASE_URL ?? "file:./local.db";
  const client = createClient({ url });
  return drizzle(client, { schema });
}

// Singleton for serverless / edge environments
declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof createDbClient> | undefined;
}

export const db = globalThis.__db ?? createDbClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

export type DB = typeof db;
