#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const sqlFile = process.argv[2] || 'supabase/migrations/20260222183649_create_smart_robot_schema.sql';
const connection = process.env.SUPABASE_DB_URL;

if (!connection) {
  console.error('Missing SUPABASE_DB_URL in environment. Set it in .env or env vars.');
  process.exit(1);
}

if (!fs.existsSync(sqlFile)) {
  console.error('SQL file not found:', sqlFile);
  process.exit(2);
}

const sql = fs.readFileSync(sqlFile, 'utf8');

(async () => {
  const client = new Client({ connectionString: connection });
  try {
    await client.connect();
    console.log('Connected to Postgres, running migration:', sqlFile);
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration completed successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message || err);
    try { await client.query('ROLLBACK'); } catch (e) {}
    await client.end();
    process.exit(3);
  }
})();
