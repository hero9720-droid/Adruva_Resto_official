-- ============================================================
-- FILE: migrations/002_rls_policies.sql
-- PURPOSE: Enable Row Level Security on all outlet-scoped tables
-- HOW IT WORKS:
--   Each request sets: SET LOCAL app.current_outlet_id = '<uuid>'
--   RLS policy reads this: current_setting('app.current_outlet_id', true)
--   Rows where outlet_id != current_setting → invisible
-- ============================================================

-- Enable RLS on all tables with outlet_id
ALTER TABLE tables              ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms               ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills               ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_splits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_grades          ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance          ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_history    ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chain-scoped tables
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- CREATE OUTLET POLICIES
CREATE POLICY outlet_isolation_tables ON tables
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_table_sessions ON table_sessions
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_rooms ON rooms
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_orders ON orders
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_order_items ON order_items
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_bills ON bills
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_bill_splits ON bill_splits
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_payment_transactions ON payment_transactions
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_menu_categories ON menu_categories
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_menu_items ON menu_items
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_menu_item_variants ON menu_item_variants
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_modifier_groups ON modifier_groups
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_modifiers ON modifiers
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_combos ON combos
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_staff ON staff
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_pay_grades ON pay_grades
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_attendance ON attendance
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_shifts ON shifts
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_leave_requests ON leave_requests
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_salary_advances ON salary_advances
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_ingredients ON ingredients
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_stock_movements ON stock_movements
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_recipes ON recipes
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_recipe_ingredients ON recipe_ingredients
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_suppliers ON suppliers
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_purchase_orders ON purchase_orders
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_purchase_order_items ON purchase_order_items
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_expenses ON expenses
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_reservations ON reservations
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_reviews ON reviews
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_notifications ON notifications
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_audit_logs ON audit_logs
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_subscriptions ON subscriptions
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_subscription_payments ON subscription_payments
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

CREATE POLICY outlet_isolation_transfer_history ON transfer_history
  USING (outlet_id::TEXT = current_setting('app.current_outlet_id', TRUE));

-- CREATE CHAIN POLICIES
CREATE POLICY chain_isolation_customers ON customers
  USING (chain_id::TEXT = current_setting('app.current_chain_id', TRUE));

CREATE POLICY chain_isolation_loyalty_transactions ON loyalty_transactions
  USING (chain_id::TEXT = current_setting('app.current_chain_id', TRUE));
