const test = require('node:test');
const assert = require('node:assert');

// DIRECT IMPORT FROM COMPILED PACKAGE EXPORTS (ZERO LOCAL MOCKS)
const {
  calculateHaversineDistanceMeters,
  validateStoreGeofence,
  calculateSellerSavings,
  GEOFENCE_CONFIG,
  UserRole,
  SubOrderStatus,
  GeofenceCheckinSchema,
  VerifyDeliveryOtpSchema
} = require('../dist/index.js');

test('ROI Engine: Calculates exact fixed subscription savings (0% commission) directly from package export', (t) => {
  const repInputs = {
    monthlyBaseSalary: 22000,
    dailyTravelAllowance: 250,
    workingDaysPerMonth: 26,
    monthlyPerformanceIncentive: 3000,
    deviceAndOverheads: 1500,
    numberOfRepsOrBeats: 1
  };
  const platformInputs = {
    fixedMonthlyBeatSubscription: 6000,
    numberOfBeats: 1
  };

  const result = calculateSellerSavings(repInputs, platformInputs);

  // Financial arithmetic verification:
  // Dedicated: 22000 + (250 * 26 = 6500) + 3000 + 1500 = 33,000/mo
  // Platform: 6000 * 1 = 6,000/mo
  // Savings: 33,000 - 6,000 = 27,000/mo (81.8% payroll reduction)
  assert.strictEqual(result.dedicatedRepMonthlyTotal, 33000);
  assert.strictEqual(result.platformSharedMonthlyTotal, 6000);
  assert.strictEqual(result.monthlyRupeeSavings, 27000);
  assert.strictEqual(result.annualRupeeSavings, 324000);
  assert.strictEqual(result.savingsPercentage, 81.8);
  assert.strictEqual(result.commissionRate, 0);

  // Verify dynamic summary pitch text generation
  assert.ok(result.summaryPitch.includes('33,000'), 'Summary pitch must mention ₹33,000 dedicated payroll');
  assert.ok(result.summaryPitch.includes('6,000'), 'Summary pitch must mention ₹6,000 fixed subscription');
  assert.ok(result.summaryPitch.includes('27,000'), 'Summary pitch must mention ₹27,000 net monthly savings');
  assert.ok(result.summaryPitch.includes('81.8%'), 'Summary pitch must mention 81.8% savings');
  assert.ok(result.summaryPitch.includes('0% commission'), 'Summary pitch must confirm 0% commission');
});

test('Geofence Math: Verifies distances accurately with Haversine formula from package export', (t) => {
  const storeLat = 26.8467;
  const storeLng = 80.9462;

  // Agent 22.2m away
  const agentNearLat = 26.8469;
  const agentNearLng = 80.9462;
  const distNear = calculateHaversineDistanceMeters(agentNearLat, agentNearLng, storeLat, storeLng);
  assert.ok(distNear >= 20 && distNear <= 25, 'Near distance should be ~22.2m, got ' + distNear + 'm');

  // Agent 478.1m away
  const agentFarLat = 26.8510;
  const agentFarLng = 80.9462;
  const distFar = calculateHaversineDistanceMeters(agentFarLat, agentFarLng, storeLat, storeLng);
  assert.ok(distFar >= 470 && distFar <= 490, 'Far distance should be ~478.1m, got ' + distFar + 'm');
});

test('Geofence Engine: validateStoreGeofence enforces 100m check-in radius and rejections', (t) => {
  const storeLat = 26.8467;
  const storeLng = 80.9462;

  // 1. Near agent (~22m) within default 100m radius -> Accepted
  const agentNearLat = 26.8469;
  const agentNearLng = 80.9462;
  const nearResult = validateStoreGeofence(agentNearLat, agentNearLng, storeLat, storeLng);
  assert.strictEqual(nearResult.isWithin, true);
  assert.strictEqual(nearResult.allowedRadiusMeters, GEOFENCE_CONFIG.DEFAULT_CHECKIN_RADIUS_METERS);
  assert.ok(nearResult.message.includes('Check-in verified'), 'Message must indicate verified checkin');
  assert.ok(nearResult.message.includes('22.2m'), 'Message must state exact distance');

  // 2. Distant agent (~478m) outside 100m radius -> Rejected
  const agentFarLat = 26.8510;
  const agentFarLng = 80.9462;
  const farResult = validateStoreGeofence(agentFarLat, agentFarLng, storeLat, storeLng);
  assert.strictEqual(farResult.isWithin, false);
  assert.ok(farResult.message.includes('Check-in rejected'), 'Message must indicate rejected checkin');
  assert.ok(farResult.message.includes('478.1m'), 'Message must state exact distance');

  // 3. Custom strict radius (e.g. 15m) -> Rejects 22.2m agent
  const strictResult = validateStoreGeofence(agentNearLat, agentNearLng, storeLat, storeLng, 15);
  assert.strictEqual(strictResult.isWithin, false);
});

test('Shared Constants & Enums: Exports match expected platform domain definitions', (t) => {
  assert.strictEqual(GEOFENCE_CONFIG.DEFAULT_CHECKIN_RADIUS_METERS, 100);
  assert.strictEqual(GEOFENCE_CONFIG.STRICT_CHECKIN_RADIUS_METERS, 50);
  assert.strictEqual(UserRole.SALES_AGENT, 'SALES_AGENT');
  assert.strictEqual(UserRole.RETAILER, 'RETAILER');
  assert.strictEqual(SubOrderStatus.DELIVERED, 'DELIVERED');
  assert.strictEqual(SubOrderStatus.DISPATCHED, 'DISPATCHED');
});

test('Shared Schemas: Validates check-in payload and OTP formats via Zod schemas', (t) => {
  // Valid Geofence check-in
  const validCheckin = GeofenceCheckinSchema.safeParse({
    agentId: 'usr_agent_01',
    retailerId: 'ret_lucknow_01',
    beatId: 'beat_hazratganj_mon',
    latitude: 26.8469,
    longitude: 80.9462
  });
  assert.strictEqual(validCheckin.success, true);

  // Invalid check-in: latitude > 90
  const invalidCheckin = GeofenceCheckinSchema.safeParse({
    agentId: 'usr_agent_01',
    retailerId: 'ret_lucknow_01',
    beatId: 'beat_hazratganj_mon',
    latitude: 105.0,
    longitude: 80.9462
  });
  assert.strictEqual(invalidCheckin.success, false);

  // Valid 4-digit OTP
  const validOtp = VerifyDeliveryOtpSchema.safeParse({
    subOrderId: 'sub_ord_01',
    enteredOtp: '4821'
  });
  assert.strictEqual(validOtp.success, true);

  // Invalid OTP: length 2
  const invalidOtp = VerifyDeliveryOtpSchema.safeParse({
    subOrderId: 'sub_ord_01',
    enteredOtp: '12'
  });
  assert.strictEqual(invalidOtp.success, false);
});
