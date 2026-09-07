/**
 * EMPIRICAL CHALLENGER TEST SUITE: MILESTONE 1 (Retailer, User & POS Endpoints)
 * 
 * Adversarial stress testing for:
 * 1. PUT /api/retailers/:id - 15m GPS collision boundary conditions (<15m vs >15m) & profile updates
 * 2. PUT /api/users/:id - Status toggle (ACTIVE -> SUSPENDED), permissions modification, & audit trail
 * 3. GET /api/pos/bills/:id - Bill retrieval & ESC/POS thermal receipt string format verification
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const TEST_PORT = process.env.TEST_PORT || 4018;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, port: TEST_PORT, hostname: '127.0.0.1' }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServerReady(retries = 35) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await request({ path: '/health', method: 'GET' });
      if (res.status === 200) return true;
    } catch (e) {
      // server starting up...
    }
    await sleep(250);
  }
  throw new Error('Server failed to start within timeout');
}

async function runEmpiricalChallenge() {
  console.log('========================================================================');
  console.log('  EMPIRICAL CHALLENGER: RETAILER, USER & POS ENDPOINT STRESS HARNESS  ');
  console.log('========================================================================\n');

  const apiDir = path.resolve(__dirname, '..');
  const serverProcess = spawn('node', ['dist/server.js'], {
    cwd: apiDir,
    env: { ...process.env, PORT: String(TEST_PORT), LOG_LEVEL: 'silent' }
  });

  serverProcess.stderr.on('data', (d) => {
    // console.error('[Server Err]:', d.toString());
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    await waitForServerReady();
    console.log(`[Challenger Server] Online at http://127.0.0.1:${TEST_PORT}\n`);

    // =========================================================================
    // SECTION 1: PUT /api/retailers/:id - 15m GPS COLLISION & STORE EDITING
    // =========================================================================
    console.log('--- SECTION 1: PUT /api/retailers/:id (GPS Collision & Store Updates) ---');

    // Baseline: Verify initial store coordinates
    // ret_sharma_general is at base: lat 26.8520000, lng 80.9490000
    // ret_gupta_kirana is initially at lat 26.8467000, lng 80.9462000
    let res = await request({ path: '/api/retailers/ret_sharma_general', method: 'GET' });
    assert(res.status === 200, 'Baseline: GET ret_sharma_general returns 200 OK');
    assert(res.data.retailer.latitude === 26.852, 'ret_sharma_general latitude is 26.852');
    assert(res.data.retailer.longitude === 80.949, 'ret_sharma_general longitude is 80.949');

    // 1.1 Stress: Distance = 5.0m (<15m) -> MUST return 409 Conflict GPS_COLLISION_15M
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: 26.8520450,
      longitude: 80.9490000
    });
    assert(res.status === 409, '1.1 Collision 5.0m: PUT returns HTTP 409 Conflict');
    assert(res.data.error === 'GPS_COLLISION_15M', '1.1 Error code is GPS_COLLISION_15M');
    assert(res.data.collisionType === 'GPS_COLLISION_15M', '1.1 collisionType is GPS_COLLISION_15M');
    assert(res.data.collidingStore && res.data.collidingStore.id === 'ret_sharma_general', '1.1 Identifies ret_sharma_general as colliding store');
    assert(res.data.collidingStore && res.data.collidingStore.distanceMeters === 5, `1.1 Distance correctly calculated as 5m (got: ${res.data.collidingStore?.distanceMeters}m)`);

    // 1.2 Stress: Distance = 10.0m (<15m) -> MUST return 409 Conflict
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: 26.8520900,
      longitude: 80.9490000
    });
    assert(res.status === 409, '1.2 Collision 10.0m: PUT returns HTTP 409 Conflict');
    assert(res.data.error === 'GPS_COLLISION_15M', '1.2 Error code is GPS_COLLISION_15M');
    assert(res.data.collidingStore.distanceMeters === 10, `1.2 Distance correctly calculated as 10m (got: ${res.data.collidingStore?.distanceMeters}m)`);

    // 1.3 Stress: Distance = 14.5m (<15m) -> MUST return 409 Conflict
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: 26.8521305,
      longitude: 80.9490000
    });
    assert(res.status === 409, '1.3 Collision 14.5m: PUT returns HTTP 409 Conflict');
    assert(res.data.error === 'GPS_COLLISION_15M', '1.3 Error code is GPS_COLLISION_15M');
    assert(res.data.collidingStore.distanceMeters === 14.5, `1.3 Distance correctly calculated as 14.5m (got: ${res.data.collidingStore?.distanceMeters}m)`);

    // 1.4 Stress: Tight Boundary Distance = 14.9m (<15m) -> MUST return 409 Conflict
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: 26.8521341,
      longitude: 80.9490000
    });
    assert(res.status === 409, '1.4 Collision 14.9m (tight boundary): PUT returns HTTP 409 Conflict');
    assert(res.data.error === 'GPS_COLLISION_15M', '1.4 Error code is GPS_COLLISION_15M');
    assert(res.data.collidingStore.distanceMeters === 14.9, `1.4 Distance correctly calculated as 14.9m (got: ${res.data.collidingStore?.distanceMeters}m)`);

    // 1.5 Stress: Tight Boundary Distance = 15.1m (>15m) -> MUST SUCCEED with HTTP 200 OK
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: 26.8521359,
      longitude: 80.9490000
    });
    assert(res.status === 200, '1.5 Clearance 15.1m (tight boundary): PUT returns HTTP 200 OK');
    assert(res.data.success === true, '1.5 Response has success: true');
    assert(res.data.retailer.latitude === 26.8521359, '1.5 Latitude successfully updated to 15.1m offset');
    assert(res.data.retailer.longitude === 80.949, '1.5 Longitude successfully updated');

    // 1.6 Stress: Safe Distance = 20.0m (>15m) -> MUST SUCCEED with HTTP 200 OK
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: 26.8521800,
      longitude: 80.9490000
    });
    assert(res.status === 200, '1.6 Clearance 20.0m: PUT returns HTTP 200 OK');
    assert(res.data.retailer.latitude === 26.85218, '1.6 Latitude successfully updated to 20m offset');

    // 1.7 Stress: Self-Exclusion Invariant (Updating own coordinates without colliding with self)
    res = await request({
      path: '/api/retailers/ret_sharma_general',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: 26.8520000,
      longitude: 80.9490000
    });
    assert(res.status === 200, '1.7 Self-exclusion invariant: Store updating to own coordinates returns 200 OK');
    assert(res.data.success === true, '1.7 Success is true on self coordinate update');

    // 1.8 Stress: String coordinate parsing robustness
    res = await request({
      path: '/api/retailers/ret_gupta_kirana',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      latitude: '26.8524499',
      longitude: '80.9490000'
    });
    assert(res.status === 200, '1.8 String coordinates: Coerced cleanly and returns 200 OK');
    assert(typeof res.data.retailer.latitude === 'number', '1.8 Latitude stored as numeric');

    // 1.9 Resolution via linked userId
    res = await request({
      path: '/api/retailers/usr_ret_1',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      storeName: 'Gupta Mega Superstore',
      ownerName: 'Rameshwar G. Gupta',
      phone: '9555555559',
      creditLimit: 90000,
      paymentTerms: 'NET_30'
    });
    assert(res.status === 200, '1.9 Resolution by linked userId (usr_ret_1) returns 200 OK');
    assert(res.data.retailer.storeName === 'Gupta Mega Superstore', '1.9 storeName updated');
    assert(res.data.retailer.ownerName === 'Rameshwar G. Gupta', '1.9 ownerName updated');
    assert(res.data.retailer.creditLimit === 90000, '1.9 creditLimit updated to 90000');
    assert(res.data.retailer.paymentTerm === 'NET_30', '1.9 paymentTerm updated to NET_30');
    const expectedAvail = Math.max(0, 90000 - res.data.retailer.creditDues);
    assert(res.data.retailer.availableCredit === expectedAvail, `1.9 availableCredit correctly computed as ${expectedAvail}`);

    // Verify linked user synchronized
    res = await request({ path: '/api/users/usr_ret_1', method: 'GET' });
    assert(res.status === 200, '1.9 GET linked user usr_ret_1 returns 200 OK');
    assert(res.data.user.name === 'Rameshwar G. Gupta', '1.9 Linked user name synchronized with retailer ownerName');
    assert(res.data.user.phone === '9555555559', '1.9 Linked user phone synchronized with retailer phone');

    // 1.10 Non-existent retailer returns 404
    res = await request({
      path: '/api/retailers/ret_non_existent_999',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { storeName: 'Nowhere Store' });
    assert(res.status === 404, '1.10 PUT non-existent retailer returns 404 Not Found');

    // =========================================================================
    // SECTION 2: PUT /api/users/:id - STATUS, PERMISSIONS & AUDIT LOGGING
    // =========================================================================
    console.log('\n--- SECTION 2: PUT /api/users/:id (Status, Permissions & Audit Trail) ---');

    // Baseline check on target user usr_seller_picker_1
    res = await request({ path: '/api/users/usr_seller_picker_1', method: 'GET' });
    assert(res.status === 200, 'Baseline: GET usr_seller_picker_1 returns 200 OK');
    assert(res.data.user.status === 'ACTIVE', 'Initial user status is ACTIVE');
    const initialPerms = res.data.user.permissions;
    assert(Array.isArray(initialPerms), 'Initial permissions is an array');

    // 2.1 Update status from ACTIVE to SUSPENDED & modify permissions array
    const modifiedPerms = ['CAN_VIEW_ORDERS', 'CAN_PACK_BATCHES', 'CAN_DISPATCH'];
    res = await request({
      path: '/api/users/usr_seller_picker_1',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'SUSPENDED',
      permissions: modifiedPerms,
      staffTitle: 'Suspended Warehouse Associate'
    });
    assert(res.status === 200, '2.1 PUT status=SUSPENDED returns 200 OK');
    assert(res.data.success === true, '2.1 Response has success: true');
    assert(res.data.user.status === 'SUSPENDED', '2.1 Returned user status is SUSPENDED');
    assert(res.data.user.permissions.length === 3, '2.1 Returned user permissions length is 3');
    assert(res.data.user.staffTitle === 'Suspended Warehouse Associate', '2.1 staffTitle updated');

    // 2.2 Verify persistence via GET /api/users/:id
    res = await request({ path: '/api/users/usr_seller_picker_1', method: 'GET' });
    assert(res.status === 200, '2.2 GET updated user returns 200 OK');
    assert(res.data.user.status === 'SUSPENDED', '2.2 Persisted status is SUSPENDED');
    assert(res.data.user.permissions.length === 3, '2.2 Persisted permissions array length is 3');
    assert(res.data.user.permissions.includes('CAN_PACK_BATCHES'), '2.2 Contains CAN_PACK_BATCHES');
    assert(!res.data.user.permissions.includes('CAN_PRINT_LABELS'), '2.2 Removed CAN_PRINT_LABELS as expected');

    // 2.3 Verify Audit Trail entry
    assert(Array.isArray(res.data.user.auditLog), '2.3 auditLog array exists on user');
    const updateLog = res.data.user.auditLog.find((l) => l.action === 'USER_UPDATED');
    assert(updateLog !== undefined, '2.3 Audit log contains USER_UPDATED event');
    assert(updateLog.userId === 'usr_seller_picker_1', '2.3 Audit log records correct userId');
    assert(updateLog.details && Array.isArray(updateLog.details.updatedFields), '2.3 Audit log contains updatedFields array');
    assert(updateLog.details.updatedFields.includes('status'), '2.3 updatedFields includes status');
    assert(updateLog.details.updatedFields.includes('permissions'), '2.3 updatedFields includes permissions');
    assert(updateLog.details.updatedFields.includes('staffTitle'), '2.3 updatedFields includes staffTitle');

    // 2.4 Transition status back from SUSPENDED to ACTIVE via loginId lookup (seller_picker)
    res = await request({
      path: '/api/users/seller_picker',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 'ACTIVE',
      staffTitle: 'Reinstated Warehouse Supervisor'
    });
    assert(res.status === 200, '2.4 Re-activating user status via loginId lookup returns 200 OK');
    assert(res.data.user.status === 'ACTIVE', '2.4 User status is now ACTIVE');

    // 2.5 Empty permissions array edge case
    res = await request({
      path: '/api/users/usr_seller_picker_1',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      permissions: []
    });
    assert(res.status === 200, '2.5 Empty permissions array returns 200 OK');
    assert(Array.isArray(res.data.user.permissions) && res.data.user.permissions.length === 0, '2.5 Permissions successfully emptied');

    // 2.6 Security check: Password must not leak in audit log updatedFields
    res = await request({
      path: '/api/users/usr_seller_picker_1',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      password: 'SuperSecretAuditTestPassword@2026',
      name: 'Suresh Kumar Yadav'
    });
    assert(res.status === 200, '2.6 Password update returns 200 OK');
    res = await request({ path: '/api/users/usr_seller_picker_1', method: 'GET' });
    const latestLog = res.data.user.auditLog[0];
    assert(latestLog && latestLog.action === 'USER_UPDATED', '2.6 Latest audit log is USER_UPDATED');
    assert(!latestLog.details.updatedFields.includes('password'), '2.6 Security check: password is NOT recorded in updatedFields');
    assert(latestLog.details.updatedFields.includes('name'), '2.6 updatedFields includes name');

    // 2.7 Audit log persistence & accumulation: multiple logs present
    const allUserUpdates = res.data.user.auditLog.filter(l => l.action === 'USER_UPDATED');
    assert(allUserUpdates.length >= 3, `2.7 Audit trail accumulates events across updates (got: ${allUserUpdates.length} entries)`);

    // 2.8 Non-existent user returns 404
    res = await request({
      path: '/api/users/usr_does_not_exist_xyz',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { status: 'SUSPENDED' });
    assert(res.status === 404, '2.8 PUT non-existent user returns 404 Not Found');

    // =========================================================================
    // SECTION 3: GET /api/pos/bills/:id - BILL RETRIEVAL & ESC/POS THERMAL RECEIPT
    // =========================================================================
    console.log('\n--- SECTION 3: GET /api/pos/bills/:id (Bill Retrieval & ESC/POS Format) ---');

    // 3.1 Retrieve single bill by Bill ID: bill_001
    res = await request({ path: '/api/pos/bills/bill_001', method: 'GET' });
    assert(res.status === 200, '3.1 GET /api/pos/bills/bill_001 returns 200 OK');
    assert(res.data.success === true, '3.1 Response success is true');
    assert(res.data.bill.id === 'bill_001', '3.1 Bill ID matches bill_001');
    assert(res.data.bill.billNumber === 'BILL-2026-101', '3.1 billNumber is BILL-2026-101');
    assert(res.data.bill.grandTotal === 235, '3.1 grandTotal is 235');
    assert(res.data.bill.taxAmount === 11.6, '3.1 taxAmount matches taxTotal 11.6');
    assert(res.data.bill.paymentMode === 'SPLIT', '3.1 paymentMode is SPLIT');
    assert(Array.isArray(res.data.bill.items) && res.data.bill.items.length === 3, '3.1 Contains 3 item records');
    assert(res.data.bill.retailerShopName && res.data.bill.retailerShopName.length > 0, '3.1 Enriched with retailerShopName');

    // 3.2 Retrieve single bill by human-readable Bill Number: BILL-2026-101
    res = await request({ path: '/api/pos/bills/BILL-2026-101', method: 'GET' });
    assert(res.status === 200, '3.2 GET /api/pos/bills/BILL-2026-101 resolves by billNumber with 200 OK');
    assert(res.data.bill.id === 'bill_001', '3.2 Resolves to bill_001');

    // 3.3 Presence of escPosThermalReceipt and escPosReceipt alias
    const thermalReceipt = res.data.bill.escPosThermalReceipt;
    assert(typeof thermalReceipt === 'string', '3.3 escPosThermalReceipt is a string');
    assert(thermalReceipt.length > 100, `3.3 escPosThermalReceipt length is substantial (${thermalReceipt.length} chars)`);
    assert(res.data.bill.escPosReceipt === thermalReceipt, '3.3 escPosReceipt alias matches escPosThermalReceipt exactly');

    // 3.4 Detailed ESC/POS Thermal Receipt Layout Verification
    console.log('\n  [Inspecting ESC/POS Thermal Receipt Payload Preview]:');
    const previewLines = thermalReceipt.trim().split('\n');
    previewLines.slice(0, 8).forEach(l => console.log('    | ' + l));
    console.log('    | ...');
    previewLines.slice(-6).forEach(l => console.log('    | ' + l));
    console.log('');

    assert(thermalReceipt.includes('----------------------------------------'), '3.4 Includes standard 40-col separator');
    assert(thermalReceipt.includes('BILL-2026-101'), '3.4 Receipt contains bill number BILL-2026-101');
    assert(thermalReceipt.includes('Date:'), '3.4 Receipt contains formatted date');
    assert(thermalReceipt.includes('Customer: Ramesh Chandra'), '3.4 Receipt contains customer name');
    assert(thermalReceipt.includes('Phone: 9820011223'), '3.4 Receipt contains customer phone');
    assert(thermalReceipt.includes('Item                  Qty   Rate    Total'), '3.4 Receipt contains column header row');
    
    // Verify line item rows exist in receipt text
    assert(thermalReceipt.includes('Parle-G Glucose'), '3.4 Receipt contains Parle-G item line');
    assert(thermalReceipt.includes('Tata Tea Gold'), '3.4 Receipt contains Tata Tea Gold item line');
    assert(thermalReceipt.includes('Limca Fresh Lemon'), '3.4 Receipt contains Limca item line');

    // Verify financial summary rows
    assert(thermalReceipt.includes('Subtotal:                            ₹245.00'), '3.4 Contains formatted Subtotal ₹245.00');
    assert(thermalReceipt.includes('Discount:                           -₹10.00'), '3.4 Contains formatted Discount -₹10.00');
    assert(thermalReceipt.includes('Tax:                                 ₹11.60'), '3.4 Contains formatted Tax ₹11.60');
    assert(thermalReceipt.includes('GRAND TOTAL:                        ₹235.00'), '3.4 Contains formatted GRAND TOTAL ₹235.00');
    assert(thermalReceipt.includes('Payment Mode: SPLIT'), '3.4 Contains Payment Mode: SPLIT');
    assert(thermalReceipt.includes('THANK YOU! VISIT AGAIN'), '3.4 Contains standard ESC/POS footer');

    // 3.5 Column width compliance check (Standard 80mm ESC/POS Font B buffer capacity <= 64 chars)
    const lines = thermalReceipt.split('\n');
    let maxColWidth = 0;
    for (const line of lines) {
      if (line.length > maxColWidth) maxColWidth = line.length;
    }
    assert(maxColWidth <= 64, `3.5 Max line width (${maxColWidth} chars) safely fits within standard 80mm thermal receipt buffer (<=64 cols)`);

    // 3.6 Non-existent bill ID returns 404
    res = await request({ path: '/api/pos/bills/bill_unknown_random_id', method: 'GET' });
    assert(res.status === 404, '3.6 GET non-existent bill returns 404 Not Found');
    assert(res.data.error === 'Bill not found', '3.6 Error message is Bill not found');

  } catch (err) {
    console.error('Test Execution Error:', err);
    failed++;
  } finally {
    serverProcess.kill('SIGTERM');
    console.log('\n========================================================================');
    console.log(`  EMPIRICAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runEmpiricalChallenge();
