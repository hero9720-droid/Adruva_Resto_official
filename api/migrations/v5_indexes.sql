-- Performance Indexes for Adruva Resto
CREATE INDEX IF NOT EXISTS idx_rooms_outlet_id ON rooms(outlet_id);
CREATE INDEX IF NOT EXISTS idx_tables_outlet_id ON tables(outlet_id);
CREATE INDEX IF NOT EXISTS idx_orders_outlet_id ON orders(outlet_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_outlet_id ON menu_items(outlet_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_outlet_id ON menu_categories(outlet_id);
CREATE INDEX IF NOT EXISTS idx_bills_outlet_id ON bills(outlet_id);
