import type { Config } from "drizzle-kit";

const config: Config = process.env.TURSO_DATABASE_URL
  ? {
      schema: "./src/lib/db/schema.ts",
      out: "./drizzle",
      dialect: "turso",
      dbCredentials: {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
    }
  : {
      schema: "./src/lib/db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: {
        url: process.env.DATABASE_URL ?? "file:./local.db",
      },
    };

export default config;
