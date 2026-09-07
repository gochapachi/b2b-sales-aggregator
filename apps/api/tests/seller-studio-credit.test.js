const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

const BASE_URL = process.env.API_TEST_URL || 'http://127.0.0.1:4000';
let serverProcess = null;

async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.ok) {
      const data = await res.json();
      return data.status === 'ok';
    }
  } catch {
    return false;
  }
  return false;
}

before(async () => {
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    const serverPath = path.resolve(__dirname, '../dist/server.js');
    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, PORT: '4000' },
      stdio: 'ignore'
    });

    const startTime = Date.now();
    while (Date.now() - startTime < 10000) {
      if (await checkHealth()) break;
      await new Promise((r) => setTimeout(r, 250));
    }

    const healthyNow = await checkHealth();
    if (!healthyNow) {
      if (serverProcess) serverProcess.kill();
      throw new Error(`Failed to start API server at ${BASE_URL}`);
    }
  }
});

after(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

describe('Seller Merchandising Studio, Decentralized Credit Lines & Payment Ledger Suite', () => {
  let createdProductId = '';
  let createdCreditLineId = '';
  let subOrderIdForEWay = '';

  // 1. Seller Merchandising & Product Studio
  describe('1. Seller Merchandising & Grouped Product Studio', () => {
    test('GET /api/seller/products retrieves products filtered by seller organization', async () => {
      const res = await fetch(`${BASE_URL}/api/seller/products?organizationId=org_anagata_fmcg`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.products));
      assert.ok(data.products.length > 0);
    });

    test('POST /api/seller/products creates new SKU with volume pricing slabs and packaging multipliers', async () => {
      const payload = {
        organizationId: 'org_anagata_fmcg',
        name: 'Haldiram Nagpur Aloo Bhujia (400g)',
        category: 'Snacks & Confectionery',
        brand: 'Haldiram',
        description: 'Crispy seasoned potato mint sticks in airtight nitrogen-flushed pouch.',
        hsnCode: '21069099',
        gstRatePct: 12,
        marginPct: 21.5,
        skus: [
          {
            skuCode: 'HALDIRAM-ALOO-400G-CTN-30',
            unitTitle: 'Master Carton (30 pouches)',
            unitMultiplier: 30,
            packMultiplier: 6,
            cartonMultiplier: 30,
            mrp: 3600,
            wholesalePrice: 2880,
            minimumOrderQuantity: 1,
            stockQuantity: 100,
            pricingSlabs: [
              { minQuantity: 1, maxQuantity: 2, pricePerUnit: 2880, discountPct: 20, label: '1 - 2 Cartons' },
              { minQuantity: 3, pricePerUnit: 2750, discountPct: 23.6, label: '3+ Cartons Bulk Wholesale' }
            ]
          }
        ]
      };

      const res = await fetch(`${BASE_URL}/api/seller/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.product.id);
      assert.strictEqual(data.product.skus[0].packMultiplier, 6);
      createdProductId = data.product.id;
    });

    test('PUT /api/seller/products/:id updates product attributes and pricing slabs', async () => {
      const res = await fetch(`${BASE_URL}/api/seller/products/${createdProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Updated description with premium festive packaging promotion.'
        })
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.product.description, 'Updated description with premium festive packaging promotion.');
    });
  });

  // 2. Decentralized Seller-Specific Retailer Credit Lines
  describe('2. Decentralized Seller Credit Lines & Credit Hold Validation', () => {
    test('GET /api/seller/credit-lines lists credit lines defined by seller', async () => {
      const res = await fetch(`${BASE_URL}/api/seller/credit-lines?organizationId=org_anagata_fmcg`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.creditLines));
      const guptaLine = data.creditLines.find((c) => c.retailerId === 'ret_gupta_kirana');
      assert.ok(guptaLine);
      assert.strictEqual(guptaLine.paymentTerm, 'NET_7');
      assert.strictEqual(guptaLine.creditLimit, 60000);
      createdCreditLineId = guptaLine.id;
    });

    test('POST /api/seller/credit-lines configures custom limit & Net-30 term for retailer', async () => {
      const res = await fetch(`${BASE_URL}/api/seller/credit-lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'org_anagata_fmcg',
          retailerId: 'ret_maurya_traders',
          creditLimit: 45000,
          paymentTerm: 'NET_30',
          creditGraceDays: 5,
          notes: 'Credit line granted after verification of physical store and GSTIN.'
        })
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.creditLine.creditLimit, 45000);
      assert.strictEqual(data.creditLine.paymentTerm, 'NET_30');
      assert.strictEqual(data.creditLine.status, 'ACTIVE');
    });

    test('POST /api/seller/credit-lines/:id/hold toggles Credit Hold on retailer', async () => {
      const res = await fetch(`${BASE_URL}/api/seller/credit-lines/${createdCreditLineId}/hold`, {
        method: 'POST'
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.creditLine.status, 'CREDIT_HOLD');

      // Attempting to place credit order when seller has credit hold must be rejected
      const orderRes = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          paymentTerm: 'NET_7',
          items: [{ productSkuId: 'sku_parle_carton', quantity: 3 }]
        })
      });

      assert.strictEqual(orderRes.status, 400);
      const orderData = await orderRes.json();
      assert.ok(orderData.error.includes('Credit hold is active'));

      // Release the credit hold
      const releaseRes = await fetch(`${BASE_URL}/api/seller/credit-lines/${createdCreditLineId}/hold`, {
        method: 'POST'
      });
      assert.strictEqual(releaseRes.status, 200);
      const releaseData = await releaseRes.json();
      assert.strictEqual(releaseData.creditLine.status, 'ACTIVE');
    });
  });

  // 3. Grouped Combo Bundle & Atomic Child SKU Stock Deduction
  describe('3. Grouped Combo Bundle & Atomic Child Stock Deduction', () => {
    test('Ordering combo bundle atomically deducts stock from underlying child SKUs', async () => {
      // Fetch initial catalog to record stock of Parle-G, Tata Tea, and Good Day
      const initialCatRes = await fetch(`${BASE_URL}/api/catalog`);
      const initialCat = await initialCatRes.json();
      const parleBefore = initialCat.products.find((p) => p.id === 'prod_parleg').skus[0].stockQuantity;
      const teaBefore = initialCat.products.find((p) => p.id === 'prod_tata_tea').skus[0].stockQuantity;
      const gooddayBefore = initialCat.products.find((p) => p.id === 'prod_britannia_goodday').skus[0].stockQuantity;

      // Order 2 units of Diwali Combo Bundle
      // Each combo contains: 2 Parle-G cartons, 1 Tata Tea bundle, 1 Good Day carton
      const checkoutRes = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          paymentTerm: 'NET_7',
          items: [{ productSkuId: 'sku_diwali_combo', quantity: 2 }]
        })
      });

      assert.strictEqual(checkoutRes.status, 200);
      const checkoutData = await checkoutRes.json();
      assert.strictEqual(checkoutData.success, true);
      subOrderIdForEWay = checkoutData.order.subOrders[0].id;

      // Fetch updated catalog and verify atomic deductions
      const afterCatRes = await fetch(`${BASE_URL}/api/catalog`);
      const afterCat = await afterCatRes.json();
      const parleAfter = afterCat.products.find((p) => p.id === 'prod_parleg').skus[0].stockQuantity;
      const teaAfter = afterCat.products.find((p) => p.id === 'prod_tata_tea').skus[0].stockQuantity;
      const gooddayAfter = afterCat.products.find((p) => p.id === 'prod_britannia_goodday').skus[0].stockQuantity;

      // 2 combos ordered => 4 Parle-G deducted, 2 Tata Tea deducted, 2 Good Day deducted
      assert.strictEqual(parleAfter, parleBefore - 4);
      assert.strictEqual(teaAfter, teaBefore - 2);
      assert.strictEqual(gooddayAfter, gooddayBefore - 2);
    });
  });

  // 4. Manual Payment Tracking & Dual-Sided Running Ledger
  describe('4. Pure Payment Tracking & Dual-Sided Running Ledger (Zero Gateway)', () => {
    test('POST /api/payments/record-voucher records manual payment and credits seller-retailer ledger', async () => {
      const voucherPayload = {
        retailerId: 'ret_gupta_kirana',
        organizationId: 'org_anagata_fmcg',
        amount: 8000,
        paymentMode: 'CHEQUE',
        referenceNumber: 'CHQ-SBI-772184',
        bankName: 'State Bank of India',
        chequeDate: '2026-09-07',
        notes: 'SBI Account Payee Cheque handed over during morning beat visit.',
        agentId: 'usr_agent_1',
        agentName: 'Rahul Sharma'
      };

      const res = await fetch(`${BASE_URL}/api/payments/record-voucher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherPayload)
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.voucher.voucherNumber.startsWith('VCH-'));
      assert.strictEqual(data.voucher.amount, 8000);
      assert.strictEqual(data.voucher.paymentMode, 'CHEQUE');
    });

    test('GET /api/ledger/statement returns full reconciliation statement with invoices and payments', async () => {
      const res = await fetch(
        `${BASE_URL}/api/ledger/statement?organizationId=org_anagata_fmcg&retailerId=ret_gupta_kirana`
      );
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      const stmt = data.statement;
      assert.strictEqual(stmt.retailerShopName, 'Gupta Kirana & General Store');
      assert.ok(stmt.totalInvoiced > 0);
      assert.ok(stmt.totalPaid > 0);
      assert.ok(Array.isArray(stmt.entries));
      assert.ok(stmt.entries.length >= 3);
      // Verify both INVOICE and PAYMENT_VOUCHER types exist
      const hasInvoice = stmt.entries.some((e) => e.type === 'INVOICE');
      const hasVoucher = stmt.entries.some((e) => e.type === 'PAYMENT_VOUCHER');
      assert.ok(hasInvoice, 'Statement should contain INVOICE debits');
      assert.ok(hasVoucher, 'Statement should contain PAYMENT_VOUCHER credits');
    });
  });

  // 5. Government NIC E-Way Bill Copy Payload & OpenStreetMap
  describe('5. Government NIC E-Way Bill Copy Payload & OpenStreetMap Routing', () => {
    test('GET /api/orders/eway-bill-payload/:subOrderId formats copy-paste ready NIC portal payload', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/eway-bill-payload/${subOrderIdForEWay}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.payload.docType, 'Tax Invoice');
      assert.strictEqual(data.payload.supplyType, 'Outward');
      assert.ok(data.payload.formattedCopyText.includes('GOVERNMENT OF INDIA E-WAY BILL SYSTEM'));
      assert.ok(data.payload.formattedCopyText.includes('PART A: CONSIGNOR'));
      assert.ok(data.payload.formattedCopyText.includes('PART B: TRANSPORTATION DETAILS'));
    });

    test('GET /api/geo/reverse returns OpenStreetMap location info without external API keys', async () => {
      const res = await fetch(`${BASE_URL}/api/geo/reverse?lat=26.8467&lng=80.9462`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.displayName);
      assert.ok(data.source.includes('OpenStreetMap'));
    });

    test('GET /api/geo/beat-route/:beatId returns waypoints for Leaflet map display', async () => {
      const res = await fetch(`${BASE_URL}/api/geo/beat-route/beat_hazratganj_mon`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.mapProvider, 'OpenStreetMap / Leaflet');
      assert.strictEqual(data.totalStops, 3);
      assert.ok(Array.isArray(data.waypoints));
      assert.strictEqual(data.waypoints.length, 3);
    });
  });
});
