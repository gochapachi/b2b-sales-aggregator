const { test, describe } = require('node:test');
const assert = require('node:assert');

const BASE_URL = process.env.API_TEST_URL || 'http://127.0.0.1:4000';

describe('Adversarial Geofence Engine Challenge Suite', () => {
  const storeLat = 26.8467;
  const storeLng = 80.9462;
  const retailerId = 'ret_gupta_kirana'; // geofence radius 100m

  // 1. Boundary coordinates (99m vs 100m vs 100.1m vs 101m)
  describe('1. Exact Boundary Coordinates (<100m vs =100m vs >100m)', () => {
    test('Boundary 99.0m north must succeed with HTTP 200 OK', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 26.847590, // exactly 99m
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
          latitude: 26.847599, // exactly 100m
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

    test('Boundary 101.0m north (1m over limit) must be strictly rejected with HTTP 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 26.847608, // 101m
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
  });

  // 2. Extreme and Negative Coordinates
  describe('2. Extreme and Negative Coordinates', () => {
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
      assert.ok(data.distanceMeters > 10000000, `Expected > 10,000 km, got ${data.distanceMeters}m`);
    });

    test('South Pole (-90, 0) rejected with HTTP 403', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: -90,
          longitude: 0
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
      assert.ok(data.distanceMeters > 19000000, `Distance should be ~20,000 km, got ${data.distanceMeters}m`);
    });

    test('Extreme out-of-range coordinates (999999, 999999) rejected with HTTP 403', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 999999,
          longitude: 999999
        })
      });
      assert.strictEqual(res.status, 403);
    });
  });

  // 3. Invalid Payloads and Malformed Inputs
  describe('3. Invalid Payloads & Missing Data', () => {
    test('Non-existent retailerId returns HTTP 404', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId: 'ret_ghost_999',
          latitude: storeLat,
          longitude: storeLng
        })
      });
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.strictEqual(data.error, 'Retailer shop not found');
    });

    test('Missing latitude/longitude does not bypass geofence (rejected with HTTP 403 or 400)', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon'
        })
      });
      // Should NOT return 200! Must be 400 or 403
      assert.notStrictEqual(res.status, 200, 'Missing coordinates must NOT result in HTTP 200');
    });

    test('Non-numeric coordinates ("xyz", "abc") does not bypass geofence', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: 'xyz',
          longitude: 'abc'
        })
      });
      assert.notStrictEqual(res.status, 200, 'Non-numeric coordinates must NOT result in HTTP 200');
    });

    test('Null coordinates (null, null) does not bypass geofence', async () => {
      const res = await fetch(`${BASE_URL}/api/visits/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'usr_agent_1',
          retailerId,
          beatId: 'beat_hazratganj_mon',
          latitude: null,
          longitude: null
        })
      });
      assert.notStrictEqual(res.status, 200, 'Null coordinates must NOT result in HTTP 200');
    });
  });
});
