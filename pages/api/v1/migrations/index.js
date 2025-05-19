import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";
import { error } from "node:console";

export default async function migrations(req, res) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).end({
      error: `Method "${res.method} not allowed"`,
    });
  }
  let dbClient;
  try {
    dbClient = await database.getNewClient();
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
      return res.status(200).json(pendingMigrations);
    }
    if (req.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigretionsOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        res.status(201).json(migratedMigrations);
      }
      res.status(200).json(migratedMigrations);
    }
  } catch {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
