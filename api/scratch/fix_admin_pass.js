const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function fix() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log('New Hash:', hash);

  const client = new Client({
    connectionString: "postgresql://postgres:GegkLDnhwBlbdfWotQSCBwjSDKTJFagb@roundhouse.proxy.rlwy.net:22168/railway"
  });

  try {
    await client.connect();
    // Update the superadmin user
    const res = await client.query(
      "UPDATE superadmin_users SET password_hash = $1 WHERE email = 'admin@adruvaresto.com' RETURNING id",
      [hash]
    );
    if (res.rowCount === 0) {
      // If user doesn't exist, insert it
      await client.query(
        "INSERT INTO superadmin_users (name, email, password_hash) VALUES ('Super Admin', 'admin@adruvaresto.com', $1)",
        [hash]
      );
      console.log('SuperAdmin inserted.');
    } else {
      console.log('SuperAdmin password updated.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

fix();
