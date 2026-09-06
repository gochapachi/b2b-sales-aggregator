const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
  const client = new Client({
    host: "213.199.62.248",
    port: 5435,
    user: "postgres",
    password: "b2b_secret_pass_2026",
    database: "b2b_aggregator",
    connectionTimeoutMillis: 10000,
  });

  console.log("Connecting to PostgreSQL on 213.199.62.248:5435...");
  await client.connect();
  console.log("Connected successfully!");

  const sqlPath = path.join(__dirname, "../docker/init.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("Applying init.sql schema & seed data...");
  await client.query(sql);
  console.log("Schema applied successfully!");

  const tables = [
    "users",
    "organizations",
    "retailers",
    "products",
    "product_skus",
    "beats",
    "beat_schedules",
    "orders",
    "sub_orders",
    "order_items",
    "visits"
  ];

  console.log("\nVerifying table counts:");
  for (const table of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
    console.log(`- ${table}: ${res.rows[0].count} rows`);
  }

  await client.end();
  console.log("\nDatabase initialization complete!");
}

main().catch(err => {
  console.error("Database initialization failed:", err);
  process.exit(1);
});
