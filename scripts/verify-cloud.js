const https = require("https");
const { URL } = require("url");

const API_BASE = "https://api-b2b.anagataitsolutions.in";
const WEB_BASE = "https://b2b.anagataitsolutions.in";

const agent = new https.Agent({ rejectUnauthorized: false });

function request(method, urlStr, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      agent,
      headers: {
        "Content-Type": "application/json",
      },
    };

    let postData = null;
    if (body) {
      postData = JSON.stringify(body);
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("===============================================================");
  console.log("LIVE CLOUD PRODUCTION END-TO-END VERIFICATION SUITE");
  console.log("Target API: " + API_BASE);
  console.log("Target Web: " + WEB_BASE);
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = "") {
    if (condition) {
      console.log(`[PASS] ${name}`);
      if (details) console.log(`       -> ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      if (details) console.error(`       -> ${details}`);
      failed++;
    }
  }

  // 1. Health Check
  const healthRes = await request("GET", `${API_BASE}/health`);
  assert(
    healthRes.statusCode === 200 && healthRes.data.status === "ok",
    "1. API Health Endpoint (/health)",
    `HTTP ${healthRes.statusCode} | Status: ${healthRes.data.status} | Platform: ${healthRes.data.platform}`
  );

  // 2. Web Portal Live
  const webRes = await request("GET", `${WEB_BASE}/`);
  assert(
    webRes.statusCode === 200 && typeof webRes.data === "string" && webRes.data.includes("Hyperlocal B2B Sales Aggregator"),
    "2. Web Portal Root (https://b2b.anagataitsolutions.in)",
    `HTTP ${webRes.statusCode} | Title & Role Dashboard rendered in HTML`
  );

  // 3. APK Download
  const apkRes = await request("HEAD", `${WEB_BASE}/downloads/b2b-sales-aggregator.apk`);
  const apkLength = parseInt(apkRes.headers["content-length"] || "0", 10);
  assert(
    apkRes.statusCode === 200 && apkLength > 60000000,
    "3. Downloadable Standalone Android APK (/downloads/b2b-sales-aggregator.apk)",
    `HTTP ${apkRes.statusCode} | Size: ${(apkLength / (1024 * 1024)).toFixed(2)} MB | Content-Type: ${apkRes.headers["content-type"]}`
  );

  // 4. Beat Route Retrieval
  const beatRes = await request("GET", `${API_BASE}/api/beats/today?agentId=usr_agent_1`);
  assert(
    beatRes.statusCode === 200 && beatRes.data.stops && beatRes.data.stops.length > 0,
    "4. Beat Route Engine (GET /api/beats/today)",
    `HTTP ${beatRes.statusCode} | Beat: "${beatRes.data.beatName}" | Total Stops: ${beatRes.data.totalStops}`
  );

  // 5. Valid Geofence Check-in (< 100m)
  const validCheckinRes = await request("POST", `${API_BASE}/api/visits/checkin`, {
    agentId: "usr_agent_1",
    retailerId: "ret_gupta_kirana",
    beatId: "beat_hazratganj_mon",
    latitude: 26.8467,
    longitude: 80.9462,
  });
  assert(
    validCheckinRes.statusCode === 200 && validCheckinRes.data.success === true && validCheckinRes.data.visit.isWithinGeofence === true,
    "5. Geofence Enforcement (< 100m Check-in Approved)",
    `HTTP ${validCheckinRes.statusCode} | Distance: ${validCheckinRes.data.visit.distanceMeters}m | Within Geofence: ${validCheckinRes.data.visit.isWithinGeofence}`
  );

  // 6. Spoofed Geofence Check-in (> 100m)
  const spoofCheckinRes = await request("POST", `${API_BASE}/api/visits/checkin`, {
    agentId: "usr_agent_1",
    retailerId: "ret_gupta_kirana",
    beatId: "beat_hazratganj_mon",
    latitude: 26.8550,
    longitude: 80.9550,
  });
  assert(
    spoofCheckinRes.statusCode === 403,
    "6. Geofence Enforcement (> 100m Distant Check-in Rejected with 403)",
    `HTTP ${spoofCheckinRes.statusCode} | Rejection Message: "${spoofCheckinRes.data.message}" | Distance: ${spoofCheckinRes.data.distanceMeters}m`
  );

  // 7. Multi-Vendor Cart MOQ Rejection
  const moqRejectRes = await request("POST", `${API_BASE}/api/orders/checkout`, {
    retailerId: "ret_gupta_kirana",
    items: [
      { productSkuId: "sku_parle_carton", quantity: 1 }, // MOQ is 2
    ],
  });
  assert(
    moqRejectRes.statusCode === 400 && typeof moqRejectRes.data.error === "string" && moqRejectRes.data.error.includes("Minimum order quantity"),
    "7. Cart Validation: SKU Minimum Order Quantity (MOQ) Rejection",
    `HTTP ${moqRejectRes.statusCode} | Error: "${moqRejectRes.data.error}"`
  );

  // 8. Multi-Vendor Cart MOV Rejection
  const movRejectRes = await request("POST", `${API_BASE}/api/orders/checkout`, {
    retailerId: "ret_gupta_kirana",
    items: [
      { productSkuId: "sku_parle_carton", quantity: 2 }, // 2 * 580 = 1160 + tax = 1368.80 < MOV 1500
    ],
  });
  assert(
    movRejectRes.statusCode === 400 && typeof movRejectRes.data.error === "string" && movRejectRes.data.error.includes("Minimum order value"),
    "8. Cart Validation: Seller Minimum Order Value (MOV) Rejection",
    `HTTP ${movRejectRes.statusCode} | Error: "${movRejectRes.data.error}"`
  );

  // 9. Valid Multi-Vendor Cart Checkout & Auto-Split
  const checkoutRes = await request("POST", `${API_BASE}/api/orders/checkout`, {
    retailerId: "ret_gupta_kirana",
    placedByAgentId: "usr_agent_1",
    paymentTerm: "NET_7",
    items: [
      { productSkuId: "sku_parle_carton", quantity: 3 }, // Seller 1 (Anagata FMCG): 3 * 580 = 1740 + 18% = 2053.20 >= 1500
      { productSkuId: "sku_limca_crate", quantity: 3 },  // Seller 2 (Awadh Beverages): 3 * 740 = 2220 + 28% = 2841.60 >= 2000
    ],
  });
  const order = checkoutRes.data.order;
  assert(
    checkoutRes.statusCode === 200 && order && order.subOrders && order.subOrders.length === 2,
    "9. Multi-Vendor Cart Checkout & Auto-Split into Sub-Orders",
    `HTTP ${checkoutRes.statusCode} | Order #: ${order.orderNumber} | Total: ₹${order.totalAmount} | Sub-Orders Split: ${order.subOrders.length}`
  );

  const subOrder1 = order.subOrders[0];
  const subOrderId = subOrder1.id;

  // 10. Order Dispatch & WhatsApp Alert via Evolution API
  const dispatchRes = await request("POST", `${API_BASE}/api/delivery/dispatch`, {
    subOrderId: subOrderId,
  });
  assert(
    dispatchRes.statusCode === 200 && dispatchRes.data.subOrder.status === "DISPATCHED",
    "10. Order Dispatch & Transactional WhatsApp Alert Dispatch",
    `HTTP ${dispatchRes.statusCode} | SubOrder Status: ${dispatchRes.data.subOrder.status} | Delivery OTP Generated: ${dispatchRes.data.subOrder.deliveryOtp}`
  );

  const generatedOtp = dispatchRes.data.subOrder.deliveryOtp;

  // 11. Invalid OTP Verification Rejection
  const invalidOtpRes = await request("POST", `${API_BASE}/api/delivery/verify-otp`, {
    subOrderId: subOrderId,
    enteredOtp: "0000",
  });
  assert(
    invalidOtpRes.statusCode === 400 && invalidOtpRes.data.error === "Invalid Delivery OTP",
    "11. Proof-of-Delivery OTP Verification (Invalid OTP Rejected)",
    `HTTP ${invalidOtpRes.statusCode} | Error: "${invalidOtpRes.data.message}"`
  );

  // 12. Valid OTP Verification & Delivery Confirmation
  const validOtpRes = await request("POST", `${API_BASE}/api/delivery/verify-otp`, {
    subOrderId: subOrderId,
    enteredOtp: generatedOtp,
  });
  assert(
    validOtpRes.statusCode === 200 && validOtpRes.data.subOrder.status === "DELIVERED",
    "12. Proof-of-Delivery OTP Verification (Valid OTP Approved -> DELIVERED)",
    `HTTP ${validOtpRes.statusCode} | Status: ${validOtpRes.data.subOrder.status} | Transit Duration: ${validOtpRes.data.subOrder.transitDurationMinutes} min`
  );

  // 13. Seller ROI Simulator
  const roiRes = await request("GET", `${API_BASE}/api/analytics/roi-simulator`);
  assert(
    roiRes.statusCode === 200 &&
    roiRes.data.monthlyRupeeSavings === 27000 &&
    roiRes.data.savingsPercentage === 81.8 &&
    roiRes.data.commissionRate === 0,
    "13. Seller Cost-Savings Intelligence Simulator",
    `HTTP ${roiRes.statusCode} | Monthly Savings: ₹${roiRes.data.monthlyRupeeSavings} | Savings %: ${roiRes.data.savingsPercentage}% | Commission: ${roiRes.data.commissionRate}%`
  );

  // 14. Udaan Brand Stores Discovery
  const brandsRes = await request("GET", `${API_BASE}/api/catalog/brands`);
  assert(
    brandsRes.statusCode === 200 && Array.isArray(brandsRes.data.brands) && brandsRes.data.brands.length >= 3,
    "14. Udaan Official FMCG Brand Stores (/api/catalog/brands)",
    `HTTP ${brandsRes.statusCode} | Curated Brands: ${brandsRes.data.brands?.map(b => b.brand).join(", ")}`
  );

  // 15. FMCG Category Hierarchy
  const catRes = await request("GET", `${API_BASE}/api/catalog/categories`);
  assert(
    catRes.statusCode === 200 && Array.isArray(catRes.data.categories) && catRes.data.categories.length >= 3,
    "15. FMCG Multi-Level Categories (/api/catalog/categories)",
    `HTTP ${catRes.statusCode} | Categories: ${catRes.data.categories?.map(c => c.name).join(", ")}`
  );

  // 16. GST Tax Invoice Generation & Retrieval
  const invRes = await request("GET", `${API_BASE}/api/orders/invoice/${subOrderId}`);
  assert(
    invRes.statusCode === 200 && invRes.data.invoice && invRes.data.invoice.invoiceNumber,
    "16. GST Tax Invoice Compliance & IRN Retrieval",
    `HTTP ${invRes.statusCode} | Invoice #: ${invRes.data.invoice?.invoiceNumber} | Grand Total: ₹${invRes.data.invoice?.grandTotal}`
  );

  // 17. Field Agent CRM Leads Pipeline
  const leadsRes = await request("GET", `${API_BASE}/api/crm/leads`);
  assert(
    leadsRes.statusCode === 200 && Array.isArray(leadsRes.data.leads) && leadsRes.data.leads.length >= 3,
    "17. Field Agent CRM Retailer Lead Pipeline (/api/crm/leads)",
    `HTTP ${leadsRes.statusCode} | Active Retailers Tracked: ${leadsRes.data.leads?.length}`
  );

  // 18. On-the-Ground Payment Collection Voucher
  const collectRes = await request("POST", `${API_BASE}/api/crm/payments/collect`, {
    retailerId: "ret_gupta_kirana",
    amount: 2500,
    paymentMode: "CASH",
    notes: "Field beat payment collection test"
  });
  assert(
    collectRes.statusCode === 200 && collectRes.data.success === true && collectRes.data.collection.receiptVoucherNumber,
    "18. In-Visit Payment Collection & Cash Ledger Voucher",
    `HTTP ${collectRes.statusCode} | Voucher: ${collectRes.data.collection?.receiptVoucherNumber} | Remaining Dues: ₹${collectRes.data.currentOutstandingDues}`
  );

  // 19. Agent Sales Performance Targets Intelligence
  const perfRes = await request("GET", `${API_BASE}/api/crm/agent/performance`);
  assert(
    perfRes.statusCode === 200 && perfRes.data.agentPerformance && perfRes.data.agentPerformance.monthlyRevenueTarget > 0,
    "19. Sales Force Automation: Revenue Targets & Strike Rate %",
    `HTTP ${perfRes.statusCode} | Monthly Target: ₹${perfRes.data.agentPerformance?.monthlyRevenueTarget} | Strike Rate: ${perfRes.data.agentPerformance?.strikeRatePct}% | Cash in Hand: ₹${perfRes.data.agentPerformance?.cashInHand}`
  );

  console.log("\n===============================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification crashed:", err);
  process.exit(1);
});
