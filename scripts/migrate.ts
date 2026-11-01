import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://postgres:orthodev@localhost:5432/orthophonie";

const sql = postgres(connectionString);

async function main() {
  await sql`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS notes text;`;
  console.log("Column notes added successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
