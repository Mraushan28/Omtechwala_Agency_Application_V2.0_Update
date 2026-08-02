// Starts an embedded PostgreSQL instance (no system install / sudo required).
// Usage: node scripts/db-start.mjs
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve(".pgdata");
const port = 5432;
const user = "postgres";
const password = "postgres";
const database = "om_techwala";

const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user,
    password,
    port,
    persistent: true,
});

async function main() {
    // Initialize the data directory on first run.
    if (!fs.existsSync(path.join(dataDir, "PG_VERSION"))) {
        console.log("Initializing embedded PostgreSQL data directory...");
        await pg.initialise();
        console.log("Data directory initialized.");
    }

    console.log(`Starting embedded PostgreSQL on port ${port}...`);
    await pg.start();
    console.log(`PostgreSQL running: postgresql://${user}:${password}@localhost:${port}`);

    // Create the application database if it doesn't exist.
    try {
        await pg.createDatabase(database);
        console.log(`Database '${database}' is ready.`);
    } catch (err) {
        console.log(`Database '${database}' already exists (${err?.message ?? "ok"}).`);
    }

    console.log("Embedded PostgreSQL is ready. Keep this process running.");
}

main().catch((err) => {
    console.error("Failed to start embedded PostgreSQL:", err);
    process.exit(1);
});

