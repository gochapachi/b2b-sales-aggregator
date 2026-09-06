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
  } catch (err) {
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

describe('Udaan B2B Marketplace & Field Agent CRM Test Suite', () => {
  let testSubOrderId = '';

  // 1. Udaan Catalog Brands & Categories
  describe('1. Udaan Brand Stores & Category Taxonomy', () => {
    test('GET /api/catalog/brands returns curated FMCG brand stores', async () => {
      const res = await fetch(`${BASE_URL}/api/catalog/brands`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.brands));
      assert.ok(data.brands.length >= 3);
      const brandNames = data.brands.map((b) => b.brand);
      assert.ok(brandNames.includes('Parle'));
      assert.ok(brandNames.includes('Coca-Cola / Limca'));
    });

    test('GET /api/catalog/categories returns multi-level FMCG categories', async () => {
      const res = await fetch(`${BASE_URL}/api/catalog/categories`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.categories));
      const categoryNames = data.categories.map((c) => c.name);
      assert.ok(categoryNames.includes('Biscuits & Confectionery'));
      assert.ok(categoryNames.includes('Cold Drinks & Beverages'));
    });

    test('GET /api/catalog exposes volume pricing slabs and margins for verified retailers', async () => {
      const res = await fetch(`${BASE_URL}/api/catalog?role=RETAILER&retailerId=ret_gupta_kirana`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.isPriceUnlocked, true);
      const parleProd = data.products.find((p) => p.brand === 'Parle');
      assert.ok(parleProd);
      assert.ok(parleProd.marginPct > 0);
      const sku = parleProd.skus[0];
      assert.ok(Array.isArray(sku.pricingSlabs));
      assert.ok(sku.pricingSlabs.length >= 2);
    });
  });

  // 2. Volume Pricing Slabs & B2B Credit Checkout
  describe('2. Volume Pricing Slabs & Net-7 Credit Terms Checkout', () => {
    test('Checkout automatically applies volume discount slab for high-quantity bulk order', async () => {
      // 10 cartons of Parle-G qualifies for 10+ slab @ ₹540 instead of base ₹580
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          placedByAgentId: 'usr_agent_1',
          paymentTerm: 'NET_7',
          items: [
            {
              productSkuId: 'sku_parle_carton',
              quantity: 10
            }
          ]
        })
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.order.subOrders.length >= 1);
      const subOrder = data.order.subOrders[0];
      testSubOrderId = subOrder.id;

      // Check applied slab unit price is ₹540
      const item = subOrder.items[0];
      assert.strictEqual(item.unitPrice, 540);
      assert.strictEqual(item.appliedSlabMinQty, 10);
      assert.strictEqual(subOrder.paymentTerm, 'NET_7');
      assert.ok(subOrder.creditDueDate);
    });

    test('GET /api/orders/invoice/:subOrderId returns compliant GST Tax Invoice', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/invoice/${testSubOrderId}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.invoice);
      assert.ok(data.invoice.invoiceNumber.startsWith('INV-2026-'));
      assert.ok(data.invoice.seller.gstin);
      assert.ok(data.invoice.buyer.shopName);
      assert.ok(data.invoice.cgstTotal > 0);
      assert.ok(data.invoice.sgstTotal > 0);
      assert.ok(data.invoice.qrCodeData.includes('upi://pay'));
    });
  });

  // 3. Field Sales Agent CRM System
  describe('3. Field Agent CRM Pipeline, Store 360 & Payments', () => {
    test('GET /api/crm/leads returns enriched retailer lead pipeline', async () => {
      const res = await fetch(`${BASE_URL}/api/crm/leads`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.leads));
      assert.ok(data.leads.length >= 3);
      const gupta = data.leads.find((l) => l.id === 'ret_gupta_kirana');
      assert.ok(gupta);
      assert.strictEqual(gupta.leadStage, 'ACTIVE_BUYER');
      assert.ok(gupta.creditLimit > 0);
    });

    test('POST /api/crm/leads onboards new retailer lead into PROSPECT stage', async () => {
      const res = await fetch(`${BASE_URL}/api/crm/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: 'Kalyan Daily Superstore',
          ownerName: 'Kalyan Singh',
          phone: '9876543210',
          address: 'Kapoorthala Chauraha, Aliganj',
          city: 'Lucknow',
          pincode: '226024'
        })
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.lead.leadStage, 'PROSPECT');
      assert.strictEqual(data.lead.shopName, 'Kalyan Daily Superstore');
    });

    test('GET /api/crm/retailer/:id returns 360° store history, notes, and payments', async () => {
      const res = await fetch(`${BASE_URL}/api/crm/retailer/ret_gupta_kirana`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.retailer);
      assert.ok(Array.isArray(data.orders));
      assert.ok(Array.isArray(data.notes));
      assert.ok(Array.isArray(data.payments));
    });

    test('POST /api/crm/payments/collect creates receipt voucher and reduces credit dues', async () => {
      const res = await fetch(`${BASE_URL}/api/crm/payments/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          amount: 5000,
          paymentMode: 'CASH',
          referenceNumber: 'CASH-REC-001',
          notes: 'Partial payment collected on field visit'
        })
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.collection.receiptVoucherNumber.startsWith('RCP-2026-'));
      assert.strictEqual(data.collection.amount, 5000);
    });

    test('GET /api/crm/agent/performance returns sales targets, strike rate, and cash in hand', async () => {
      const res = await fetch(`${BASE_URL}/api/crm/agent/performance`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.agentPerformance);
      assert.ok(data.agentPerformance.monthlyRevenueTarget > 0);
      assert.ok(data.agentPerformance.strikeRatePct >= 0);
      assert.ok(data.agentPerformance.dailyVisitsCompletedToday > 0);
      assert.ok(data.agentPerformance.cashInHand >= 5000);
    });
  });
});
