const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:hero1749t@localhost:5432/adruva_resto',
});

async function seed() {
  console.log('🚀 Seeding realistic Outlet demo data...');
  
  const client = await pool.connect();
  try {
    const outletRes = await client.query('SELECT id FROM outlets LIMIT 1');
    if (outletRes.rows.length === 0) {
      console.log('❌ No outlet found. Run standard seed first.');
      return;
    }
    const outletId = outletRes.rows[0].id;

    // 1. Seed Ingredients
    const ingredients = [
      { name: 'Chicken Breast', category: 'PROTEIN', unit: 'KG', stock: 50, low: 10, cost: 35000 },
      { name: 'Basmati Rice', category: 'GRAINS', unit: 'KG', stock: 100, low: 20, cost: 9000 },
      { name: 'Tomato', category: 'VEG', unit: 'KG', stock: 5, low: 15, cost: 4000 }, // Low stock!
      { name: 'Olive Oil', category: 'OILS', unit: 'LTR', stock: 20, low: 5, cost: 120000 },
      { name: 'Paneer', category: 'DAIRY', unit: 'KG', stock: 12, low: 5, cost: 45000 }
    ];

    const ingIds = [];
    for (const ing of ingredients) {
      const res = await client.query(
        `INSERT INTO ingredients (outlet_id, name, category, unit, current_stock, low_threshold, avg_cost_paise)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [outletId, ing.name, ing.category, ing.unit, ing.stock, ing.low, ing.cost]
      );
      ingIds.push({ id: res.rows[0].id, ...ing });
    }

    // 2. Seed Menu Items
    const menuItems = [
      { name: 'Butter Chicken', category: 'Main Course', price: 45000, desc: 'Classic creamy butter chicken.' },
      { name: 'Paneer Tikka', category: 'Starters', price: 32000, desc: 'Grilled cottage cheese skewers.' },
      { name: 'Chicken Biryani', category: 'Rice', price: 38000, desc: 'Fragrant chicken biryani.' }
    ];

    for (const item of menuItems) {
      await client.query(
        `INSERT INTO menu_items (outlet_id, name, category, price_paise, description, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [outletId, item.name, item.category, item.price, item.desc]
      );
    }

    // 3. Seed Suppliers
    const suppliers = [
      { name: 'Metro Wholesale', person: 'Amit', email: 'metro@wholesale.com', phone: '9876543210' },
      { name: 'Daily Fresh Veggies', person: 'Suresh', email: 'fresh@veggies.in', phone: '9123456789' }
    ];

    for (const s of suppliers) {
      await client.query(
        `INSERT INTO suppliers (outlet_id, name, contact_person, email, phone)
         VALUES ($1, $2, $3, $4, $5)`,
        [outletId, s.name, s.person, s.email, s.phone]
      );
    }

    // 4. Seed Stock Movements
    for (const ing of ingIds) {
      await client.query(
        `INSERT INTO stock_movements (outlet_id, ingredient_id, type, quantity, notes)
         VALUES ($1, $2, 'purchase', $3, 'Initial setup stock')`,
        [outletId, ing.id, ing.stock]
      );
    }

    console.log('✅ Outlet demo data seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
