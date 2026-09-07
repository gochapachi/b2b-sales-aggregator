# Original User Request

## 2026-09-06T12:26:43Z

Build and deploy the complete Hyperlocal B2B Sales Aggregator platform onto the user's Coolify VPS (https://server.anagataitsolutions.in), compile a downloadable standalone Android APK for physical smartphone testing, and execute end-to-end multi-role verification.

Working directory: `C:\Users\sanje\.gemini\antigravity\scratch\b2b-sales-aggregator`
Integrity mode: development

## Requirements

### R1. Coolify Cloud Stack Deployment
Deploy the full application stack onto the user's Ubuntu 24.04 VPS via Coolify:
- Backend API deployed and accessible at `https://api-b2b.anagataitsolutions.in`
- Next.js Web Portal deployed and accessible at `https://b2b.anagataitsolutions.in`
- PostgreSQL 16 database provisioned with persistent storage, initialized with complete relational schemas and seed data
- Direct integration configured with the running Evolution API at `https://evo.anagataitsolutions.in` for transactional WhatsApp alerts

### R2. Standalone Android APK Compilation
Compile and package the React Native / Expo mobile application (`apps/mobile`) into an installable `.apk` file:
- Supports all 3 operational roles: Field Sales Agent (geofenced beat routes), Brand/Wholesaler (live order dispatch & OTP verification), and Retailer (wholesale catalog & active OTP tracking)
- Package must be directly downloadable and installable on physical Android devices without requiring local Metro development servers
- Output the resulting `.apk` file to an easily accessible path with sideloading instructions

### R3. End-to-End System Testing & Verification
Verify the entire system end-to-end across web and mobile surfaces:
- Validate that the Geofence engine strictly enforces <100m check-ins and rejects spoofed/distant visits
- Validate that multi-vendor carts correctly validate SKU-level MOQ and Seller-level MOV, then auto-split into vendor sub-orders
- Validate that transactional WhatsApp alerts (itemized bills and 4-digit Delivery OTPs) dispatch properly via Evolution API
- Validate that entering the 4-digit Delivery OTP successfully marks the order delivered and logs transit duration in minutes
- Verify the Seller Cost-Savings Intelligence Simulator (confirming ₹27,000/mo net savings and 81.8% payroll reduction with 0% commission on a ₹6,000 fixed subscription)

## Acceptance Criteria

### Production Cloud Hosting
- [ ] Backend API returns HTTP 200 on `https://api-b2b.anagataitsolutions.in/health`.
- [ ] Web Portal is publicly live on `https://b2b.anagataitsolutions.in` with all 4 dashboard role views operational.
- [ ] Database containers and environment variables verified on Coolify.

### Android Package Delivery
- [ ] Standalone Android `.apk` is built, signed for debug/release installation, and stored in a reachable output directory.
- [ ] APK installs and launches cleanly on Android with role navigation.

### Automated End-to-End Verification
- [ ] Automated integration test suite runs and passes with zero failures.
- [ ] Proof of delivery OTP verification lifecycle and WhatsApp dispatch logs documented.

## 2026-09-07T06:44:04Z

Build and deploy the complete 100-feature enterprise expansion for the Hyperlocal B2B Sales Aggregator platform, including self-service signups with Super Admin KYC approval queues, agent-assisted onboarding with automated ID/password generation and WhatsApp dispatch, automatic in-app update mechanisms, and multi-seller ERP column mapping.

Working directory: `C:\Users\sanje\.gemini\antigravity\scratch\b2b-sales-aggregator`
Integrity mode: development

## Requirements

### R1. Self-Service Retailer & Seller Signup with Admin KYC Approval Queue
- Implement public registration workflows for both Kirana Retailers and Wholesale Sellers/Distributors (`/signup/retailer` and `/signup/seller`).
- Collect store/business name, owner contact details, verified WhatsApp phone, physical address, OpenStreetMap GPS geolocation, document type (GSTIN, PAN, Udyam, or Trade License), and document/shop photos uploaded to self-hosted MinIO.
- Newly registered accounts enter `PENDING_APPROVAL` status with restricted access until verified.
- Super Admin portal must include an interactive KYC Inspection Queue where admins can inspect submitted documents, approve or reject with reasons, and upon approval, automatically provision active account credentials.
- Instantly notify the applicant via Evolution API WhatsApp message upon approval containing their verified credentials and login portal URL.

### R2. Field Agent Assisted Onboarding with Automated ID & Password Provisioning
- When a Field Sales Agent onboards a Kirana store or a Supply BD Agent onboards a distributor, the system must automatically generate a unique Login ID (registered phone or business code) and a cryptographically secure random password.
- Store records must immediately link these credentials to the user profile.
- Send an automated welcome notification via Evolution API WhatsApp to the onboarded owner's phone containing their Login ID, temporary password, and 1-click login link.
- Enforce strict store exclusivity: database-level uniqueness on GPS coordinates (within 15m radius) and store identification ensuring no two sales agents can claim or add the same retail store to their active beat.

### R3. In-App Automatic Updates (Web PWA & Mobile OTA Engine)
- Implement an automated client update detection system for both web and mobile environments.
- **Web / PWA**: Register a service worker lifecycle listener (`sw.js` / Next.js PWA) and client-side version polling against `GET /api/app/version`. When a new deployment is detected on Coolify, display a non-intrusive update badge/toast (*"A new update is available. Click to refresh"*) that performs cache busting and reloads the latest production build.
- **Mobile Application**: Integrate an in-app OTA version checker that prompts users when a new `.apk` release is compiled, offering a direct 1-click update download from `https://b2b.anagataitsolutions.in/downloads/b2b-sales-aggregator.apk`.

### R4. Supply BD Agent Portal & Multi-Seller Master SKU Marketplace (Features 1–15, 61–72)
- Provide a dedicated Supply BD Agent portal to recruit, onboard, and manage FMCG distributors and manufacturers.
- Support multiple distinct sellers listing and competing on the exact same Master SKU (e.g. *Tata Salt 1kg* or *Parle-G 800g*) with individual landed costs, stock levels, and MOQ volume slabs.
- Implement an automated Buy-Box algorithm surfacing the top seller based on landed wholesale cost, proximity (PostGIS), and fulfillment reliability rating.
- Implement distributor stock reservation locks during checkout and automatic secondary-seller fallback routing if a primary distributor fails to accept within SLA.

### R5. Universal ERP Bulk Product Importer & Interactive Column Mapper (Features 16–30)
- Build an interactive visual column mapping tool for wholesale distributors importing product catalogs from arbitrary or non-standard ERPs (Tally Prime, Marg ERP, Busy, Zoho, Excel/CSV).
- Feature fuzzy column name matching (e.g., mapping `"Prod_Rate"`, `"W-Sale Price"`, `"Nett Amt"` to `wholesalePrice`), persistent mapping memory per seller, dry-run schema validation, and instant highlight of invalid rows (missing MRP, negative stock, invalid HSN).
- Support direct Tally Prime XML Master ingestion and Marg ERP CSV formats with batch and expiry date parsing for First-Expiry-First-Out (FEFO) inventory management.

### R6. Automated Beat Cluster Assignment & Non-Overlapping Exclusivity (Features 31–45)
- Automated Beat Builder: Once a field sales agent onboards a configurable threshold of stores (e.g., 15–25 Kiranas in a cluster), automatically assemble those stores into an optimized day-wise beat route using 2-opt spatial routing.
- Hard exclusivity rule: Prevent duplicate store claims across agents with clear collision detection and territory transfer workflows when agents are reassigned.
- Enforce PostGIS geofenced visit verification (<100m check-in radius) and track planned vs. actual visits in real-time.

### R7. Retailer Margin Transparency, Velocity Intelligence & Super Admin Dispatch Command (Features 46–60, 73–100)
- In the retail ordering storefront, display prominent gross margin badges on MRP (*"MRP ₹100 | Buy ₹82 | Net Margin ₹18 (18%)"*), a *"Sort by Highest Margin"* filter, and a cart profitability summary bar.
- Provide sell-through velocity intelligence alerting retailers against overstocking slow-moving items (*"⚠️ Last carton took 42 days to liquidate. Recommended order: 1 carton"*).
- Super Admin Operations HQ: Real-time monitoring of all field agents, active beats, visit strike rates, and seller dispatch tracking with live Turn-Around-Time (TAT) countdowns, delayed dispatch alerts, and seller SLA compliance scorecards.

---

## Acceptance Criteria

### Authentication, Signups & Credential Provisioning
- [ ] Public self-registration forms accessible at `/signup/retailer` and `/signup/seller` with KYC document upload.
- [ ] Accounts successfully queue as `PENDING_APPROVAL` and show up in the Super Admin KYC Inspection Desk.
- [ ] Approving an account in Super Admin generates credentials and triggers an automated WhatsApp message via Evolution API.
- [ ] Agent-assisted store creation automatically generates a Login ID and secure password, returning them in the response and dispatching via WhatsApp.
- [ ] Attempting to onboard a store at the same GPS location (<15m) or phone number by a second agent is rejected with a 409 Conflict.

### Automatic App Updates
- [ ] `GET /api/app/version` endpoint returns current build hash and timestamp.
- [ ] Next.js web application displays an automatic update toast when the client-side version differs from the server.
- [ ] Mobile app version checker detects updates and links directly to `/downloads/b2b-sales-aggregator.apk`.

### ERP Import & Dynamic Column Mapper
- [ ] Uploading a custom-header CSV opens the visual column mapper UI.
- [ ] System auto-matches standard fields (Product Name, SKU/Barcode, Buy Price, MRP, Stock, GST).
- [ ] Dry-run validation correctly flags invalid rows and saves valid items to the distributor's catalog.

### Margin Transparency & Velocity Insights
- [ ] Retailer catalog cards display explicit ₹ and % margin against MRP.
- [ ] Cart shows total projected retail margin across all items.
- [ ] Slow-moving SKUs display sell-through warnings based on historical POS sales data.

### Super Admin Logistics & Beat Telemetry
- [ ] Super Admin dashboard displays live seller fulfillment metrics: Dispatch TAT, SLA countdown, and On-Time Delivery % (OTD).
- [ ] Beat analytics table accurately reflects total assigned stores, visits logged today, and order conversion strike rate.

### Automated Cloud Verification
- [ ] Comprehensive verification script (`verify-cloud.js` / new test suite) passes 100% of checks against the live Coolify deployment (`https://api-b2b.anagataitsolutions.in` and `https://b2b.anagataitsolutions.in`).
- [ ] Zero paid external APIs utilized throughout the entire implementation.

