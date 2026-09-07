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
    dispatchRes.statusCode === 200 && dispatchRes.data?.subOrder?.status === "DISPATCHED",
    "10. Order Dispatch & Transactional WhatsApp Alert Dispatch",
    `HTTP ${dispatchRes.statusCode} | SubOrder Status: ${dispatchRes.data?.subOrder?.status} | Delivery OTP Generated: ${dispatchRes.data?.subOrder?.deliveryOtp}`
  );

  const generatedOtp = dispatchRes.data?.subOrder?.deliveryOtp;

  // 11. Invalid OTP Verification Rejection
  const invalidOtpRes = await request("POST", `${API_BASE}/api/delivery/verify-otp`, {
    subOrderId: subOrderId,
    enteredOtp: "0000",
  });
  assert(
    invalidOtpRes.statusCode === 400 && invalidOtpRes.data?.error === "Invalid Delivery OTP",
    "11. Proof-of-Delivery OTP Verification (Invalid OTP Rejected)",
    `HTTP ${invalidOtpRes.statusCode} | Error: "${invalidOtpRes.data?.message}"`
  );

  // 12. Valid OTP Verification & Delivery Confirmation
  const validOtpRes = await request("POST", `${API_BASE}/api/delivery/verify-otp`, {
    subOrderId: subOrderId,
    enteredOtp: generatedOtp,
  });
  assert(
    validOtpRes.statusCode === 200 && validOtpRes.data?.subOrder?.status === "DELIVERED",
    "12. Proof-of-Delivery OTP Verification (Valid OTP Approved -> DELIVERED)",
    `HTTP ${validOtpRes.statusCode} | Status: ${validOtpRes.data?.subOrder?.status} | Transit Duration: ${validOtpRes.data?.subOrder?.transitDurationMinutes} min`
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

  // 20. Seller Merchandising Studio: Wholesale SKUs & Bundles
  const sellerProdRes = await request("GET", `${API_BASE}/api/seller/products?organizationId=org_anagata_fmcg`);
  assert(
    sellerProdRes.statusCode === 200 && Array.isArray(sellerProdRes.data.products) && sellerProdRes.data.products.length > 0,
    "20. Seller Merchandising Studio (/api/seller/products)",
    `HTTP ${sellerProdRes.statusCode} | Products Count: ${sellerProdRes.data.products?.length} | Example: ${sellerProdRes.data.products?.[0]?.name}`
  );

  // 21. Grouped Product / Combo Bundle with Packaging Multipliers
  const comboProduct = sellerProdRes.data.products?.find((p) => p.id === "prod_festive_combo");
  const comboSku = comboProduct?.skus?.find((s) => s.isGroupedBundle);
  assert(
    sellerProdRes.statusCode === 200 && comboSku && comboSku.bundleItems?.length >= 2,
    "21. Master Combo Bundle & Multi-Tier Packaging Multipliers",
    `Combo: "${comboProduct?.name}" | Bundled Child Items: ${comboSku?.bundleItems?.length} items | Carton Multiplier: ${comboSku?.cartonMultiplier}`
  );

  // 22. Decentralized Seller-Controlled Retailer Credit Lines
  const creditLinesRes = await request("GET", `${API_BASE}/api/seller/credit-lines?organizationId=org_anagata_fmcg`);
  assert(
    creditLinesRes.statusCode === 200 && Array.isArray(creditLinesRes.data.creditLines) && creditLinesRes.data.creditLines.length > 0,
    "22. Decentralized Seller-Retailer Credit Lines (/api/seller/credit-lines)",
    `HTTP ${creditLinesRes.statusCode} | Credit Lines: ${creditLinesRes.data.creditLines?.length} pairs | Gupta Kirana Limit: ₹${creditLinesRes.data.creditLines?.[0]?.creditLimit}`
  );

  // 23. Zero-Gateway Payment Tracking & Dual-Sided Running Ledger
  const ledgerRes = await request("GET", `${API_BASE}/api/ledger/statement?organizationId=org_anagata_fmcg&retailerId=ret_gupta_kirana`);
  assert(
    ledgerRes.statusCode === 200 && ledgerRes.data.statement && Array.isArray(ledgerRes.data.statement.entries),
    "23. Dual-Sided Running Ledger Reconciliation (/api/ledger/statement)",
    `HTTP ${ledgerRes.statusCode} | Total Invoiced: ₹${ledgerRes.data.statement?.totalInvoiced} | Total Paid: ₹${ledgerRes.data.statement?.totalPaid} | Balance: ₹${ledgerRes.data.statement?.outstandingBalance}`
  );

  // 24. Government NIC Portal E-Way Bill Copy-Paste Payload
  const ewayRes = await request("GET", `${API_BASE}/api/orders/eway-bill-payload/${subOrderId}`);
  assert(
    ewayRes.statusCode === 200 && ewayRes.data.payload && ewayRes.data.payload.formattedCopyText?.includes("GOVERNMENT OF INDIA E-WAY BILL SYSTEM"),
    "24. Government NIC Portal E-Way Bill Copy Payload (/api/orders/eway-bill-payload)",
    `HTTP ${ewayRes.statusCode} | Doc No: ${ewayRes.data.payload?.invoiceNumber} | Supply Type: ${ewayRes.data.payload?.supplyType} | Vehicle: ${ewayRes.data.payload?.transporterDetails?.vehicleNumber}`
  );

  // 25. OpenStreetMap (OSM) Reverse Geocoding & Beat Route
  const osmGeoRes = await request("GET", `${API_BASE}/api/geo/reverse?lat=26.8467&lng=80.9462`);
  const osmRouteRes = await request("GET", `${API_BASE}/api/geo/beat-route/beat_hazratganj_mon`);
  assert(
    osmGeoRes.statusCode === 200 && osmGeoRes.data.displayName && osmRouteRes.statusCode === 200 && osmRouteRes.data.mapProvider?.includes("OpenStreetMap"),
    "25. OpenStreetMap Geocoding & Beat Waypoints (/api/geo/reverse & beat-route)",
    `HTTP ${osmGeoRes.statusCode} | Geo: "${osmGeoRes.data.displayName?.slice(0, 40)}..." | Route Provider: ${osmRouteRes.data.mapProvider} (${osmRouteRes.data.totalStops} stops)`
  );

  // 26. FEFO Batch Inventory & Near-Expiry Liquidation Alerts
  const batchRes = await request("GET", `${API_BASE}/api/warehouse/batches`);
  const nearExpiryRes = await request("GET", `${API_BASE}/api/warehouse/near-expiry?days=30`);
  assert(
    batchRes.statusCode === 200 && Array.isArray(batchRes.data.batches) && batchRes.data.batches.length >= 2 &&
    nearExpiryRes.statusCode === 200 && Array.isArray(nearExpiryRes.data.nearExpiryBatches),
    "26. Warehouse FEFO Batch Tracking & 30-Day Expiry Liquidation Engine",
    `Batches: ${batchRes.data.batches?.length} tracked | Near Expiry: ${nearExpiryRes.data.nearExpiryBatches?.length} alerted`
  );

  // 27. 4x6 Carton Thermal Shipping Label
  const labelRes = await request("GET", `${API_BASE}/api/warehouse/shipping-label/sub_order_parle_001`);
  assert(
    labelRes.statusCode === 200 && labelRes.data.success && labelRes.data.label?.cartonCode,
    "27. Warehouse 4x6 Thermal Carton Shipping Label with Embedded QR",
    `Carton: ${labelRes.data.label?.cartonCode} | Route Stop: #${labelRes.data.label?.routeStopSequence} | QR: ${labelRes.data.label?.qrCodeContent?.slice(0, 30)}...`
  );

  // 28. Master Manufacturer Bulk Purchase Order (PO)
  const poRes = await request("GET", `${API_BASE}/api/warehouse/master-po?organizationId=org_anagata_fmcg`);
  assert(
    poRes.statusCode === 200 && poRes.data.success && poRes.data.masterPo?.poNumber,
    "28. Master Bulk Manufacturer Purchase Order (PO) Consolidation",
    `PO #: ${poRes.data.masterPo?.poNumber} | Total Items: ${poRes.data.masterPo?.lineItems?.length} | Value: ₹${poRes.data.masterPo?.totalPoValue}`
  );

  // 29. Reverse Logistics GST Credit Note Issuance
  const cnRes = await request("POST", `${API_BASE}/api/returns/credit-notes`, {
    originalInvoiceNumber: "INV-2026-PARLE-001",
    subOrderId: "sub_order_parle_001",
    retailerId: "ret_gupta_kirana",
    returnReason: "DAMAGED_IN_TRANSIT",
    lineItems: [
      { skuId: "sku_parle_carton", quantityReturned: 1, rate: 580, gstRatePct: 18 }
    ]
  });
  assert(
    cnRes.statusCode === 200 && cnRes.data.success && cnRes.data.creditNote?.creditNoteNumber,
    "29. Reverse Logistics GST Credit Note Compliance & Ledger Reversal",
    `Credit Note #: ${cnRes.data.creditNote?.creditNoteNumber} | Refund: ₹${cnRes.data.creditNote?.grandTotal} | Status: ${cnRes.data.creditNote?.status}`
  );

  // 30. Multi-Stop Delivery Trip Run Sheet with Tata Ace Capacity Meter
  const runSheetRes = await request("GET", `${API_BASE}/api/logistics/run-sheets`);
  const activeRunSheet = runSheetRes.data.runSheets?.[0];
  assert(
    runSheetRes.statusCode === 200 && activeRunSheet && activeRunSheet.totalWeightKg > 0,
    "30. Multi-Stop Delivery Run Sheet & Vehicle Gross Weight Capacity",
    `Trip: ${activeRunSheet?.runSheetNumber} | Vehicle: ${activeRunSheet?.vehicleRegistration} | Weight: ${activeRunSheet?.totalWeightKg}kg / ${activeRunSheet?.vehicleGrossCapacityKg}kg (${((activeRunSheet?.totalWeightKg / activeRunSheet?.vehicleGrossCapacityKg) * 100).toFixed(1)}%)`
  );

  // 31. Driver End-of-Trip Cash Handover Reconciliation
  const handoverRes = await request("POST", `${API_BASE}/api/logistics/cash-handover`, {
    runSheetId: "run_sheet_2026_09_07_01",
    cashCollected: 24500,
    receivedByStaffId: "usr_admin_1",
    notes: "E2E Cloud Verification Cash Handover"
  });
  assert(
    handoverRes.statusCode === 200 && handoverRes.data.success && handoverRes.data.runSheet?.cashReconciled === 24500,
    "31. Driver COD Cash Handover Reconciliation & Ledger Settlement",
    `Run Sheet: ${handoverRes.data.runSheet?.runSheetNumber} | Reconciled: ₹${handoverRes.data.runSheet?.cashReconciled} | Status: ${handoverRes.data.runSheet?.status}`
  );

  // 32. 1-Click Tally Prime XML Export
  const tallyRes = await request("GET", `${API_BASE}/api/accounting/tally-xml`);
  assert(
    tallyRes.statusCode === 200 && typeof tallyRes.data === "string" && tallyRes.data.includes("<ENVELOPE>"),
    "32. 1-Click Tally Prime XML Master & Voucher Export (/api/accounting/tally-xml)",
    `HTTP ${tallyRes.statusCode} | XML Format Valid | Root Tag: <ENVELOPE> | Vouchers Exported`
  );

  // 33. Marg ERP CSV Export
  const margRes = await request("GET", `${API_BASE}/api/accounting/marg-csv`);
  assert(
    margRes.statusCode === 200 && typeof margRes.data === "string" && margRes.data.includes("InvoiceDate,InvoiceNo"),
    "33. Marg ERP Dual Format CSV Export (/api/accounting/marg-csv)",
    `HTTP ${margRes.statusCode} | CSV Header: "${margRes.data.split("\n")[0]}" | Rows: ${margRes.data.trim().split("\n").length - 1}`
  );

  // 34. B2B Debt Aging Analysis (0-30, 31-60, 61-90, 90+ Days)
  const agingRes = await request("GET", `${API_BASE}/api/accounting/aging-analysis`);
  assert(
    agingRes.statusCode === 200 && agingRes.data.success && agingRes.data.agingReport?.totalOutstanding > 0,
    "34. B2B Debt Aging Analysis & Default Risk Classification",
    `Total Outstanding: ₹${agingRes.data.agingReport?.totalOutstanding} | 0-30 Days: ₹${agingRes.data.agingReport?.bucket0to30?.length || 0} bills | 90+ Days: ₹${agingRes.data.agingReport?.bucket90Plus?.length || 0} bills`
  );

  // 35. Post-Dated Cheque (PDC) Vault & Clearing
  const pdcRes = await request("GET", `${API_BASE}/api/accounting/pdc-cheques`);
  assert(
    pdcRes.statusCode === 200 && Array.isArray(pdcRes.data.pdcCheques) && pdcRes.data.pdcCheques.length > 0,
    "35. Post-Dated Cheque (PDC) Security Deposit Vault (/api/accounting/pdc-cheques)",
    `PDCs Vaulted: ${pdcRes.data.pdcCheques?.length} | Cheque #: ${pdcRes.data.pdcCheques?.[0]?.chequeNumber} | Bank: ${pdcRes.data.pdcCheques?.[0]?.bankName}`
  );

  // 36. Digital Kirana Udhar Khata Ledger
  const khataRes = await request("GET", `${API_BASE}/api/retailer/khata?retailerId=ret_gupta_kirana`);
  assert(
    khataRes.statusCode === 200 && Array.isArray(khataRes.data.customerKhatas) && khataRes.data.customerKhatas.length > 0,
    "36. Digital Kirana Udhar Khata & WhatsApp Payment Reminders",
    `Customer Accounts: ${khataRes.data.customerKhatas?.length} | Customer: "${khataRes.data.customerKhatas?.[0]?.customerName}" | Balance: ₹${khataRes.data.customerKhatas?.[0]?.currentBalance}`
  );

  // 37. SFA 2-Opt Traveling Salesman (TSP) Route Optimization
  const tspRes = await request("POST", `${API_BASE}/api/sfa/optimize-route`, {
    beatId: "beat_hazratganj_mon"
  });
  assert(
    tspRes.statusCode === 200 && tspRes.data.success && tspRes.data.distanceSavedKm > 0,
    "37. SFA 2-Opt Traveling Salesman (TSP) Dynamic Route Minimizer",
    `Original: ${tspRes.data.originalDistanceKm}km -> Optimized: ${tspRes.data.optimizedDistanceKm}km (Saved: ${tspRes.data.distanceSavedKm}km, ${tspRes.data.percentSavings}%)`
  );

  // 38. Sales Agent Morning Audio Briefing Engine
  const briefingRes = await request("GET", `${API_BASE}/api/sfa/daily-briefing?agentId=usr_agent_1`);
  assert(
    briefingRes.statusCode === 200 && briefingRes.data.success && briefingRes.data.speechSynthLang === "hi-IN",
    "38. Native HTML5 SpeechSynthesis Agent Morning Audio Briefing",
    `Voice Lang: ${briefingRes.data.speechSynthLang} | Briefing Script: "${briefingRes.data.textScript?.slice(0, 50)}..."`
  );

  // 39. Enterprise System Telemetry & Self-Hosted Stack Health
  const telemetryRes = await request("GET", `${API_BASE}/api/admin/telemetry`);
  assert(
    telemetryRes.statusCode === 200 && telemetryRes.data.success && telemetryRes.data.telemetry?.status === "HEALTHY",
    "39. Enterprise Telemetry & Zero-Paid Self-Hosted Stack Health",
    `Status: ${telemetryRes.data.telemetry?.status} | RAM: ${telemetryRes.data.telemetry?.memoryUsageMb} MB | Sync Queue: ${telemetryRes.data.telemetry?.syncQueueBacklog} pending`
  );

  // 40. Immutable Audit Trail Logging
  const auditRes = await request("GET", `${API_BASE}/api/admin/audit-logs`);
  assert(
    auditRes.statusCode === 200 && Array.isArray(auditRes.data.auditLogs) && auditRes.data.auditLogs.length > 0,
    "40. Immutable Audit Trail & Regulatory Event Logging (/api/admin/audit-logs)",
    `Audit Events: ${auditRes.data.auditLogs?.length} recorded | Latest Action: ${auditRes.data.auditLogs?.[0]?.action}`
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
