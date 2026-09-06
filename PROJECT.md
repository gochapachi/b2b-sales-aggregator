# Project: Hyperlocal B2B Sales Aggregator

## Architecture
Multi-tier monorepo architecture connecting Field Sales Agents, Wholesalers/Brands, and Retailers:
- **`packages/shared`**: Core business domain logic, Haversine spherical trigonometric geofencing calculations, Seller ROI Cost-Savings calculations, TypeScript interfaces.
- **`apps/api`**: Fastify HTTP server (port 4000), Geofence check-in verification (<100m), Multi-Vendor Cart MOQ/MOV validation and vendor sub-order splitting, 4-digit Delivery OTP lifecycle, Evolution API WhatsApp notification integration.
- **`apps/web`**: Next.js 14 App Router portal (port 3000) with 4 role-based dashboards (Agent, Wholesaler/Brand, Retailer, Platform Admin / ROI Simulator).
- **`apps/mobile`**: React Native / Expo 51 standalone mobile application supporting Field Agent (geofenced beat routes), Brand/Wholesaler (live order dispatch & OTP verification), and Retailer (wholesale catalog & active OTP tracking).
- **`docker/`**: PostgreSQL 16 relational DDL schemas and FMCG seed data (`docker/init.sql`) with persistent storage volume configuration for Coolify.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Monorepo Workspaces & Toolchain Configuration | Declare workspaces in root package.json, align build scripts | M1 | Survey 3 |
| 2 | Frontend Build & API Dynamic Binding | Create apps/web/public, parameterize NEXT_PUBLIC_API_URL in Dockerfile and page.tsx | M1 | Survey 1 |
| 3 | Evolution API Production Configuration | Align EVOLUTION_API_KEY and active instance name ('n8n') | M1 | Survey 1 |
| 4 | PostgreSQL 16 Relational Schema & Persistence | Create docker/init.sql with normalized tables and FMCG seed data | M1 | Survey 1 |
| 5 | Automated API Integration Test Harness | Implement automated tests in apps/api/tests/api.test.js | M1 | Survey 3 |
| 6 | Mobile App Config Synthesis | Synthesize index.js, babel.config.js, metro.config.js, and app icon in apps/mobile | M2 | Survey 2 |
| 7 | Expo Native Android Prebuild | Generate Android project directory using local JDK 21 and Android SDK | M2 | Survey 2 |
| 8 | Standalone Android APK Compilation | Package bundled offline JavaScript and assemble release APK | M2 | Survey 2 |
| 9 | APK Distribution & Sideloading Package | Host APK at release/ and apps/web/public/downloads/ with sideloading guide | M2 | Survey 2 |
| 10 | Coolify PostgreSQL 16 Database Deployment | Provision database with persistent volume and relational seed data on VPS | M3 | Survey 1 |
| 11 | Coolify Backend API Deployment | Deploy api container to Coolify at https://api-b2b.anagataitsolutions.in | M3 | Survey 1 |
| 12 | Coolify Next.js Web Portal Deployment | Deploy web container to Coolify at https://b2b.anagataitsolutions.in | M3 | Survey 1 |
| 13 | Geofence Engine Verification | Enforce <100m check-in radius and reject distant/spoofed check-ins with HTTP 403 | M4 | Survey 3 |
| 14 | Multi-Vendor Cart MOQ/MOV Validation & Split | Enforce SKU MOQ, Seller MOV, and auto-split into sub-orders with independent OTPs | M4 | Survey 3 |
| 15 | WhatsApp Transactional Alerts & OTP Dispatch | Send itemized bill and 4-digit Delivery OTP via Evolution API | M4 | Survey 3 |
| 16 | Proof-of-Delivery OTP Verification & SLA Tracking | Validate 4-digit OTP, transition to DELIVERED, and log transit duration in minutes | M4 | Survey 3 |
| 17 | Seller Cost-Savings Intelligence Verification | Validate ₹27,000/mo net savings and 81.8% payroll reduction on ₹6,000 fixed subscription | M4 | Survey 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Core Code & Config Hardening, Database Schemas, and Automated Tests | Fix monorepo workspaces, web public dir & API URL, Evolution API keys, docker/init.sql, fix shared package syntax & build, and de-facade test suite | none | DONE |
| M2 | Standalone Android APK Compilation & Distribution | Prebuild mobile app, bundle offline JS, compile standalone APK with JDK 21 + Android SDK, publish APK | M1 | IN_PROGRESS |
| M3 | Coolify Cloud Stack Deployment | Deploy PostgreSQL, Backend API, and Web Portal to Coolify VPS at target domains | M1 | PLANNED |
| M4 | End-to-End System Testing & Multi-Role Verification | Execute full automated E2E test suite across Geofence, Multi-vendor cart, WhatsApp OTP, Delivery SLA, and Seller ROI | M2, M3 | PLANNED |

## Interface Contracts
### Mobile / Web Frontend ↔ Backend API
- `GET /health` -> `{ status: "ok", timestamp: string, version: string }`
- `GET /api/beats/today?agentId=:id` -> Array of Beat stops with target geocoordinates and retailer metadata
- `POST /api/visits/checkin` -> Payload `{ agentId, retailerId, beatId, latitude, longitude }`. Returns 200 on `< 100m`, returns 403 Forbidden on `> 100m`.
- `POST /api/orders/checkout` -> Payload `{ retailerId, items: [{ productSkuId, quantity }] }`. Returns 400 on MOQ/MOV violation, returns 200 with Master Order & vendor sub-orders.
- `POST /api/delivery/dispatch` -> Payload `{ subOrderId }`. Sets `DISPATCHED`, triggers WhatsApp OTP alert.
- `POST /api/delivery/verify-otp` -> Payload `{ subOrderId, enteredOtp }`. Returns 400 on invalid OTP, returns 200 on valid OTP with `transitDurationMinutes`.
- `GET /api/analytics/roi-simulator` -> Returns `{ monthlyRupeeSavings, annualRupeeSavings, savingsPercentage, commissionRate }`.

### Backend API ↔ Evolution API
- `POST https://evo.anagataitsolutions.in/message/sendText/:instance`
- Headers: `{ apikey: "IefwSiekrTOn92twVtnlLcl3WEKiC8pz", Content-Type: "application/json" }`
- Payload: `{ number: "91XXXXXXXXXX", text: "..." }`

## Code Layout
- `packages/shared/src/`: Types, Geofence calculation (`geofence.ts`), ROI simulator (`roi-calculator.ts`)
- `packages/shared/dist/`: Compiled CommonJS and TypeScript declarations
- `apps/api/src/`: Server routes (`server.ts`), Configuration (`config.ts`), Evolution API service (`services/evolution.service.ts`), Data store (`store/data-store.ts`)
- `apps/api/tests/`: Automated API integration tests (`tests/api.test.js`)
- `apps/web/src/`: Next.js pages, role dashboards, ROI calculator component
- `apps/web/public/`: Static assets (`favicon.ico`, `robots.txt`, `downloads/b2b-sales-aggregator.apk`)
- `apps/mobile/src/`: React Native screens for Agent, Seller, and Retailer
- `apps/mobile/android/`: Native Android project generated via Expo prebuild
- `docker/`: Database initialization SQL (`docker/init.sql`)
- `release/`: Standalone `.apk` output binary
