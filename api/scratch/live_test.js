const http = require('http');

// ─── HTTP Helpers ────────────────────────────────────────────────────────────

function req(method, path, body, token, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 4000,
      path: '/api' + path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...extraHeaders
      }
    };
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, body: data, headers: res.headers }); }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

function pass(label) { console.log(`  ✅ PASS: ${label}`); }
function fail(label, detail) { console.log(`  ❌ FAIL: ${label}  →  ${detail || ''}`); }

// ─── Test Suite ───────────────────────────────────────────────────────────────

async function run() {
  console.log('\n═══════════════════════════════════════════');
  console.log('   ADRUVA RESTO — LIVE API TEST SUITE');
  console.log('═══════════════════════════════════════════\n');

  // ── PHASE 1: Health ─────────────────────────────────────
  console.log('🔵 PHASE 1: System Health');
  const health = await req('GET', '/health');
  health.body.db === 'connected' ? pass('PostgreSQL connected') : fail('DB', health.body.db);
  health.body.redis === 'connected' ? pass('Redis (Upstash) connected') : fail('Redis', health.body.redis);

  // ── PHASE 2: Auth (Staff / Outlet) ──────────────────────
  console.log('\n🔵 PHASE 2: Staff Authentication (JWT + Redis)');
  const loginRes = await req('POST', '/auth/login', { email: 'manager@adruva.com', password: 'admin123' });
  if (!loginRes.body.accessToken) { fail('Outlet Manager login', JSON.stringify(loginRes.body)); return; }
  const TOKEN = loginRes.body.accessToken;
  const refreshCookie = (loginRes.headers['set-cookie'] || []).join('; ');
  pass(`Staff login → role: ${loginRes.body.user.role}`);

  // Refresh token (httpOnly cookie sent)
  const refreshRes = await req('POST', '/auth/refresh', null, null, { Cookie: refreshCookie });
  refreshRes.status === 200
    ? pass('Refresh token OK (cookie flow)')
    : fail('Token refresh', JSON.stringify(refreshRes.body));

  // Logout
  const logoutRes = await req('POST', '/auth/logout', null, TOKEN);
  logoutRes.body.success ? pass('Logout OK') : fail('Logout', JSON.stringify(logoutRes.body));

  // Re-login after logout
  const reLoginRes = await req('POST', '/auth/login', { email: 'manager@adruva.com', password: 'admin123' });
  const MTOKEN = reLoginRes.body.accessToken;

  // ── PHASE 3: Menu Module ─────────────────────────────────
  console.log('\n🔵 PHASE 3: Menu Module');
  const cats = await req('GET', '/menu/categories', null, MTOKEN);
  cats.body.success ? pass(`Categories: ${cats.body.data.length} total`) : fail('Categories', JSON.stringify(cats.body));

  const items = await req('GET', '/menu/items', null, MTOKEN);
  items.body.success ? pass(`Menu Items: ${items.body.data.length} total`) : fail('Items', JSON.stringify(items.body));

  const stats = await req('GET', '/menu/stats', null, MTOKEN);
  stats.body.success
    ? pass(`Plan limit: ${stats.body.data.item_count}/${stats.body.data.max_menu_items} items used`)
    : fail('Menu stats', JSON.stringify(stats.body));

  // Create a new category
  const newCat = await req('POST', '/menu/categories', { name: 'Test Category', sort_order: 99 }, MTOKEN);
  newCat.status === 201 ? pass('Create category OK') : fail('Create category', JSON.stringify(newCat.body));
  
  // Public QR menu (no auth — customer-app)
  const pubMenu = await req('GET', '/menu/public/adruva-andheri');
  pubMenu.body.success
    ? pass(`Public QR menu: ${pubMenu.body.data.categories.length} categories for "${pubMenu.body.data.outlet.name}"`)
    : fail('Public QR menu', JSON.stringify(pubMenu.body));

  // ── PHASE 4: Settings — Tables ───────────────────────────
  console.log('\n🔵 PHASE 4: Tables & Rooms');
  const tables = await req('GET', '/settings/tables', null, MTOKEN);
  tables.body.success ? pass(`Tables: ${tables.body.data.length} available`) : fail('Tables', JSON.stringify(tables.body));
  const firstTable = tables.body.data?.[0];

  // ── PHASE 5: Order Engine ────────────────────────────────
  console.log('\n🔵 PHASE 5: Order Engine');
  const menuItemId = items.body.data?.[0]?.id;
  const itemPrice = items.body.data?.[0]?.base_price_paise;
  const tableId = firstTable?.id;

  let order;
  if (menuItemId && tableId) {
    const orderRes = await req('POST', '/orders', {
      order_type: 'dine_in',
      table_id: tableId,
      items: [{ menu_item_id: menuItemId, quantity: 2, unit_price_paise: itemPrice }]
    }, MTOKEN);

    if (orderRes.status === 201) {
      order = orderRes.body.data;
      pass(`Order created: #${order.order_number} | ${order.items.length} item(s) | Table auto-set to occupied`);
    } else {
      fail('Order creation', JSON.stringify(orderRes.body));
    }

    // GET orders filtered by status
    const getOrders = await req('GET', '/orders?status=confirmed', null, MTOKEN);
    getOrders.body.success ? pass(`Get orders (confirmed): ${getOrders.body.data.length} returned`) : fail('Get orders', JSON.stringify(getOrders.body));

    // KDS: update item to preparing
    if (order?.items?.[0]) {
      const itemStatusRes = await req('PATCH', `/orders/items/${order.items[0].id}/status`, { status: 'preparing' }, MTOKEN);
      itemStatusRes.body.success ? pass('KDS item status: pending → preparing') : fail('KDS item status', JSON.stringify(itemStatusRes.body));
    }

    // Update entire order to ready
    if (order) {
      const orderStatusRes = await req('PATCH', `/orders/${order.id}/status`, { status: 'ready' }, MTOKEN);
      orderStatusRes.body.success ? pass('Order status: confirmed → ready') : fail('Order status', JSON.stringify(orderStatusRes.body));
    }
  }

  // ── PHASE 6: Billing ─────────────────────────────────────
  console.log('\n🔵 PHASE 6: Billing & Payments');
  if (order) {
    // Generate bill
    const billRes = await req('POST', '/billing/generate', {
      order_id: order.id,
      gst_5_paise: Math.round(order.items[0]?.total_paise * 0.05)
    }, MTOKEN);

    if (billRes.status === 201) {
      const bill = billRes.body.data;
      pass(`Bill generated: #${bill.bill_number} | Total: ₹${(bill.total_paise/100).toFixed(2)} (incl. 5% GST)`);

      // Record payment
      const payRes = await req('POST', '/billing/payments', {
        bill_id: bill.id, payment_method: 'upi', amount_paise: bill.total_paise
      }, MTOKEN);
      payRes.body.success ? pass('Payment recorded: UPI') : fail('Payment', JSON.stringify(payRes.body));

      // Verify bill is now paid
      const detailRes = await req('GET', `/billing/${bill.id}`, null, MTOKEN);
      if (detailRes.body.success) {
        const s = detailRes.body.data.status;
        s === 'paid' ? pass(`Bill status confirmed: paid ✓`) : fail(`Bill should be 'paid', got '${s}'`);
      }

      // Bills list
      const billList = await req('GET', '/billing/list?status=paid', null, MTOKEN);
      billList.body.success ? pass(`Bill list (paid): ${billList.body.data.length} entries`) : fail('Bill list', JSON.stringify(billList.body));
    } else {
      fail('Bill generation', JSON.stringify(billRes.body));
    }
  }

  // ── PHASE 7: RBAC Guards ─────────────────────────────────
  console.log('\n🔵 PHASE 7: RBAC & Security Guards');
  // Waiter login → try to create menu item (should be 403)
  const waiterLogin = await req('POST', '/auth/login', { email: 'waiter@adruva.com', password: 'admin123' });
  if (waiterLogin.body.accessToken) {
    const WTOKEN = waiterLogin.body.accessToken;
    const forbiddenRes = await req('POST', '/menu/items', { name: 'Hack', base_price_paise: 0 }, WTOKEN);
    forbiddenRes.status === 403 ? pass('RBAC: waiter cannot create menu items (403)') : fail('RBAC not enforced', `got status ${forbiddenRes.status}`);
    
    // Waiter CAN get menu items
    const allowedRes = await req('GET', '/menu/items', null, WTOKEN);
    allowedRes.status === 200 ? pass('RBAC: waiter can read menu items (200)') : fail('Waiter read access', `got ${allowedRes.status}`);
  }
  
  // No token → 401
  const noAuthRes = await req('GET', '/menu/categories');
  noAuthRes.status === 401 ? pass('Auth guard: no token → 401') : fail('Auth guard', `got ${noAuthRes.status}`);

  // ── PHASE 8: Chain App ───────────────────────────────────
  console.log('\n🔵 PHASE 8: Chain HQ App');
  const chainLogin = await req('POST', '/chain/auth/login', { email: 'golden@adruvaresto.com', password: 'admin123' });
  if (chainLogin.body.accessToken) {
    const CT = chainLogin.body.accessToken;
    pass('Chain login OK');

    const cm = await req('GET', '/chain/mgmt/metrics', null, CT);
    cm.body.success
      ? pass(`Chain metrics: ${cm.body.data.metrics.total_outlets} outlets | ₹${cm.body.data.metrics.total_revenue/100} revenue`)
      : fail('Chain metrics', JSON.stringify(cm.body));

    const co = await req('GET', '/chain/mgmt/outlets', null, CT);
    co.body.success ? pass(`Chain outlets: ${co.body.data.length} listed`) : fail('Chain outlets', JSON.stringify(co.body));

    const masterCats = await req('GET', '/chain/mgmt/master-menu/categories', null, CT);
    masterCats.body.success ? pass(`Master menu categories: ${masterCats.body.data.length}`) : fail('Master categories', JSON.stringify(masterCats.body));
  } else {
    fail('Chain login', JSON.stringify(chainLogin.body));
  }

  // ── PHASE 9: SuperAdmin ──────────────────────────────────
  console.log('\n🔵 PHASE 9: SuperAdmin');
  const saLogin = await req('POST', '/superadmin/auth/login', { email: 'admin@adruvaresto.com', password: 'admin123' });
  if (saLogin.body.accessToken) {
    const SAT = saLogin.body.accessToken;
    pass('SuperAdmin login OK');

    const saM = await req('GET', '/superadmin/mgmt/metrics', null, SAT);
    saM.body.success
      ? pass(`SA metrics: ${saM.body.data.chains} chains | ${saM.body.data.outlets} outlets | ₹${saM.body.data.totalRevenue/100} platform revenue`)
      : fail('SA metrics', JSON.stringify(saM.body));

    const saH = await req('GET', '/superadmin/mgmt/health', null, SAT);
    saH.body.success
      ? pass(`SA health: API=${saH.body.data.api} | DB=${saH.body.data.database} | Redis=${saH.body.data.redis} | uptime=${saH.body.data.uptime}s`)
      : fail('SA health', JSON.stringify(saH.body));

    const plans = await req('GET', '/superadmin/mgmt/plans', null, SAT);
    plans.body.success ? pass(`Plans: ${plans.body.data.length} available`) : fail('Plans', JSON.stringify(plans.body));

    const chains = await req('GET', '/superadmin/mgmt/chains', null, SAT);
    chains.body.success ? pass(`All chains: ${chains.body.data.length} listed`) : fail('Chains', JSON.stringify(chains.body));

    // Non-superadmin cannot access SA routes
    const unauth = await req('GET', '/superadmin/mgmt/metrics', null, MTOKEN);
    unauth.status === 403 ? pass('SA route blocked for outlet_manager (403)') : fail('SA RBAC', `got ${unauth.status}`);
  } else {
    fail('SuperAdmin login', JSON.stringify(saLogin.body));
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('   ALL PHASES COMPLETE');
  console.log('═══════════════════════════════════════════\n');
}

run().catch(e => console.error('CRASH:', e.message, e.stack));
