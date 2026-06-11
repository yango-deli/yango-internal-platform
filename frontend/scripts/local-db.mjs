// Local development PostgreSQL using embedded-postgres.
// Keeps a real Postgres server running on port 5433 with data in frontend/.localdb
// so the app works locally without Docker or a system Postgres install.
//
// Usage:
//   node scripts/local-db.mjs         → initialise (first run), start, and stay alive
//   node scripts/local-db.mjs stop    → stop a running server
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const databaseDir = join(__dirname, "..", ".localdb");
const PORT = 5433;
const DB_NAME = "yango";

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

const mode = process.argv[2];

async function main() {
  if (mode === "stop") {
    await pg.stop();
    console.log("Local DB stopped.");
    return;
  }

  const fresh = !existsSync(databaseDir);
  if (fresh) {
    console.log("Initialising local Postgres data directory...");
    await pg.initialise();
  }

  await pg.start();

  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Created database "${DB_NAME}".`);
  } catch {
    // Database already exists — fine.
  }

  console.log(
    `LOCAL_DB_READY postgresql://postgres:postgres@localhost:${PORT}/${DB_NAME}`
  );

  const shutdown = async () => {
    console.log("\nStopping local Postgres...");
    try {
      await pg.stop();
    } catch {}
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep the process alive so the server stays up.
  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
