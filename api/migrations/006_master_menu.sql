-- ============================================================
-- FILE: migrations/006_master_menu.sql
-- PURPOSE: Update menu schema to support Chain Master Menu logic
-- ============================================================

-- 1. Add chain_id to menu_categories and menu_items
ALTER TABLE menu_categories ADD COLUMN chain_id UUID REFERENCES chains(id) ON DELETE CASCADE;
ALTER TABLE menu_items ADD COLUMN chain_id UUID REFERENCES chains(id) ON DELETE CASCADE;

-- 2. Make outlet_id nullable (so chain-level master items can have outlet_id = NULL)
ALTER TABLE menu_categories ALTER COLUMN outlet_id DROP NOT NULL;
ALTER TABLE menu_items ALTER COLUMN outlet_id DROP NOT NULL;

-- 3. Update RLS policies to allow chain owners to view and edit master items
CREATE POLICY chain_isolation_master_menu_categories ON menu_categories
  USING (
    chain_id::TEXT = current_setting('app.current_chain_id', TRUE) 
    AND outlet_id IS NULL
  );

CREATE POLICY chain_isolation_master_menu_items ON menu_items
  USING (
    chain_id::TEXT = current_setting('app.current_chain_id', TRUE) 
    AND outlet_id IS NULL
  );
