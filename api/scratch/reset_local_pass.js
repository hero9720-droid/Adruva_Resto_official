const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const db = new Pool({ connectionString: 'postgresql://postgres:hero1749t@localhost:5432/adruva_resto' });

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  const r = await db.query('UPDATE staff SET password_hash = $1', [hash]);
  console.log('Updated rows:', r.rowCount);
  
  // Also reset chain_users password
  const r2 = await db.query('UPDATE chain_users SET password_hash = $1', [hash]);
  console.log('Chain users updated:', r2.rowCount);
  
  // Also reset superadmin password
  const r3 = await db.query('UPDATE superadmin_users SET password_hash = $1', [hash]);
  console.log('Superadmin updated:', r3.rowCount);
  
  await db.end();
}

run().catch(console.error);
