-- ============================================================
-- FILE: migrations/004_performance_indexes.sql
-- PURPOSE: Indexes for all frequently-queried columns
-- ============================================================

-- Orders: most queried by outlet + status + date
CREATE INDEX idx_orders_outlet_status      ON orders(outlet_id, status);
CREATE INDEX idx_orders_outlet_created     ON orders(outlet_id, created_at DESC);
CREATE INDEX idx_orders_session            ON orders(session_id);

-- Order items: by order
CREATE INDEX idx_order_items_order         ON order_items(order_id);

-- Bills: by outlet + status + date
CREATE INDEX idx_bills_outlet_status       ON bills(outlet_id, status);
CREATE INDEX idx_bills_outlet_created      ON bills(outlet_id, created_at DESC);
CREATE INDEX idx_bills_order               ON bills(order_id);

-- Payment transactions
CREATE INDEX idx_payment_bill              ON payment_transactions(bill_id);
CREATE INDEX idx_payment_razorpay_order    ON payment_transactions(razorpay_order_id);

-- Staff: by outlet
CREATE INDEX idx_staff_outlet              ON staff(outlet_id);
CREATE INDEX idx_staff_outlet_role         ON staff(outlet_id, role);

-- Menu items: availability filter is common
CREATE INDEX idx_menu_items_outlet_avail   ON menu_items(outlet_id, is_available);
CREATE INDEX idx_menu_items_category       ON menu_items(category_id);

-- Customers: phone search + chain scoping
CREATE INDEX idx_customers_chain           ON customers(chain_id);
CREATE INDEX idx_customers_phone           ON customers(chain_id, phone);
CREATE INDEX idx_customers_loyalty         ON customers(chain_id, loyalty_points);

-- Attendance: date range queries
CREATE INDEX idx_attendance_staff_date     ON attendance(staff_id, date);
CREATE INDEX idx_attendance_outlet_date    ON attendance(outlet_id, date);

-- Stock movements: ingredient history
CREATE INDEX idx_stock_movements_ingredient ON stock_movements(ingredient_id, created_at DESC);

-- Audit logs: by outlet + created
CREATE INDEX idx_audit_logs_outlet         ON audit_logs(outlet_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor          ON audit_logs(actor_id, created_at DESC);

-- Reviews: rating filter
CREATE INDEX idx_reviews_outlet_rating     ON reviews(outlet_id, rating);

-- Subscriptions: status-based cron queries
CREATE INDEX idx_subscriptions_status      ON subscriptions(status);
CREATE INDEX idx_subscriptions_expiry      ON subscriptions(current_period_end)
  WHERE status IN ('active','expiring');

-- Notifications: unread per staff
CREATE INDEX idx_notifications_staff_unread ON notifications(staff_id, is_read)
  WHERE is_read = FALSE;
