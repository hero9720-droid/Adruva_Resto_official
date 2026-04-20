const bcrypt = require('bcrypt');
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:GegkLDnhwBlbdfWotQSCBwjSDKTJFagb@roundhouse.proxy.rlwy.net:22168/railway'
});

async function run() {
  await client.connect();
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const res = await client.query('UPDATE staff SET password_hash = $1 WHERE email = $2', [hash, 'dipendrakalura113@gmail.com']);
    console.log('Password reset:', res.rowCount);
  } catch(e) {
    console.error(e.message);
  } finally {
    await client.end();
  }
}

run();
