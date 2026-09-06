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

    // Wait up to 10 seconds for server to come up
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

describe('Hyperlocal B2B Sales Aggregator - API Integration Suite', () => {
  // Shared state across checkout and delivery tests
  let createdSubOrders = [];

  // ===========================================================================
  // 1. Geofence Engine Verification (<100m vs >100m)
  // ===========================================================================
  describe('1. Geofence Engine (<100m Enforced, >100m Rejected)', () => {
    test('Distant check-in (>100m away) is strictly rejected with HTTP 403 Forbidden', async () => {
      // Gupta Kirana location: lat: 26.8467, lon: 80.9462, allowed geofence: 100m
      // Spoofed location: lat: 26.8550 (~923m away)
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId: 'ret_gupta_kirana',
          beatId: 'beat_hazratganj_mon',
          latitude: 26.8550,
          longitude: 80.9462
        })
      });

      assert.strictEqual(res.status, 403, 'Expected HTTP 403 Forbidden for out-of-bounds check-in');
      const data = await res.json();
      assert.strictEqual(data.error, 'Geofence Check-in Failed');
      assert.ok(data.distanceMeters > 100, `Expected distance > 100m, got ${data.distanceMeters}m`);
      assert.strictEqual(data.allowedRadiusMeters, 100);
      assert.ok(data.message.includes('You must be within 100m to check in'));
    });

    test('Near check-in (<100m away) successfully records visit with HTTP 200 OK', async () => {
      // Near coordinate: lat: 26.8469, lon: 80.9462 (~22m away)
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId: 'ret_gupta_kirana',
          beatId: 'beat_hazratganj_mon',
          latitude: 26.8469,
          longitude: 80.9462
        })
      });

      assert.strictEqual(res.status, 200, 'Expected HTTP 200 OK for valid geofenced check-in');
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.visit, 'Expected visit object in response');
      assert.strictEqual(data.visit.isWithinGeofence, true);
      assert.ok(data.visit.distanceMeters <= 100, `Expected distance <= 100m, got ${data.visit.distanceMeters}m`);
      assert.strictEqual(data.visit.retailerId, 'ret_gupta_kirana');
    });
  });

  // ===========================================================================
  // 2. Multi-Vendor Cart Validation & Auto-Split
  // ===========================================================================
  describe('2. Multi-Vendor Cart: MOQ Rejection, MOV Rejection & Vendor Order Splitting', () => {
    test('SKU MOQ violation is rejected with HTTP 400 Bad Request', async () => {
      // Parle-G carton requires minimumOrderQuantity = 2
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 1 } // Only 1, fails MOQ
          ]
        })
      });

      assert.strictEqual(res.status, 400, 'Expected HTTP 400 for MOQ violation');
      const data = await res.json();
      assert.ok(data.error.toLowerCase().includes('minimum order quantity'));
      assert.ok(data.error.includes('2 units'));
    });

    test('Seller MOV violation is rejected with HTTP 400 Bad Request', async () => {
      // 2x Parle-G carton = ₹1,160 subtotal (+ GST = ₹1,368.80) < Anagata FMCG MOV ₹1,500
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 2 }
          ]
        })
      });

      assert.strictEqual(res.status, 400, 'Expected HTTP 400 for MOV violation');
      const data = await res.json();
      assert.ok(data.error.toLowerCase().includes('minimum order value'));
      assert.ok(data.error.includes('1500'));
    });

    test('Valid multi-vendor cart splits into vendor sub-orders with unique 4-digit OTPs', async () => {
      // Anagata FMCG: 2x Parle-G (₹1,160) + 1x Tata Tea (₹2,650) = ₹3,810 > MOV ₹1,500
      // Awadh Beverages: 3x Limca crate (₹2,220) = ₹2,220 > MOV ₹2,000
      const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'ret_gupta_kirana',
          placedByAgentId: 'usr_agent_1',
          items: [
            { productSkuId: 'sku_parle_carton', quantity: 2 },
            { productSkuId: 'sku_tata_tea_box', quantity: 1 },
            { productSkuId: 'sku_limca_crate', quantity: 3 }
          ]
        })
      });

      assert.strictEqual(res.status, 200, 'Expected HTTP 200 for valid multi-vendor checkout');
      const data = await res.json();

      assert.ok(data.order, 'Expected data.order in response');
      assert.ok(data.order.orderNumber.startsWith('ORD-'), 'Order number should start with ORD-');
      assert.strictEqual(data.order.retailerId, 'ret_gupta_kirana');
      assert.strictEqual(data.order.status, 'PLACED');

      // Verify sub-orders
      assert.ok(Array.isArray(data.order.subOrders), 'Expected subOrders array');
      assert.strictEqual(data.order.subOrders.length, 2, 'Should split into exactly 2 vendor sub-orders');

      const sellerIds = data.order.subOrders.map((so) => so.organizationId).sort();
      assert.deepStrictEqual(sellerIds, ['org_anagata_fmcg', 'org_awadh_beverages']);

      for (const so of data.order.subOrders) {
        assert.ok(/^\d{4}$/.test(so.deliveryOtp), `Delivery OTP should be a 4-digit code: ${so.deliveryOtp}`);
        assert.strictEqual(so.status, 'RECEIVED');
        assert.ok(so.items.length > 0, 'Sub-order should contain items');
      }

      // Store sub-orders for subsequent delivery tests
      createdSubOrders = data.order.subOrders;
    });
  });

  // ===========================================================================
  // 3. WhatsApp Evolution API Delivery OTP Alert & Verification Lifecycle
  // ===========================================================================
  describe('3. WhatsApp Delivery OTP Dispatch & Proof-of-Delivery Verification', () => {
    test('Dispatching sub-order transitions status to DISPATCHED and triggers WhatsApp OTP alert', async () => {
      assert.ok(createdSubOrders.length > 0, 'Requires sub-orders from checkout test');
      const targetSubOrder = createdSubOrders[0];

      const res = await fetch(`${BASE_URL}/api/delivery/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subOrderId: targetSubOrder.id
        })
      });

      assert.strictEqual(res.status, 200, 'Expected HTTP 200 for dispatch call');
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.subOrder.status, 'DISPATCHED');
      assert.ok(data.subOrder.dispatchTime, 'Dispatch time must be recorded');
      assert.ok(data.message.includes('4-digit Delivery OTP sent to retailer WhatsApp'));

      // Update local reference
      targetSubOrder.status = 'DISPATCHED';
      targetSubOrder.dispatchTime = data.subOrder.dispatchTime;
    });

    test('Incorrect Delivery OTP is rejected with HTTP 400 Bad Request', async () => {
      const targetSubOrder = createdSubOrders[0];
      // Intentionally wrong OTP
      const wrongOtp = targetSubOrder.deliveryOtp === '0000' ? '9999' : '0000';

      const res = await fetch(`${BASE_URL}/api/delivery/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subOrderId: targetSubOrder.id,
          enteredOtp: wrongOtp
        })
      });

      assert.strictEqual(res.status, 400, 'Expected HTTP 400 for invalid OTP');
      const data = await res.json();
      assert.strictEqual(data.error, 'Invalid Delivery OTP');
    });

    test('Valid Delivery OTP transitions status to DELIVERED and logs transit duration in minutes', async () => {
      const targetSubOrder = createdSubOrders[0];

      const res = await fetch(`${BASE_URL}/api/delivery/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subOrderId: targetSubOrder.id,
          enteredOtp: targetSubOrder.deliveryOtp,
          deliveryBoyName: 'Vikas Delivery'
        })
      });

      assert.strictEqual(res.status, 200, 'Expected HTTP 200 for valid OTP verification');
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.subOrder.status, 'DELIVERED');
      assert.ok(data.subOrder.deliveryTime, 'Delivery timestamp must be set');
      assert.ok(typeof data.subOrder.transitDurationMinutes === 'number', 'Transit duration must be a number');
      assert.ok(data.subOrder.transitDurationMinutes >= 1, 'Transit duration must be at least 1 minute');
      assert.ok(data.message.includes(`Recorded transit time: ${data.subOrder.transitDurationMinutes} minutes`));
    });
  });

  // ===========================================================================
  // 4. Seller Cost-Savings Intelligence Simulator
  // ===========================================================================
  describe('4. Seller ROI Simulator Intelligence Engine', () => {
    test('Calculates exact ₹27,000/mo net savings, 81.8% payroll reduction, and 0% commission on ₹6,000 subscription', async () => {
      // GET /api/analytics/roi-simulator with standard FMCG parameters
      const params = new URLSearchParams({
        baseSalary: '22000',
        dailyTa: '250',
        workingDays: '26',
        incentive: '3000',
        overheads: '1500',
        beatFee: '6000',
        repsCount: '1'
      });

      const res = await fetch(`${BASE_URL}/api/analytics/roi-simulator?${params.toString()}`);
      assert.strictEqual(res.status, 200, 'Expected HTTP 200 for ROI simulator endpoint');

      const data = await res.json();
      // Dedicated Rep Total = 22,000 + (250 * 26) + 3,000 + 1,500 = ₹33,000
      assert.strictEqual(data.dedicatedRepMonthlyTotal, 33000);
      assert.strictEqual(data.dedicatedRepAnnualTotal, 396000);

      // Platform Shared Beat = ₹6,000
      assert.strictEqual(data.platformSharedMonthlyTotal, 6000);
      assert.strictEqual(data.platformSharedAnnualTotal, 72000);

      // Net Savings = 33,000 - 6,000 = ₹27,000/month (₹324,000/year)
      assert.strictEqual(data.monthlyRupeeSavings, 27000);
      assert.strictEqual(data.annualRupeeSavings, 324000);

      // Payroll Reduction Percentage = (27,000 / 33,000) * 100 = 81.8%
      assert.strictEqual(data.savingsPercentage, 81.8);

      // Commission Rate = 0%
      assert.strictEqual(data.commissionRate, 0);
    });
  });
});
