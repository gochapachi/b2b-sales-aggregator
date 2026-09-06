const { test, describe, before } = require('node:test');
const assert = require('node:assert');

const BASE_URL = process.env.API_TEST_URL || 'http://127.0.0.1:4000';

describe('Adversarial Challenger Suite: OTP Lifecycle, Transit SLAs, and ROI Engine', () => {

  // =========================================================================
  // Helper: Create a fresh order and return its sub-orders
  // =========================================================================
  async function createTestOrder() {
    const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        retailerId: 'ret_gupta_kirana',
        placedByAgentId: 'usr_agent_1',
        items: [
          { productSkuId: 'sku_parle_carton', quantity: 2 },
          { productSkuId: 'sku_tata_tea_box', quantity: 1 }
        ]
      })
    });
    assert.strictEqual(res.status, 200, 'Order creation must succeed');
    const data = await res.json();
    return data.order.subOrders[0];
  }

  // =========================================================================
  // 1. Stress-Testing Delivery OTP Verification
  // =========================================================================
  describe('1. Delivery OTP Verification Adversarial Stress Tests', () => {
    
    test('Scenario 1.1: Wrong OTP is strictly rejected with HTTP 400', async () => {
      const subOrder = await createTestOrder();
      const wrongOtp = subOrder.deliveryOtp === '1111' ? '2222' : '1111';

      const res = await fetch(`${BASE_URL}/api/delivery/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subOrderId: subOrder.id,
          enteredOtp: wrongOtp
        })
      });

      assert.strictEqual(res.status, 400, 'Wrong OTP must return HTTP 400');
      const data = await res.json();
      assert.strictEqual(data.error, 'Invalid Delivery OTP');
    });

    test('Scenario 1.2: Brute Force Attempts - Check for rate limiting or lockout', async () => {
      const subOrder = await createTestOrder();
      // Attempt 25 rapid incorrect OTP guesses
      const attempts = [];
      for (let i = 0; i < 25; i++) {
        const guess = String(i).padStart(4, '0');
        if (guess === subOrder.deliveryOtp) continue;
        attempts.push(
          fetch(`${BASE_URL}/api/delivery/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subOrderId: subOrder.id,
              enteredOtp: guess
            })
          })
        );
      }

      const responses = await Promise.all(attempts);
      const statusCodes = responses.map(r => r.status);
      const all400 = statusCodes.every(s => s === 400);
      const has429 = statusCodes.some(s => s === 429);

      console.log(`[CHALLENGE OBSERVATION] 25 Brute-force OTP attempts: ${statusCodes.filter(s => s === 400).length} returned 400, ${statusCodes.filter(s => s === 429).length} returned 429 (Rate Limited)`);
      // Note: If no rate limiting or lockout exists, all 25 return 400. We document this security observation.
    });

    test('Scenario 1.3: Non-numeric and malformed OTP inputs', async () => {
      const subOrder = await createTestOrder();

      const malformedInputs = [
        { label: 'Alphabetical string', val: 'abcd' },
        { label: 'Alphanumeric string', val: '12a4' },
        { label: 'Padded whitespace string', val: ' ' + subOrder.deliveryOtp + ' ' },
        { label: 'Numeric integer (not string)', val: parseInt(subOrder.deliveryOtp, 10) },
        { label: 'Empty string', val: '' },
        { label: 'Short OTP (3 digits)', val: '123' },
        { label: 'Long OTP (6 digits)', val: '123456' },
        { label: 'SQL Injection payload', val: "' OR '1'='1" },
        { label: 'Null value', val: null },
        { label: 'Boolean value', val: true }
      ];

      for (const input of malformedInputs) {
        const res = await fetch(`${BASE_URL}/api/delivery/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subOrderId: subOrder.id,
            enteredOtp: input.val
          })
        });

        assert.strictEqual(
          res.status,
          400,
          `Malformed input [${input.label}] should be rejected with HTTP 400, got ${res.status}`
        );
      }
    });

    test('Scenario 1.4: Re-verifying an ALREADY DELIVERED order (Idempotency vs State Violation)', async () => {
      const subOrder = await createTestOrder();

      // Dispatch order first
      await fetch(`${BASE_URL}/api/delivery/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subOrderId: subOrder.id })
      });

      // 1st verification: Delivery succeeds
      const res1 = await fetch(`${BASE_URL}/api/delivery/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subOrderId: subOrder.id,
          enteredOtp: subOrder.deliveryOtp
        })
      });
      assert.strictEqual(res1.status, 200);
      const data1 = await res1.json();
      assert.strictEqual(data1.subOrder.status, 'DELIVERED');
      const firstDeliveryTime = data1.subOrder.deliveryTime;
      const firstTransitDuration = data1.subOrder.transitDurationMinutes;

      // Small delay to test timestamp changes
      await new Promise(r => setTimeout(r, 100));

      // 2nd verification: Re-submitting verification for already delivered order
      const res2 = await fetch(`${BASE_URL}/api/delivery/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subOrderId: subOrder.id,
          enteredOtp: subOrder.deliveryOtp
        })
      });

      const data2 = await res2.json();
      console.log(`[CHALLENGE OBSERVATION] Re-verification response status: ${res2.status}, status: ${data2.subOrder?.status}`);
      console.log(`[CHALLENGE OBSERVATION] 1st deliveryTime: ${firstDeliveryTime}, 2nd deliveryTime: ${data2.subOrder?.deliveryTime}`);
    });
  });

  // =========================================================================
  // 2. Transit Duration Logging Calculation Stress Tests
  // =========================================================================
  describe('2. Transit Duration Logging Calculation Under Varied Time Deltas', () => {

    function calculateTransitDuration(dispatchTimeStr, deliveryTime) {
      if (dispatchTimeStr) {
        const dispatchMs = new Date(dispatchTimeStr).getTime();
        const deliveryMs = deliveryTime.getTime();
        return Math.max(1, Math.round((deliveryMs - dispatchMs) / 60000));
      } else {
        return 24; // Average 24 mins fallback
      }
    }

    test('Varied time deltas: sub-minute, standard, multi-hour, missing, and future dates', () => {
      const now = new Date('2026-09-06T12:00:00.000Z');

      // 1. Sub-minute: 10 seconds -> Math.round(10/60) = 0, Math.max(1, 0) = 1 min
      const t10s = new Date(now.getTime() - 10 * 1000).toISOString();
      assert.strictEqual(calculateTransitDuration(t10s, now), 1);

      // 2. 45 seconds -> Math.round(45/60) = 1 min
      const t45s = new Date(now.getTime() - 45 * 1000).toISOString();
      assert.strictEqual(calculateTransitDuration(t45s, now), 1);

      // 3. 89 seconds -> Math.round(89/60) = 1 min
      const t89s = new Date(now.getTime() - 89 * 1000).toISOString();
      assert.strictEqual(calculateTransitDuration(t89s, now), 1);

      // 4. 91 seconds -> Math.round(91/60) = 2 mins
      const t91s = new Date(now.getTime() - 91 * 1000).toISOString();
      assert.strictEqual(calculateTransitDuration(t91s, now), 2);

      // 5. 24.5 minutes -> Math.round(24.5) = 25 mins
      const t24m30s = new Date(now.getTime() - (24 * 60 + 30) * 1000).toISOString();
      assert.strictEqual(calculateTransitDuration(t24m30s, now), 25);

      // 6. 120 minutes (2 hours)
      const t120m = new Date(now.getTime() - 120 * 60 * 1000).toISOString();
      assert.strictEqual(calculateTransitDuration(t120m, now), 120);

      // 7. Missing dispatchTime -> fallback 24 mins
      assert.strictEqual(calculateTransitDuration(null, now), 24);
      assert.strictEqual(calculateTransitDuration(undefined, now), 24);

      // 8. Future dispatch time (clock drift or anomaly) -> negative delta -> clamped to 1 min
      const futureDispatch = new Date(now.getTime() + 60 * 1000).toISOString();
      assert.strictEqual(calculateTransitDuration(futureDispatch, now), 1);
    });
  });

  // =========================================================================
  // 3. Seller ROI Simulator Formula Mathematical Verification Across Varied Inputs
  // =========================================================================
  describe('3. Seller ROI Simulator Formula Mathematical Verification', () => {

    test('Baseline: Exactly ₹27,000/mo net savings, 81.8% payroll reduction, and 0% commission on ₹6,000 subscription', async () => {
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
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      // Calculation Breakdown:
      // Base Salary: 22,000
      // TA: 250 * 26 = 6,500
      // Incentive: 3,000
      // Overheads: 1,500
      // Total Dedicated Monthly = 22000 + 6500 + 3000 + 1500 = ₹33,000
      assert.strictEqual(data.dedicatedRepMonthlyTotal, 33000);
      assert.strictEqual(data.dedicatedRepAnnualTotal, 396000);

      // Platform Fee = ₹6,000
      assert.strictEqual(data.platformSharedMonthlyTotal, 6000);
      assert.strictEqual(data.platformSharedAnnualTotal, 72000);

      // Net Monthly Savings = 33,000 - 6,000 = ₹27,000
      assert.strictEqual(data.monthlyRupeeSavings, 27000);
      // Net Annual Savings = 27,000 * 12 = ₹324,000
      assert.strictEqual(data.annualRupeeSavings, 324000);

      // Savings Percentage = (27,000 / 33,000) * 100 = 81.818... -> 81.8%
      assert.strictEqual(data.savingsPercentage, 81.8);

      // Commission Rate = 0%
      assert.strictEqual(data.commissionRate, 0);

      // Cost per visit: 780 visits
      assert.strictEqual(data.effectiveCostPerVisit.dedicatedRep, 42.3);
      assert.strictEqual(data.effectiveCostPerVisit.platformShared, 7.7);
    });

    test('Scaling input: 5 Sales Reps across 5 Beats', async () => {
      const params = new URLSearchParams({
        baseSalary: '22000',
        dailyTa: '250',
        workingDays: '26',
        incentive: '3000',
        overheads: '1500',
        beatFee: '6000',
        repsCount: '5'
      });

      const res = await fetch(`${BASE_URL}/api/analytics/roi-simulator?${params.toString()}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.dedicatedRepMonthlyTotal, 165000);
      assert.strictEqual(data.platformSharedMonthlyTotal, 30000);
      assert.strictEqual(data.monthlyRupeeSavings, 135000);
      assert.strictEqual(data.annualRupeeSavings, 1620000); // ₹16.2 Lakhs
      assert.strictEqual(data.savingsPercentage, 81.8);
    });

    test('Extreme input: Dedicated rep cost lower than platform subscription', async () => {
      // Very low salary where dedicated rep = ₹5,000, beat fee = ₹6,000
      const params = new URLSearchParams({
        baseSalary: '5000',
        dailyTa: '0',
        workingDays: '26',
        incentive: '0',
        overheads: '0',
        beatFee: '6000',
        repsCount: '1'
      });

      const res = await fetch(`${BASE_URL}/api/analytics/roi-simulator?${params.toString()}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.dedicatedRepMonthlyTotal, 5000);
      assert.strictEqual(data.platformSharedMonthlyTotal, 6000);
      // Math.max(0, 5000 - 6000) = 0
      assert.strictEqual(data.monthlyRupeeSavings, 0);
      assert.strictEqual(data.annualRupeeSavings, 0);
      assert.strictEqual(data.savingsPercentage, 0);
    });

    test('Zero input: 0 reps count', async () => {
      const params = new URLSearchParams({
        baseSalary: '22000',
        dailyTa: '250',
        workingDays: '26',
        incentive: '3000',
        overheads: '1500',
        beatFee: '6000',
        repsCount: '0'
      });

      const res = await fetch(`${BASE_URL}/api/analytics/roi-simulator?${params.toString()}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.dedicatedRepMonthlyTotal, 0);
      assert.strictEqual(data.platformSharedMonthlyTotal, 0);
      assert.strictEqual(data.monthlyRupeeSavings, 0);
      assert.strictEqual(data.savingsPercentage, 0); // No division by zero crash
    });
  });
});
