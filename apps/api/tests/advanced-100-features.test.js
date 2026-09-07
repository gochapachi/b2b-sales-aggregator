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

describe('100 Advanced Enterprise Features Test Suite', () => {
  // 1. Warehouse, FEFO Batches & Carton Labels
  describe('1. Warehouse, FEFO Batches & Packing Desk', () => {
    test('GET /api/warehouse/batches returns registered product batches', async () => {
      const res = await fetch(`${BASE_URL}/api/warehouse/batches`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.batches.length >= 3);
      assert.ok(data.batches.some((b) => b.batchNumber === 'BN-2026-PG01'));
    });

    test('GET /api/warehouse/near-expiry detects batches expiring within 30 days', async () => {
      const res = await fetch(`${BASE_URL}/api/warehouse/near-expiry`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.batches.length >= 1);
      const nearExp = data.batches.find((b) => b.batchNumber === 'BN-2026-PG01');
      assert.ok(nearExp);
      assert.strictEqual(nearExp.status, 'NEAR_EXPIRY');
      assert.strictEqual(nearExp.nearExpiryDiscountPct, 20);
    });

    test('POST /api/warehouse/allocate-fefo allocates stock from earliest expiring batch', async () => {
      const res = await fetch(`${BASE_URL}/api/warehouse/allocate-fefo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skuId: 'sku_parle_g_carton',
          quantity: 10
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.allocation.requestedQuantity, 10);
      assert.strictEqual(data.allocation.allocatedQuantity, 10);
      assert.ok(data.allocation.allocations.length > 0);
      assert.strictEqual(data.allocation.allocations[0].batchNumber, 'BN-2026-PG01');
    });

    test('GET /api/warehouse/carton-label/:subOrderId generates 4x6 thermal shipping label', async () => {
      const res = await fetch(`${BASE_URL}/api/warehouse/carton-label/subord_001`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.labelData.qrPayload.includes('B2B-BOX'));
      assert.ok(data.labelData.grossWeightKg > 0);
    });

    test('GET /api/warehouse/master-po consolidates orders into bulk manufacturer PO', async () => {
      const res = await fetch(`${BASE_URL}/api/warehouse/master-po`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.items.length > 0);
      assert.ok(data.totalEstCost > 0);
    });
  });

  // 2. Returns & GST Credit Notes (Rule 53)
  describe('2. Returns, Damage Pickups & GST Credit Notes', () => {
    test('POST /api/returns/credit-notes issues GST Credit Note and adjusts ledger', async () => {
      const res = await fetch(`${BASE_URL}/api/returns/credit-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalInvoiceNumber: 'INV-2026-AUG001',
          originalInvoiceDate: '2026-08-20',
          retailerId: 'ret_gupta_kirana',
          organizationId: 'org_anagata_fmcg',
          reason: 'DAMAGED_IN_TRANSIT',
          items: [
            {
              skuId: 'sku_parle_g_carton',
              productName: 'Parle-G Glucose Biscuits (80g)',
              hsnCode: '19053100',
              quantity: 2,
              ratePerUnit: 580,
              gstRatePct: 5
            }
          ]
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.creditNote.creditNoteNumber.startsWith('CN-2026-'));
      assert.strictEqual(data.creditNote.grandTotal, 1218); // 1160 + 58 tax
    });
  });

  // 3. Logistics, Trip Run Sheets & Van Sales
  describe('3. Logistics, Trip Run Sheets & Van Sales', () => {
    let runSheetId = '';

    test('POST /api/logistics/run-sheets creates loading manifest with gross weight check', async () => {
      const res = await fetch(`${BASE_URL}/api/logistics/run-sheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'org_anagata_fmcg',
          driverName: 'Ram Kishan',
          driverPhone: '9811223344',
          vehicleNumber: 'UP-32-BZ-9021 (Tata Ace)',
          subOrderIds: ['subord_001']
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.runSheet.maxGrossWeightKg === 1000);
      assert.ok(data.runSheet.totalGrossWeightKg > 0);
      runSheetId = data.runSheet.id;
    });

    test('POST /api/logistics/run-sheets/:id/handover reconciles driver COD cash', async () => {
      const res = await fetch(`${BASE_URL}/api/logistics/run-sheets/${runSheetId}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualCashCollected: 14200
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.runSheet.status, 'COMPLETED');
    });

    test('POST /api/logistics/van-sales/order books instant spot bill deducting van stock', async () => {
      const res = await fetch(`${BASE_URL}/api/logistics/van-sales/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skuId: 'sku_parle_g_carton',
          quantity: 2,
          amountPaid: 1160
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.remainingStock >= 0);
    });
  });

  // 4. Trade Schemes BOGO & Loyalty Points
  describe('4. Trade Schemes, BOGO & Loyalty Engine', () => {
    test('POST /api/schemes/evaluate applies Buy 10 Get 1 Free trade scheme', async () => {
      const res = await fetch(`${BASE_URL}/api/schemes/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'org_anagata_fmcg',
          cartItems: [{ skuId: 'sku_parle_g_carton', quantity: 20, unitPrice: 580 }]
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.freeItems.length > 0);
      assert.strictEqual(data.freeItems[0].quantity, 2);
      assert.strictEqual(data.totalSavings, 1160);
    });

    test('GET /api/loyalty/:retailerId and POST /api/loyalty/redeem', async () => {
      const getRes = await fetch(`${BASE_URL}/api/loyalty/ret_gupta_kirana`);
      assert.strictEqual(getRes.status, 200);
      const getData = await getRes.json();
      assert.strictEqual(getData.success, true);
      assert.ok(getData.account.currentPoints > 0);

      const redeemRes = await fetch(`${BASE_URL}/api/loyalty/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          pointsToRedeem: 100
        })
      });
      assert.strictEqual(redeemRes.status, 200);
      const redeemData = await redeemRes.json();
      assert.strictEqual(redeemData.success, true);
      assert.strictEqual(redeemData.discountRupees, 50);
    });
  });

  // 5. Accounting, Tally Prime XML & Marg ERP Exports
  describe('5. Accounting, Tally XML & Marg ERP CSV Exports', () => {
    test('GET /api/accounting/tally-xml outputs valid Tally XML format', async () => {
      const res = await fetch(`${BASE_URL}/api/accounting/tally-xml?organizationId=org_anagata_fmcg`);
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('<ENVELOPE>'));
      assert.ok(text.includes('<VOUCHER VCHTYPE="Sales"'));
      assert.ok(text.includes('<PARTYLEDGERNAME>Anagata FMCG Wholesale</PARTYLEDGERNAME>'));
    });

    test('GET /api/accounting/marg-csv outputs formatted CSV', async () => {
      const res = await fetch(`${BASE_URL}/api/accounting/marg-csv?organizationId=org_anagata_fmcg`);
      assert.strictEqual(res.status, 200);
      const csv = await res.text();
      assert.ok(csv.includes('Invoice_No,Invoice_Date,Retailer_Name,GSTIN'));
      assert.ok(csv.includes('Gupta Kirana'));
    });

    test('GET /api/accounting/aging-analysis returns bucketed debt report', async () => {
      const res = await fetch(`${BASE_URL}/api/accounting/aging-analysis?organizationId=org_anagata_fmcg`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.aging.totalOutstanding >= 0);
      assert.ok('bracket_0_30' in data.aging);
      assert.ok('bracket_31_60' in data.aging);
    });

    test('POST /api/accounting/pdc-cheques records cheque into vault', async () => {
      const res = await fetch(`${BASE_URL}/api/accounting/pdc-cheques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chequeNumber: 'CHQ-ICIC-992211',
          bankName: 'ICICI Bank',
          retailerId: 'ret_gupta_kirana',
          organizationId: 'org_anagata_fmcg',
          amount: 18000,
          chequeDate: '2026-09-25',
          notes: 'September credit clearance PDC'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.cheque.status, 'RECEIVED');
    });
  });

  // 6. Retailer Khata, Reorder Predictor & TSP Route Optimizer
  describe('6. Retailer Khata, Reorder Predictor & TSP Optimizer', () => {
    test('POST /api/retailer/khata/entry updates Kirana customer credit book', async () => {
      const res = await fetch(`${BASE_URL}/api/retailer/khata/entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          customerName: 'Mohan Lal (Tailor)',
          customerPhone: '9844001122',
          type: 'CREDIT_GIVEN',
          amount: 500,
          notes: 'Groceries on credit'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.khata.totalDues, 500);
    });

    test('GET /api/sfa/tsp-optimize/:beatId minimizes beat route travel distance', async () => {
      const res = await fetch(`${BASE_URL}/api/sfa/tsp-optimize/beat_hazratganj_mon`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.orderedStops.length > 0);
      assert.ok(data.optimizedKm <= data.originalKm);
    });

    test('GET /api/admin/telemetry returns server CPU, RAM & store health', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/telemetry`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.telemetry.databaseStatus, 'CONNECTED');
      assert.ok(data.telemetry.memoryUsageMb.heapUsed > 0);
    });
  });
});
