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
      throw new Error('Server failed to start within 10 seconds');
    }
  }
});

after(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

describe('Phase 2 Enterprise Expansion Test Suite (Worker M1)', () => {

  describe('1. Version Polling Engine (R3)', () => {
    test('GET /api/app/version returns version, build hash, timestamp, and apkDownloadUrl', async () => {
      const res = await fetch(`${BASE_URL}/api/app/version`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.version, '2.1.0');
      assert.ok(data.buildHash, 'buildHash must be present');
      assert.ok(data.timestamp, 'timestamp must be present');
      assert.ok(data.apkDownloadUrl.includes('.apk'), 'apkDownloadUrl must be valid');
    });
  });

  describe('2. Self-Service Retailer & Seller Signups with KYC Upload (R1)', () => {
    test('POST /api/kyc/upload uploads base64 document and returns MinIO documentUrl', async () => {
      const res = await fetch(`${BASE_URL}/api/kyc/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: Buffer.from('Test KYC Document PDF Content').toString('base64'),
          fileName: 'gst_certificate.pdf',
          mimeType: 'application/pdf',
          bucketType: 'DOCS'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.documentUrl.includes('minio'), 'documentUrl must point to MinIO');
    });

    test('POST /api/signup/retailer registers Kirana store in PENDING_APPROVAL status', async () => {
      const res = await fetch(`${BASE_URL}/api/signup/retailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: 'Kalyan Kirana Bhandar',
          ownerName: 'Kalyan Verma',
          phone: '9123456780',
          whatsappNumber: '9123456780',
          address: 'Gomti Nagar, Sector 4, Lucknow',
          latitude: 26.855000,
          longitude: 80.990000,
          documentType: 'GSTIN',
          documentNumber: '09AAACK1234P1Z1'
        })
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.status, 'PENDING_APPROVAL');
      assert.ok(data.retailerId);
    });

    test('POST /api/signup/retailer rejects duplicate phone with 409 Conflict', async () => {
      const res = await fetch(`${BASE_URL}/api/signup/retailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: 'Another Store',
          ownerName: 'Another Owner',
          phone: '9123456780',
          latitude: 26.890000,
          longitude: 80.990000
        })
      });
      assert.strictEqual(res.status, 409);
      const data = await res.json();
      assert.strictEqual(data.collisionType, 'PHONE_DUPLICATE');
    });

    test('POST /api/signup/retailer rejects location within 15m of existing store with 409 GPS_COLLISION_15M', async () => {
      // Ret Gupta Kirana is at 26.846700, 80.946200
      const res = await fetch(`${BASE_URL}/api/signup/retailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: 'Gupta Kirana Imposter',
          ownerName: 'Fake Owner',
          phone: '9111222333',
          latitude: 26.846701, // ~10cm away
          longitude: 80.946201
        })
      });
      assert.strictEqual(res.status, 409);
      const data = await res.json();
      assert.strictEqual(data.collisionType, 'GPS_COLLISION_15M');
      assert.ok(data.collidingStore);
    });

    test('POST /api/signup/seller registers distributor in PENDING_APPROVAL status', async () => {
      const res = await fetch(`${BASE_URL}/api/signup/seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Avadh Confectionery Distributors LLP',
          ownerName: 'Rohit Khanna',
          contactPhone: '9876543210',
          gstin: '09AAACR1234M1Z2',
          address: 'Plot 45, Nadarganj Industrial Area, Lucknow',
          latitude: 26.780000,
          longitude: 80.880000
        })
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.status, 'PENDING_APPROVAL');
      assert.ok(data.sellerId);
    });
  });

  describe('3. Super Admin KYC Review Desk & WhatsApp Credentials (R1)', () => {
    test('GET /api/kyc/pending returns queue with totalPending count', async () => {
      const res = await fetch(`${BASE_URL}/api/kyc/pending`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.pendingRetailers));
      assert.ok(Array.isArray(data.pendingSellers));
      assert.ok(data.totalPending >= 1);
    });

    test('POST /api/kyc/review with APPROVE generates secure credentials and updates status', async () => {
      const res = await fetch(`${BASE_URL}/api/kyc/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: 'ret_sharma_general',
          targetType: 'RETAILER',
          approved: true,
          reason: 'Verified municipal trade license'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.status, 'VERIFIED');
      assert.ok(data.credentials.loginId, 'Login ID must be returned');
      assert.ok(data.credentials.password, 'Password must be generated');
      assert.strictEqual(data.whatsAppNotificationDispatched, true);
    });
  });

  describe('4. Field Agent Assisted Onboarding & 15m Collision Rejection (R2)', () => {
    test('POST /api/onboarding creates retailer, provisions credentials, and dispatches WhatsApp alert', async () => {
      const res = await fetch(`${BASE_URL}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: 'Shri Ram Provision Store',
          ownerName: 'Ram Sevak',
          phone: '9833445566',
          whatsappNumber: '9833445566',
          address: 'Shop 12, Chowk Bazaar, Lucknow',
          latitude: 26.868000,
          longitude: 80.912000,
          agentId: 'usr_agent_1'
        })
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.credentials.loginId);
      assert.ok(data.credentials.temporaryPassword);
      assert.ok(data.retailer.id);
    });

    test('POST /api/onboarding rejects store within 15m radius with 409 GPS_COLLISION_15M', async () => {
      const res = await fetch(`${BASE_URL}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: 'Duplicate Nearby Store',
          ownerName: 'Other Person',
          phone: '9899001122',
          latitude: 26.868005, // <1m away from Shri Ram Provision Store
          longitude: 80.912005,
          agentId: 'usr_agent_2'
        })
      });
      assert.strictEqual(res.status, 409);
      const data = await res.json();
      assert.strictEqual(data.error, 'GPS_COLLISION_15M');
      assert.strictEqual(data.collisionType, 'GPS_COLLISION_15M');
      assert.ok(data.collidingStore);
    });

    test('POST /api/onboarding rejects duplicate phone number with 409 PHONE_DUPLICATE', async () => {
      const res = await fetch(`${BASE_URL}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: 'Far Away Store',
          ownerName: 'Test Owner',
          phone: '9833445566', // duplicate
          latitude: 26.950000,
          longitude: 80.850000
        })
      });
      assert.strictEqual(res.status, 409);
      const data = await res.json();
      assert.strictEqual(data.collisionType, 'PHONE_DUPLICATE');
    });
  });

  describe('5. Multi-Seller Master SKU Marketplace & Buy-Box Algorithm (R4)', () => {
    test('GET /api/marketplace/master-skus returns master catalog with competing listing counts', async () => {
      const res = await fetch(`${BASE_URL}/api/marketplace/master-skus`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.masterSkus));
      assert.ok(data.totalCount >= 3);
      const parleG = data.masterSkus.find((s) => s.id === 'msku_parle_g_80g');
      assert.ok(parleG);
      assert.ok(parleG.activeListingsCount >= 2, 'Should have multiple competing sellers');
    });

    test('GET /api/marketplace/buy-box/:masterSkuId evaluates Buy-Box winner and alternative sellers', async () => {
      const res = await fetch(`${BASE_URL}/api/marketplace/buy-box/msku_parle_g_80g?lat=26.85&lon=80.94`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.masterSku);
      assert.ok(data.buyBoxWinner, 'Must designate Buy-Box winner');
      assert.strictEqual(data.buyBoxWinner.sellerId, 'org_anagata_fmcg');
      assert.ok(data.buyBoxWinner.totalScore > 0);
      assert.ok(Array.isArray(data.alternateSellers));
      assert.ok(data.alternateSellers.length >= 1);
    });

    test('POST /api/orders/sub-orders/:id/fallback-reroute reroutes order to secondary distributor upon SLA breach', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/sub-orders/subord_001/fallback-reroute`, {
        method: 'POST'
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.previousSellerId);
      assert.ok(data.newSellerId);
      assert.notStrictEqual(data.previousSellerId, data.newSellerId);
    });
  });

  describe('6. Automated Beat Builder & Territory Exclusivity Transfer (R6)', () => {
    test('POST /api/beats/auto-build clusters stores into optimized route with 2-opt spatial routing', async () => {
      const res = await fetch(`${BASE_URL}/api/beats/auto-build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          clusterSize: 15
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.beatId);
      assert.ok(Array.isArray(data.optimizedStops));
      assert.ok(data.totalStores >= 2);
    });

    test('POST /api/territory/transfer-store transfers store exclusivity and logs audit trail', async () => {
      const res = await fetch(`${BASE_URL}/api/territory/transfer-store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: 'ret_gupta_kirana',
          fromAgentId: 'usr_agent_1',
          toAgentId: 'usr_agent_new',
          reason: 'Quarterly beat route re-balancing'
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.transfer.retailerId, 'ret_gupta_kirana');
      assert.strictEqual(data.transfer.targetAgentId, 'usr_agent_new');
    });
  });

  describe('7. Universal ERP Bulk Importer & Column Mapper (R5)', () => {
    test('POST /api/erp/column-map/preview validates custom CSV mapping and flags errors', async () => {
      const res = await fetch(`${BASE_URL}/api/erp/column-map/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers: ['Item_Desc', 'Barcode', 'Rate_Wholesale', 'Max_Retail_Price', 'Qty_Available'],
          sampleRows: [
            ['Britannia Good Day Butter 100g', '8901063012345', 28.5, 35, 120],
            ['Invalid Price Biscuit', '8901063099999', 45, 40, 50] // Error: wholesalePrice > mrp
          ],
          columnMapping: {
            productName: 'Item_Desc',
            skuCode: 'Barcode',
            wholesalePrice: 'Rate_Wholesale',
            mrp: 'Max_Retail_Price',
            currentStock: 'Qty_Available'
          }
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.previewItems.length, 2);
      assert.strictEqual(data.previewItems[0].isValid, true);
      assert.strictEqual(data.previewItems[1].isValid, false);
      assert.ok(data.previewItems[1].validationErrors.includes('Wholesale price cannot exceed MRP'));
    });

    test('POST /api/erp/column-map/import commits mapped products into seller catalog', async () => {
      const res = await fetch(`${BASE_URL}/api/erp/column-map/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'org_anagata_fmcg',
          products: [
            {
              productName: 'Parle Monaco Classic Cheeslings 150g',
              skuCode: 'MON-CHEESE-150',
              mrp: 60,
              wholesalePrice: 48,
              currentStock: 80,
              category: 'Biscuits & Confectionery'
            }
          ]
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.importedCount, 1);
    });
  });

  describe('8. Super Admin Dispatch SLA & Fulfillment Radar (R7)', () => {
    test('GET /api/admin/dispatch-sla returns live TAT, OTD scorecards, and active dispatches', async () => {
      const res = await fetch(`${BASE_URL}/api/admin/dispatch-sla`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(typeof data.onTimeDeliveryPct === 'number');
      assert.ok(typeof data.averageTatMinutes === 'number');
      assert.ok(Array.isArray(data.sellerScorecards));
    });
  });

});
