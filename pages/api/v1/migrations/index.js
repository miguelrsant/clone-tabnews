import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(req, res) {
  const dbClient = await database.getNewClient();
  const defaultMigretionsOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  if (req.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigretionsOptions);
    await dbClient.end();
    return res.status(200).json(pendingMigrations);
  }
  if (req.method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigretionsOptions,
      dryRun: false,
    });
    await dbClient.end();
    if (migratedMigrations.length > 0) {
      res.status(201).json(migratedMigrations);
    }
    res.status(200).json(migratedMigrations);
  }

  return res.status(405).end();
}
