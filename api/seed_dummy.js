const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:GegkLDnhwBlbdfWotQSCBwjSDKTJFagb@roundhouse.proxy.rlwy.net:22168/railway' });

async function seed() {
  await client.connect();
  try {
    const r1 = await client.query('SELECT id FROM outlets WHERE name = $1', ['dk']);
    if (!r1.rows.length) return console.log('Outlet not found');
    const outletId = r1.rows[0].id;

    // Check if items already exist
    const count = await client.query('SELECT count(*) FROM menu_items WHERE outlet_id = $1', [outletId]);
    if (count.rows[0].count > 0) {
      console.log('Already has items');
      return;
    }

    const r2 = await client.query('INSERT INTO menu_categories (outlet_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id', [outletId, 'Burgers', 1]);
    const catId = r2.rows[0].id;
    
    await client.query('INSERT INTO menu_items (outlet_id, category_id, name, description, photo_url, base_price_paise, food_type, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7, true)', [outletId, catId, 'Adruva Signature Burger', 'Delicious double patty burger with special sauce.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200', 25000, 'non_veg']);
    
    console.log('Dummy menu item added!');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

seed();
