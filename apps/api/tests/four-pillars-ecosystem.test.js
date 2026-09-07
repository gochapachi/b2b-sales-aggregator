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

describe('Four Pillars B2B & Retail Ecosystem Test Suite', () => {
  // =========================================================================
  // PILLAR 1: RETAIL KIRANA POS SYSTEM
  // =========================================================================
  describe('Pillar 1: Retail Kirana POS System', () => {
    test('GET /api/pos/products returns seeded Kirana inventory', async () => {
      const res = await fetch(`${BASE_URL}/api/pos/products?retailerId=ret_gupta_kirana`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.products.length >= 4);
      const parleG = data.products.find((p) => p.name.includes('Parle-G'));
      assert.ok(parleG, 'Parle-G should exist in retail POS stock');
      assert.strictEqual(parleG.sellingPrice, 10);
      assert.ok(parleG.marginPct > 0);
    });

    test('POST /api/pos/products manually adds a new Kirana retail SKU', async () => {
      const res = await fetch(`${BASE_URL}/api/pos/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          name: 'Maggi 2-Minute Noodles 70g',
          brand: 'Nestle',
          category: 'Instant Noodles & Pasta',
          uom: 'Packets',
          sellingPrice: 14,
          purchasePrice: 11.5,
          mrp: 14,
          stockQuantity: 48,
          reorderLevel: 12,
          hsnCode: '19023010',
          gstRatePct: 12,
          isVegetarian: true,
          ingredients: 'Wheat flour, Palm oil, Salt, Mineral, Spices'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.product.id);
      assert.strictEqual(data.product.sellingPrice, 14);
      assert.strictEqual(data.product.currentStock, 48);
      assert.ok(data.product.marginPct > 0);
    });

    test('POST /api/pos/inward-from-delivery auto-inwards B2B goods into POS stock', async () => {
      const res = await fetch(`${BASE_URL}/api/pos/inward-from-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subOrderId: 'subord_001' })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.inwardedProducts.length >= 1);
      assert.ok(data.inwardedProducts[0].costPrice > 0);
      assert.strictEqual(data.inwardedProducts[0].marginPct, 18);
    });

    test('POST /api/pos/checkout processes CASH counter bill with stock deduction', async () => {
      // Get initial stock of Parle-G
      const prodRes = await fetch(`${BASE_URL}/api/pos/products?retailerId=ret_gupta_kirana`);
      const prodData = await prodRes.json();
      const itemToBuy = prodData.products[0];
      const initialStock = itemToBuy.currentStock;

      const checkoutRes = await fetch(`${BASE_URL}/api/pos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          customerName: 'Anil Kumar',
          customerPhone: '9876500001',
          paymentMode: 'CASH',
          cashAmount: 50,
          items: [{ productId: itemToBuy.id, quantity: 2 }]
        })
      });
      assert.strictEqual(checkoutRes.status, 200);
      const checkoutData = await checkoutRes.json();
      assert.strictEqual(checkoutData.success, true);
      assert.ok(checkoutData.bill.billNumber.startsWith('BILL-2026-'));
      assert.strictEqual(checkoutData.bill.paymentMode, 'CASH');
      assert.strictEqual(checkoutData.bill.items[0].quantity, 2);

      // Verify stock was deducted
      const verifyProdRes = await fetch(`${BASE_URL}/api/pos/products?retailerId=ret_gupta_kirana`);
      const verifyProdData = await verifyProdRes.json();
      const updatedItem = verifyProdData.products.find((p) => p.id === itemToBuy.id);
      assert.strictEqual(updatedItem.currentStock, initialStock - 2);
    });

    test('POST /api/pos/checkout processes KHATA credit bill and updates customer ledger', async () => {
      const checkoutRes = await fetch(`${BASE_URL}/api/pos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          customerName: 'Ramesh Verma',
          customerPhone: '9876543210',
          paymentMode: 'KHATA',
          items: [{ productId: 'pos_pg_80g', quantity: 5 }]
        })
      });
      assert.strictEqual(checkoutRes.status, 200);
      const checkoutData = await checkoutRes.json();
      assert.strictEqual(checkoutData.success, true);
      assert.strictEqual(checkoutData.bill.paymentMode, 'KHATA');
      assert.ok(checkoutData.bill.grandTotal > 0);

      // Check POS financials to verify Khata outstanding updated
      const finRes = await fetch(`${BASE_URL}/api/pos/financials?retailerId=ret_gupta_kirana`);
      const finData = await finRes.json();
      assert.strictEqual(finData.success, true);
      assert.ok(finData.financials.totalKhataOutstanding > 0);
    });

    test('POST /api/pos/daily-register reconciles day-end drawer cash and discrepancy', async () => {
      const res = await fetch(`${BASE_URL}/api/pos/daily-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          closingCashActual: 1850,
          notes: 'Counted 1850 in drawer at 10 PM close'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.register.status, 'CLOSED');
      assert.strictEqual(data.register.closingCashActual, 1850);
      assert.notStrictEqual(data.register.discrepancy, undefined);
    });

    test('GET /api/pos/financials returns comprehensive Kirana store KPIs', async () => {
      const res = await fetch(`${BASE_URL}/api/pos/financials?retailerId=ret_gupta_kirana`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      const { financials } = data;
      assert.ok(financials.totalSkusCount >= 4);
      assert.ok(financials.inventoryStockValue > 0);
      assert.ok(financials.inventoryRetailValue > financials.inventoryStockValue);
      assert.ok(financials.estimatedGrossMarginPct > 0);
    });
  });

  // =========================================================================
  // PILLAR 3: SFA SHARE-OF-SHELF (SOS) AUDIT
  // =========================================================================
  describe('Pillar 3: SFA Share-of-Shelf (SOS) In-Store Audits', () => {
    test('POST /api/sfa/shelf-audit records FMCG shelf facing audit', async () => {
      const res = await fetch(`${BASE_URL}/api/sfa/shelf-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId: 'ret_gupta_kirana',
          retailerShopName: 'Gupta Kirana & General Store',
          category: 'Biscuits & Bakery',
          brandName: 'Parle',
          totalShelfWidthCm: 200,
          brandFacingWidthCm: 80,
          facingUnits: 16,
          competitorBrandName: 'Britannia',
          competitorFacingsCount: 12,
          eyeLevelFacing: true,
          notes: 'Parle-G and Monaco on eye-level shelf 2'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.audit.shelfSharePct, 40); // 80 / 200 = 40%
      assert.ok(data.audit.photoUrl);
    });

    test('GET /api/sfa/shelf-audit/:retailerId retrieves historical audits', async () => {
      const res = await fetch(`${BASE_URL}/api/sfa/shelf-audit/ret_gupta_kirana`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.audits.length >= 1);
      assert.strictEqual(data.audits[0].retailerId, 'ret_gupta_kirana');
    });
  });

  // =========================================================================
  // PILLAR 4: SUPER ADMIN PLATFORM ANALYTICS ENGINE
  // =========================================================================
  describe('Pillar 4: Platform Owner & Super Admin Analytics Engine', () => {
    test('GET /api/admin/analytics/overview returns real-time GMV and platform telemetry', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/analytics/overview`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      const { overview } = data;
      assert.ok(overview.totalGmv > 0);
      assert.ok(overview.totalOrdersCount > 0);
      assert.ok(overview.totalRetailersCount >= 3);
      assert.ok(overview.totalWholesalersCount >= 2);
      assert.ok(overview.wholesalerMonthlySavingsRupees >= 10000);
      assert.ok(overview.riskDistribution.lowRiskPct > 0);
    });

    test('GET /api/admin/analytics/heatmaps returns hyperlocal ward density metrics', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/analytics/heatmaps`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.zones.length >= 3);
      const zone1 = data.zones[0];
      assert.ok(zone1.wardName);
      assert.ok(zone1.activeKiranasCount > 0);
      assert.ok(zone1.latitude && zone1.longitude);
      assert.ok(zone1.monthlyGmvRupees > 0);
    });

    test('GET /api/admin/analytics/brand-share returns FMCG volume and market share breakdown', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/analytics/brand-share`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.brandShares.length >= 4);
      const parle = data.brandShares.find((b) => b.brandName === 'Parle');
      assert.ok(parle);
      assert.ok(parle.marketSharePct > 0);
      assert.ok(parle.unitsSold > 0);
    });

    test('GET /api/admin/analytics/cohort-retention returns 12-month Kirana cohort retention matrix', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/analytics/cohort-retention`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.cohorts.length >= 4);
      assert.strictEqual(data.cohorts[0].m1RetentionPct, 92);
    });

    test('GET /api/admin/analytics/credit-npa returns systemic 45+ day NPA credit radar', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/analytics/credit-npa`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.npaSummary);
      assert.notStrictEqual(data.npaSummary.totalOverdueCapital, undefined);
      assert.notStrictEqual(data.npaSummary.totalNpaCapital, undefined);
      assert.ok(['LOW', 'MODERATE', 'HIGH'].includes(data.npaSummary.systemicRiskLevel));
      assert.ok(Array.isArray(data.highRiskRetailers));
    });
  });
});
