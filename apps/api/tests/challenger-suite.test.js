const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');

const BASE_URL = process.env.API_TEST_URL || 'http://127.0.0.1:4000';

describe('EMPIRICAL CHALLENGER MASTER SUITE: Geofence Engine & Multi-Vendor Cart Stress Tests', () => {
  const storeLat = 26.8467;
  const storeLng = 80.9462;
  const retailerId = 'ret_gupta_kirana'; // Gupta Kirana, geofence radius 100m

  // =========================================================================
  // DOMAIN 1: GEOFENCE ENGINE ADVERSARIAL STRESS TESTS
  // =========================================================================
  describe('Domain 1: Geofence Engine Adversarial Boundaries & Coordinates', () => {
    test('Boundary 99.0m north must succeed with HTTP 200 OK', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 26.847590, // exactly 99.0m
          longitude: storeLng
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.visit.distanceMeters, 99);
      assert.strictEqual(data.visit.isWithinGeofence, true);
    });

    test('Boundary exactly 100.0m north must succeed with HTTP 200 OK', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 26.847599, // exactly 100.0m
          longitude: storeLng
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.visit.distanceMeters, 100);
      assert.strictEqual(data.visit.isWithinGeofence, true);
    });

    test('Boundary 100.1m north (0.1m over limit) must be strictly rejected with HTTP 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 26.847600, // 100.1m
          longitude: storeLng
        })
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.strictEqual(data.error, 'Geofence Check-in Failed');
      assert.strictEqual(data.distanceMeters, 100.1);
      assert.strictEqual(data.allowedRadiusMeters, 100);
    });

    test('Boundary 101.0m north (1.0m over limit) must be strictly rejected with HTTP 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 26.847608, // 101.0m
          longitude: storeLng
        })
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.strictEqual(data.error, 'Geofence Check-in Failed');
      assert.strictEqual(data.distanceMeters, 101);
      assert.strictEqual(data.allowedRadiusMeters, 100);
    });

    test('Zero distance (exact store coordinate 0.0m) must succeed with HTTP 200 OK', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: storeLat,
          longitude: storeLng
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.visit.distanceMeters, 0);
    });

    test('Negative hemisphere coordinates (-26.8467, -80.9462) rejected with HTTP 403', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: -26.8467,
          longitude: -80.9462
        })
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.ok(data.distanceMeters > 10000000);
    });

    test('Antipodal point (-26.8467, -99.0538) rejected with HTTP 403 without NaN crash', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: -26.8467,
          longitude: -99.0538
        })
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.ok(data.distanceMeters > 19000000);
    });

    test('Missing coordinates fail closed (do NOT return 200)', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon'
        })
      });
      assert.notStrictEqual(res.status, 200);
      assert.strictEqual(res.status, 403);
    });

    test('Non-numeric coordinates fail closed with HTTP 403', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 'not_a_latitude',
          longitude: 'not_a_longitude'
        })
      });
      assert.strictEqual(res.status, 403);
    });
  });

  // =========================================================================
  // DOMAIN 2: MULTI-VENDOR CART MOQ/MOV STRESS TESTS
  // =========================================================================
  describe('Domain 2: Multi-Vendor Cart MOQ/MOV Permutations & Vendor Isolation', () => {
    test('Zero quantity rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [{ productSkuId: 'sku_parle_carton', quantity: 0 }]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order quantity'));
    });

    test('Negative quantity (-1) rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [{ productSkuId: 'sku_parle_carton', quantity: -1 }]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order quantity'));
    });

    test('Sub-MOQ quantity (1 of 2 Parle-G cartons) rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [{ productSkuId: 'sku_parle_carton', quantity: 1 }]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order quantity'));
    });

    test('Cross-Vendor MOV Isolation - Permutation A: Both sellers below MOV -> Rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 2 }, // Anagata: ₹1368.80 < ₹1500
            { productSkuId: 'sku_limca_crate', quantity: 2 }    // Awadh: ₹1894.40 < ₹2000
          ]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order value'));
    });

    test('Cross-Vendor MOV Isolation - Permutation B: Seller 1 meets MOV, Seller 2 below MOV -> Rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 3 }, // Anagata: ₹2053.20 > ₹1500 (PASS)
            { productSkuId: 'sku_limca_crate', quantity: 2 }    // Awadh: ₹1894.40 < ₹2000 (FAIL)
          ]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order value'));
      assert.ok(data.error.includes('Awadh Beverages'));
      assert.ok(data.error.includes('2000'));
    });

    test('Cross-Vendor MOV Isolation - Permutation C: Seller 1 below MOV, Seller 2 meets MOV -> Rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 2 }, // Anagata: ₹1368.80 < ₹1500 (FAIL)
            { productSkuId: 'sku_limca_crate', quantity: 3 }    // Awadh: ₹2841.60 > ₹2000 (PASS)
          ]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order value'));
      assert.ok(data.error.includes('Anagata FMCG'));
      assert.ok(data.error.includes('1500'));
    });

    test('Cross-Vendor Splitting - Permutation D: Both sellers meet MOV -> Auto-splits into 2 sub-orders with distinct OTPs', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          placedByAgentId: 'usr_agent_1',
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 3 }, // Anagata: ₹2053.20
            { productSkuId: 'sku_limca_crate', quantity: 3 }    // Awadh: ₹2841.60
          ]
        })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.order.subOrders.length, 2);

      const so1 = data.order.subOrders.find(s => s.organizationId === 'org_anagata_fmcg');
      const so2 = data.order.subOrders.find(s => s.organizationId === 'org_awadh_beverages');

      assert.ok(so1, 'Sub-order for Anagata FMCG must exist');
      assert.ok(so2, 'Sub-order for Awadh Beverages must exist');

      assert.notStrictEqual(so1.deliveryOtp, so2.deliveryOtp, 'Delivery OTPs must be unique across vendors');
      assert.strictEqual(so1.grandTotal, 2053.2);
      assert.strictEqual(so2.grandTotal, 2841.6);
      assert.ok(Math.abs(data.order.totalAmount - 4894.8) < 0.001, `Expected ~4894.8, got ${data.order.totalAmount}`);
    });

    test('Non-existent SKU rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [{ productSkuId: 'sku_nonexistent_xyz', quantity: 10 }]
        })
      });
      assert.strictEqual(res.status, 400);
    });
  });
});
