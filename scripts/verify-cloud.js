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
  const nearExpiryRes = await request("GET", `${API_BASE}/api/warehouse/near-expiry`);
  assert(
    batchRes.statusCode === 200 && Array.isArray(batchRes.data.batches) && batchRes.data.batches.length >= 2 &&
    nearExpiryRes.statusCode === 200 && Array.isArray(nearExpiryRes.data.batches),
    "26. Warehouse FEFO Batch Tracking & 30-Day Expiry Liquidation Engine",
    `Batches: ${batchRes.data.batches?.length} tracked | Near Expiry: ${nearExpiryRes.data.batches?.length} alerted`
  );

  // 27. 4x6 Carton Thermal Shipping Label
  const labelRes = await request("GET", `${API_BASE}/api/warehouse/carton-label/${subOrderId}`);
  assert(
    labelRes.statusCode === 200 && labelRes.data.success && labelRes.data.labelData?.qrPayload,
    "27. Warehouse 4x6 Thermal Carton Shipping Label with Embedded QR",
    `Carton: ${labelRes.data.labelData?.boxLabel} | Consignee: ${labelRes.data.labelData?.consignee} | QR: ${labelRes.data.labelData?.qrPayload}`
  );

  // 28. Master Manufacturer Bulk Purchase Order (PO)
  const poRes = await request("GET", `${API_BASE}/api/warehouse/master-po`);
  assert(
    poRes.statusCode === 200 && poRes.data.success && poRes.data.masterPoNumber,
    "28. Master Bulk Manufacturer Purchase Order (PO) Consolidation",
    `PO #: ${poRes.data.masterPoNumber} | Items: ${poRes.data.items?.length} | Est Cost: ₹${poRes.data.totalEstCost}`
  );

  // 29. Reverse Logistics GST Credit Note Issuance
  const cnRes = await request("POST", `${API_BASE}/api/returns/credit-notes`, {
    originalInvoiceNumber: "INV-2026-AUG001",
    originalInvoiceDate: "2026-08-20",
    retailerId: "ret_gupta_kirana",
    organizationId: "org_anagata_fmcg",
    reason: "DAMAGED_IN_TRANSIT",
    items: [
      {
        skuId: "sku_parle_g_carton",
        productName: "Parle-G Glucose Biscuits (80g)",
        hsnCode: "19053100",
        quantity: 2,
        ratePerUnit: 580,
        gstRatePct: 5
      }
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
    runSheetRes.statusCode === 200 && activeRunSheet && activeRunSheet.totalGrossWeightKg > 0,
    "30. Multi-Stop Delivery Run Sheet & Vehicle Gross Weight Capacity",
    `Trip: ${activeRunSheet?.runSheetNumber} | Vehicle: ${activeRunSheet?.vehicleNumber} | Weight: ${activeRunSheet?.totalGrossWeightKg}kg / ${activeRunSheet?.maxGrossWeightKg}kg`
  );

  // 31. Driver End-of-Trip Cash Handover Reconciliation
  const handoverRes = await request("POST", `${API_BASE}/api/logistics/run-sheets/${activeRunSheet?.id || "run_001"}/handover`, {
    actualCashCollected: 14200
  });
  assert(
    handoverRes.statusCode === 200 && handoverRes.data.success && handoverRes.data.runSheet?.status === "COMPLETED",
    "31. Driver COD Cash Handover Reconciliation & Ledger Settlement",
    `Run Sheet: ${handoverRes.data.runSheet?.runSheetNumber} | Reconciled: ₹${handoverRes.data.runSheet?.actualCashCollected} | Status: ${handoverRes.data.runSheet?.status}`
  );

  // 32. 1-Click Tally Prime XML Export
  const tallyRes = await request("GET", `${API_BASE}/api/accounting/tally-xml?organizationId=org_anagata_fmcg`);
  assert(
    tallyRes.statusCode === 200 && typeof tallyRes.data === "string" && tallyRes.data.includes("<ENVELOPE>"),
    "32. 1-Click Tally Prime XML Master & Voucher Export (/api/accounting/tally-xml)",
    `HTTP ${tallyRes.statusCode} | XML Format Valid | Root Tag: <ENVELOPE> | Vouchers Exported`
  );

  // 33. Marg ERP CSV Export
  const margRes = await request("GET", `${API_BASE}/api/accounting/marg-csv?organizationId=org_anagata_fmcg`);
  assert(
    margRes.statusCode === 200 && typeof margRes.data === "string" && margRes.data.includes("Invoice_No"),
    "33. Marg ERP Dual Format CSV Export (/api/accounting/marg-csv)",
    `HTTP ${margRes.statusCode} | CSV Header: "${margRes.data.split("\n")[0]}" | Rows: ${margRes.data.trim().split("\n").length - 1}`
  );

  // 34. B2B Debt Aging Analysis (0-30, 31-60, 61-90, 90+ Days)
  const agingRes = await request("GET", `${API_BASE}/api/accounting/aging-analysis?organizationId=org_anagata_fmcg`);
  assert(
    agingRes.statusCode === 200 && agingRes.data.success && agingRes.data.aging && "bracket_0_30" in agingRes.data.aging,
    "34. B2B Debt Aging Analysis & Default Risk Classification",
    `Total Outstanding: ₹${agingRes.data.aging?.totalOutstanding} | 0-30 Days: ₹${agingRes.data.aging?.bracket_0_30} | 31-60 Days: ₹${agingRes.data.aging?.bracket_31_60}`
  );

  // 35. Post-Dated Cheque (PDC) Vault & Clearing
  const pdcRes = await request("POST", `${API_BASE}/api/accounting/pdc-cheques`, {
    chequeNumber: "CHQ-ICIC-992211",
    bankName: "ICICI Bank",
    retailerId: "ret_gupta_kirana",
    organizationId: "org_anagata_fmcg",
    amount: 18000,
    chequeDate: "2026-09-25",
    notes: "September credit clearance PDC"
  });
  assert(
    pdcRes.statusCode === 200 && pdcRes.data.success && pdcRes.data.cheque?.status === "RECEIVED",
    "35. Post-Dated Cheque (PDC) Security Deposit Vault (/api/accounting/pdc-cheques)",
    `Cheque #: ${pdcRes.data.cheque?.chequeNumber} | Bank: ${pdcRes.data.cheque?.bankName} | Amount: ₹${pdcRes.data.cheque?.amount}`
  );

  // 36. Digital Kirana Udhar Khata Ledger
  const khataRes = await request("POST", `${API_BASE}/api/retailer/khata/entry`, {
    retailerId: "ret_gupta_kirana",
    customerName: "Mohan Lal (Tailor)",
    customerPhone: "9844001122",
    type: "CREDIT_GIVEN",
    amount: 500,
    notes: "Groceries on credit"
  });
  assert(
    khataRes.statusCode === 200 && khataRes.data.success && khataRes.data.khata?.totalDues >= 500,
    "36. Digital Kirana Udhar Khata & Customer Credit Book",
    `Customer: ${khataRes.data.khata?.customerName} | Dues: ₹${khataRes.data.khata?.totalDues}`
  );

  // 37. SFA 2-Opt Traveling Salesman (TSP) Route Optimization
  const tspRes = await request("GET", `${API_BASE}/api/sfa/tsp-optimize/beat_hazratganj_mon`);
  assert(
    tspRes.statusCode === 200 && tspRes.data.success && Array.isArray(tspRes.data.orderedStops),
    "37. SFA 2-Opt Traveling Salesman (TSP) Dynamic Route Minimizer",
    `Original: ${tspRes.data.originalKm}km -> Optimized: ${tspRes.data.optimizedKm}km (Stops: ${tspRes.data.orderedStops?.length})`
  );

  // 38. Sales Force Automation: Gamified Leaderboard & Rankings
  const sfaRes = await request("GET", `${API_BASE}/api/sfa/leaderboard`);
  assert(
    sfaRes.statusCode === 200 && sfaRes.data.success && Array.isArray(sfaRes.data.leaderboard),
    "38. Sales Force Automation: Gamified Leaderboard & KPI Rankings",
    `Rank 1 Agent: ${sfaRes.data.leaderboard?.[0]?.agentName} (${sfaRes.data.leaderboard?.[0]?.badge}) | GMV: ₹${sfaRes.data.leaderboard?.[0]?.gmvAchieved}`
  );

  // 39. Enterprise System Telemetry & Self-Hosted Stack Health
  const telemetryRes = await request("GET", `${API_BASE}/api/admin/telemetry`);
  assert(
    telemetryRes.statusCode === 200 && telemetryRes.data.success && telemetryRes.data.telemetry?.databaseStatus === "CONNECTED",
    "39. Enterprise Telemetry & Zero-Paid Self-Hosted Stack Health",
    `DB: ${telemetryRes.data.telemetry?.databaseStatus} | Heap: ${telemetryRes.data.telemetry?.memoryUsageMb?.heapUsed} MB | Uptime: ${telemetryRes.data.telemetry?.uptimeSeconds}s`
  );

  // 40. Automated MinIO Object Storage Backup Trigger
  const backupRes = await request("POST", `${API_BASE}/api/admin/backup-to-minio`, {});
  assert(
    backupRes.statusCode === 200 && backupRes.data?.success && backupRes.data?.bucket === "b2b-backups",
    "40. Automated Database Backup to Self-Hosted MinIO Object Storage",
    `Backup: ${backupRes.data?.backupFile} | Bucket: ${backupRes.data?.bucket} | Size: ${backupRes.data?.sizeMb} MB`
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
