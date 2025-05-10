import database from "infra/database.js";

export default async function status(req, res) {
  const updateAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxconnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxconnectionsValue =
    databaseMaxconnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedconnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseOpenedconnectionsValue =
    databaseOpenedconnectionsResult.rows[0].count;

  res.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxconnectionsValue),
        opened_connections: databaseOpenedconnectionsValue,
      },
    },
  });
}
