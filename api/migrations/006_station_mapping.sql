-- Migration: Add station mapping to menu items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS station VARCHAR(50) DEFAULT 'kitchen';

-- Update existing items to 'kitchen'
UPDATE menu_items SET station = 'kitchen' WHERE station IS NULL;
