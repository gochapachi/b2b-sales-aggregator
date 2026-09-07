# Project: Hyperlocal B2B Sales Aggregator (100-Feature Enterprise Expansion)

## Architecture
Multi-tier monorepo architecture connecting Kirana Retailers, FMCG Distributors/Wholesalers, Field Sales Agents, Supply BD Agents, and Super Admin:
- **`packages/shared`**: Domain types, Haversine spatial calculations, 15m GPS collision verification, 2-opt spatial route clustering, Buy-Box composite scoring, ERP fuzzy column matching, FEFO batch prioritization, Sell-through velocity intelligence, Seller ROI calculator.
- **`apps/api`**: Fastify HTTP server (port 4000) with PostgreSQL 16 persistence and InMemory fallback store.
  - Endpoints for Self-service Kirana & Seller signups (`/api/signup/retailer`, `/api/signup/seller`), MinIO document upload (`/api/kyc/upload`), Super Admin KYC Review Desk (`/api/kyc/pending`, `/api/kyc/review`).
  - Field Agent Assisted Onboarding (`/api/onboarding`) with automated Login ID & secure password generation, 15m GPS collision rejection (409 Conflict), and Evolution API WhatsApp dispatch.
  - In-App version polling (`/api/app/version`).
  - Multi-Seller Master SKU Marketplace with automated Buy-Box algorithm, stock reservation locks during checkout, and secondary seller SLA fallback routing.
  - Universal ERP Importer engine with fuzzy column matching, persistent mapping memory, schema dry-run validation, Tally Prime XML & Marg ERP CSV parsers, and FEFO batch allocation.
  - Automated Beat Builder (`/api/beats/auto-build`) using 2-opt spatial routing for 15–25 stores, territory exclusivity & transfer workflows, and PostGIS <100m geofence validation.
  - Super Admin Operations HQ metrics: Dispatch TAT countdown, seller SLA scorecards, beat telemetry.
- **`apps/web`**: Next.js 14 App Router portal (port 3000) with 5 dashboard views (Kirana Retailer, Wholesaler/Brand, Field Sales Agent, Supply BD Agent, Super Admin Operations HQ).
  - Public signup pages (`/signup/retailer`, `/signup/seller`) with interactive OpenStreetMap GPS pin picker.
  - Super Admin KYC review desk with document inspector, approve/reject controls, and credential generation preview.
  - Next.js PWA `sw.js` lifecycle listener + client version polling toast (`GET /api/app/version`).
  - Supply BD Agent portal for distributor recruitment and onboarding.
  - Multi-Seller Master SKU cards with Buy-Box winner and alternative seller comparisons.
  - Universal ERP Bulk Product Importer & visual interactive column mapper (`UniversalErpImporter.tsx`).
  - Retailer Margin Transparency: gross margin badges on MRP, "Sort by Highest Margin" filter, Cart Profitability summary bar, and sell-through velocity slow-moving alerts.
- **`apps/mobile`**: React Native / Expo 51 standalone mobile application:
  - Field Sales Agent screen with assisted store onboarding form, automated password provisioning, and 15m collision validation.
  - In-app OTA version checker (`OtaUpdateBanner.tsx`) checking `/api/app/version` and linking to APK download.
- **`docker/`**: PostgreSQL 16 relational DDL schemas (`docker/init.sql`) with tables for users, retailers, organizations, master_skus, seller_sku_listings, stock_reservations, territory_transfers, and 15m GPS collision trigger.
- **`release/`**: Standalone Android `.apk` binary (hosted at `apps/web/public/downloads/b2b-sales-aggregator.apk`).
- **`scripts/`**: Comprehensive cloud verification test suite (`scripts/verify-cloud.js`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Public Kirana Retailer Signup | `/signup/retailer` form with store details, GPS picker, KYC doc upload | M3 | R1 |
| 2 | Public Wholesaler Seller Signup | `/signup/seller` form with business details, GSTIN/PAN, MinIO doc upload | M3 | R1 |
| 3 | MinIO S3 Document Storage | Secure file upload and pre-signed document preview for KYC verification | M1 | R1 |
| 4 | PENDING_APPROVAL Account Queue | Restrict unverified accounts to pending approval state across DB and API | M1 | R1 |
| 5 | Super Admin KYC Review Desk | Interactive inspection desk to approve/reject KYC with reasons | M3 | R1 |
| 6 | Automated Credential Provisioning | Generate Login ID & cryptographically secure random password upon approval | M1 | R1 |
| 7 | Evolution API WhatsApp KYC Dispatch | Instant WhatsApp alert to applicant containing credentials and login portal URL | M1 | R1 |
| 8 | Field Agent Assisted Onboarding | Mobile & CRM assisted store onboarding with automated ID/password generation | M1 | R2 |
| 9 | WhatsApp Assisted Welcome Alert | Automated welcome notification via WhatsApp to owner with 1-click login link | M1 | R2 |
| 10 | 15m GPS Uniqueness & Collision Rejection | Database and API rejection of store creation within 15m radius (409 Conflict) | M1 | R2 |
| 11 | Backend App Version Polling Endpoint | `GET /api/app/version` returning buildHash, timestamp, and APK download URL | M1 | R3 |
| 12 | Web PWA Service Worker & Refresh Toast | `sw.js` lifecycle listener + client version polling toast for instant reload | M3 | R3 |
| 13 | Mobile In-App OTA Version Checker | In-app version checker prompting direct download of updated APK | M4 | R3 |
| 14 | Supply BD Agent Portal | Dedicated portal to recruit, onboard, and manage FMCG distributors | M3 | R4 |
| 15 | Multi-Seller Master SKU Architecture | Decoupled Master SKU catalog with multiple competing seller listings | M1 | R4 |
| 16 | Automated Buy-Box Algorithm | Scoring engine combining landed cost, proximity, reliability, and SLA | M2 | R4 |
| 17 | Distributor Stock Reservation Locks | Atomic 15-minute checkout stock reservation locks to prevent overselling | M1 | R4 |
| 18 | Secondary Seller SLA Fallback Routing | Automatic fallback rerouting if primary distributor fails to accept within SLA | M1 | R4 |
| 19 | Universal ERP Interactive Column Mapper | Visual column mapping UI for arbitrary distributor CSV/ERP exports | M3 | R5 |
| 20 | Fuzzy Column Name Matching | 3-tier fuzzy matcher (aliases, substring, Levenshtein) for ERP headers | M2 | R5 |
| 21 | Persistent Column Mapping Memory | Store seller-specific column mappings in DB to auto-apply on future uploads | M1 | R5 |
| 22 | ERP Dry-Run Schema Validation | Non-destructive validation flagging invalid MRP, negative stock, invalid HSN | M2 | R5 |
| 23 | Tally Prime XML Master Ingestion | Direct parser for Tally Prime XML item masters and inventory batches | M2 | R5 |
| 24 | Marg ERP CSV Ingestion | Direct parser for Marg ERP CSV exports with batch and expiry date parsing | M2 | R5 |
| 25 | FEFO Batch/Expiry Inventory Tracking | First-Expiry-First-Out batch prioritization and near-expiry discount flags | M2 | R5 |
| 26 | Automated Beat Builder & Clustering | Automatically assemble 15–25 onboarded Kiranas into day-wise beat routes | M2 | R6 |
| 27 | 2-Opt Spatial TSP Route Optimization | Heuristic edge-swapping minimizing total travel distance for field agents | M2 | R6 |
| 28 | Non-Overlapping Store Exclusivity | Prevent duplicate store claims across agents with collision detection | M1 | R6 |
| 29 | Territory Transfer Workflow | Reassign Kirana stores between sales agents with audit trail logging | M1 | R6 |
| 30 | PostGIS <100m Geofence Verification | Strict geofence enforcement rejecting check-ins outside 100m radius | M1 | R6 |
| 31 | Planned vs. Actual Visit Tracking | Real-time tracking of agent beat execution and visit compliance | M1 | R6 |
| 32 | Retailer Gross Margin Badges on MRP | Explicit display of ₹ and % gross profit margin on retail catalog cards | M3 | R7 |
| 33 | Sort by Highest Margin Catalog Filter | Storefront filter allowing retailers to sort products by profitability | M3 | R7 |
| 34 | Cart Profitability Summary Bar | Real-time total projected retailer margin calculation in checkout cart | M3 | R7 |
| 35 | Sell-Through Velocity Formula & Alerts | Calculate POS liquidation velocity and display slow-moving SKU warnings | M2 | R7 |
| 36 | Super Admin Operations HQ Dashboard | Real-time command center for all field agents, active beats, and strike rates | M3 | R7 |
| 37 | Live Seller Dispatch TAT Countdown | Real-time countdown timer for order dispatch with delayed alert triggers | M3 | R7 |
| 38 | Seller SLA Compliance Scorecards | Dynamic scoring of distributor fulfillment reliability, TAT, and fill rates | M1 | R7 |
| 39 | Field Agent Beat Telemetry | Real-time telemetry tracking agent locations, visits, and order strike rates | M3 | R7 |
| 40 | Automated Live Cloud Verification Suite | 69 automated test assertions in `verify-cloud.js` passing 100% on Coolify VPS | M5 | Verification |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Backend Domain Core, Schemas, & API Expansion | Database DDL (`docker/init.sql`), data-store, endpoints for Signups (R1), KYC review & WhatsApp creds (R1), Assisted Onboarding with 15m GPS collision 409 (R2), Version polling (R3), Master SKU / Stock locks / Fallback (R4), Beat Auto-build & Territory Transfer (R6) | none | IN_PROGRESS |
| M2 | Algorithmic Engines & Universal ERP Importer | Packages/shared & API services: Buy-Box composite scoring (R4), Fuzzy ERP column mapper & persistent memory (R5), Tally XML & Marg CSV parsers with FEFO (R5), 2-Opt spatial route clustering (R6), Sell-through velocity intelligence & slow-moving alerts (R7) | M1 | PLANNED |
| M3 | Next.js Web Portal Enterprise Expansion | Public signups (`/signup/retailer`, `/signup/seller`) with OSM GPS picker, Super Admin KYC Review Desk, PWA `sw.js` version polling toast, Supply BD Agent Portal, Multi-Seller Master SKU cards, Universal ERP Column Mapper UI, Margin Badges & Cart Profitability, Super Admin Operations HQ | M1, M2 | PLANNED |
| M4 | Mobile Application Updates & OTA Engine | React Native / Expo: Field Agent assisted Kirana onboarding form with 15m collision check, in-app OTA update banner with direct APK download, type-check & build verification | M1, M3 | PLANNED |
| M5 | Automated Cloud Verification & Coolify Deployment | Expand `scripts/verify-cloud.js` to 69 test assertions, deploy API and Web containers to Coolify VPS (`server.anagataitsolutions.in`), verify 100% passing tests against production domains with zero paid APIs | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Public & KYC API
- `POST /api/signup/retailer` -> Body: `{ storeName, ownerName, phone, address, latitude, longitude, documentType, documentUrl }`. Returns 201 `{ status: "PENDING_APPROVAL", retailerId }`.
- `POST /api/signup/seller` -> Body: `{ businessName, contactName, phone, gstin, pan, address, latitude, longitude, documentUrl }`. Returns 201 `{ status: "PENDING_APPROVAL", sellerId }`.
- `POST /api/kyc/upload` -> Body: `{ fileData, fileName, mimeType }`. Returns 200 `{ documentUrl: string }`.
- `GET /api/kyc/pending` -> Returns Array of pending retailer & seller applications with documents.
- `POST /api/kyc/review` -> Body: `{ entityId, entityType: 'RETAILER'|'SELLER', decision: 'APPROVE'|'REJECT', reason?: string }`.
  - On `APPROVE`: Generates Login ID & random secure password, updates status to `ACTIVE`, triggers Evolution API WhatsApp with credentials & URL. Returns 200 `{ status: "ACTIVE", credentials: { loginId, password } }`.
  - On `REJECT`: Sets status `REJECTED`, dispatches WhatsApp notification with rejection reason. Returns 200 `{ status: "REJECTED" }`.

### Assisted Onboarding API
- `POST /api/onboarding` -> Body: `{ agentId, storeName, ownerName, phone, address, latitude, longitude }`.
  - If existing retailer within 15m (`distanceMeters < 15.0`) -> Returns HTTP 409 Conflict `{ error: "GPS_COLLISION_15M", message: "Store already exists within 15 meters" }`.
  - If phone exists -> Returns HTTP 409 Conflict `{ error: "PHONE_DUPLICATE", message: "Phone number already registered" }`.
  - On success -> Generates Login ID & secure password, links to user profile, dispatches WhatsApp welcome message, returns 201 `{ retailerId, credentials: { loginId, password } }`.

### Version & Updates API
- `GET /api/app/version` -> Returns 200 `{ version: "2.1.0", buildHash: string, timestamp: string, apkDownloadUrl: "https://b2b.anagataitsolutions.in/downloads/b2b-sales-aggregator.apk" }`.

### Marketplace, Buy-Box & Orders API
- `GET /api/marketplace/buy-box/:masterSkuId?lat=:lat&lon=:lon` -> Returns `{ masterSku, buyBoxWinner: { sellerId, price, landedCost, proximityKm, reliabilityScore, slaScore, totalScore }, alternateSellers: [...] }`.
- `POST /api/orders/sub-orders/:id/fallback-reroute` -> Reroutes sub-order to secondary seller upon primary SLA breach, locks secondary stock, sends WhatsApp alert.

### ERP & Beat Routing API
- `POST /api/seller/catalog/fuzzy-map` -> Body: `{ headers: string[] }`. Returns 200 `{ mappings: Record<string, string>, confidenceScores: Record<string, number> }`.
- `POST /api/seller/catalog/bulk-import` -> Body: `{ sellerId, format: 'CSV'|'XML', rawContent: string, columnMap?: Record<string, string>, dryRun?: boolean }`. Returns 200 `{ validCount, errorCount, errors: Array<{ row, field, error }>, preview: Array<any> }`.
- `POST /api/beats/auto-build` -> Body: `{ agentId, storeIds?: string[], clusterSize?: number }`. Clusters stores into 15–25 store groups, executes 2-opt spatial TSP, assigns day schedules.
- `POST /api/territory/transfer-store` -> Body: `{ storeId, fromAgentId, toAgentId, reason }`. Transfers store exclusivity with audit log.

### Evolution API WhatsApp Contract
- `POST https://evo.anagataitsolutions.in/message/sendText/:instance`
- Headers: `{ apikey: "IefwSiekrTOn92twVtnlLcl3WEKiC8pz", Content-Type: "application/json" }`
- Payload: `{ number: "91XXXXXXXXXX", text: "..." }`

## Code Layout
- `packages/shared/src/`: Types, Geofence (`geofence.ts`), Buy-Box algorithm (`buy-box.ts`), ERP fuzzy matcher (`erp-matcher.ts`), Velocity intelligence (`velocity.ts`), 2-opt spatial routing (`tsp.ts`), ROI simulator (`roi-calculator.ts`)
- `apps/api/src/`: Fastify server (`server.ts`), Configuration (`config.ts`), Services (`services/evolution.service.ts`, `services/minio.service.ts`), Data store (`store/data-store.ts`)
- `apps/api/tests/`: Integration suites (`tests/api.test.js`, `tests/enterprise-expansion.test.js`)
- `apps/web/src/`: Next.js pages (`/signup/retailer`, `/signup/seller`, `/`), components for Super Admin KYC, Supply BD, ERP Importer, Margin badges, PWA toast
- `apps/web/public/`: `sw.js`, `manifest.json`, `downloads/b2b-sales-aggregator.apk`
- `apps/mobile/src/`: Screens for Agent (with assisted onboarding), Seller, Retailer, and `OtaUpdateBanner.tsx`
- `docker/`: Database initialization SQL (`docker/init.sql`)
- `scripts/`: Cloud verification test suite (`scripts/verify-cloud.js`)

