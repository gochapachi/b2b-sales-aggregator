const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const TEST_PORT = process.env.TEST_PORT || 4015;

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

async function waitForServerReady(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await request({ path: '/health', method: 'GET' });
      if (res.status === 200) return true;
    } catch (e) {}
    await sleep(200);
  }
  throw new Error('Test server failed to start within timeout');
}

async function runChallengerSuite() {
  console.log('================================================================');
  console.log('  CHALLENGER EMPIRICAL TEST SUITE: PRODUCT & ORDER CRUD STRESS  ');
  console.log('================================================================\n');

  const apiDir = path.resolve(__dirname, '..');
  const serverProcess = spawn('node', ['dist/server.js'], {
    cwd: apiDir,
    env: { ...process.env, PORT: String(TEST_PORT), LOG_LEVEL: 'silent' }
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      if (details) console.error(`         Details: ${JSON.stringify(details)}`);
      failed++;
    }
  }

  try {
    await waitForServerReady();
    console.log(`[Challenger Server] Running on http://127.0.0.1:${TEST_PORT}\n`);

    // =========================================================================
    // SECTION 1: SELLER PRODUCTS CRUD & EDGE CASE STRESS
    // =========================================================================
    console.log('--- SECTION 1: PUT /api/seller/products/:id EDGE CASES ---');

    // 1.1 Baseline product retrieval
    let res = await request({ path: '/api/seller/products/prod_parleg', method: 'GET' });
    assert(res.status === 200 && res.data.success, 'GET /api/seller/products/prod_parleg returns 200 OK');

    // 1.2 Flat SKU update: Zero stock edge case (stock = 0)
    res = await request({
      path: '/api/seller/products/prod_parleg',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      stock: 0,
      wholesalePrice: 600,
      mrp: 720
    });
    assert(res.status === 200, 'PUT /api/seller/products/:id accepts stock=0', res.data);
    assert(res.data.product.skus[0].stockQuantity === 0, 'Zero stock is preserved and not ignored/defaulted (got stockQuantity=0)', res.data.product.skus[0]);

    // 1.3 High Margin Recalculation (MRP 2000, Wholesale 20 -> Margin 99.0%)
    res = await request({
      path: '/api/seller/products/prod_parleg',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      wholesalePrice: 20,
      mrp: 2000
    });
    assert(res.status === 200, 'PUT accepts high margin price ratio');
    // ((2000 - 20) / 2000) * 100 = 99.0%
    assert(res.data.product.marginPct === 99, `High margin recalculated to exactly 99% (got: ${res.data.product.marginPct}%)`);

    // 1.4 Negative price edge case (wholesalePrice = -50)
    res = await request({
      path: '/api/seller/products/prod_parleg',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      wholesalePrice: -50,
      mrp: 100
    });
    assert(res.status === 200, 'PUT handles negative wholesalePrice without unhandled server crash');
    assert(res.data.product.skus[0].wholesalePrice === -50, 'Negative wholesalePrice is recorded as -50');
    // ((100 - (-50)) / 100) * 100 = 150%
    assert(res.data.product.marginPct === 150, `Margin calculation correctly handles negative price arithmetic: 150% (got ${res.data.product.marginPct}%)`);

    // 1.5 Inverted price (Negative margin: wholesalePrice > mrp)
    res = await request({
      path: '/api/seller/products/prod_parleg',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      wholesalePrice: 120,
      mrp: 100
    });
    assert(res.status === 200, 'PUT accepts inverted prices (wholesalePrice > mrp)');
    // ((100 - 120) / 100) * 100 = -20%
    assert(res.data.product.marginPct === -20, `Negative margin correctly calculated as -20% (got ${res.data.product.marginPct}%)`);

    // 1.6 Zero MRP guard (mrp = 0 avoids NaN or Infinity)
    res = await request({
      path: '/api/seller/products/prod_parleg',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      mrp: 0,
      wholesalePrice: 50
    });
    assert(res.status === 200, 'PUT with mrp=0 succeeds without divide-by-zero crash');
    assert(typeof res.data.product.marginPct === 'number' && !isNaN(res.data.product.marginPct), 'marginPct does not become NaN or Infinity when mrp is 0');

    // 1.7 Flat vs Nested SKU structures: Nested SKUs array replacement
    const customSkus = [
      {
        id: 'sku_nested_small',
        skuCode: 'NESTED-50G',
        unitTitle: 'Small Pack 50g',
        mrp: 20,
        wholesalePrice: 16,
        stockQuantity: 500,
        minimumOrderQuantity: 10,
        isActive: true
      },
      {
        id: 'sku_nested_large',
        skuCode: 'NESTED-500G',
        unitTitle: 'Family Pack 500g',
        mrp: 150,
        wholesalePrice: 120,
        stockQuantity: 150,
        minimumOrderQuantity: 2,
        isActive: true
      }
    ];

    res = await request({
      path: '/api/seller/products/prod_parleg',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Parle-G Multi-Pack Edition',
      skus: customSkus,
      marginPct: 20
    });
    assert(res.status === 200, 'PUT accepts nested skus array structure');
    assert(res.data.product.skus.length === 2, 'Product now contains 2 nested SKUs');
    assert(res.data.product.skus[0].skuCode === 'NESTED-50G', 'First SKU matches NESTED-50G');
    assert(res.data.product.skus[1].skuCode === 'NESTED-500G', 'Second SKU matches NESTED-500G');

    // 1.8 Flat update applied on primary SKU after multi-SKU replacement
    res = await request({
      path: '/api/seller/products/prod_parleg',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      wholesalePrice: 15,
      mrp: 20,
      stock: 450
    });
    assert(res.status === 200, 'Flat update on multi-SKU product modifies primary SKU');
    assert(res.data.product.skus[0].wholesalePrice === 15, 'Primary SKU wholesalePrice updated to 15');
    assert(res.data.product.skus[0].stockQuantity === 450, 'Primary SKU stock updated to 450');
    assert(res.data.product.skus[1].wholesalePrice === 120, 'Second SKU remained intact at 120');

    // 1.9 Update non-existent product ID returns 404
    res = await request({
      path: '/api/seller/products/prod_ghost_9999',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Ghost' });
    assert(res.status === 404 && res.data.success === false, 'PUT /api/seller/products/prod_ghost_9999 returns 404 Not Found');

    // =========================================================================
    // SECTION 2: DELETE /api/seller/products/:id (ARCHIVE VS HARD DELETE)
    // =========================================================================
    console.log('\n--- SECTION 2: DELETE /api/seller/products/:id ARCHIVE VS HARD DELETE ---');

    // 2.1 Soft Archival on prod_fortune_oil (archive=true)
    res = await request({
      path: '/api/seller/products/prod_fortune_oil?archive=true',
      method: 'DELETE'
    });
    assert(res.status === 200 && res.data.success, 'DELETE /api/seller/products/prod_fortune_oil?archive=true returns 200 OK');
    assert(res.data.product && res.data.product.status === 'ARCHIVED', 'Archived product status is ARCHIVED');
    assert(res.data.product && res.data.product.isArchived === true, 'Archived product isArchived flag is true');
    assert(res.data.product && res.data.product.skus.every((s) => s.isActive === false), 'All nested SKUs are set to isActive: false upon archival');

    // 2.2 Verify archived product remains retrievable via direct ID
    res = await request({ path: '/api/seller/products/prod_fortune_oil', method: 'GET' });
    assert(res.status === 200, 'GET /api/seller/products/prod_fortune_oil returns 200 OK for archived product');
    assert(res.data.product.status === 'ARCHIVED' && res.data.product.isArchived === true, 'GET confirms persisted ARCHIVED state');

    // 2.3 Verify archived product remains visible in seller product studio list
    res = await request({ path: '/api/seller/products?organizationId=org_anagata_fmcg', method: 'GET' });
    assert(res.status === 200, 'GET /api/seller/products list returns 200 OK');
    const fortuneInSellerList = res.data.products.find((p) => p.id === 'prod_fortune_oil');
    assert(fortuneInSellerList !== undefined, 'Archived product remains visible in seller inventory list');
    assert(fortuneInSellerList && fortuneInSellerList.status === 'ARCHIVED', 'Seller list reflects ARCHIVED status');

    // 2.4 Verify archived product in public catalog has inactive SKUs
    res = await request({ path: '/api/catalog', method: 'GET' });
    assert(res.status === 200, 'GET /api/catalog returns 200 OK');
    const fortuneInCatalog = res.data.products.find((p) => p.id === 'prod_fortune_oil');
    assert(fortuneInCatalog !== undefined, 'Product exists in catalog store');
    assert(fortuneInCatalog && fortuneInCatalog.skus.every((s) => s.isActive === false), 'Public catalog correctly exposes inactive SKUs for archived product');

    // 2.5 Hard Delete verification on a newly created product
    res = await request({
      path: '/api/seller/products',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      organizationId: 'org_anagata_fmcg',
      name: 'Adversarial Hard Delete SKU',
      category: 'Oil',
      brand: 'TestBrand',
      skus: [{ mrp: 180, wholesalePrice: 150, stockQuantity: 50, unitTitle: 'Bottle' }]
    });
    assert(res.status === 200, 'Created temporary test product for hard delete');
    const hardDeleteProdId = res.data.product.id;

    // Execute hard delete
    res = await request({
      path: `/api/seller/products/${hardDeleteProdId}?hardDelete=true`,
      method: 'DELETE'
    });
    assert(res.status === 200, 'DELETE with ?hardDelete=true returns 200 OK');
    assert(res.data.message.includes('permanently deleted'), 'Message confirms permanent deletion');

    // Verify completely gone (404)
    res = await request({ path: `/api/seller/products/${hardDeleteProdId}`, method: 'GET' });
    assert(res.status === 404, 'Hard-deleted product is no longer queryable via GET (404)');

    // Verify absent from seller list
    res = await request({ path: '/api/seller/products?organizationId=org_anagata_fmcg', method: 'GET' });
    const absentInSeller = res.data.products.find((p) => p.id === hardDeleteProdId);
    assert(absentInSeller === undefined, 'Hard-deleted product is completely absent from seller list');

    // 2.6 Default DELETE without query parameters performs safe soft-archive
    res = await request({
      path: '/api/seller/products',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      organizationId: 'org_anagata_fmcg',
      name: 'Default Delete Behavior Test',
      category: 'Grains',
      brand: 'TestBrand',
      skus: [{ mrp: 80, wholesalePrice: 65, stockQuantity: 20 }]
    });
    const defaultDelId = res.data.product.id;
    res = await request({
      path: `/api/seller/products/${defaultDelId}`,
      method: 'DELETE'
    });
    assert(res.status === 200, 'DELETE without parameters defaults to soft archive');
    assert(res.data.product && res.data.product.status === 'ARCHIVED', 'Default deletion marks status as ARCHIVED');

    // 2.7 DELETE non-existent product returns 404
    res = await request({
      path: '/api/seller/products/prod_ghost_does_not_exist',
      method: 'DELETE'
    });
    assert(res.status === 404, 'DELETE non-existent product returns 404 Not Found');

    // =========================================================================
    // SECTION 3: UNIVERSAL ORDERS DUAL RESOLUTION & LIFECYCLE
    // =========================================================================
    console.log('\n--- SECTION 3: ORDERS DUAL RESOLUTION & LIFECYCLE STRESS ---');

    // 3.1 Dual resolution: Master Order by Master Order ID (ord_sample_01)
    res = await request({ path: '/api/orders/ord_sample_01', method: 'GET' });
    assert(res.status === 200, 'GET /api/orders/ord_sample_01 returns 200 OK');
    assert(res.data.orderType === 'MASTER_ORDER', 'Resolves as MASTER_ORDER');
    assert(res.data.order.id === 'ord_sample_01', 'Order ID matches ord_sample_01');
    assert(res.data.order.retailer && res.data.order.retailer.id === 'ret_gupta_kirana', 'Enriched with complete retailer store profile');
    assert(res.data.order.subOrders && res.data.order.subOrders.length >= 2, 'Contains child sub-orders array');
    assert(res.data.order.subOrders[0].sellerOrganization !== null, 'Sub-order enriched with seller organization');
    assert(res.data.order.subOrders[0].invoice && res.data.order.subOrders[0].invoice.invoiceNumber, 'Sub-order contains generated GST Tax Invoice');

    // 3.2 Dual resolution: Master Order by Human-Readable Order Number (ORD-871718)
    res = await request({ path: '/api/orders/ORD-871718', method: 'GET' });
    assert(res.status === 200, 'GET /api/orders/ORD-871718 resolves by orderNumber');
    assert(res.data.orderType === 'MASTER_ORDER', 'Resolves as MASTER_ORDER');
    assert(res.data.order.id === 'ord_sample_01', 'Maps to same master order ord_sample_01');

    // 3.3 Dual resolution: Sub-Order by Sub-Order ID (subord_sample_fmcg)
    res = await request({ path: '/api/orders/subord_sample_fmcg', method: 'GET' });
    assert(res.status === 200, 'GET /api/orders/subord_sample_fmcg returns 200 OK');
    assert(res.data.orderType === 'SUB_ORDER', 'Resolves as SUB_ORDER');
    assert(res.data.order.masterOrderId === 'ord_sample_01', 'Includes parent masterOrderId reference');
    assert(res.data.order.masterOrderNumber === 'ORD-871718', 'Includes parent masterOrderNumber');
    assert(res.data.order.deliveryOtp === '4871', 'Sub-order includes 4-digit deliveryOtp');
    assert(res.data.order.items && res.data.order.items.length > 0, 'Sub-order includes line items');
    assert(res.data.order.retailer && res.data.order.retailer.shopName, 'Sub-order enriched with buyer retailer details');
    assert(res.data.order.sellerOrganization && res.data.order.sellerOrganization.name, 'Sub-order enriched with seller organization profile');

    // 3.4 Invalid Order ID returns 404
    res = await request({ path: '/api/orders/ord_non_existent_random_id', method: 'GET' });
    assert(res.status === 404, 'GET /api/orders/:invalidId returns 404 Not Found');

    // 3.5 Full Status Lifecycle Transition on a Fresh Master/Sub-order
    res = await request({
      path: '/api/orders/checkout',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      retailerId: 'ret_gupta_kirana',
      paymentMode: 'CASH_ON_DELIVERY',
      paymentTerm: 'COD',
      items: [
        {
          productSkuId: 'sku_tata_tea_box',
          quantity: 2
        }
      ]
    });
    assert(res.status === 200 && res.data.order, 'Created fresh multi-vendor master order for lifecycle test', res.data);
    const freshMasterOrder = res.data.order;
    const freshSubOrder = freshMasterOrder.subOrders[0];
    const subOrdId = freshSubOrder.id;

    // Verify initial status is RECEIVED
    assert(freshSubOrder.status === 'RECEIVED', 'Initial sub-order status is RECEIVED');
    assert(freshMasterOrder.status === 'PLACED', 'Initial master order status is PLACED');

    // Step 1: Transition RECEIVED -> ACCEPTED
    res = await request({
      path: `/api/orders/${subOrdId}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'ACCEPTED'
    });
    assert(res.status === 200, 'Transition to ACCEPTED returns 200 OK');
    assert(res.data.order.status === 'ACCEPTED', 'Sub-order status updated to ACCEPTED');

    // Step 2: Transition ACCEPTED -> PACKED with deliveryNotes
    res = await request({
      path: `/api/orders/${subOrdId}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'PACKED',
      deliveryNotes: 'Carton sealed with holographic security tape'
    });
    assert(res.status === 200, 'Transition to PACKED returns 200 OK');
    assert(res.data.order.status === 'PACKED', 'Sub-order status updated to PACKED');
    assert(res.data.order.deliveryNotes === 'Carton sealed with holographic security tape', 'Delivery notes persisted');
    const packedStep = res.data.order.trackingHistory?.find((s) => s.status === 'PACKED');
    assert(packedStep && packedStep.completed === true, 'Tracking history PACKED step marked completed');

    // Step 3: Transition PACKED -> DISPATCHED
    res = await request({
      path: `/api/orders/${subOrdId}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'DISPATCHED'
    });
    assert(res.status === 200, 'Transition to DISPATCHED returns 200 OK');
    assert(res.data.order.status === 'DISPATCHED', 'Sub-order status updated to DISPATCHED');
    assert(Boolean(res.data.order.dispatchTime), 'dispatchTime timestamp recorded');
    assert(res.data.masterOrderStatus === 'PARTIALLY_DELIVERED', 'Parent master order aggregated status is PARTIALLY_DELIVERED');

    // Wait 150ms to ensure positive transit duration delta
    await sleep(150);

    // Step 4: Transition DISPATCHED -> DELIVERED & Transit Duration Calculation
    res = await request({
      path: `/api/orders/${subOrdId}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'DELIVERED',
      paymentStatus: 'PAID'
    });
    assert(res.status === 200, 'Transition to DELIVERED returns 200 OK');
    assert(res.data.order.status === 'DELIVERED', 'Sub-order status updated to DELIVERED');
    assert(Boolean(res.data.order.deliveryTime), 'deliveryTime timestamp recorded');
    assert(typeof res.data.order.transitDurationMinutes === 'number' && res.data.order.transitDurationMinutes >= 1,
      `transitDurationMinutes computed as positive integer (got: ${res.data.order.transitDurationMinutes} min)`);
    assert(res.data.order.paymentStatus === 'PAID', 'paymentStatus updated to PAID');
    assert(res.data.masterOrderStatus === 'COMPLETED', 'Parent master order aggregated status transitioned to COMPLETED');

    // 3.6 Transit Duration Fallback when dispatchTime is absent
    res = await request({
      path: '/api/orders/checkout',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      retailerId: 'ret_gupta_kirana',
      paymentMode: 'CASH_ON_DELIVERY',
      paymentTerm: 'COD',
      items: [
        {
          productSkuId: 'sku_limca_crate',
          quantity: 3
        }
      ]
    });
    assert(res.status === 200 && res.data.order, 'Created second test order for fallback transit test');
    const directDelivSubOrdId = res.data.order.subOrders[0].id;
    res = await request({
      path: `/api/orders/${directDelivSubOrdId}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'DELIVERED'
    });
    assert(res.status === 200, 'Direct DELIVERED transition without DISPATCHED succeeds');
    assert(res.data.order.transitDurationMinutes === 15, `Transit duration defaults to 15 mins fallback when dispatchTime missing (got: ${res.data.order.transitDurationMinutes})`);

    // 3.7 PATCH Invalid Order ID returns 404
    res = await request({
      path: '/api/orders/ord_ghost_invalid_999',
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, { status: 'CANCELLED' });
    assert(res.status === 404 && res.data.success === false, 'PATCH /api/orders/:invalidId returns 404 Not Found');

    // 3.8 PATCH Master Order directly
    res = await request({
      path: `/api/orders/${freshMasterOrder.id}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, {
      paymentStatus: 'PAID'
    });
    assert(res.status === 200, 'PATCH master order directly returns 200 OK');
    assert(res.data.order.paymentStatus === 'PAID', 'Master order paymentStatus updated to PAID');

    console.log('\n================================================================');
    console.log(`  CHALLENGER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled error during test execution:', err);
    process.exit(1);
  } finally {
    serverProcess.kill('SIGTERM');
  }
}

runChallengerSuite();
