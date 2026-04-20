-- ============================================================
-- FILE: migrations/001_initial_schema.sql
-- PURPOSE: Create all tables for AdruvaResto
-- ORDER: Must run before 002, 003, 004, 005
-- ============================================================

-- REQUIRED EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- for gen_random_bytes()

-- ============================================================
-- TABLE 1: PLANS
-- Must come BEFORE chains (chains references plans)
-- ============================================================
CREATE TABLE plans (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  VARCHAR(100) NOT NULL,          -- 'Basic', 'Pro', 'Enterprise'
  monthly_price_paise   INTEGER NOT NULL,               -- e.g. 199900 = ₹1,999/month
  annual_price_paise    INTEGER NOT NULL,               -- discounted annual total
  -- Quota limits — enforced by subscription middleware
  max_tables            INTEGER DEFAULT 20,             -- NULL = unlimited
  max_staff             INTEGER DEFAULT 10,
  max_menu_items        INTEGER DEFAULT 200,
  max_orders_per_month  INTEGER DEFAULT 5000,
  features              JSONB DEFAULT '{}',             -- feature flags per plan
  is_active             BOOLEAN DEFAULT TRUE,
  is_archived           BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 2: CHAINS
-- Represents a restaurant brand (may own 1 or many outlets)
-- ============================================================
CREATE TABLE chains (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(200) NOT NULL,
  owner_email       VARCHAR(255) UNIQUE NOT NULL,
  owner_name        VARCHAR(200) NOT NULL,
  owner_phone       VARCHAR(20),
  logo_url          TEXT,
  plan_id           UUID REFERENCES plans(id),
  -- Chain-level status mirrors subscription but for the whole brand
  status            VARCHAR(20) DEFAULT 'trial'
                    CHECK (status IN ('trial','active','grace','restricted','suspended','terminated')),
  trial_ends_at     TIMESTAMPTZ,
  superadmin_notes  JSONB DEFAULT '{}',             -- internal notes by SuperAdmin
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: CHAIN USERS
-- Chain owner login table — completely separate from staff
-- ============================================================
CREATE TABLE chain_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chain_id        UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(30) DEFAULT 'chain_owner'
                  CHECK (role IN ('chain_owner','chain_admin','chain_viewer')),
  is_active       BOOLEAN DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 4: PAY GRADES
-- Must come BEFORE staff; FK to outlets added after outlets table
-- ============================================================
CREATE TABLE pay_grades (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID,                                -- FK added after outlets table
  name            VARCHAR(100) NOT NULL,               -- e.g. 'Junior Waiter', 'Senior Chef'
  salary_type     VARCHAR(20) CHECK (salary_type IN ('monthly','hourly','daily')),
  rate_paise      INTEGER NOT NULL,                    -- monthly salary or hourly/daily rate
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 5: OUTLETS
-- One physical restaurant location
-- ============================================================
CREATE TABLE outlets (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chain_id                  UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
  name                      VARCHAR(200) NOT NULL,
  address                   TEXT,
  city                      VARCHAR(100),
  phone                     VARCHAR(20),
  logo_url                  TEXT,
  subdomain                 VARCHAR(100) UNIQUE,           -- for customer-app routing
  custom_domain             VARCHAR(255) UNIQUE,           -- e.g. menu.spicepalace.com

  -- Subscription columns
  plan_id                   UUID REFERENCES plans(id),
  subscription_status       VARCHAR(20) DEFAULT 'trial'
                            CHECK (subscription_status IN (
                              'trial','active','expiring','grace','restricted','suspended'
                            )),
  subscription_end_date     TIMESTAMPTZ,
  trial_ends_at             TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  grace_period_days         INTEGER DEFAULT 3,             -- days after expiry before restricted

  -- Razorpay keys stored AES-256 encrypted
  razorpay_key_id_enc       TEXT,
  razorpay_key_secret_enc   TEXT,
  razorpay_test_mode        BOOLEAN DEFAULT TRUE,

  -- Per-outlet HMAC secret for QR code signing
  qr_secret                 TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),

  -- Location
  latitude                  DECIMAL(10,8),
  longitude                 DECIMAL(11,8),

  -- Settings stored as JSONB
  settings_general          JSONB DEFAULT '{}',
  settings_tax              JSONB DEFAULT '{}',
  settings_qr               JSONB DEFAULT '{}',
  settings_notifications    JSONB DEFAULT '{}',
  settings_hardware         JSONB DEFAULT '{}',
  settings_billing          JSONB DEFAULT '{}',
  settings_operational      JSONB DEFAULT '{}',

  is_active                 BOOLEAN DEFAULT TRUE,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- Deferred FK: pay_grades.outlet_id
ALTER TABLE pay_grades ADD CONSTRAINT pay_grades_outlet_fk
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE;

-- ============================================================
-- TABLE 6: OUTLET COUNTERS
-- ============================================================
CREATE TABLE outlet_counters (
  outlet_id     UUID PRIMARY KEY REFERENCES outlets(id) ON DELETE CASCADE,
  order_count   INTEGER DEFAULT 0,
  bill_count    INTEGER DEFAULT 0
);

CREATE OR REPLACE FUNCTION create_outlet_counter()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO outlet_counters (outlet_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_outlet_insert
  AFTER INSERT ON outlets
  FOR EACH ROW EXECUTE FUNCTION create_outlet_counter();

-- ============================================================
-- TABLE 7: SUPERADMIN USERS
-- ============================================================
CREATE TABLE superadmin_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret   TEXT,
  totp_enabled  BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 8: STAFF
-- ============================================================
CREATE TABLE staff (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id         UUID REFERENCES outlets(id) ON DELETE CASCADE,
  name              VARCHAR(200) NOT NULL,
  email             VARCHAR(255),
  phone             VARCHAR(20),
  role              VARCHAR(30) NOT NULL
                    CHECK (role IN (
                      'outlet_manager','cashier','waiter','kitchen',
                      'inventory_manager','delivery'
                    )),
  password_hash     TEXT,
  pin_hash          TEXT,
  permissions       JSONB DEFAULT '{}',
  temp_permissions  JSONB DEFAULT '[]',
  pay_grade_id      UUID REFERENCES pay_grades(id),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 9: MENU CATEGORIES
-- ============================================================
CREATE TABLE menu_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id   UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES menu_categories(id),
  name        VARCHAR(200) NOT NULL,
  icon        VARCHAR(50),
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 10: MENU ITEMS
-- ============================================================
CREATE TABLE menu_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id           UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  category_id         UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name                VARCHAR(200) NOT NULL,
  description         TEXT,
  photo_url           TEXT,
  base_price_paise    INTEGER NOT NULL DEFAULT 0,
  cost_price_paise    INTEGER DEFAULT 0,
  food_type           VARCHAR(10) DEFAULT 'veg'
                      CHECK (food_type IN ('veg','non_veg','egg','vegan')),
  is_available        BOOLEAN DEFAULT TRUE,
  is_featured         BOOLEAN DEFAULT FALSE,
  preparation_time_minutes INTEGER DEFAULT 15,
  chain_approved      BOOLEAN DEFAULT TRUE,
  chain_min_price_paise INTEGER,
  chain_max_price_paise INTEGER,
  sort_order          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 11: MENU ITEM VARIANTS
-- ============================================================
CREATE TABLE menu_item_variants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id     UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  menu_item_id  UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  price_paise   INTEGER NOT NULL,
  is_default    BOOLEAN DEFAULT FALSE,
  sort_order    INTEGER DEFAULT 0
);

-- ============================================================
-- TABLE 12: MODIFIER GROUPS
-- ============================================================
CREATE TABLE modifier_groups (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id     UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  menu_item_id  UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  is_required   BOOLEAN DEFAULT FALSE,
  min_select    INTEGER DEFAULT 0,
  max_select    INTEGER DEFAULT 1
);

CREATE TABLE modifiers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  group_id        UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  extra_price_paise INTEGER DEFAULT 0
);

-- ============================================================
-- TABLE 13: COMBO MEALS
-- ============================================================
CREATE TABLE combos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id     UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  price_paise   INTEGER NOT NULL,
  is_available  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE combo_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id   UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  combo_id    UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity    INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- TABLE 14: TABLES
-- ============================================================
CREATE TABLE tables (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id   UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name        VARCHAR(50) NOT NULL,
  capacity    INTEGER DEFAULT 4,
  pos_x       INTEGER DEFAULT 0,
  pos_y       INTEGER DEFAULT 0,
  width       INTEGER DEFAULT 80,
  height      INTEGER DEFAULT 80,
  shape       VARCHAR(20) DEFAULT 'square'
              CHECK (shape IN ('square','circle','rectangle')),
  status      VARCHAR(20) DEFAULT 'available'
              CHECK (status IN ('available','occupied','reserved','cleaning','maintenance')),
  assigned_waiter_id UUID REFERENCES staff(id),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 15: TABLE SESSIONS
-- ============================================================
CREATE TABLE table_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id),
  table_id        UUID NOT NULL REFERENCES tables(id),
  opened_by       UUID REFERENCES staff(id),
  closed_at       TIMESTAMPTZ,
  customer_count  INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 16: ROOMS
-- ============================================================
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id   UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  floor       VARCHAR(20),
  capacity    INTEGER DEFAULT 2,
  status      VARCHAR(20) DEFAULT 'available'
              CHECK (status IN ('available','occupied','cleaning','maintenance')),
  checked_in_at   TIMESTAMPTZ,
  checked_out_at  TIMESTAMPTZ,
  guest_name      VARCHAR(200),
  accumulated_paise INTEGER DEFAULT 0,
  bill_status     VARCHAR(20) DEFAULT 'pending',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 17: CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chain_id            UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
  name                VARCHAR(200),
  phone               VARCHAR(20),
  email               VARCHAR(255),
  loyalty_points      INTEGER DEFAULT 0,
  lifetime_spend_paise INTEGER DEFAULT 0,
  visit_count         INTEGER DEFAULT 0,
  last_visit_at       TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chain_id, phone)
);

-- ============================================================
-- TABLE 18: ORDERS
-- ============================================================
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  order_number    VARCHAR(20) NOT NULL,
  order_type      VARCHAR(20) NOT NULL
                  CHECK (order_type IN ('dine_in','takeaway','delivery','qr','room_service')),
  status          VARCHAR(20) DEFAULT 'draft'
                  CHECK (status IN ('draft','confirmed','preparing','ready','served','cancelled')),
  session_id      UUID REFERENCES table_sessions(id),
  table_id        UUID REFERENCES tables(id),
  room_id         UUID REFERENCES rooms(id),
  customer_id     UUID REFERENCES customers(id),
  waiter_id       UUID REFERENCES staff(id),
  source          VARCHAR(20) DEFAULT 'pos'
                  CHECK (source IN ('pos','qr','online','whatsapp')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (outlet_id, order_number)
);

-- ============================================================
-- TABLE 19: ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id           UUID NOT NULL REFERENCES outlets(id),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id        UUID REFERENCES menu_items(id),
  variant_id          UUID REFERENCES menu_item_variants(id),
  quantity            INTEGER NOT NULL DEFAULT 1,
  unit_price_paise    INTEGER NOT NULL,
  total_paise         INTEGER NOT NULL,
  modifiers_json      JSONB DEFAULT '[]',
  notes               TEXT,
  status              VARCHAR(20) DEFAULT 'pending'
                      CHECK (status IN ('pending','preparing','ready','served')),
  station             VARCHAR(50),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 20: BILLS
-- ============================================================
CREATE TABLE bills (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id             UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  order_id              UUID REFERENCES orders(id),
  session_id            UUID REFERENCES table_sessions(id),
  customer_id           UUID REFERENCES customers(id),
  bill_number           VARCHAR(20) NOT NULL,
  status                VARCHAR(20) DEFAULT 'open'
                        CHECK (status IN ('open','partial','paid','voided')),
  subtotal_paise        INTEGER NOT NULL DEFAULT 0,
  discount_paise        INTEGER DEFAULT 0,
  discount_type         VARCHAR(20),
  coupon_code           VARCHAR(50),
  coupon_id             UUID,
  loyalty_points_used   INTEGER DEFAULT 0,
  service_charge_paise  INTEGER DEFAULT 0,
  gst_5_paise           INTEGER DEFAULT 0,
  gst_12_paise          INTEGER DEFAULT 0,
  gst_18_paise          INTEGER DEFAULT 0,
  round_off_paise       INTEGER DEFAULT 0,
  total_paise           INTEGER NOT NULL DEFAULT 0,
  paid_paise            INTEGER DEFAULT 0,
  voided_by             UUID REFERENCES staff(id),
  void_reason           VARCHAR(50),
  voided_at             TIMESTAMPTZ,
  edited_by             UUID REFERENCES staff(id),
  edit_reason           TEXT,
  edited_at             TIMESTAMPTZ,
  created_by            UUID REFERENCES staff(id),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (outlet_id, bill_number)
);

-- ============================================================
-- TABLE 21: BILL SPLITS
-- ============================================================
CREATE TABLE bill_splits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id),
  parent_bill_id  UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  split_index     INTEGER NOT NULL,
  label           VARCHAR(50),
  subtotal_paise  INTEGER NOT NULL DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'unpaid'
                  CHECK (status IN ('unpaid','paid')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bill_split_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id     UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  split_id      UUID NOT NULL REFERENCES bill_splits(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  quantity      INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- TABLE 22: PAYMENT TRANSACTIONS
-- ============================================================
CREATE TABLE payment_transactions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id             UUID NOT NULL REFERENCES outlets(id),
  bill_id               UUID REFERENCES bills(id),
  method                VARCHAR(20) NOT NULL
                        CHECK (method IN ('cash','upi','card','custom1','custom2','loyalty')),
  amount_paise          INTEGER NOT NULL,
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,
  razorpay_signature    TEXT,
  status                VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','captured','failed','refunded')),
  refunded_amount_paise INTEGER DEFAULT 0,
  refund_reason         TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 23: LOYALTY TRANSACTIONS
-- ============================================================
CREATE TABLE loyalty_transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES customers(id),
  outlet_id     UUID NOT NULL REFERENCES outlets(id),
  chain_id      UUID NOT NULL REFERENCES chains(id),
  bill_id       UUID REFERENCES bills(id),
  type          VARCHAR(20) CHECK (type IN ('earned','redeemed','expired','adjusted')),
  points        INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 24: REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id         UUID NOT NULL REFERENCES outlets(id),
  customer_id       UUID REFERENCES customers(id),
  bill_id           UUID REFERENCES bills(id),
  rating            SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text       TEXT,
  source            VARCHAR(20) DEFAULT 'qr'
                    CHECK (source IN ('qr','whatsapp','sms')),
  status            VARCHAR(20) DEFAULT 'new'
                    CHECK (status IN ('new','acknowledged','responded')),
  manager_response  TEXT,
  responded_at      TIMESTAMPTZ,
  responded_by      UUID REFERENCES staff(id),
  chain_escalated   BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 25: INGREDIENTS
-- ============================================================
CREATE TABLE ingredients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id         UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name              VARCHAR(200) NOT NULL,
  category          VARCHAR(100),
  unit              VARCHAR(20) NOT NULL
                    CHECK (unit IN ('kg','g','l','ml','pcs','dozen','box','pack','litre','oz','lb')),
  current_stock     DECIMAL(10,3) DEFAULT 0,
  low_threshold     DECIMAL(10,3) DEFAULT 0,
  avg_cost_paise    INTEGER DEFAULT 0,
  last_restocked_at TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 26: STOCK MOVEMENTS
-- ============================================================
CREATE TABLE stock_movements (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id         UUID NOT NULL REFERENCES outlets(id),
  ingredient_id     UUID NOT NULL REFERENCES ingredients(id),
  type              VARCHAR(20) NOT NULL
                    CHECK (type IN (
                      'stock_in','wastage','adjustment','kitchen_use',
                      'transfer_in','transfer_out'
                    )),
  quantity          DECIMAL(10,3) NOT NULL,
  unit_cost_paise   INTEGER DEFAULT 0,
  total_cost_paise  INTEGER DEFAULT 0,
  reason            TEXT,
  reference_id      UUID,
  created_by        UUID REFERENCES staff(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 27: RECIPES
-- ============================================================
CREATE TABLE recipes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  menu_item_id    UUID UNIQUE REFERENCES menu_items(id) ON DELETE CASCADE,
  instructions    TEXT,
  version         INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id     UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  recipe_id     UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity      DECIMAL(10,3) NOT NULL,
  unit          VARCHAR(20) NOT NULL
);

-- ============================================================
-- TABLE 28: SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id   UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  contact     VARCHAR(20),
  email       VARCHAR(255),
  address     TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 29: PURCHASE ORDERS
-- ============================================================
CREATE TABLE purchase_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id             UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  supplier_id           UUID REFERENCES suppliers(id),
  po_number             VARCHAR(20),
  status                VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','partial','received','cancelled')),
  expected_delivery_at  TIMESTAMPTZ,
  received_at           TIMESTAMPTZ,
  notes                 TEXT,
  created_by            UUID REFERENCES staff(id),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id           UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  purchase_order_id   UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  ingredient_id       UUID NOT NULL REFERENCES ingredients(id),
  ordered_qty         DECIMAL(10,3) NOT NULL,
  received_qty        DECIMAL(10,3) DEFAULT 0,
  unit_cost_paise     INTEGER NOT NULL
);

-- ============================================================
-- TABLE 30: EXPENSES
-- ============================================================
CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  category        VARCHAR(50) NOT NULL,
  amount_paise    INTEGER NOT NULL,
  expense_date    DATE NOT NULL,
  description     TEXT,
  receipt_url     TEXT,
  status          VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  submitted_by    UUID REFERENCES staff(id),
  approved_by     UUID REFERENCES staff(id),
  approved_at     TIMESTAMPTZ,
  reject_reason   TEXT,
  po_id           UUID REFERENCES purchase_orders(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 31: ATTENDANCE
-- ============================================================
CREATE TABLE attendance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id),
  staff_id        UUID NOT NULL REFERENCES staff(id),
  date            DATE NOT NULL,
  clock_in        TIMESTAMPTZ,
  clock_out       TIMESTAMPTZ,
  hours_worked    DECIMAL(5,2),
  is_manual_entry BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (staff_id, date)
);

-- ============================================================
-- TABLE 32: SHIFTS
-- ============================================================
CREATE TABLE shifts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id   UUID NOT NULL REFERENCES outlets(id),
  staff_id    UUID NOT NULL REFERENCES staff(id),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 33: LEAVE REQUESTS
-- ============================================================
CREATE TABLE leave_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id),
  staff_id        UUID NOT NULL REFERENCES staff(id),
  leave_type      VARCHAR(30) CHECK (leave_type IN ('casual','sick','annual','unpaid')),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  reason          TEXT,
  status          VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  reviewed_by     UUID REFERENCES staff(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 34: SALARY ADVANCES
-- ============================================================
CREATE TABLE salary_advances (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id     UUID NOT NULL REFERENCES outlets(id),
  staff_id      UUID NOT NULL REFERENCES staff(id),
  amount_paise  INTEGER NOT NULL,
  reason        TEXT,
  deduct_month  VARCHAR(7),
  is_deducted   BOOLEAN DEFAULT FALSE,
  created_by    UUID REFERENCES staff(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 35: COUPONS
-- ============================================================
CREATE TABLE coupons (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id           UUID REFERENCES outlets(id),
  chain_id            UUID REFERENCES chains(id),
  code                VARCHAR(50) NOT NULL,
  type                VARCHAR(20) CHECK (type IN ('flat','percent')),
  discount_value      INTEGER NOT NULL,
  min_order_paise     INTEGER DEFAULT 0,
  max_discount_paise  INTEGER,
  usage_limit         INTEGER,
  used_count          INTEGER DEFAULT 0,
  valid_from          TIMESTAMPTZ,
  valid_until         TIMESTAMPTZ,
  applicable_to       TEXT[] DEFAULT '{"dine_in","takeaway","delivery","qr"}',
  is_active           BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TABLE 36: RESERVATIONS
-- ============================================================
CREATE TABLE reservations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id),
  customer_name   VARCHAR(200) NOT NULL,
  phone           VARCHAR(20),
  party_size      INTEGER NOT NULL,
  table_id        UUID REFERENCES tables(id),
  reservation_at  TIMESTAMPTZ NOT NULL,
  notes           TEXT,
  status          VARCHAR(20) DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed','arrived','no_show','cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 37: SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id             UUID UNIQUE NOT NULL REFERENCES outlets(id),
  plan_id               UUID NOT NULL REFERENCES plans(id),
  status                VARCHAR(20) DEFAULT 'trial'
                        CHECK (status IN (
                          'trial','active','expiring','grace','restricted','suspended'
                        )),
  billing_cycle         VARCHAR(10) CHECK (billing_cycle IN ('monthly','annual')),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  trial_ends_at         TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  grace_ends_at         TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 38: SUBSCRIPTION PAYMENTS
-- ============================================================
CREATE TABLE subscription_payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id           UUID REFERENCES outlets(id) ON DELETE CASCADE,
  subscription_id     UUID NOT NULL REFERENCES subscriptions(id),
  outlet_ids          UUID[],
  chain_id            UUID REFERENCES chains(id),
  amount_paise        INTEGER NOT NULL,
  period_months       INTEGER NOT NULL DEFAULT 1,
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  status              VARCHAR(20) DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','failed','refunded')),
  invoice_url         TEXT,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 39: TRANSFER HISTORY
-- ============================================================
CREATE TABLE transfer_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  staff_id        UUID NOT NULL REFERENCES staff(id),
  from_outlet_id  UUID REFERENCES outlets(id),
  to_outlet_id    UUID NOT NULL REFERENCES outlets(id),
  reason          TEXT,
  transferred_by  UUID REFERENCES staff(id),
  transferred_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 40: NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id   UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  staff_id    UUID REFERENCES staff(id),
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 41: AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id     UUID REFERENCES outlets(id),
  chain_id      UUID REFERENCES chains(id),
  actor_id      UUID,
  actor_type    VARCHAR(20) CHECK (actor_type IN ('staff','chain_owner','superadmin','system')),
  actor_name    VARCHAR(200),
  action        VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id   UUID,
  old_value     JSONB,
  new_value     JSONB,
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 42: FEATURE FLAGS
-- ============================================================
CREATE TABLE feature_flags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chain_id    UUID REFERENCES chains(id),
  flag_name   VARCHAR(100) NOT NULL,
  is_enabled  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (chain_id, flag_name)
);

-- ============================================================
-- TABLE 43: ANNOUNCEMENTS
-- ============================================================
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  target      VARCHAR(20) DEFAULT 'all'
              CHECK (target IN ('all','plan_basic','plan_pro','plan_enterprise')),
  is_active   BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  created_by  UUID REFERENCES superadmin_users(id)
);
