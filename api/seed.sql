-- Adruva Resto — Complete Seed (Single DO block, schema-safe)
DO $$
DECLARE
  v_plan_id    UUID;
  v_chain_id   UUID;
  v_outlet_id  UUID;
  v_c_starter  UUID;
  v_c_main     UUID;
  v_c_bread    UUID;
  v_c_bev      UUID;
  v_c_dessert  UUID;
BEGIN

  -- 1. Plan (no unique on name — check first)
  SELECT id INTO v_plan_id FROM plans WHERE name = 'starter' LIMIT 1;
  IF v_plan_id IS NULL THEN
    INSERT INTO plans (name, monthly_price_paise, annual_price_paise, max_menu_items, max_staff, max_tables, features)
    VALUES ('starter', 99900, 999000, 100, 10, 20, '{"pos": true, "kds": true, "reservations": true}')
    RETURNING id INTO v_plan_id;
  END IF;
  RAISE NOTICE 'Plan id: %', v_plan_id;

  -- 2. Chain (owner_email IS unique)
  INSERT INTO chains (name, owner_email, owner_name, owner_phone, plan_id, status)
  VALUES ('Adruva Foods Pvt Ltd', 'admin@adruvafoods.com', 'Deepak Kumar', '9999999999', v_plan_id, 'active')
  ON CONFLICT (owner_email) DO UPDATE SET name = 'Adruva Foods Pvt Ltd'
  RETURNING id INTO v_chain_id;
  RAISE NOTICE 'Chain id: %', v_chain_id;

  -- 3. Outlet (subdomain IS unique)
  INSERT INTO outlets (chain_id, plan_id, name, phone, address, city, subdomain, subscription_status, subscription_end_date, is_active)
  VALUES (v_chain_id, v_plan_id, 'Adruva Gourmet - Andheri', '9988776655', 'Shop 12, Link Road, Andheri West', 'Mumbai', 'adruva-andheri', 'active', NOW() + INTERVAL '1 year', true)
  ON CONFLICT (subdomain) DO UPDATE SET subscription_status = 'active', subscription_end_date = NOW() + INTERVAL '1 year'
  RETURNING id INTO v_outlet_id;
  RAISE NOTICE 'Outlet id: %', v_outlet_id;

  -- 4. Subscription (outlet_id IS unique)
  INSERT INTO subscriptions (outlet_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
  VALUES (v_outlet_id, v_plan_id, 'active', 'annual', NOW(), NOW() + INTERVAL '1 year')
  ON CONFLICT (outlet_id) DO UPDATE SET status = 'active', current_period_end = NOW() + INTERVAL '1 year';

  -- 5. Staff — outlet_manager (password: Admin@1234)
  INSERT INTO staff (outlet_id, name, email, phone, role, password_hash, is_active)
  VALUES (
    v_outlet_id, 'Outlet Manager', 'manager@adruva.com', '9876543210',
    'outlet_manager',
    '$2b$12$bm2vc/ma4YI0x.DF2fcWAeo7lXhvbo8WrS6PoqpwzOY3Z4.fQJNU.',
    true
  )
  ON CONFLICT DO NOTHING;

  -- 6. Menu Categories
  INSERT INTO menu_categories (outlet_id, name, icon, sort_order, is_active)
  VALUES
    (v_outlet_id, 'Starters',    '🥗', 1, true),
    (v_outlet_id, 'Main Course', '🍛', 2, true),
    (v_outlet_id, 'Breads',      '🫓', 3, true),
    (v_outlet_id, 'Beverages',   '🥤', 4, true),
    (v_outlet_id, 'Desserts',    '🍮', 5, true)
  ON CONFLICT DO NOTHING;

  -- Get category IDs
  SELECT id INTO v_c_starter  FROM menu_categories WHERE outlet_id = v_outlet_id AND name = 'Starters';
  SELECT id INTO v_c_main     FROM menu_categories WHERE outlet_id = v_outlet_id AND name = 'Main Course';
  SELECT id INTO v_c_bread    FROM menu_categories WHERE outlet_id = v_outlet_id AND name = 'Breads';
  SELECT id INTO v_c_bev      FROM menu_categories WHERE outlet_id = v_outlet_id AND name = 'Beverages';
  SELECT id INTO v_c_dessert  FROM menu_categories WHERE outlet_id = v_outlet_id AND name = 'Desserts';

  -- 7. Menu Items
  INSERT INTO menu_items (outlet_id, category_id, name, description, base_price_paise, cost_price_paise, food_type, is_available, is_featured, preparation_time_minutes, sort_order)
  VALUES
    (v_outlet_id, v_c_starter,  'Paneer Tikka',   'Marinated cottage cheese grilled in tandoor',       28000, 12000, 'veg',     true, true,  15, 1),
    (v_outlet_id, v_c_starter,  'Chicken 65',     'Crispy fried chicken with South Indian spices',     32000, 14000, 'non_veg', true, true,  12, 2),
    (v_outlet_id, v_c_starter,  'Veg Manchurian', 'Crispy veggie balls in Indo-Chinese gravy',         24000,  9000, 'veg',     true, false, 10, 3),
    (v_outlet_id, v_c_main,     'Dal Makhani',    'Slow-cooked black lentils in creamy tomato gravy',  22000,  8000, 'veg',     true, false, 20, 1),
    (v_outlet_id, v_c_main,     'Butter Chicken', 'Tender chicken in rich tomato-butter sauce',        34000, 15000, 'non_veg', true, true,  18, 2),
    (v_outlet_id, v_c_main,     'Paneer Kadai',   'Cottage cheese in spiced onion-tomato masala',      28000, 11000, 'veg',     true, false, 15, 3),
    (v_outlet_id, v_c_bread,    'Garlic Naan',    'Soft leavened bread with garlic butter',             6000,  2000, 'veg',     true, false,  8, 1),
    (v_outlet_id, v_c_bread,    'Tandoori Roti',  'Whole wheat bread baked in clay oven',               4000,  1000, 'veg',     true, false,  6, 2),
    (v_outlet_id, v_c_bev,      'Masala Chai',    'Spiced Indian milk tea',                             4000,  1000, 'veg',     true, false,  5, 1),
    (v_outlet_id, v_c_bev,      'Mango Lassi',    'Sweet yoghurt drink with mango pulp',                9000,  3000, 'veg',     true, false,  5, 2),
    (v_outlet_id, v_c_dessert,  'Gulab Jamun',    'Soft milk-solid dumplings in rose syrup',           12000,  4000, 'veg',     true, false,  5, 1),
    (v_outlet_id, v_c_dessert,  'Rasmalai',       'Soft cottage cheese patties in saffron milk',       14000,  5000, 'veg',     true, false,  5, 2)
  ON CONFLICT DO NOTHING;

  -- 8. Tables
  INSERT INTO tables (outlet_id, name, capacity, status)
  VALUES
    (v_outlet_id, 'T1', 2, 'available'),
    (v_outlet_id, 'T2', 4, 'available'),
    (v_outlet_id, 'T3', 4, 'available'),
    (v_outlet_id, 'T4', 6, 'available'),
    (v_outlet_id, 'T5', 6, 'available'),
    (v_outlet_id, 'T6', 8, 'available'),
    (v_outlet_id, 'T7', 2, 'available'),
    (v_outlet_id, 'T8', 4, 'available')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SEED COMPLETE!';
  RAISE NOTICE 'Email:    manager@adruva.com';
  RAISE NOTICE 'Password: Admin@1234';
  RAISE NOTICE 'URL:      http://localhost:3001';
  RAISE NOTICE '==============================================';

END $$;
