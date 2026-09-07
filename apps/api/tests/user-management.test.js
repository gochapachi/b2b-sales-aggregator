const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const TEST_PORT = 4005;

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

async function waitForServerReady(retries = 20) {
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

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING TEST SUITE: 30 USER HANDLING & RBAC FEATURES');
  console.log('====================================================\n');

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
    console.log(`[Test Server] Verified online at http://127.0.0.1:${TEST_PORT}\n`);

    // 1. Test GET /api/auth/test-credentials
    console.log('--- 1. Pre-configured Test Accounts Registry ---');
    let res = await request({
      path: '/api/auth/test-credentials',
      method: 'GET'
    });
    assert(res.status === 200, 'GET /api/auth/test-credentials returns 200 OK');
    assert(res.data.accounts && res.data.accounts.length >= 8, `Returned ${res.data.accounts?.length} deterministic test accounts`);
    
    const superAdminAcc = res.data.accounts.find(a => a.role === 'SUPER_ADMIN');
    assert(superAdminAcc && superAdminAcc.loginId === 'superadmin', 'Superadmin test account found');
    const cashierAcc = res.data.accounts.find(a => a.loginId === 'ret_cashier');
    assert(cashierAcc && cashierAcc.quickPin === '1234', 'Counter Cashier with Quick-PIN 1234 found');

    // 2. Test Multi-Identifier Login (Username vs Phone)
    console.log('\n--- 2. Multi-Identifier Login (Username & Mobile) ---');
    // Login with username 'superadmin'
    res = await request({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { loginId: 'superadmin', password: 'SuperAdmin@2026' });
    assert(res.status === 200, 'Login with username "superadmin" returns 200 OK');
    assert(res.data.user && res.data.user.role === 'SUPER_ADMIN', 'Super Admin role resolved');
    const adminToken = res.data.token;

    // Login with phone number '9999999999'
    res = await request({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { phone: '9999999999', password: 'SuperAdmin@2026' });
    assert(res.status === 200, 'Login with 10-digit phone "9999999999" returns 200 OK');

    // Login with Kirana Owner
    res = await request({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { loginId: 'ret_gupta', password: 'Kirana@2026' });
    assert(res.status === 200, 'Kirana store owner login returns 200 OK');
    assert(res.data.user.role === 'RETAILER', 'Retailer role resolved');
    assert(res.data.retailerProfile !== null, 'Retailer store profile linked to session');

    // 3. Margin Privacy & Cashier Restricted Permissions
    console.log('\n--- 3. Granular RBAC & Margin Privacy Shielding ---');
    res = await request({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { loginId: 'ret_cashier', password: 'Cashier@2026' });
    assert(res.status === 200, 'Kirana Cashier login returns 200 OK');
    assert(res.data.user.role === 'RETAILER_STAFF', 'Role is RETAILER_STAFF');
    assert(res.data.user.permissions.includes('CAN_CREATE_BILLS'), 'Cashier has CAN_CREATE_BILLS permission');
    assert(!res.data.user.permissions.includes('CAN_VIEW_PROFIT_MARGINS'), 'MARGIN PRIVACY SHIELD: CAN_VIEW_PROFIT_MARGINS is hidden from Cashier');

    // 4. Quick-PIN 4-Digit Counter Login
    console.log('\n--- 4. Fast 4-Digit Cashier Quick-PIN Login ---');
    res = await request({
      path: '/api/auth/quick-pin',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { retailerId: 'ret_gupta_kirana', quickPin: '1234' });
    assert(res.status === 200, 'Fast 4-Digit Quick-PIN login returns 200 OK');
    assert(res.data.token && res.data.user.role === 'RETAILER_STAFF', 'Cashier quick session authenticated');

    // Invalid PIN
    res = await request({
      path: '/api/auth/quick-pin',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { retailerId: 'ret_gupta_kirana', quickPin: '9999' });
    assert(res.status === 401, 'Invalid Quick-PIN rejected with 401 Unauthorized');

    // 5. Tenant Staff Management (Wholesaler creates sub-user)
    console.log('\n--- 5. Tenant Team Management (Sub-User Creation & RBAC) ---');
    const testStaffPhone = '919026019566'; // User test number
    res = await request({
      path: '/api/tenant/users',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      tenantType: 'SELLER',
      tenantId: 'org_anagata_fmcg',
      phone: testStaffPhone,
      name: 'Pooja Verma',
      role: 'SELLER_STAFF',
      staffTitle: 'Inventory Inwarding Specialist',
      permissions: ['CAN_INWARD_STOCK', 'CAN_PACK_BATCHES']
    });
    assert(res.status === 200, 'Wholesaler invited new team member successfully');
    assert(res.data.temporaryPassword && res.data.temporaryPassword.length > 5, 'Temporary password automatically generated');
    assert(res.data.whatsappDispatched === true, 'WhatsApp credential dispatch simulated/sent via Evolution API');
    const newStaffId = res.data.user.id;
    const newStaffPass = res.data.temporaryPassword;

    // Login with new staff credentials
    res = await request({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { phone: testStaffPhone, password: newStaffPass });
    assert(res.status === 200, 'New sub-user successfully signs in with generated credentials');
    assert(res.data.user.permissions.includes('CAN_INWARD_STOCK'), 'Assigned permissions accurately verified in session');

    // Fetch tenant team list
    res = await request({
      path: '/api/tenant/users?tenantType=SELLER&tenantId=org_anagata_fmcg',
      method: 'GET'
    });
    assert(res.status === 200, 'GET /api/tenant/users returns 200 OK');
    assert(res.data.users.some(u => u.id === newStaffId), 'Newly invited staff appears in team directory');

    // 6. User Status Toggle (Suspend & Reactivate)
    console.log('\n--- 6. Security Status Controls (Suspend & Reactivate) ---');
    res = await request({
      path: `/api/tenant/users/${newStaffId}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, { status: 'SUSPENDED' });
    assert(res.status === 200, 'Staff member status set to SUSPENDED');

    // Attempt login when suspended
    res = await request({
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { phone: testStaffPhone, password: newStaffPass });
    assert(res.status === 403, 'Suspended user login rejected with 403 Forbidden');

    // Reactivate
    res = await request({
      path: `/api/tenant/users/${newStaffId}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, { status: 'ACTIVE' });
    assert(res.status === 200, 'Staff member reactivated to ACTIVE');

    // 7. Password Reset Request
    console.log('\n--- 7. Self-Service Password Reset Flow ---');
    res = await request({
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { identifier: testStaffPhone });
    assert(res.status === 200, 'Password reset OTP requested');

    // 8. Super Admin User Registry & Impersonation
    console.log('\n--- 8. Super Admin User Registry & Impersonation ---');
    res = await request({
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(res.status === 200, 'Super Admin GET /api/admin/users returns 200 OK');
    assert(res.data.total > 8, `Total registered users across all tenants: ${res.data.total}`);

    // Super Admin Impersonation
    res = await request({
      path: '/api/admin/impersonate',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      }
    }, { targetUserId: 'usr_ret_1' });
    assert(res.status === 200, 'Super Admin impersonation returns 200 OK');
    assert(res.data.user.isImpersonated === true, 'Impersonation flag set in returned user token');

    // 9. Security Audit Log Trail
    console.log('\n--- 9. Security Audit Log Trail ---');
    res = await request({
      path: '/api/admin/audit-logs',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(res.status === 200, 'GET /api/admin/audit-logs returns 200 OK');
    assert(res.data.auditLogs && res.data.auditLogs.length > 0, `Recorded ${res.data.auditLogs?.length} audit events`);
    const impersonationLog = res.data.auditLogs.find(l => l.action === 'SUPER_ADMIN_IMPERSONATION');
    assert(impersonationLog !== undefined, 'Impersonation action logged in immutable audit trail');

  } catch (err) {
    console.error('Test Execution Error:', err);
    failed++;
  } finally {
    serverProcess.kill('SIGTERM');
    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();
