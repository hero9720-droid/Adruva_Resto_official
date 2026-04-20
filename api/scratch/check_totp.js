const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: "postgresql://postgres:GegkLDnhwBlbdfWotQSCBwjSDKTJFagb@roundhouse.proxy.rlwy.net:22168/railway"
  });

  try {
    await client.connect();
    const res = await client.query("SELECT id, email, totp_enabled FROM superadmin_users");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
