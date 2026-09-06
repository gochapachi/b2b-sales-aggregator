const { test, describe } = require('node:test');
const assert = require('node:assert');

const BASE_URL = process.env.API_TEST_URL || 'http://127.0.0.1:4000';

describe('Adversarial Multi-Vendor Cart MOQ/MOV Challenge Suite', () => {
  const retailerId = 'ret_gupta_kirana';

  // =========================================================================
  // 1. Quantity & MOQ Permutations
  // =========================================================================
  describe('1. Quantity & MOQ Boundaries', () => {
    test('Zero quantity is strictly rejected with HTTP 400', async () => {
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

    test('Negative quantity (-1) is strictly rejected with HTTP 400', async () => {
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

    test('Sub-MOQ quantity (1 of 2 required for Parle-G) is rejected with HTTP 400', async () => {
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
      assert.ok(data.error.includes('2 units'));
    });

    test('Sub-MOQ quantity (1 of 2 required for Limca crate) is rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [{ productSkuId: 'sku_limca_crate', quantity: 1 }]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order quantity'));
    });

    test('Fractional sub-MOQ quantity (0.5 for Tata Tea MOQ 1) is rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [{ productSkuId: 'sku_tata_tea_box', quantity: 0.5 }]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order quantity'));
    });
  });

  // =========================================================================
  // 2. Multi-Seller MOV Permutations
  // =========================================================================
  describe('2. Multi-Seller MOV Isolation & Cross-Vendor Validation', () => {
    // Seller 1: Anagata FMCG (MOV ₹1500)
    // 2x Parle-G @ ₹580 + 18% GST = ₹1368.80 (< ₹1500)
    // 3x Parle-G @ ₹580 + 18% GST = ₹2053.20 (> ₹1500)
    //
    // Seller 2: Awadh Beverages (MOV ₹2000)
    // 2x Limca @ ₹740 + 28% GST = ₹1894.40 (< ₹2000)
    // 3x Limca @ ₹740 + 28% GST = ₹2841.60 (> ₹2000)

    test('Permutation A: Seller 1 below MOV, Seller 2 below MOV -> Rejected with HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 2 }, // ₹1368.80 < ₹1500
            { productSkuId: 'sku_limca_crate', quantity: 2 }    // ₹1894.40 < ₹2000
          ]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order value'));
    });

    test('Permutation B: Seller 1 passes MOV, Seller 2 below MOV -> Rejected with HTTP 400 identifying Seller 2', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 3 }, // ₹2053.20 > ₹1500 (PASS)
            { productSkuId: 'sku_limca_crate', quantity: 2 }    // ₹1894.40 < ₹2000 (FAIL)
          ]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order value'));
      assert.ok(data.error.includes('Awadh Beverages'));
      assert.ok(data.error.includes('2000'));
    });

    test('Permutation C: Seller 1 below MOV, Seller 2 passes MOV -> Rejected with HTTP 400 identifying Seller 1', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 2 }, // ₹1368.80 < ₹1500 (FAIL)
            { productSkuId: 'sku_limca_crate', quantity: 3 }    // ₹2841.60 > ₹2000 (PASS)
          ]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('Minimum order value'));
      assert.ok(data.error.includes('Anagata FMCG'));
      assert.ok(data.error.includes('1500'));
    });

    test('Permutation D: Both sellers satisfy MOV -> Splits into exactly 2 independent vendor sub-orders', async () => {
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

      // OTPs must be unique between sub-orders
      assert.notStrictEqual(so1.deliveryOtp, so2.deliveryOtp, 'Delivery OTPs should be distinct between vendors');

      // Grand totals must match calculations
      assert.strictEqual(so1.grandTotal, 2053.2);
      assert.strictEqual(so2.grandTotal, 2841.6);
      assert.strictEqual(data.order.totalAmount, 2053.2 + 2841.6);
    });
  });

  // =========================================================================
  // 3. Payload & Catalog Edge Cases
  // =========================================================================
  describe('3. Payload & Catalog Edge Cases', () => {
    test('Non-existent product SKU returns HTTP 400', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [{ productSkuId: 'sku_ghost_nonexistent', quantity: 10 }]
        })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.ok(data.error.includes('not found in catalog'));
    });

    test('Non-existent retailer returns HTTP 404', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_phantom_shop',
          items: [{ productSkuId: 'sku_parle_carton', quantity: 2 }]
        })
      });
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.strictEqual(data.error, 'Retailer not found');
    });

    test('Empty items array is evaluated (behavior observation)', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: []
        })
      });
      // Document what the server returns
      const data = await res.json();
      console.log('Empty items array result -> status:', res.status, 'body:', JSON.stringify(data));
      // Even if currently 200 or 400, record empirical observation
    });

    test('Non-numeric quantity ("five") handling', async () => {
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId,
          items: [{ productSkuId: 'sku_parle_carton', quantity: 'five' }]
        })
      });
      const data = await res.json();
      console.log('Non-numeric quantity ("five") result -> status:', res.status, 'body:', JSON.stringify(data));
    });
  });
});
