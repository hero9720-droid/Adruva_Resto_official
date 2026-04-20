/**
 * Adruva Resto — Seed Script
 * Creates: 1 plan + 1 chain + 1 outlet + 1 subscription + 1 manager + menu + tables
 * Run: npx tsx seed.ts
 */

import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const db = new Pool({
  user: 'postgres',
  password: 'hero1749t',
  host: 'localhost',
  port: 5432,
  database: 'adruva_resto',
});

async function seed() {
  console.log('🌱 Starting seed...\n');

  // 1. Plan (correct column names: monthly_price_paise, annual_price_paise)
  const planRes = await db.query(`
    INSERT INTO plans (name, monthly_price_paise, annual_price_paise, max_menu_items, max_staff, max_tables, features)
    VALUES ('starter', 99900, 999000, 50, 5, 10, '{"pos": true, "kds": true, "reservations": true}')
    ON CONFLICT (name) DO UPDATE SET monthly_price_paise = 99900
    RETURNING id
  `);
  const plan_id = planRes.rows[0].id;
  console.log(`✅ Plan: starter (id: ${plan_id})`);

  // 2. Chain
  const chainRes = await db.query(`
    INSERT INTO chains (name, email, phone)
    VALUES ('Adruva Foods Pvt Ltd', 'admin@adruvafoods.com', '9999999999')
    ON CONFLICT (email) DO UPDATE SET name = 'Adruva Foods Pvt Ltd'
    RETURNING id
  `);
  const chain_id = chainRes.rows[0].id;
  console.log(`✅ Chain: Adruva Foods Pvt Ltd (id: ${chain_id})`);

  // 3. Outlet (with plan_id)
  const outletRes = await db.query(`
    INSERT INTO outlets (chain_id, plan_id, name, phone, address, city, slug, status)
    VALUES ($1, $2, 'Adruva Gourmet - Andheri', '9988776655', 'Shop 12, Link Road, Andheri West', 'Mumbai', 'adruva-andheri', 'active')
    ON CONFLICT (slug) DO UPDATE SET name = 'Adruva Gourmet - Andheri'
    RETURNING id
  `, [chain_id, plan_id]);
  const outlet_id = outletRes.rows[0].id;
  console.log(`✅ Outlet: Adruva Gourmet - Andheri (id: ${outlet_id})`);

  // 4. Subscription (outlet_id, not chain_id — per DB schema)
  const now = new Date();
  const oneYear = new Date(now);
  oneYear.setFullYear(oneYear.getFullYear() + 1);

  await db.query(`
    INSERT INTO subscriptions (outlet_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
    VALUES ($1, $2, 'active', 'annual', $3, $4)
    ON CONFLICT (outlet_id) DO UPDATE SET status = 'active', current_period_end = $4
  `, [outlet_id, plan_id, now.toISOString(), oneYear.toISOString()]);
  console.log(`✅ Subscription: active (1 year)`);

  // 5. Staff / Outlet Manager
  const password_hash = await bcrypt.hash('Admin@1234', 12);
  await db.query(`
    INSERT INTO staff (outlet_id, name, email, phone, role, password_hash, is_active)
    VALUES ($1, 'Outlet Manager', 'manager@adruva.com', '9876543210', 'outlet_manager', $2, true)
    ON CONFLICT (email) DO UPDATE SET password_hash = $2, is_active = true
  `, [outlet_id, password_hash]);
  console.log(`✅ Staff: manager@adruva.com / Admin@1234`);

  // 6. Menu Categories
  const categories = [
    { name: 'Starters', icon: '🥗', sort_order: 1 },
    { name: 'Main Course', icon: '🍛', sort_order: 2 },
    { name: 'Breads', icon: '🫓', sort_order: 3 },
    { name: 'Beverages', icon: '🥤', sort_order: 4 },
    { name: 'Desserts', icon: '🍮', sort_order: 5 },
  ];
  for (const cat of categories) {
    await db.query(`
      INSERT INTO menu_categories (outlet_id, name, icon, sort_order, is_active)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT DO NOTHING
    `, [outlet_id, cat.name, cat.icon, cat.sort_order]);
  }
  console.log(`✅ 5 menu categories`);

  // 7. Menu Items
  const catRes = await db.query(`SELECT id, name FROM menu_categories WHERE outlet_id = $1`, [outlet_id]);
  const catMap: Record<string, string> = {};
  for (const c of catRes.rows) catMap[c.name] = c.id;

  const items = [
    { name: 'Paneer Tikka',   desc: 'Marinated cottage cheese grilled in tandoor', price: 28000, cost: 12000, type: 'veg',     cat: 'Starters',     featured: true  },
    { name: 'Chicken 65',     desc: 'Crispy fried chicken with South Indian spices', price: 32000, cost: 14000, type: 'non_veg', cat: 'Starters',     featured: true  },
    { name: 'Dal Makhani',    desc: 'Slow-cooked black lentils in creamy tomato gravy', price: 22000, cost: 8000, type: 'veg', cat: 'Main Course',   featured: false },
    { name: 'Butter Chicken', desc: 'Tender chicken in rich tomato-butter sauce', price: 34000, cost: 15000, type: 'non_veg', cat: 'Main Course',    featured: true  },
    { name: 'Garlic Naan',    desc: 'Soft leavened bread with garlic butter', price: 6000, cost: 2000, type: 'veg',     cat: 'Breads',       featured: false },
    { name: 'Masala Chai',    desc: 'Spiced Indian milk tea', price: 4000, cost: 1000, type: 'veg',     cat: 'Beverages',    featured: false },
    { name: 'Gulab Jamun',    desc: 'Soft milk-solid dumplings in rose syrup', price: 12000, cost: 4000, type: 'veg', cat: 'Desserts',      featured: false },
  ];

  for (const item of items) {
    await db.query(`
      INSERT INTO menu_items (outlet_id, category_id, name, description, base_price_paise, cost_price_paise, food_type, is_available, is_featured, preparation_time_minutes, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, 15, 1)
      ON CONFLICT DO NOTHING
    `, [outlet_id, catMap[item.cat], item.name, item.desc, item.price, item.cost, item.type, item.featured]);
  }
  console.log(`✅ 7 menu items`);

  // 8. Tables
  for (let i = 1; i <= 8; i++) {
    await db.query(`
      INSERT INTO tables (outlet_id, table_number, capacity, status)
      VALUES ($1, $2, 4, 'available')
      ON CONFLICT DO NOTHING
    `, [outlet_id, i]);
  }
  console.log(`✅ 8 tables\n`);

  console.log('╔═══════════════════════════════════════╗');
  console.log('║        🎉 SEED COMPLETE!              ║');
  console.log('╠═══════════════════════════════════════╣');
  console.log('║  Email:    manager@adruva.com         ║');
  console.log('║  Password: Admin@1234                 ║');
  console.log('║  URL:      http://localhost:3001      ║');
  console.log('╚═══════════════════════════════════════╝\n');

  await db.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
