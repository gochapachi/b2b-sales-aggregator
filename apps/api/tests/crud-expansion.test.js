const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const TEST_PORT = process.env.TEST_PORT || 4010;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, port: TEST_PORT, hostname: '127.0.0.1' }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServerReady(retries = 25) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await request({ path: '/health', method: 'GET' });
      if (res.status === 200) return true;
    } catch (e) {
      // server starting up...
    }
    await sleep(250);
  }
  throw new Error('Server failed to start within timeout');
}

async function runTests() {
  console.log('================================================================');
  console.log('  STARTING TEST SUITE: BACKEND API CRUD EXPANSION & HARDENING  ');
  console.log('================================================================\n');

  const apiDir = path.resolve(__dirname, '..');
  const serverProcess = spawn('node', ['dist/server.js'], {
    cwd: apiDir,
    env: { ...process.env, PORT: String(TEST_PORT), LOG_LEVEL: 'silent' }
  });

  serverProcess.stderr.on('data', (d) => {
    // console.error('[Server Err]:', d.toString());
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    await waitForServerReady();
    console.log(`[Test Server] Online at http://127.0.0.1:${TEST_PORT}\n`);

    // =========================================================================
    // DOMAIN 1: Seller Products CRUD
    // =========================================================================
    console.log('--- 1. SELLER PRODUCTS CRUD (/api/seller/products) ---');

    // 1.1 GET /api/seller/products/:id by product ID
    let res = await request({ path: '/api/seller/products/prod_parleg', method: 'GET' });
    assert(res.status === 200, 'GET /api/seller/products/prod_parleg returns 200 OK');
    assert(res.data.success === true, 'Response contains success: true');
    assert(res.data.product && res.data.product.id === 'prod_parleg', 'Product ID matches prod_parleg');
    assert(res.data.product.skus && res.data.product.skus.length > 0, 'Product has nested SKUs');
    assert(res.data.product.name.includes('Parle-G'), 'Product name is Parle-G');

    // 1.2 GET /api/seller/products/:id by SKU ID
    res = await request({ path: '/api/seller/products/sku_parle_carton', method: 'GET' });
    assert(res.status === 200, 'GET /api/seller/products/:skuId resolves by nested SKU ID');
    assert(res.data.product.id === 'prod_parleg', 'Resolves to parent product prod_parleg');

    // 1.3 GET /api/seller/products/:id by SKU code
    res = await request({ path: '/api/seller/products/PARLE-G-80G-CTN-72', method: 'GET' });
    assert(res.status === 200, 'GET /api/seller/products/:skuCode resolves by nested SKU Code');
    assert(res.data.product.id === 'prod_parleg', 'Resolves to parent product prod_parleg');

    // 1.4 GET /api/seller/products/:id non-existent returns 404
    res = await request({ path: '/api/seller/products/prod_non_existent', method: 'GET' });
    assert(res.status === 404, 'GET /api/seller/products/:id non-existent returns 404 Not Found');

    // 1.5 PUT /api/seller/products/:id with flat SKU fields & margin recalculation
    res = await request({
      path: '/api/seller/products/prod_parleg',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      wholesalePrice: 570,
      mrp: 720,
      stock: 300,
      moq: 3,
      description: 'Updated Parle-G Glucose Biscuit Wholesale Carton'
    });
    assert(res.status === 200, 'PUT /api/seller/products/prod_parleg returns 200 OK');
    assert(res.data.product.description === 'Updated Parle-G Glucose Biscuit Wholesale Carton', 'Top-level description updated');
    const updatedSku = res.data.product.skus[0];
    assert(updatedSku.wholesalePrice === 570, 'Primary SKU wholesalePrice updated to 570');
    assert(updatedSku.stockQuantity === 300, 'Primary SKU stockQuantity updated to 300');
    assert(updatedSku.minimumOrderQuantity === 3, 'Primary SKU minimumOrderQuantity updated to 3');
    // Margin check: ((720 - 570) / 720) * 100 = 20.83% -> rounded to 20.8%
    assert(res.data.product.marginPct === 20.8, `Margin % correctly recalculated to 20.8% (got: ${res.data.product.marginPct})`);

    // 1.6 PUT non-existent product returns 404
    res = await request({
      path: '/api/seller/products/prod_unknown',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Fake' });
    assert(res.status === 404, 'PUT /api/seller/products/:id non-existent returns 404');

    // 1.7 DELETE /api/seller/products/:id?archive=true (Soft Archiving)
    res = await request({
      path: '/api/seller/products/prod_parleg?archive=true',
      method: 'DELETE'
    });
    assert(res.status === 200, 'DELETE /api/seller/products/prod_parleg?archive=true returns 200 OK');
    assert(res.data.product.status === 'ARCHIVED', 'Product status marked ARCHIVED');
    assert(res.data.product.isArchived === true, 'Product isArchived is true');
    assert(res.data.product.skus[0].isActive === false, 'Nested SKUs deactivated');

    // Verify archived product remains retrievable
    res = await request({ path: '/api/seller/products/prod_parleg', method: 'GET' });
    assert(res.status === 200, 'Archived product remains retrievable via GET');
    assert(res.data.product.status === 'ARCHIVED', 'Persisted status is ARCHIVED');

    // 1.8 Hard Delete on temporary product
    res = await request({
      path: '/api/seller/products',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      organizationId: 'org_anagata_fmcg',
      name: 'Temp Product For Hard Delete',
      category: 'Snacks',
      brand: 'TestBrand',
      skus: [{ mrp: 50, wholesalePrice: 40, stockQuantity: 10, unitTitle: 'Pack' }]
    });
    const tempProdId = res.data.product.id;
    assert(res.status === 200 && tempProdId, 'Created temporary product for hard delete');

    res = await request({
      path: `/api/seller/products/${tempProdId}?hardDelete=true`,
      method: 'DELETE'
    });
    assert(res.status === 200, 'DELETE with ?hardDelete=true returns 200 OK');
    assert(res.data.message.includes('permanently deleted'), 'Message confirms permanent deletion');

    res = await request({ path: `/api/seller/products/${tempProdId}`, method: 'GET' });
    assert(res.status === 404, 'Hard-deleted product returns 404 on subsequent GET');

    // =========================================================================
    // DOMAIN 2: Universal Orders & Sub-Orders
    // =========================================================================
    console.log('\n--- 2. UNIVERSAL ORDERS & SUB-ORDERS (/api/orders) ---');

    // 2.1 GET Master Order by ID
    res = await request({ path: '/api/orders/ord_sample_01', method: 'GET' });
    assert(res.status === 200, 'GET /api/orders/ord_sample_01 returns 200 OK');
    assert(res.data.orderType === 'MASTER_ORDER', 'Resolves orderType as MASTER_ORDER');
    assert(res.data.order && res.data.order.orderNumber === 'ORD-871718', 'Order number matches ORD-871718');
    assert(res.data.order.retailer && res.data.order.retailer.shopName.includes('Gupta'), 'Enriched with retailer shop details');
    assert(res.data.order.subOrders && res.data.order.subOrders.length >= 2, 'Enriched with multiple sub-orders');
    assert(res.data.order.subOrders[0].sellerOrganization !== null, 'Sub-order enriched with seller organization');
    assert(res.data.order.subOrders[0].invoice !== undefined, 'Sub-order has GST Tax Invoice attached');

    // 2.2 GET Sub-Order by ID
    res = await request({ path: '/api/orders/subord_sample_fmcg', method: 'GET' });
    assert(res.status === 200, 'GET /api/orders/subord_sample_fmcg returns 200 OK');
    assert(res.data.orderType === 'SUB_ORDER', 'Resolves orderType as SUB_ORDER');
    assert(res.data.order.masterOrderId === 'ord_sample_01', 'Includes parent masterOrderId');
    assert(res.data.order.deliveryOtp === '4871', 'Includes deliveryOtp');
    assert(res.data.order.items && res.data.order.items.length > 0, 'Includes line items array');
    assert(res.data.order.retailer !== null, 'Includes enriched retailer details');
    assert(res.data.order.sellerOrganization !== null, 'Includes enriched seller organization');

    // 2.3 GET Non-existent order returns 404
    res = await request({ path: '/api/orders/ord_unknown', method: 'GET' });
    assert(res.status === 404, 'GET /api/orders/:id non-existent returns 404');

    // 2.4 PATCH Sub-Order Status Transitions: PACKED
    res = await request({
      path: '/api/orders/subord_sample_bev',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'PACKED',
      deliveryNotes: 'Packed in thermal crate with ice gel packs'
    });
    assert(res.status === 200, 'PATCH /api/orders/subord_sample_bev status=PACKED returns 200 OK');
    assert(res.data.order.status === 'PACKED', 'Sub-order status is PACKED');
    assert(res.data.order.deliveryNotes === 'Packed in thermal crate with ice gel packs', 'Delivery notes saved');

    // 2.5 PATCH Sub-Order: DISPATCHED
    res = await request({
      path: '/api/orders/subord_sample_bev',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'DISPATCHED'
    });
    assert(res.status === 200, 'PATCH status=DISPATCHED returns 200 OK');
    assert(res.data.order.status === 'DISPATCHED', 'Sub-order status is DISPATCHED');
    assert(res.data.order.dispatchTime !== undefined, 'dispatchTime timestamp recorded');

    // 2.6 PATCH Sub-Order: DELIVERED & Transit Duration Calculation
    res = await request({
      path: '/api/orders/subord_sample_bev',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'DELIVERED',
      paymentStatus: 'PAID'
    });
    assert(res.status === 200, 'PATCH status=DELIVERED returns 200 OK');
    assert(res.data.order.status === 'DELIVERED', 'Sub-order status is DELIVERED');
    assert(res.data.order.transitDurationMinutes !== undefined && res.data.order.transitDurationMinutes >= 1, 'transitDurationMinutes calculated');
    assert(res.data.order.paymentStatus === 'PAID', 'paymentStatus updated to PAID');
    // Since subord_sample_fmcg is DELIVERED and now subord_sample_bev is DELIVERED, master order becomes COMPLETED
    assert(res.data.masterOrderStatus === 'COMPLETED', `Master order aggregated status transitioned to COMPLETED (got: ${res.data.masterOrderStatus})`);

    // 2.7 PATCH Master Order directly
    res = await request({
      path: '/api/orders/ord_sample_01',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      paymentStatus: 'PAID'
    });
    assert(res.status === 200, 'PATCH /api/orders/:masterOrderId returns 200 OK');
    assert(res.data.order.paymentStatus === 'PAID', 'Master order paymentStatus updated to PAID');

    // =========================================================================
    // DOMAIN 3: Retailers & Store Leads
    // =========================================================================
    console.log('\n--- 3. RETAILERS & STORE LEADS (/api/retailers) ---');

    // 3.1 GET /api/retailers list
    res = await request({ path: '/api/retailers', method: 'GET' });
    assert(res.status === 200, 'GET /api/retailers returns 200 OK');
    assert(res.data.retailers && res.data.retailers.length >= 2, `Returned ${res.data.retailers?.length} retailers`);

    // 3.2 GET /api/retailers with query filter
    res = await request({ path: '/api/retailers?city=Lucknow', method: 'GET' });
    assert(res.status === 200, 'GET /api/retailers?city=Lucknow returns 200 OK');
    assert(res.data.retailers.every(r => r.city.toLowerCase() === 'lucknow'), 'All returned stores in Lucknow');

    // 3.3 GET /api/retailers/:id store 360 profile
    res = await request({ path: '/api/retailers/ret_gupta_kirana', method: 'GET' });
    assert(res.status === 200, 'GET /api/retailers/ret_gupta_kirana returns 200 OK');
    assert(res.data.retailer.id === 'ret_gupta_kirana', 'Retailer ID matches ret_gupta_kirana');
    assert(res.data.retailer.storeName === 'Gupta Kirana & General Store', 'Retailer storeName is present');
    assert(res.data.retailer.ordersCount >= 1, `Lifetime ordersCount is ${res.data.retailer.ordersCount}`);
    assert(res.data.retailer.lifetimeValue > 0, `Lifetime value is ₹${res.data.retailer.lifetimeValue}`);
    assert(Array.isArray(res.data.retailer.orderHistory), 'orderHistory array attached');
    assert(Array.isArray(res.data.retailer.visits), 'visits array attached');
    assert(Array.isArray(res.data.retailer.notes), 'notes array attached');
    assert(Array.isArray(res.data.retailer.payments), 'payments array attached');

    // 3.4 GET non-existent retailer returns 404
    res = await request({ path: '/api/retailers/ret_unknown', method: 'GET' });
    assert(res.status === 404, 'GET /api/retailers/:id non-existent returns 404');

    // 3.5 PUT /api/retailers/:id update store profile
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      ownerName: 'Ramesh Kumar Gupta',
      creditLimit: 75000,
      paymentTerms: 'NET_15',
      address: 'Shop 4-5, Near Mayfair, Hazratganj'
    });
    assert(res.status === 200, 'PUT /api/retailers/ret_gupta_kirana returns 200 OK');
    assert(res.data.retailer.ownerName === 'Ramesh Kumar Gupta', 'ownerName updated');
    assert(res.data.retailer.creditLimit === 75000, 'creditLimit updated to 75000');
    assert(res.data.retailer.paymentTerm === 'NET_15', 'paymentTerm updated to NET_15');
    assert(res.data.retailer.availableCredit > 0, 'availableCredit recalculated');

    // 3.6 PUT /api/retailers/:id enforces 15m GPS collision check
    // ret_sharma_general is at lat: 26.852000, lng: 80.949000
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: 26.852002,
      longitude: 80.949002
    });
    assert(res.status === 409, 'PUT with colliding GPS coordinates returns 409 Conflict');
    assert(res.data.error === 'GPS_COLLISION_15M', 'Error code is GPS_COLLISION_15M');
    assert(res.data.collidingStore && res.data.collidingStore.shopName.includes('Sharma'), 'Identifies colliding store');

    // =========================================================================
    // DOMAIN 4: Universal User Profile & Registry
    // =========================================================================
    console.log('\n--- 4. UNIVERSAL USER REGISTRY (/api/users) ---');

    // 4.1 GET /api/users/:id
    res = await request({ path: '/api/users/usr_seller_picker_1', method: 'GET' });
    assert(res.status === 200, 'GET /api/users/usr_seller_picker_1 returns 200 OK');
    assert(res.data.user.id === 'usr_seller_picker_1', 'User ID matches');
    assert(res.data.user.role === 'SELLER_STAFF', 'Role is SELLER_STAFF');
    assert(res.data.user.staffTitle === 'Warehouse Picker & Dispatcher', 'staffTitle is correct');
    assert(res.data.user.organizationName === 'Anagata FMCG Wholesale', 'Organization resolved');
    assert(Array.isArray(res.data.user.permissions), 'Permissions array present');
    assert(Array.isArray(res.data.user.auditLog), 'auditLog array present');

    // 4.2 GET non-existent user returns 404
    res = await request({ path: '/api/users/usr_non_existent', method: 'GET' });
    assert(res.status === 404, 'GET /api/users/:id non-existent returns 404');

    // 4.3 PUT /api/users/:id update profile and permissions
    res = await request({
      path: '/api/users/usr_seller_picker_1',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      staffTitle: 'Lead Warehouse Manager',
      status: 'SUSPENDED',
      permissions: ['CAN_VIEW_ORDERS', 'CAN_PACK_BATCHES', 'CAN_DISPATCH', 'CAN_PRINT_LABELS', 'CAN_VIEW_LEDGERS']
    });
    assert(res.status === 200, 'PUT /api/users/usr_seller_picker_1 returns 200 OK');
    assert(res.data.user.staffTitle === 'Lead Warehouse Manager', 'staffTitle updated');
    assert(res.data.user.status === 'SUSPENDED', 'status toggled to SUSPENDED');
    assert(res.data.user.permissions.length === 5, 'permissions array updated to 5 items');

    // 4.4 Verify audit log records user modification
    res = await request({ path: '/api/users/usr_seller_picker_1', method: 'GET' });
    assert(res.status === 200, 'GET updated user returns 200 OK');
    const updateLog = res.data.user.auditLog.find(l => l.action === 'USER_UPDATED');
    assert(updateLog !== undefined, 'Security audit log records USER_UPDATED event');

    // 4.5 PUT non-existent user returns 404
    res = await request({
      path: '/api/users/usr_fake',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Nobody' });
    assert(res.status === 404, 'PUT /api/users/:id non-existent returns 404');

    // =========================================================================
    // DOMAIN 5: Retail POS Bills & Thermal Reprint
    // =========================================================================
    console.log('\n--- 5. RETAIL POS BILLS & THERMAL REPRINT (/api/pos/bills) ---');

    // 5.1 GET /api/pos/bills
    res = await request({ path: '/api/pos/bills', method: 'GET' });
    assert(res.status === 200, 'GET /api/pos/bills returns 200 OK');
    assert(res.data.success === true, 'Response success: true');
    assert(Array.isArray(res.data.bills) && res.data.bills.length > 0, `Returned ${res.data.bills.length} counter bills`);

    // 5.2 GET /api/pos/bills?retailerId=ret_gupta_kirana
    res = await request({ path: '/api/pos/bills?retailerId=ret_gupta_kirana', method: 'GET' });
    assert(res.status === 200, 'GET /api/pos/bills?retailerId=ret_gupta_kirana returns 200 OK');
    assert(res.data.bills.every(b => b.retailerId === 'ret_gupta_kirana'), 'All bills belong to ret_gupta_kirana');

    // 5.3 GET /api/pos/bills/:id by Bill ID
    res = await request({ path: '/api/pos/bills/bill_001', method: 'GET' });
    assert(res.status === 200, 'GET /api/pos/bills/bill_001 returns 200 OK');
    assert(res.data.bill.id === 'bill_001', 'Bill ID is bill_001');
    assert(res.data.bill.billNumber === 'BILL-2026-101', 'Bill Number is BILL-2026-101');
    assert(res.data.bill.grandTotal === 235, 'grandTotal is 235');
    assert(res.data.bill.taxAmount !== undefined, 'taxAmount is present');
    assert(res.data.bill.items && res.data.bill.items.length >= 2, 'Bill line items present');
    assert(res.data.bill.retailerShopName.includes('Gupta'), 'Enriched with retailer shop name');

    // 5.4 Check ESC/POS Thermal Receipt formatting
    assert(typeof res.data.bill.escPosThermalReceipt === 'string', 'escPosThermalReceipt is a formatted string');
    assert(typeof res.data.bill.escPosReceipt === 'string', 'escPosReceipt alias is present');
    const receipt = res.data.bill.escPosThermalReceipt;
    assert(receipt.includes('Gupta Kirana & General Store'), 'Receipt includes store name header');
    assert(receipt.includes('BILL-2026-101'), 'Receipt includes Bill No');
    assert(receipt.includes('Parle-G Glucose'), 'Receipt includes item row');
    assert(receipt.includes('GRAND TOTAL:'), 'Receipt includes GRAND TOTAL');
    assert(receipt.includes('THANK YOU! VISIT AGAIN'), 'Receipt includes footer message');

    // 5.5 GET /api/pos/bills/:id by Bill Number
    res = await request({ path: '/api/pos/bills/BILL-2026-101', method: 'GET' });
    assert(res.status === 200, 'GET /api/pos/bills/:billNumber resolves by human-readable Bill Number');
    assert(res.data.bill.id === 'bill_001', 'Resolves to bill_001');

    // 5.6 GET non-existent bill returns 404
    res = await request({ path: '/api/pos/bills/bill_non_existent', method: 'GET' });
    assert(res.status === 404, 'GET /api/pos/bills/:id non-existent returns 404');

  } catch (err) {
    console.error('Test Execution Error:', err);
    failed++;
  } finally {
    serverProcess.kill('SIGTERM');
    console.log('\n================================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();
