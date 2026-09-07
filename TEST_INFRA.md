# Test Infrastructure & Verification Architecture
## Hyperlocal B2B Sales Aggregator — 100-Feature Enterprise Expansion (R1–R7)

**Document Version:** 2.1.0  
**Author:** Test Writer (`test_writer_e2e`)  
**Scope:** 100 Platform Features, Requirements R1 through R7, End-to-End Automation & Cloud Verification  
**Integrity Standard:** Zero Cheats, Opaque-Box HTTP Contracts, Zero Paid External APIs  

---

## 1. 4-Tier Testing Methodology Overview

To guarantee enterprise robustness across the Fastify API backend, Next.js Web Portal, Expo/React Native Mobile Client, and PostgreSQL database, the test infrastructure is structured into four distinct, progressive tiers:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     TIER 4: REAL-WORLD WORKLOADS                          │
│  High concurrency stock locks, 25-store 2-opt TSP, bulk ERP 500-row stress │
├───────────────────────────────────────────────────────────────────────────┤
│                   TIER 3: CROSS-FEATURE COMBINATIONS                      │
│   Multi-role lifecycles: Signup ➔ KYC ➔ Creds ➔ BuyBox ➔ Lock ➔ SLA Reroute │
├───────────────────────────────────────────────────────────────────────────┤
│                  TIER 2: BOUNDARY & CORNER CASES                          │
│   15m GPS collision boundary (14.9m vs 15.1m), 15-min TTL, MOQ/MOV, FEFO │
├───────────────────────────────────────────────────────────────────────────┤
│                     TIER 1: FEATURE COVERAGE                              │
│   Exhaustive contract verification for all 100 features and R1–R7 routes   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Tier Definitions:
1. **Tier 1: Feature Coverage**  
   Verifies that every single feature (Features 1–100) and API route responds with the exact HTTP status codes, payload structures, schema types, and business data defined in `PROJECT.md` and `ORIGINAL_REQUEST.md`.
2. **Tier 2: Boundary & Corner Cases**  
   Tests mathematical boundaries, geofence radii (14.9m collision vs 15.1m permitted), inventory thresholds (zero stock, negative stock), date horizons (near-expiry, past-expiry), rate limits, and schema edge cases (special characters, malformed GSTIN/HSN).
3. **Tier 3: Cross-Feature Combinations**  
   Verifies multi-step workflows spanning multiple platform roles and modules. Confirms data consistency when state changes cascade across the relational database and in-memory caches.
4. **Tier 4: Real-World Workloads & Stress Testing**  
   Simulates realistic production stress: concurrent checkouts contending for limited stock, rapid agent check-ins across multiple beats, high-volume catalog imports, and external service failure resilience (Evolution API failover).

---

## 2. Requirement Coverage Matrix (R1–R7)

| Req | Domain / Capability | Primary Endpoints | Test Suite Files |
|---|---|---|---|
| **R1** | Public Self-Service Signup & Super Admin KYC Approval Queue | `POST /api/signup/retailer`<br>`POST /api/signup/seller`<br>`GET /api/kyc/pending`<br>`POST /api/kyc/review`<br>`POST /api/kyc/upload` | `apps/api/tests/enterprise-expansion.test.js`<br>`scripts/verify-cloud.js` (Tests 49–52) |
| **R2** | Field Agent Assisted Onboarding & 15m GPS Exclusivity | `POST /api/onboarding` (with 15m GPS and phone uniqueness) | `apps/api/tests/enterprise-expansion.test.js`<br>`scripts/verify-cloud.js` (Tests 53–54) |
| **R3** | In-App Version Polling & Automatic Update Engine | `GET /api/app/version` | `apps/api/tests/enterprise-expansion.test.js`<br>`scripts/verify-cloud.js` (Test 55) |
| **R4** | Multi-Seller Master SKU Marketplace, Buy-Box & SLA Fallback | `GET /api/marketplace/buy-box/:id`<br>`POST /api/marketplace/stock-reservation/lock`<br>`POST /api/orders/sub-orders/:id/fallback-reroute` | `apps/api/tests/enterprise-expansion.test.js`<br>`scripts/verify-cloud.js` (Tests 56–59) |
| **R5** | Universal ERP Importer, Fuzzy Matcher, Persistent Memory & FEFO | `POST /api/seller/catalog/fuzzy-map`<br>`POST /api/seller/catalog/bulk-import`<br>`POST /api/erp/import/dry-run`<br>`POST /api/erp/column-mapper/memory` | `apps/api/tests/enterprise-expansion.test.js`<br>`scripts/verify-cloud.js` (Tests 60–64) |
| **R6** | Automated Beat Builder (2-Opt Routing) & Territory Exclusivity | `POST /api/beats/auto-build`<br>`POST /api/territory/transfer-store`<br>`POST /api/visits/checkin` | `apps/api/tests/enterprise-expansion.test.js`<br>`scripts/verify-cloud.js` (Tests 65–66) |
| **R7** | Retailer Margin Transparency, Velocity Alerts & Dispatch Command | `GET /api/orders/cart-profitability`<br>`GET /api/analytics/velocity/:retailerId/:skuId`<br>`GET /api/admin/dispatch-command` | `apps/api/tests/enterprise-expansion.test.js`<br>`scripts/verify-cloud.js` (Tests 67–69) |

---

## 3. Tier 1: Exhaustive 100-Feature Coverage Specification

Each of the 100 platform features is mapped to an authoritative test definition:

### Features 1–25: Core Marketplace, KYC & Onboarding
| Feature # | Feature Name | Test ID | Target Endpoint | Input Condition | Authoritative Expected Output |
|---|---|---|---|---|---|
| **1** | Public Kirana Retailer Signup | `T1-F01` | `POST /api/signup/retailer` | Complete Kirana registration payload | HTTP 201, `status: "PENDING_APPROVAL"`, returns `retailerId` |
| **2** | Public Wholesaler Seller Signup | `T1-F02` | `POST /api/signup/seller` | Complete distributor registration payload | HTTP 201, `status: "PENDING_APPROVAL"`, returns `sellerId` |
| **3** | MinIO S3 Document Storage | `T1-F03` | `POST /api/kyc/upload` | Base64 file upload (PDF/image) | HTTP 200, returns sanitized `documentUrl` |
| **4** | PENDING_APPROVAL Account Queue | `T1-F04` | `GET /api/kyc/pending` | Unverified accounts present | HTTP 200, array containing newly queued retailer/seller |
| **5** | Super Admin KYC Review Desk | `T1-F05` | `POST /api/kyc/review` | Super Admin approval decision | HTTP 200, `status: "ACTIVE"`, credentials returned |
| **6** | Automated Credential Provisioning | `T1-F06` | `POST /api/kyc/review` | KYC approval of applicant | Returns `credentials: { loginId, temporaryPassword, portalUrl }` |
| **7** | Evolution API WhatsApp KYC Dispatch | `T1-F07` | `POST /api/kyc/review` | KYC approval of applicant | Dispatches WhatsApp message with credentials to owner phone |
| **8** | Field Agent Assisted Onboarding | `T1-F08` | `POST /api/onboarding` | Agent submits store details | HTTP 201, returns auto-generated login credentials |
| **9** | WhatsApp Assisted Welcome Alert | `T1-F09` | `POST /api/onboarding` | Successful store onboarding | Logs WhatsApp message with credentials and 1-click login link |
| **10** | 15m GPS Collision Rejection | `T1-F10` | `POST /api/onboarding` | Lat/Lon within 15m of existing store | HTTP 409 Conflict, `error: "GPS_COLLISION_15M"` |
| **11** | Phone Duplicate Rejection | `T1-F11` | `POST /api/onboarding` | Duplicate phone number | HTTP 409 Conflict, `error: "PHONE_DUPLICATE"` |
| **12** | Backend App Version Polling | `T1-F12` | `GET /api/app/version` | Unauthenticated public request | HTTP 200, contains `buildHash`, `timestamp`, `apkDownloadUrl` |
| **13** | Web PWA Service Worker Manifest | `T1-F13` | `GET /manifest.json` | Web browser PWA fetch | HTTP 200, valid Web App Manifest JSON |
| **14** | Mobile OTA Update Link | `T1-F14` | `GET /downloads/b2b-sales-aggregator.apk` | Sideload download request | HTTP 200/302, valid APK binary stream |
| **15** | Supply BD Agent Portal | `T1-F15` | `GET /api/sellers` | BD Agent queries distributor list | HTTP 200, list of distributors with status |
| **16** | Multi-Seller Master SKU Architecture | `T1-F16` | `GET /api/marketplace/master-skus` | Query master SKU catalog | HTTP 200, items with multiple linked seller offers |
| **17** | Automated Buy-Box Algorithm | `T1-F17` | `GET /api/marketplace/buy-box/:id` | Retailer GPS coords provided | HTTP 200, winner selected by composite score |
| **18** | Distributor Stock Reservation Locks | `T1-F18` | `POST /api/marketplace/stock-reservation/lock` | Checkout stock hold requested | HTTP 200, 15-min TTL lock created, available stock reduced |
| **19** | Secondary Seller SLA Fallback Routing | `T1-F19` | `POST /api/orders/sub-orders/:id/fallback-reroute` | Primary seller SLA breached | HTTP 200, sub-order reassigned to secondary seller |
| **20** | Universal ERP Fuzzy Column Matcher | `T1-F20` | `POST /api/seller/catalog/fuzzy-map` | Raw ERP headers array | HTTP 200, canonical mappings with confidence scores |
| **21** | Persistent Column Mapping Memory | `T1-F21` | `POST /api/erp/column-mapper/memory` | Save mapping by file header hash | HTTP 200, recallable for subsequent uploads |
| **22** | ERP Dry-Run Schema Validation | `T1-F22` | `POST /api/erp/import/dry-run` | Mixed valid/invalid CSV rows | HTTP 200, exact row error breakdown without DB write |
| **23** | Tally Prime XML Master Ingestion | `T1-F23` | `POST /api/seller/catalog/bulk-import` | Tally XML `<ENVELOPE>` payload | HTTP 200, parsed stock items and opening balances |
| **24** | Marg ERP CSV Ingestion | `T1-F24` | `POST /api/seller/catalog/bulk-import` | Marg CSV with `Rate_A` & `MM/YY` | HTTP 200, normalized prices and ISO expiry dates |
| **25** | FEFO Batch Expiry Prioritization | `T1-F25` | `POST /api/warehouse/allocate-fefo` | Order quantity from multi-batch stock | HTTP 200, fulfills from earliest expiring batch |

### Features 26–50: SFA, Beats, Routing & Margins
| Feature # | Feature Name | Test ID | Target Endpoint | Input Condition | Authoritative Expected Output |
|---|---|---|---|---|---|
| **26** | Automated Beat Builder & Clustering | `T1-F26` | `POST /api/beats/auto-build` | Pool of 15–25 onboarded Kiranas | HTTP 200, clusters assigned to days Monday–Saturday |
| **27** | 2-Opt Spatial TSP Optimization | `T1-F27` | `POST /api/beats/auto-build` | Unordered store coordinates | HTTP 200, `optimizedKm < originalKm`, zero edge crossings |
| **28** | Non-Overlapping Store Exclusivity | `T1-F28` | `POST /api/onboarding` | Duplicate store addition across agents | HTTP 409 Conflict, exclusivity maintained |
| **29** | Territory Transfer Workflow | `T1-F29` | `POST /api/territory/transfer-store` | Store reallocated from Agent A to B | HTTP 200, ownership updated, audit log persisted |
| **30** | PostGIS Geofenced Check-In (<100m) | `T1-F30` | `POST /api/visits/checkin` | Check-in at 45m distance | HTTP 200, `isWithinGeofence: true` |
| **31** | Geofence Anti-Spoofing (>100m) | `T1-F31` | `POST /api/visits/checkin` | Check-in at 450m distance | HTTP 403 Forbidden, `isWithinGeofence: false` |
| **32** | Planned vs Actual Visit Tracking | `T1-F32` | `GET /api/sfa/visits/summary` | Query agent daily performance | HTTP 200, planned count vs actual check-in count |
| **33** | Retailer Gross Margin Badges on MRP | `T1-F33` | `GET /api/marketplace/products` | Catalog listing with MRP & wholesale | Returns `mrp`, `wholesalePrice`, `marginRupees`, `marginPct` |
| **34** | Sort by Highest Margin Catalog Filter | `T1-F34` | `GET /api/marketplace/products?sortBy=margin` | Request sorted catalog | HTTP 200, items sorted descending by `marginPct` |
| **35** | Cart Profitability Summary Bar | `T1-F35` | `POST /api/orders/cart-profitability` | Multi-item wholesale cart | HTTP 200, returns total projected retail profit and margin % |
| **36** | Sell-Through Velocity Calculation | `T1-F36` | `GET /api/analytics/velocity/:retailer/:sku` | 30-day POS sales history | Returns `dailySalesVelocity` and `liquidationDays` |
| **37** | Slow-Moving SKU Warning Alert | `T1-F37` | `GET /api/analytics/velocity/:retailer/:sku` | Item liquidation period > 30 days | Returns `slowMovingAlert: true` with warning text |
| **38** | Super Admin Operations HQ Dashboard | `T1-F38` | `GET /api/admin/operations/hq` | Operations telemetry request | HTTP 200, live active beats, agents, and network metrics |
| **39** | Live Seller Dispatch TAT Countdown | `T1-F39` | `GET /api/admin/dispatch-command` | Orders in `ACCEPTED` state | Returns real-time countdown to dispatch deadline |
| **40** | Seller SLA Compliance Scorecards | `T1-F40` | `GET /api/sellers/:id/scorecard` | Distributor historical performance | Returns on-time delivery %, fulfillment rate, rating |
| **41** | Field Agent Beat Telemetry | `T1-F41` | `GET /api/sfa/telemetry` | Query agent live beat status | Returns current location, visited stops, remaining stops |
| **42** | Multi-Vendor Cart Splitting | `T1-F42` | `POST /api/orders/checkout` | Cart containing items from 2 sellers | HTTP 201, splits into 2 distinct vendor sub-orders |
| **43** | SKU-Level MOQ Enforcement | `T1-F43` | `POST /api/orders/checkout` | Item quantity < `minimumOrderQuantity` | HTTP 400 Bad Request, `error: "MOQ_VIOLATION"` |
| **44** | Seller-Level MOV Enforcement | `T1-F44` | `POST /api/orders/checkout` | Seller subtotal < `minimumOrderValue` | HTTP 400 Bad Request, `error: "MOV_VIOLATION"` |
| **45** | WhatsApp 4-Digit Delivery OTP Dispatch | `T1-F45` | `POST /api/delivery/dispatch` | Seller dispatches sub-order | Sub-order `status: "DISPATCHED"`, dispatches OTP WhatsApp |
| **46** | Incorrect Delivery OTP Rejection | `T1-F46` | `POST /api/delivery/verify-otp` | Delivery agent inputs wrong OTP | HTTP 400 Bad Request, delivery not confirmed |
| **47** | Proof-of-Delivery OTP Verification | `T1-F47` | `POST /api/delivery/verify-otp` | Correct 4-digit OTP supplied | HTTP 200, `status: "DELIVERED"`, logs transit minutes |
| **48** | Seller Cost-Savings Intelligence | `T1-F48` | `POST /api/analytics/roi-simulator` | Monthly order volume ₹15,00,000 | Returns ₹27,000/mo savings, 81.8% payroll reduction |
| **49** | Retail POS Seeded Inventory | `T1-F49` | `GET /api/pos/products` | Query kirana retail inventory | Returns products with barcode, selling price, margin |
| **50** | Retail POS Custom SKU Creation | `T1-F50` | `POST /api/pos/products` | Retailer adds unbranded loose item | HTTP 201, product persisted in POS inventory |

### Features 51–75: POS, Udhar Khata, CRM & Wholesaler Tools
| Feature # | Feature Name | Test ID | Target Endpoint | Input Condition | Authoritative Expected Output |
|---|---|---|---|---|---|
| **51** | Platform Delivery Direct POS Inwarding | `T1-F51` | `POST /api/pos/inward-delivery` | Delivered sub-order ID | Automatically syncs wholesale stock into POS stock |
| **52** | Cash Checkout POS Generation | `T1-F52` | `POST /api/pos/checkout` | Payment mode `CASH` | Generates retail receipt, decrements POS inventory |
| **53** | Customer Udhar Khata Ledger Entry | `T1-F53` | `POST /api/pos/checkout` | Payment mode `KHATA` | Creates customer ledger entry with balance update |
| **54** | SFA In-Store Share-of-Shelf Audit | `T1-F54` | `POST /api/sfa/shelf-audit` | Shelf facing measurements | Computes brand share % vs competitor facings |
| **55** | Super Admin GMV Ticker & Analytics | `T1-F55` | `GET /api/admin/analytics/overview` | Platform analytics query | Returns total GMV, order velocity, network savings |
| **56** | OpenStreetMap Ward Heatmaps | `T1-F56` | `GET /api/admin/analytics/heatmaps` | Geographic zone analytics query | Returns order density and Kirana concentration by ward |
| **57** | FMCG Brand Share Analytics | `T1-F57` | `GET /api/admin/analytics/brand-share` | Brand category breakdown | Returns market share % across product categories |
| **58** | 45+ Day Credit NPA Radar | `T1-F58` | `GET /api/admin/analytics/credit-npa` | Overdue credit portfolio check | Flags retailers with overdue credit > 45 days |
| **59** | Udaan Brand Stores Listing | `T1-F59` | `GET /api/brand-stores` | Query brand flagship hubs | Returns verified brand flagship stores |
| **60** | FMCG Category Master Tree | `T1-F60` | `GET /api/categories` | Catalog category navigation | Returns nested categories with HSN defaults |
| **61** | GST Tax Invoice PDF Generation | `T1-F61` | `GET /api/invoices/:orderId` | Completed order ID | Returns compliant B2B tax invoice with CGST/SGST |
| **62** | CRM Retailer Lead Pipeline | `T1-F62` | `GET /api/crm/leads` | Sales agent query | Returns leads categorized by pipeline stage |
| **63** | Payment Collection Voucher Logging | `T1-F63` | `POST /api/payments/voucher` | Cash/cheque collection record | Generates signed payment receipt voucher |
| **64** | Agent Monthly Sales Targets | `T1-F64` | `GET /api/sfa/targets/:agentId` | Agent KPI review | Returns target GMV, visit strike rate, new onboards |
| **65** | Wholesaler Product Studio | `T1-F65` | `POST /api/products` | Distributor lists new SKU | Persists product with GST rate and landed pricing |
| **66** | Promotional SKU Bundles | `T1-F66` | `POST /api/bundles` | Combine multiple SKUs into combo | Creates bundle offer with special discounted price |
| **67** | Retailer Credit Line Issuance | `T1-F67` | `POST /api/credit/assign` | Distributor assigns credit terms | Allocates ₹25,000 credit limit with 14-day terms |
| **68** | Wholesaler B2B Statement of Accounts | `T1-F68` | `GET /api/ledger/:retailerId` | Retailer account ledger query | Returns running balance, debits, credits, and invoices |
| **69** | E-Way Bill JSON Payload Generation | `T1-F69` | `GET /api/invoices/:id/eway-bill` | Order value > ₹50,000 | Returns NIC-compliant Part-A E-Way Bill JSON |
| **70** | OpenStreetMap Reverse Geocoding | `T1-F70` | `GET /api/geo/reverse` | Latitude and longitude | Returns verified street address and ward name |
| **71** | Near-Expiry Discount Allocation | `T1-F71` | `POST /api/inventory/near-expiry-flag` | Batch expiring within 30 days | Applies 15% automatic liquidation discount |
| **72** | Master Carton QR / Barcode Labels | `T1-F72` | `GET /api/orders/sub-orders/:id/labels` | Dispatched sub-order | Generates printable barcode shipping labels |
| **73** | Master Purchase Order Aggregator | `T1-F73` | `GET /api/procurement/master-po` | Aggregate pending retailer orders | Compiles consolidated factory purchase order |
| **74** | Sales Return Credit Notes | `T1-F74` | `POST /api/returns/credit-note` | Damaged goods return | Issues GST credit note and restores inventory |
| **75** | Tata Ace Logistics Run Sheet | `T1-F75` | `GET /api/logistics/run-sheet/:routeId` | Daily dispatch route | Returns loading sequence and drop-off manifest |

### Features 76–100: Advanced Logistics, Financials & Security
| Feature # | Feature Name | Test ID | Target Endpoint | Input Condition | Authoritative Expected Output |
|---|---|---|---|---|---|
| **76** | Delivery Driver COD Cash Handover | `T1-F76` | `POST /api/logistics/cod-handover` | Driver deposits collected cash | Reconciles collected cash with distributor ledger |
| **77** | Tally Prime XML Export | `T1-F77` | `GET /api/erp/export/tally-xml` | Export seller transactions | Returns valid Tally `<ENVELOPE>` accounting XML |
| **78** | Marg ERP CSV Export | `T1-F78` | `GET /api/erp/export/marg-csv` | Export seller inventory | Returns Marg-compatible CSV format |
| **79** | Retailer Debt Aging Buckets | `T1-F79` | `GET /api/credit/aging/:retailerId` | Credit ledger query | Returns 0–15, 16–30, 31–45, 45+ day debt buckets |
| **80** | Post-Dated Cheque (PDC) Vault | `T1-F80` | `POST /api/credit/pdc-register` | Register physical security cheque | Records cheque number, bank, amount, maturity date |
| **81** | Kirana Khata Customer Statements | `T1-F81` | `GET /api/khata/statement/:customerId` | Retail customer statement | Returns chronological purchases and payments |
| **82** | Sales Agent Leaderboard | `T1-F82` | `GET /api/sfa/leaderboard` | Monthly team performance | Returns agents ranked by GMV and onboardings |
| **83** | Real-Time Agent GPS Breadcrumbs | `T1-F83` | `POST /api/sfa/telemetry/ping` | Agent app periodic GPS ping | Appends timestamped coordinate to breadcrumb trail |
| **84** | MinIO Automated Database Backup | `T1-F84` | `POST /api/admin/backups/trigger` | Scheduled backup trigger | Creates encrypted SQL dump and uploads to MinIO |
| **85** | Stock Reservation Reaper Service | `T1-F85` | `POST /api/marketplace/stock-reservation/reap` | Stale reservations (>15 mins) | Expires uncommitted locks and restores stock pool |
| **86** | Distributor Fulfillment Reliability Docking | `T1-F86` | `POST /api/sellers/:id/dock-score` | Seller SLA breach event | Decrements reliability score by 0.20 points |
| **87** | Buy-Box Pricing Volume Slabs | `T1-F87` | `GET /api/marketplace/buy-box/:id` | Tiered pricing slabs defined | Returns tiered wholesale rates for 10+, 50+, 100+ units |
| **88** | Automated Kirana Reorder Triggers | `T1-F88` | `GET /api/analytics/reorder-recommendations` | In-store stock < safety threshold | Generates 1-click cart replenishment suggestions |
| **89** | Multi-Language WhatsApp Alert Templates | `T1-F89` | `POST /api/alerts/whatsapp/multilingual` | Language preference: Hindi/English | Dispatches WhatsApp in preferred vernacular script |
| **90** | Offline Mobile Sync Queue | `T1-F90` | `POST /api/mobile/sync` | Batched offline visit check-ins | Idempotently replays offline visits with true timestamps |
| **91** | Barcode Scanner SKU Lookup | `T1-F91` | `GET /api/marketplace/lookup-barcode/:ean` | Scan EAN-13 barcode | Instantly resolves Master SKU and Buy-Box offer |
| **92** | Dynamic Delivery Surcharge Engine | `T1-F92` | `GET /api/marketplace/delivery-fee` | Distance beyond free delivery radius | Computes ₹/km surcharge based on distance delta |
| **93** | Seller Minimum Order Slabs | `T1-F93` | `POST /api/orders/checkout` | Cart MOV verification | Validates minimum order value per seller warehouse |
| **94** | Retailer Order History & Repeat 1-Click | `T1-F94` | `POST /api/orders/:id/reorder` | Previous completed order | Reconstructs cart with current live stock & prices |
| **95** | Super Admin Audit Logging | `T1-F95` | `GET /api/admin/audit-logs` | Query critical admin mutations | Returns timestamped log of approvals, edits, deletes |
| **96** | Role-Based Access Control (RBAC) | `T1-F96` | `GET /api/admin/kyc-queue` | Retailer attempts admin access | Rejects with HTTP 403 Forbidden |
| **97** | OpenStreetMap Interactive Pin Picker | `T1-F97` | `GET /api/geo/coordinates` | Street address query | Returns precision GPS coordinates for map picker |
| **98** | Mobile APK Build Hash Verification | `T1-F98` | `GET /api/app/version` | Mobile app compares build hashes | Prompts OTA update if server buildHash differs |
| **99** | Web PWA Service Worker Cache Invalidation | `T1-F99` | `GET /api/app/version` | Web client version polling | Triggers cache bust and update toast if version newer |
| **100** | Zero-Paid Live Cloud Verification Suite | `T1-F100` | `node scripts/verify-cloud.js` | Full production test run | 100% pass across all 69 assertions with zero paid APIs |

---

## 4. Tier 2: Boundary & Corner Cases Specification

### 4.1. Geolocation & Spatial Boundaries
- **15-Meter Collision Boundary ($D = 15.0\text{ m}$)**:
  - Coordinate A: `(26.846700, 80.946200)` (Gupta Kirana)
  - Coordinate B at 14.8m: `(26.846830, 80.946200)` ➔ **MUST REJECT (HTTP 409 Conflict, `GPS_COLLISION_15M`)**
  - Coordinate C at 15.2m: `(26.846840, 80.946200)` ➔ **MUST ALLOW (HTTP 201 Created)**
  - Coordinate D at 0.0m (Identical GPS): ➔ **MUST REJECT (HTTP 409 Conflict)**
- **Geofence Check-in Boundary ($D = 100.0\text{ m}$)**:
  - Agent check-in at 98.5m ➔ **HTTP 200 OK (`isWithinGeofence: true`)**
  - Agent check-in at 101.2m ➔ **HTTP 403 Forbidden (`isWithinGeofence: false`)**

### 4.2. Stock Reservation TTL & Concurrency
- **15-Minute Expiration Window**:
  - Lock created at $T_0 = \text{now}$.
  - Verification at $T_0 + 14\text{m } 50\text{s}$: Lock status is `ACTIVE`; stock remains reserved.
  - Verification at $T_0 + 15\text{m } 05\text{s}$: Lock status is `EXPIRED`; stock returned to available pool.
- **Over-Reservation Prevention**:
  - Available stock: 10 units.
  - Concurrent checkout 1 requests 7 units ➔ Approved (3 units remaining).
  - Concurrent checkout 2 requests 5 units ➔ **Rejected (HTTP 409 Conflict / Insufficient Stock)**.

### 4.3. ERP Ingestion Business Rule Boundaries
- **MRP vs. Wholesale Price Inversion**:
  - Valid: MRP ₹100, Wholesale ₹82 ➔ Valid retail margin (18%).
  - Invalid: MRP ₹80, Wholesale ₹82 ➔ **Flagged: `MRP_LESS_THAN_WHOLESALE` (Row rejected)**.
- **Negative Stock Values**:
  - Stock: `0` ➔ Valid (Listed as Out of Stock).
  - Stock: `-5` ➔ **Flagged: `NEGATIVE_STOCK_INVALID` (Row rejected)**.
- **HSN & GST Validation**:
  - HSN: `19053100` (8 digits) ➔ Valid.
  - HSN: `1905` (4 digits) ➔ Valid.
  - HSN: `190` (3 digits) ➔ **Flagged: `INVALID_HSN_FORMAT`**.
  - GST Rate: `18` ➔ Valid.
  - GST Rate: `17` ➔ **Flagged: `INVALID_GST_SLAB` (Must be 0, 5, 12, 18, or 28)**.

---

## 5. Tier 3: Cross-Feature Integration Workflows

### 5.1. Workflow 1: Kirana Retailer Full Lifecycle
```
[1. Public Signup] ────► [2. PENDING_APPROVAL] ────► [3. Admin KYC Review]
(/signup/retailer)         (Restricted Access)         (Doc Inspection Desk)
                                                                │ (Approve)
                                                                ▼
[6. Checkout] ◄──── [5. Buy-Box Catalog] ◄──── [4. WhatsApp Credentials]
(15-min Lock)         (MRP Margin Badges)        (Login ID & Password)
      │
      ▼
[7. Sub-Order Created] ────► [8. Seller Dispatch] ────► [9. Delivery OTP]
(Multi-vendor Split)         (WhatsApp Notification)    (Proof-of-Delivery)
                                                                │
                                                                ▼
                                                        [10. POS Stock Sync]
                                                        (Direct Inwarding)
```

### 5.2. Workflow 2: Wholesale Distributor Catalog & SLA Fallback
```
[1. Seller Signup] ──► [2. KYC Approved] ──► [3. Universal ERP Import]
                                             (Fuzzy Mapping + Dry Run)
                                                        │
                                                        ▼
[6. Order Rerouted] ◄── [5. SLA Timeout] ◄── [4. Competing Buy-Box Listing]
(Secondary Seller)      (>120 mins Unaccepted) (Master SKU Winner)
```

### 5.3. Workflow 3: Field Sales Agent Beat Clustering & Store Exclusivity
```
[1. Agent Onboards 20 Stores] ──► [2. 15m Collision Verification]
                                  (Rejects GPS/Phone Duplicates)
                                                │
                                                ▼
[4. Territory Transfer] ◄── [3. Automated Beat Builder]
(Audit-Logged Reassign)     (2-Opt TSP Route Optimization)
```

---

## 6. Tier 4: Real-World Workload & Stress Scenarios

1. **High-Concurrency Stock Reservation Lock**:
   - 50 concurrent virtual agents attempt to reserve 2 units each on a Master SKU listing with only 30 available units.
   - Assert: Exactly 15 reservations succeed (30 units allocated); exactly 35 fail with HTTP 409 Conflict.
   - Assert: Total reserved units never exceeds 30.
2. **2-Opt Spatial TSP Optimization Under Load**:
   - Execute auto-beat clustering on 25 stores scattered across urban Lucknow.
   - Assert: Algorithm completes within $<100\text{ms}$.
   - Assert: Optimized tour length is at least 15% shorter than unoptimized sequence.
3. **500-Row ERP Catalog Bulk Ingestion**:
   - Stream a 500-row Marg ERP CSV with mixed valid rows, missing MRPs, and negative stocks.
   - Assert: Ingestion runs in $<2.5\text{s}$ without event-loop starvation.
   - Assert: Error summary returns exact count of valid vs invalid rows with cell-level error markers.
4. **Resilient WhatsApp Messaging (Evolution API)**:
   - Execute 20 onboarding/approval events while simulating network jitter to `https://evo.anagataitsolutions.in`.
   - Assert: Backend does not crash; gracefully logs delivery status; user creation transaction completes successfully.

---

## 7. Zero-Paid External API Policy & Verification

To comply with the strict project mandate, every external integration relies exclusively on free, self-hosted, or open-source components:

| Component | Self-Hosted / Open-Source Solution | Zero-Paid Proof |
|---|---|---|
| **Geocoding & Maps** | OpenStreetMap (OSM) Nominatim & Leaflet vector tiles | Free open data, no Google Maps API keys |
| **Routing & Distance** | Native in-process Haversine & PostgreSQL PostGIS (`ST_Distance`) | Pure mathematical algorithm, no Mapbox/Google Roads API |
| **Object Storage (KYC/Photos)** | Self-hosted MinIO (S3-compatible) on Coolify VPS | Self-hosted storage on user's own VPS |
| **Transactional WhatsApp** | Evolution API (`https://evo.anagataitsolutions.in`) over Baileys | Self-hosted WhatsApp Web session, zero Twilio/Meta Cloud API charges |
| **Optimization Algorithms** | In-process 2-opt TSP, Levenshtein fuzzy string distance | Native Node.js execution, zero SaaS optimizers |

---

## 8. Test Execution Commands & Tooling

### Local Integration Test Suites:
```powershell
# Run the complete Enterprise Expansion test suite (R1–R7)
node --test apps/api/tests/enterprise-expansion.test.js

# Run existing regression test suites
node --test apps/api/tests/api.test.js
node --test apps/api/tests/advanced-100-features.test.js
node --test apps/api/tests/four-pillars-ecosystem.test.js

# Run all test suites in parallel
node --test apps/api/tests/*.test.js
```

### Live Cloud Production Verification:
```powershell
# Run 69 live production assertions against Coolify VPS
node scripts/verify-cloud.js
```

---

## 9. Test Defect Escalation Protocol

As a Test Writer, I write and maintain **test code only**. If an automated test fails due to a defect in implementation code:
1. Document the failure in `handoff.md` with:
   - Exact endpoint and HTTP method
   - Request payload
   - Actual response status and body
   - Expected response per `PROJECT.md` contract
2. Escalate immediately to the implementing worker (`worker_m1` or appropriate milestone agent).
3. Under no circumstances may the test writer modify application code to bypass test assertions.
