const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const db = new Pool({ connectionString: 'postgresql://postgres:hero1749t@localhost:5432/adruva_resto' });

async function run() {
  const hash = await bcrypt.hash('admin123', 10);
  
  // Add waiter
  await db.query(`DELETE FROM staff WHERE email = 'waiter@adruva.com'`);
  await db.query(`
    INSERT INTO staff (outlet_id, name, email, role, password_hash, is_active)
    VALUES ('5ecedb48-bdb9-4a7d-8b22-a93c1e14eada', 'Test Waiter', 'waiter@adruva.com', 'waiter', $1, true)
  `, [hash]);
  console.log('Waiter staff seeded OK');
  
  // Add cashier
  await db.query(`DELETE FROM staff WHERE email = 'cashier@adruva.com'`);
  await db.query(`
    INSERT INTO staff (outlet_id, name, email, role, password_hash, is_active)
    VALUES ('5ecedb48-bdb9-4a7d-8b22-a93c1e14eada', 'Test Cashier', 'cashier@adruva.com', 'cashier', $1, true)
  `, [hash]);
  console.log('Cashier staff seeded OK');
  
  await db.end();
}

run().catch(console.error);
