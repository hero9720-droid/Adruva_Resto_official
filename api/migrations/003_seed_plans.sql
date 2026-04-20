-- ============================================================
-- FILE: migrations/003_seed_plans.sql
-- PURPOSE: Insert the 3 subscription plans + 1 superadmin user
-- ============================================================

INSERT INTO plans (name, monthly_price_paise, annual_price_paise,
                   max_tables, max_staff, max_menu_items, max_orders_per_month, features)
VALUES
  -- Basic: ₹1,999/month — small restaurants
  ('Basic',  199900, 1999000,  10,  10, 100, 2000,
   '{"online_orders": false, "chain_panel": false, "analytics": false}'),
  -- Pro: ₹4,999/month — growing chains
  ('Pro',    499900, 4999000,  30,  30, 500, 10000,
   '{"online_orders": true, "chain_panel": true, "analytics": true}'),
  -- Enterprise: ₹9,999/month — large chains (custom limits)
  ('Enterprise', 999900, 9999000, NULL, NULL, NULL, NULL,
   '{"online_orders": true, "chain_panel": true, "analytics": true, "white_label": true}');

-- Default superadmin (change password immediately after first deploy)
INSERT INTO superadmin_users (name, email, password_hash)
VALUES (
  'Super Admin',
  'admin@adruvaresto.com',
  -- bcrypt hash of 'admin123'
  '$2b$10$ITlPEyt.FVZHk88RLWYu2uIzs5lzEgvSwsE8/kqzRS.CKlHCT4hVO'
);
