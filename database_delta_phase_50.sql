-- ADRUVA RESTO: PHASE 40-50 UNIFIED SCHEMA DELTA
-- Run this in your Supabase SQL Editor to sync the latest features.

-- 1. LOYALTY & RETENTION
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL REFERENCES chains(id),
    name TEXT NOT NULL, -- Bronze, Silver, Gold, Platinum
    min_spend_paise BIGINT DEFAULT 0,
    multiplier DECIMAL(3,2) DEFAULT 1.0,
    benefits_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SUSTAINABILITY & WASTE
CREATE TABLE IF NOT EXISTS sustainability_waste_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID NOT NULL REFERENCES outlets(id),
    staff_id UUID REFERENCES staff(id),
    item_name TEXT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    waste_reason TEXT,
    co2_impact_kg DECIMAL(10,2),
    water_impact_liters DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. EQUIPMENT & IOT TELEMETRY
CREATE TABLE IF NOT EXISTS equipment_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID NOT NULL REFERENCES outlets(id),
    name TEXT NOT NULL,
    type TEXT, -- Oven, Refrigerator, HVAC
    status TEXT DEFAULT 'operational',
    last_maintenance TIMESTAMP WITH TIME ZONE,
    metadata_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES equipment_assets(id),
    parameter TEXT NOT NULL, -- temperature, vibration, power
    value DECIMAL(10,2) NOT NULL,
    is_anomaly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SENTIMENT & REVIEWS BRIDGE
CREATE TABLE IF NOT EXISTS sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID NOT NULL REFERENCES outlets(id),
    source TEXT NOT NULL, -- Google, Zomato, Internal
    rating INTEGER,
    comment TEXT,
    sentiment_score DECIMAL(3,2), -- -1 to 1
    ai_summary TEXT,
    is_responded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. WAITLIST & QUEUE
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID NOT NULL REFERENCES outlets(id),
    customer_name TEXT NOT NULL,
    phone TEXT,
    party_size INTEGER NOT NULL,
    status TEXT DEFAULT 'waiting', -- waiting, notified, seated, cancelled
    estimated_wait_mins INTEGER,
    actual_seated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. COLUMNS IN EXISTING TABLES
ALTER TABLE orders ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'pos'; -- pos, qr, web
ALTER TABLE staff ADD COLUMN IF NOT EXISTS epi_score DECIMAL(5,2) DEFAULT 0; -- Employee Performance Index

-- 7. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_waste_outlet ON sustainability_waste_logs(outlet_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_asset ON equipment_telemetry(asset_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_entries(outlet_id, status);
