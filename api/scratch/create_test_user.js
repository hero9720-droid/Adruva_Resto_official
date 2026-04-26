
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const outletId = '5ecedb48-bdb9-4a7d-8b22-a93c1e14eada';
    const hash = await bcrypt.hash('password123', 12);
    
    // Check if user already exists
    const check = await pool.query('SELECT id FROM staff WHERE email = $1', ['test@example.com']);
    if (check.rows.length > 0) {
        await pool.query('UPDATE staff SET password_hash = $1, is_active = true WHERE email = $2', [hash, 'test@example.com']);
        console.log('Updated existing user.');
    } else {
        await pool.query(
            'INSERT INTO staff (outlet_id, name, email, role, password_hash, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
            [outletId, 'Test Manager', 'test@example.com', 'outlet_manager', hash, true]
        );
        console.log('Created new user.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
