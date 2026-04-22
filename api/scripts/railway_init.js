const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function init() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const appClient = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await appClient.connect();
    console.log(`Connected to database. Running migrations...`);

    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`Running migration: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await appClient.query(sql);
      console.log(`✓ Migration ${file} executed successfully.`);
    }

    console.log('All database migrations applied successfully!');
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  } finally {
    await appClient.end();
  }
}

init();
