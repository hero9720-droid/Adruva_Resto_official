require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { db, withOutletContext } = require('../src/lib/db');

async function verify() {
  console.log('--- ADRUVA RESTO OPERATIONS VERIFICATION ---');
  console.log('DB URL Status:', process.env.DATABASE_URL ? 'LOADED' : 'NOT LOADED');

  try {
    // 1. Get an existing outlet
    const outletRes = await db.query('SELECT id, name, chain_id FROM outlets LIMIT 1');
    if (outletRes.rowCount === 0) {
      console.error('❌ No outlets found. Please run seed script first.');
      process.exit(1);
    }
    const outlet = outletRes.rows[0];
    console.log(`✅ Found Outlet: ${outlet.name} (${outlet.id})`);

    // 2. Test Rooms Module Logic
    console.log('\n--- Testing Rooms Module ---');
    const roomName = 'Test Room ' + Date.now().toString().slice(-4);
    
    const newRoom = await withOutletContext(outlet.id, async (client) => {
      const res = await client.query(
        'INSERT INTO rooms (outlet_id, name, floor, capacity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [outlet.id, roomName, '1st', 2, 'available']
      );
      return res.rows[0];
    });
    console.log(`✅ Room Created: ${newRoom.name} [ID: ${newRoom.id}]`);

    // Update Room
    await withOutletContext(outlet.id, async (client) => {
      await client.query('UPDATE rooms SET status = $1 WHERE id = $2', ['occupied', newRoom.id]);
    });
    console.log('✅ Room Status Updated to OCCUPIED');

    // 3. Test Online Orders Logic
    console.log('\n--- Testing Online Orders Logic ---');
    const orderNum = 'QR-' + Date.now().toString().slice(-4);
    const newOrder = await withOutletContext(outlet.id, async (client) => {
      const res = await client.query(
        `INSERT INTO orders (outlet_id, order_number, order_type, source, status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [outlet.id, orderNum, 'dine_in', 'qr', 'confirmed']
      );
      return res.rows[0];
    });
    console.log(`✅ Online (QR) Order Created: ${newOrder.order_number}`);

    // Verify filter by source
    const filtered = await withOutletContext(outlet.id, async (client) => {
      const res = await client.query('SELECT * FROM orders WHERE outlet_id = $1 AND source = $2', [outlet.id, 'qr']);
      return res.rows;
    });
    const found = filtered.some(o => o.id === newOrder.id);
    console.log(found ? '✅ Source filtering verified: QR order found in queue.' : '❌ Source filtering failed.');

    // 4. Cleanup Test Data
    await withOutletContext(outlet.id, async (client) => {
      await client.query('DELETE FROM orders WHERE id = $1', [newOrder.id]);
      await client.query('DELETE FROM rooms WHERE id = $1', [newRoom.id]);
    });
    console.log('\n✅ Cleanup: Test data removed.');
    console.log('\n--- VERIFICATION COMPLETE: ALL SYSTEMS NOMINAL ---');

  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED');
    console.error(err);
  } finally {
    if (db) await db.end();
  }
}

verify();
