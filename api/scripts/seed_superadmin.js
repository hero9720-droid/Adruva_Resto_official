const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:hero1749t@localhost:5432/adruva_resto',
});

async function seed() {
  console.log('🚀 Seeding realistic SuperAdmin data...');
  
  const client = await pool.connect();
  try {
    // 1. Clear existing dummy logs/payments if needed (optional)
    
    // 2. Insert fake Audit Logs
    const actors = ['Super Admin', 'Deepak Kumar', 'Rahul Sharma'];
    const events = [
      { type: 'CHAIN_PROVISIONED', details: 'New chain "Pizza Galaxy" authorized for Mumbai region.' },
      { type: 'PLAN_UPDATED', details: 'Tier "Pro" pricing adjusted to ₹4,999.' },
      { type: 'SECURITY_ALERT', details: 'Unauthorized login attempt blocked from IP 182.1.4.2.' },
      { type: 'SYSTEM_UPGRADE', details: 'Platform updated to v2.4.1 (Stable).' },
      { type: 'OUTLET_SUSPENDED', details: 'Outlet "Burger King - Thane" suspended due to non-payment.' }
    ];

    for (let i = 0; i < 20; i++) {
      const event = events[Math.floor(Math.random() * events.length)];
      await client.query(
        'INSERT INTO audit_logs (actor_name, event_type, details, created_at) VALUES ($1, $2, $3, $4)',
        [actors[Math.floor(Math.random() * actors.length)], event.type, event.details, new Date(Date.now() - i * 3600000)]
      );
    }

    // 3. Insert fake Revenue Trends (payment_transactions)
    // We need an outlet_id for this.
    const outletRes = await client.query('SELECT id FROM outlets LIMIT 1');
    if (outletRes.rows.length > 0) {
      const outletId = outletRes.rows[0].id;
      for (let i = 0; i < 14; i++) {
        const amount = Math.floor(Math.random() * 500000) + 100000;
        await client.query(
          "INSERT INTO payment_transactions (outlet_id, method, amount_paise, status, created_at) VALUES ($1, 'upi', $2, 'captured', $3)",
          [outletId, amount, new Date(Date.now() - i * 86400000)]
        );
      }
    }

    console.log('✅ Seeding complete! Dashboard will now show real trends.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
