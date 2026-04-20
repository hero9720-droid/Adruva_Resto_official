const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function init() {
  const dbName = process.env.DB_NAME || 'adruva_resto';
  
  // Connect to default 'postgres' database to create the new one
  const rootClient = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres'
  });

  try {
    await rootClient.connect();
    const res = await rootClient.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    if (res.rowCount > 0) {
      console.log(`Dropping existing database ${dbName}...`);
      // Terminate other connections to the database before dropping
      await rootClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${dbName}'
          AND pid <> pg_backend_pid();
      `);
      await rootClient.query(`DROP DATABASE ${dbName}`);
    }
    
    console.log(`Creating database ${dbName}...`);
    await rootClient.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database ${dbName} created successfully.`);
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  // Connect to the new database and run migrations
  const appClient = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: dbName
  });

  try {
    await appClient.connect();
    console.log(`Connected to ${dbName}. Running migrations...`);

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
