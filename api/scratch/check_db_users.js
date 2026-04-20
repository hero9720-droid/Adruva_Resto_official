const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: "postgresql://postgres:GegkLDnhwBlbdfWotQSCBwjSDKTJFagb@roundhouse.proxy.rlwy.net:22168/railway"
  });

  try {
    await client.connect();
    const res = await client.query("SELECT * FROM superadmin_users");
    console.log('Total Users:', res.rowCount);
    res.rows.forEach(user => {
      console.log(`User: ${user.name}, Email: '${user.email}', Has Hash: ${!!user.password_hash}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
