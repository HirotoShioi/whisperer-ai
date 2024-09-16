import { PGliteWorker } from "@electric-sql/pglite/worker";
import { drizzle } from "drizzle-orm/pglite";
import { applyMigrations } from "./migration";
import { schema } from "./schema";

let pgClient: PGliteWorker;
let dbInitializationPromise: Promise<ReturnType<typeof drizzle>>;

export async function getDB() {
  if (!dbInitializationPromise) {
    const startTime = performance.now();
    dbInitializationPromise = (async () => {
      pgClient = new PGliteWorker(
        new Worker(new URL("../workers/pg-lite-worker.js", import.meta.url), {
          type: "module",
        }),
        {
          dataDir: "idb://llmchat",
          meta: {},
        }
      );
      await pgClient.waitReady;
      const db = drizzle(pgClient as any, { schema });
      await applyMigrations(pgClient);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      console.log(`✅ db initialized in ${loadTime.toFixed(2)}ms`);
      return db;
    })();
  }
  return dbInitializationPromise;
}

export async function getPGClient(): Promise<PGliteWorker> {
  if (!pgClient) {
    await getDB();
  }
  return pgClient;
}
