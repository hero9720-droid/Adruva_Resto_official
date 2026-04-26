/**
 * Adruva Resto — Master Migration Runner
 * Runs ALL pending TypeScript migrations in order.
 * Usage: npx tsx migrations/run_migrations.ts
 */
import 'dotenv/config';
import { db } from '../src/lib/db';

// ─── Migration SQL blocks ──────────────────────────────────────────────────

const migrations: { name: string; sql: string }[] = [

  // ── 1. Safety & Hygiene (Compliance) ───────────────────────────────────
  {
    name: '20260425_safety_hygiene',
    sql: `
      CREATE TABLE IF NOT EXISTS compliance_standards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        checkpoints JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hygiene_audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        auditor_id UUID NOT NULL REFERENCES staff(id),
        standard_id UUID REFERENCES compliance_standards(id),
        score INT DEFAULT 0,
        results JSONB NOT NULL,
        corrective_actions JSONB DEFAULT '[]',
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_hygiene_outlet ON hygiene_audits(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_hygiene_auditor ON hygiene_audits(auditor_id);

      INSERT INTO compliance_standards (chain_id, title, category, checkpoints)
      SELECT id, 'Daily Food Safety Check', 'Kitchen', '[
        {"question": "Fridge temperatures checked (0-4°C)?", "type": "boolean", "required": true},
        {"question": "Food storage labels verified (FIFO)?", "type": "boolean", "required": true},
        {"question": "No signs of pest activity in dry storage?", "type": "boolean", "required": true},
        {"question": "Staff wearing clean uniforms and headgear?", "type": "boolean", "required": true},
        {"question": "Sanitization solution concentration verified?", "type": "boolean", "required": false}
      ]'::jsonb FROM chains LIMIT 1
      ON CONFLICT DO NOTHING;
    `,
  },

  // ── 2. Payroll ─────────────────────────────────────────────────────────
  {
    name: '20260425_payroll',
    sql: `
      CREATE TABLE IF NOT EXISTS payroll_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id UUID NOT NULL REFERENCES staff(id) UNIQUE,
        base_salary_paise BIGINT DEFAULT 0,
        hourly_rate_paise BIGINT DEFAULT 0,
        overtime_multiplier FLOAT DEFAULT 1.5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payroll_cycles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id),
        month INT NOT NULL,
        year INT NOT NULL,
        status TEXT DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(chain_id, month, year)
      );

      CREATE TABLE IF NOT EXISTS payslips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cycle_id UUID NOT NULL REFERENCES payroll_cycles(id) ON DELETE CASCADE,
        staff_id UUID NOT NULL REFERENCES staff(id),
        base_paid_paise BIGINT DEFAULT 0,
        overtime_paid_paise BIGINT DEFAULT 0,
        bonus_paise BIGINT DEFAULT 0,
        deductions_paise BIGINT DEFAULT 0,
        net_paid_paise BIGINT DEFAULT 0,
        status TEXT DEFAULT 'generated',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_payslips_staff ON payslips(staff_id);
      CREATE INDEX IF NOT EXISTS idx_payslips_cycle ON payslips(cycle_id);
    `,
  },

  // ── 3. Tip Pooling ─────────────────────────────────────────────────────
  {
    name: '20260425_tip_pooling',
    sql: `
      CREATE TABLE IF NOT EXISTS tip_pools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        total_tips_paise BIGINT DEFAULT 0,
        distribution_method TEXT DEFAULT 'equal', -- equal, hours, role_weight
        status TEXT DEFAULT 'pending', -- pending, distributed
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(outlet_id, date)
      );

      CREATE TABLE IF NOT EXISTS tip_distributions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pool_id UUID NOT NULL REFERENCES tip_pools(id) ON DELETE CASCADE,
        staff_id UUID NOT NULL REFERENCES staff(id),
        amount_paise BIGINT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tip_pools_outlet ON tip_pools(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_tip_dist_staff ON tip_distributions(staff_id);
    `,
  },

  // ── 4. Training ────────────────────────────────────────────────────────
  {
    name: '20260425_training',
    sql: `
      CREATE TABLE IF NOT EXISTS training_modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        content_url TEXT,
        duration_minutes INT DEFAULT 30,
        category TEXT DEFAULT 'general',
        is_mandatory BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS training_completions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
        staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        score INT,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(module_id, staff_id)
      );

      CREATE INDEX IF NOT EXISTS idx_training_completions_staff ON training_completions(staff_id);
    `,
  },

  // ── 5. Feedback ────────────────────────────────────────────────────────
  {
    name: '20260425_feedback',
    sql: `
      CREATE TABLE IF NOT EXISTS customer_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        food_rating INT CHECK (food_rating BETWEEN 1 AND 5),
        service_rating INT CHECK (service_rating BETWEEN 1 AND 5),
        ambiance_rating INT CHECK (ambiance_rating BETWEEN 1 AND 5),
        comment TEXT,
        source TEXT DEFAULT 'qr',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_feedback_outlet ON customer_feedback(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_bill ON customer_feedback(bill_id);
    `,
  },

  // ── 6. Forecasting ─────────────────────────────────────────────────────
  {
    name: '20260425_forecasting',
    sql: `
      CREATE TABLE IF NOT EXISTS sales_forecasts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        forecast_date DATE NOT NULL,
        predicted_orders INT DEFAULT 0,
        predicted_revenue_paise BIGINT DEFAULT 0,
        confidence_score FLOAT DEFAULT 0,
        model_version TEXT DEFAULT 'v1',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(outlet_id, forecast_date)
      );

      CREATE INDEX IF NOT EXISTS idx_sales_forecast_outlet ON sales_forecasts(outlet_id);
    `,
  },

  // ── 7. Maintenance ─────────────────────────────────────────────────────
  {
    name: '20260425_maintenance',
    sql: `
      CREATE TABLE IF NOT EXISTS maintenance_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        serial_number TEXT,
        purchase_date DATE,
        warranty_expiry DATE,
        last_service_date DATE,
        next_service_date DATE,
        status TEXT DEFAULT 'operational',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID NOT NULL REFERENCES maintenance_assets(id) ON DELETE CASCADE,
        reported_by UUID REFERENCES staff(id),
        issue_description TEXT NOT NULL,
        resolution TEXT,
        cost_paise BIGINT DEFAULT 0,
        status TEXT DEFAULT 'open',
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_maintenance_outlet ON maintenance_assets(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset ON maintenance_logs(asset_id);
    `,
  },

  // ── 8. Marketing ──────────────────────────────────────────────────────
  {
    name: '20260425_marketing',
    sql: `
      CREATE TABLE IF NOT EXISTS promotions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        promo_type TEXT DEFAULT 'discount', -- discount, bogo, combo
        discount_percent INT DEFAULT 0,
        discount_flat_paise BIGINT DEFAULT 0,
        min_order_paise BIGINT DEFAULT 0,
        code TEXT UNIQUE,
        valid_from TIMESTAMP WITH TIME ZONE,
        valid_until TIMESTAMP WITH TIME ZONE,
        usage_limit INT,
        usage_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_promo_chain ON promotions(chain_id);
      CREATE INDEX IF NOT EXISTS idx_promo_code ON promotions(code);
    `,
  },

  // ── 9. Viral Referrals ────────────────────────────────────────────────
  {
    name: '20260425_viral_referrals',
    sql: `
      CREATE TABLE IF NOT EXISTS referral_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        code TEXT UNIQUE NOT NULL,
        total_referrals INT DEFAULT 0,
        total_earned_paise BIGINT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS referral_uses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code_id UUID NOT NULL REFERENCES referral_codes(id),
        referred_customer_id UUID NOT NULL REFERENCES customers(id),
        reward_paise BIGINT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_referral_customer ON referral_codes(customer_id);
    `,
  },

  // ── 10. Pricing (Dynamic) ────────────────────────────────────────────
  {
    name: '20260425_pricing',
    sql: `
      CREATE TABLE IF NOT EXISTS pricing_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        rule_type TEXT NOT NULL, -- time_of_day, day_of_week, demand
        condition_json JSONB NOT NULL,
        price_modifier_percent INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_pricing_chain ON pricing_rules(chain_id);
    `,
  },

  // ── 11. Supplier Ledgers ─────────────────────────────────────────────
  {
    name: '20260425_supplier_ledgers',
    sql: `
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        contact_name TEXT,
        phone TEXT,
        email TEXT,
        gst_number TEXT,
        address TEXT,
        payment_terms_days INT DEFAULT 30,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS supplier_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        invoice_number TEXT,
        invoice_date DATE NOT NULL,
        amount_paise BIGINT NOT NULL,
        tax_paise BIGINT DEFAULT 0,
        status TEXT DEFAULT 'pending', -- pending, paid, overdue
        due_date DATE,
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier ON supplier_invoices(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_supplier_invoices_outlet ON supplier_invoices(outlet_id);
    `,
  },

  // ── 12. Stock Transfers ──────────────────────────────────────────────
  {
    name: '20260425_stock_transfers',
    sql: `
      CREATE TABLE IF NOT EXISTS stock_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        to_outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        quantity FLOAT NOT NULL,
        unit TEXT NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, in_transit, received
        requested_by UUID REFERENCES staff(id),
        received_by UUID REFERENCES staff(id),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        received_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_stock_transfers_from ON stock_transfers(from_outlet_id);
      CREATE INDEX IF NOT EXISTS idx_stock_transfers_to ON stock_transfers(to_outlet_id);
    `,
  },

  // ── 13. Delivery Hub ─────────────────────────────────────────────────
  {
    name: '20260425_delivery_hub',
    sql: `
      CREATE TABLE IF NOT EXISTS delivery_partners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT,
        vehicle_type TEXT DEFAULT 'bike',
        status TEXT DEFAULT 'available', -- available, on_delivery, off_duty
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS delivery_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        partner_id UUID NOT NULL REFERENCES delivery_partners(id),
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        picked_up_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        distance_km FLOAT,
        delivery_charge_paise BIGINT DEFAULT 0,
        status TEXT DEFAULT 'assigned'
      );

      CREATE INDEX IF NOT EXISTS idx_delivery_partner_outlet ON delivery_partners(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_delivery_assign_order ON delivery_assignments(order_id);
    `,
  },

  // ── 14. Taxation ─────────────────────────────────────────────────────
  {
    name: '20260425_taxation',
    sql: `
      CREATE TABLE IF NOT EXISTS tax_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        rate_percent FLOAT NOT NULL,
        applies_to TEXT DEFAULT 'all', -- all, food, beverages, services
        is_inclusive BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tax_chain ON tax_configs(chain_id);
    `,
  },

  // ── 15. Brand Assets ─────────────────────────────────────────────────
  {
    name: '20260425_brand_assets',
    sql: `
      CREATE TABLE IF NOT EXISTS brand_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        asset_type TEXT NOT NULL, -- logo, banner, menu_cover, social_post
        url TEXT NOT NULL,
        label TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_brand_assets_chain ON brand_assets(chain_id);
    `,
  },

  // ── 16. Platform Integrations ─────────────────────────────────────────
  {
    name: '20260425_platform_sync',
    sql: `
      CREATE TABLE IF NOT EXISTS platform_integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        platform TEXT NOT NULL, -- zomato, swiggy, uber_eats
        api_key TEXT,
        merchant_id TEXT,
        is_active BOOLEAN DEFAULT false,
        last_sync_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(outlet_id, platform)
      );

      CREATE TABLE IF NOT EXISTS platform_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id UUID NOT NULL REFERENCES platform_integrations(id) ON DELETE CASCADE,
        external_order_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        status TEXT DEFAULT 'received',
        raw_payload JSONB,
        mapped_order_id UUID REFERENCES orders(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_platform_outlet ON platform_integrations(outlet_id);
    `,
  },

  // ── 17. AI Menu ──────────────────────────────────────────────────────
  {
    name: '20260425_ai_menu',
    sql: `
      CREATE TABLE IF NOT EXISTS menu_ai_suggestions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        suggestion_type TEXT NOT NULL, -- price_change, new_item, remove_item, rename
        item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
        suggestion_json JSONB NOT NULL,
        confidence_score FLOAT DEFAULT 0,
        status TEXT DEFAULT 'pending', -- pending, accepted, rejected
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_ai_menu_chain ON menu_ai_suggestions(chain_id);
    `,
  },

  // ── 18. Handovers (Shift) ────────────────────────────────────────────
  {
    name: '20260425_handovers',
    sql: `
      CREATE TABLE IF NOT EXISTS shift_handovers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        outgoing_staff_id UUID NOT NULL REFERENCES staff(id),
        incoming_staff_id UUID REFERENCES staff(id),
        cash_balance_paise BIGINT DEFAULT 0,
        notes TEXT,
        issues_reported JSONB DEFAULT '[]',
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        acknowledged_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_handovers_outlet ON shift_handovers(outlet_id);
    `,
  },

  // ── 19. Loyalty Config ───────────────────────────────────────────────
  {
    name: '20260425_loyalty_config',
    sql: `
      ALTER TABLE chains 
        ADD COLUMN IF NOT EXISTS loyalty_points_per_100_paise INT DEFAULT 1,
        ADD COLUMN IF NOT EXISTS loyalty_redemption_per_point_paise INT DEFAULT 100;
    `,
  },

  // ── 20. Menu Sync (Chain → Outlet) ───────────────────────────────────
  {
    name: '20260425_menu_sync',
    sql: `
      ALTER TABLE menu_items 
        ADD COLUMN IF NOT EXISTS synced_from_chain BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS master_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL;

      CREATE INDEX IF NOT EXISTS idx_menu_master ON menu_items(master_item_id);
    `,
  },

  // ── 21. Reservations (Global/Chain level) ───────────────────────────
  {
    name: '20260425_reservations_global',
    sql: `
      ALTER TABLE reservations
        ADD COLUMN IF NOT EXISTS special_occasion TEXT,
        ADD COLUMN IF NOT EXISTS deposit_paise BIGINT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
    `,
  },

  // ── 22. Shift Verification ───────────────────────────────────────────
  {
    name: '20260425_shift_verification',
    sql: `
      ALTER TABLE staff
        ADD COLUMN IF NOT EXISTS pin_hash TEXT,
        ADD COLUMN IF NOT EXISTS last_shift_start TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS last_shift_end TIMESTAMP WITH TIME ZONE;
    `,
  },

  // ── 23. Supplier Performance ─────────────────────────────────────────
  {
    name: '20260425_supplier_performance',
    sql: `
      ALTER TABLE suppliers
        ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS on_time_delivery_percent FLOAT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0;
    `,
  },

  // ── 24. Menu Cleanup ─────────────────────────────────────────────────
  {
    name: '20260425_menu_cleanup',
    sql: `
      ALTER TABLE menu_items
        ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS archive_reason TEXT;
      
      CREATE INDEX IF NOT EXISTS idx_menu_items_archived ON menu_items(archived_at) WHERE archived_at IS NULL;
    `,
  },

  // ── 25. Pest Control ─────────────────────────────────────────────────
  {
    name: '20260426_pest_control',
    sql: `
      CREATE TABLE IF NOT EXISTS pest_control_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        vendor_name TEXT NOT NULL,
        service_date DATE NOT NULL,
        next_due_date DATE,
        chemicals_used TEXT,
        certificate_url TEXT,
        status TEXT DEFAULT 'completed',
        cost_paise BIGINT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_pest_outlet ON pest_control_logs(outlet_id);
    `,
  },

  // ── 26. Geo Fencing (Marketing) ──────────────────────────────────────
  {
    name: '20260426_geo_fencing',
    sql: `
      CREATE TABLE IF NOT EXISTS geo_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        center_lat FLOAT NOT NULL,
        center_lng FLOAT NOT NULL,
        radius_km FLOAT DEFAULT 2,
        message TEXT NOT NULL,
        trigger_event TEXT DEFAULT 'enter', -- enter, exit
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_geo_campaigns_chain ON geo_campaigns(chain_id);
    `,
  },

  // ── 27. Dynamic Tax Config ───────────────────────────────────────────
  {
    name: '20260426_dynamic_tax',
    sql: `
      ALTER TABLE bills
        ADD COLUMN IF NOT EXISTS tax_breakdown JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS service_charge_percent FLOAT DEFAULT 0;
    `,
  },
];

// ─── Runner ────────────────────────────────────────────────────────────────

async function runAll() {
  console.log('\n🚀 Adruva Resto — Master Migration Runner');
  console.log('━'.repeat(50));
  let passed = 0;
  let failed = 0;

  for (const m of migrations) {
    try {
      await db.query(m.sql);
      console.log(`  ✅  ${m.name}`);
      passed++;
    } catch (err: any) {
      // Skip if already exists / already applied
      if (err.message?.includes('already exists') || err.code === '42701') {
        console.log(`  ⏭️  ${m.name}  (already applied)`);
        passed++;
      } else {
        console.error(`  ❌  ${m.name}  →  ${err.message}`);
        failed++;
      }
    }
  }

  console.log('━'.repeat(50));
  console.log(`\n  ✅ Passed: ${passed}   ❌ Failed: ${failed}`);
  console.log(`  Total migrations: ${migrations.length}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runAll();
