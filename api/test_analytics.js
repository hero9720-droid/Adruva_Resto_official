const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:GegkLDnhwBlbdfWotQSCBwjSDKTJFagb@roundhouse.proxy.rlwy.net:22168/railway'
});

async function run() {
  await client.connect();
  try {
    const r1 = await client.query('SELECT id FROM outlets WHERE name = $1', ['dk']);
    const outletId = r1.rows[0].id;
    const token = jwt.sign({ id: 'dummy', outlet_id: outletId, role: 'outlet_manager' }, 'adruva_resto_super_secret_key_2026', { expiresIn: '1h' });
    
    const res = await axios.get('https://adruvaresto-backend-production.up.railway.app/api/analytics/overview', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('SUCCESS:', res.data);
  } catch(e) {
    console.log('ERROR:', e.response?.data || e.message);
  } finally {
    await client.end();
  }
}

run();
