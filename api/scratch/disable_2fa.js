const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: "postgresql://postgres:GegkLDnhwBlbdfWotQSCBwjSDKTJFagb@roundhouse.proxy.rlwy.net:22168/railway"
  });

  try {
    await client.connect();
    await client.query(
      "UPDATE superadmin_users SET totp_enabled = false WHERE email = 'admin@adruvaresto.com'"
    );
    console.log('2FA disabled for admin.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

fix();
