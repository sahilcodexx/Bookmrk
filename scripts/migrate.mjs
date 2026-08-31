// scripts/migrate.mjs — apply all pending SQL migrations in order.
//
// Reads every .sql file under `supabase/migrations/` and runs them in
// filename order. Idempotent within the file (each migration uses
// `if not exists` / `drop if exists` patterns) so re-running is safe.

import { readFileSync, readdirSync } from "node:fs";
import { Client } from "pg";
import { spawn } from "node:child_process";

const env = { ...process.env };
try {
  const txt = readFileSync(".env", "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
} catch (e) {
  console.error("No .env file");
  process.exit(1);
}

const dir = "supabase/migrations";
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error(`No .sql files in ${dir}`);
  process.exit(1);
}

const client = new Client({ connectionString: env.DATABASE_URL });
await client.connect();
try {
  for (const f of files) {
    const sql = readFileSync(`${dir}/${f}`, "utf8");
    console.log(`→ ${f}`);
    try {
      await client.query(sql);
      console.log(`  ✓ applied`);
    } catch (err) {
      console.error(`  ✗ failed: ${err.message}`);
      process.exit(1);
    }
  }
} finally {
  await client.end();
}
