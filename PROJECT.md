# Project: Hyperlocal B2B Sales Aggregator (Universal CRUD, Order Tracking & Mobile Parity)

## Architecture
Multi-tier monorepo architecture connecting Kirana Retailers, FMCG Distributors/Wholesalers, Field Sales Agents, Supply BD Agents, and Super Admin:
- **`packages/shared`**: Domain types, Haversine spatial calculations, 15m GPS collision verification, 2-opt spatial route clustering, Buy-Box composite scoring, ERP fuzzy column matching, FEFO batch prioritization, Sell-through velocity intelligence, Seller ROI calculator.
- **`apps/api`**: Fastify HTTP server (port 4000) with PostgreSQL 16 persistence and InMemory fallback store (`store/data-store.ts`).
  - Universal CRUD for Seller Products: `GET /api/seller/products/:id`, `PUT /api/seller/products/:id` (flat SKU pricing/stock/slabs/margin), `DELETE /api/seller/products/:id` (soft archive vs delete).
  - Universal Order Management: `GET /api/orders/:id` (dual resolution: master `ord_...` and sub-order `subord_...`), `PATCH /api/orders/:id` (status transitions, OTP verification, delivery notes, transit duration).
  - Store Profile & Lead Management: `GET /api/retailers/:id`, `PUT /api/retailers/:id` (15m collision validation, full order history, contact & credit terms).
  - Universal User Registry: `GET /api/users/:id`, `PUT /api/users/:id` (granular permissions, role, status toggle, audit trail).
  - Retail POS Counter: `GET /api/pos/bills`, `GET /api/pos/bills/:id` (bill history, line items, 58mm/80mm ESC/POS thermal reprint payload).
- **`apps/web`**: Next.js 14 App Router portal (port 3000) with 5 dashboard views:
  - Common Slide-over Drawer (`components/common/SlideOverDrawer.tsx`) with backdrop blur and smooth transitions.
  - Seller Catalog Studio (`SellerProductStudio.tsx`): "View Details" Drawer (SKU specs, volume slabs, margin), "Edit Product" Modal (`PUT /api/seller/products/:id`), "Delete / Archive Product" confirmation dialog.
  - Universal Order Details Drawer (`components/orders/OrderDetailsDrawer.tsx`): line items table, buyer KYC profile with OSM GPS, 5-stage fulfillment timeline, 1-click GST Invoice (`INV-2026-X`) and E-Way Bill downloads. Integrated into Seller and Super Admin desks.
  - Agent CRM Store Lead Desk (`AgentCrmDashboard.tsx`): "View Store" Drawer (store photos, OSM coordinates, GSTIN/PAN docs, order history, visit logs), "Edit Store" Modal (`PUT /api/retailers/:id`).
  - Team & User Management (`TenantUserManagementDesk.tsx` & `SuperAdminUserRegistryDesk.tsx`): "View User Profile" Drawer, "Edit User" Modal (`PUT /api/users/:id`).
  - Retail POS Counter (`RetailPosCheckoutDesk.tsx`): "Bill History" Drawer with line item breakdown and 1-click ESC/POS reprint.
  - Kirana Retailer Workspace: Dedicated "My Orders & Tracking" Tab (`ORDERS`), status badges (`PENDING`, `ACCEPTED`, `PACKED`, `DISPATCHED`, `DELIVERED`), prominent Delivery OTP Card for dispatched orders, View Order Details modal with itemized pricing, gross profit calculations, 1-click GST Tax Invoice download (`INV-2026-X`), and real-time status polling.
  - Enterprise UI/UX polish: rich empty states, consistent typography, badge colors, inline validation, and loading spinners.
- **`apps/mobile`**: React Native / Expo 51 standalone mobile application:
  - Product Detail Modal (`ProductDetailModal.tsx`): specs, carton multipliers, tiered volume slabs, interactive retail resale margin calculator.
  - Dedicated My Orders Screen (`RetailerOrdersScreen.tsx`): 5-stage status timeline, prominent Delivery OTP card for active deliveries, line-item inspection.
  - Store Profile Screen (`RetailerProfileScreen.tsx`): View and edit Kirana store profile.
  - Sub-navigation via `retailerSubTab: "CATALOG" | "ORDERS" | "PROFILE"` in `App.tsx`.
- **`docker/`**: PostgreSQL 16 relational DDL schemas (`docker/init.sql`).
- **`release/`**: Standalone Android `.apk` binary (hosted at `apps/web/public/downloads/b2b-sales-aggregator.apk` and `release/b2b-sales-aggregator.apk`).
- **`scripts/`**: Comprehensive cloud verification test suite (`scripts/verify-cloud.js`, expanded to 90 assertions) and persona authentication tester (`scripts/test-personas.js`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Seller Product Details API & Drawer | `GET /api/seller/products/:id` and interactive View Details Drawer in SellerProductStudio | M1, M2 | R1 |
| 2 | Seller Product Edit API & Modal | `PUT /api/seller/products/:id` with flat SKU attributes, margin re-calc, and Edit Modal | M1, M2 | R1 |
| 3 | Seller Product Archive / Delete API & Modal | `DELETE /api/seller/products/:id` supporting soft archive and confirmation modal | M1, M2 | R1 |
| 4 | Universal Order Details API & Drawer | `GET /api/orders/:id` (dual resolution) and interactive slide-over OrderDetailsDrawer | M1, M2 | R1 |
| 5 | Order Status & Fulfillment PATCH API | `PATCH /api/orders/:id` for status transitions, OTP verification, transit duration | M1 | R1 |
| 6 | Agent CRM Store 360 View Drawer | Expand CRM store modal to full drawer: photos, OSM GPS, GSTIN/PAN docs, order history | M2 | R1 |
| 7 | Agent CRM Store Edit API & Modal | `GET/PUT /api/retailers/:id` to edit store name, contact, address, credit terms | M1, M2 | R1 |
| 8 | User Profile View Drawer | Detailed permissions checklist, assigned store/warehouse, audit trail in user desks | M2 | R1 |
| 9 | User Edit API & Modal | `GET/PUT /api/users/:id` to update title, role, granular permissions, status | M1, M2 | R1 |
| 10 | POS Bill History API & Drawer | `GET /api/pos/bills/:id` and slide-over Bill History Drawer with line items & ESC/POS reprint | M1, M2 | R1 |
| 11 | Retailer My Orders Tab & Timeline | Dedicated "My Orders" tab with status badges and 5-stage fulfillment timeline | M2 | R2 |
| 12 | Retailer Delivery OTP Card | High-visibility pinned Delivery OTP Card for dispatched orders to show drivers | M2 | R2 |
| 13 | Retailer Order Details & Profit Modal | Itemized pricing, unit wholesale rate, MRP, retailer gross profit, 1-click GST invoice | M2 | R2 |
| 14 | Retailer Real-Time Status Polling | Automated 6-second polling reflecting live warehouse transitions without reload | M2 | R2 |
| 15 | Common Slide-Over Drawer Component | Reusable `SlideOverDrawer.tsx` with backdrop blur, smooth slide transition, Escape handling | M2 | R3 |
| 16 | Design System Typography, Badges & Spinners | Standardized badges, responsive action icons, loading state spinners on all actions | M2 | R3 |
| 17 | Rich Empty States Across Desks | Informative empty states with icons and action triggers across orders, products, bills, users | M2 | R3 |
| 18 | Mobile Product Detail Modal | Tap catalog card for SKU specs, multipliers, volume slabs, interactive margin calculator | M3 | R4 |
| 19 | Mobile My Orders Screen & OTP Card | Dedicated orders screen, 5-stage timeline, Delivery OTP card, order breakdown | M3 | R4 |
| 20 | Mobile Store Profile Screen | View and edit Kirana store profile (name, owner, phone, address, credit terms) | M3 | R4 |
| 21 | Android Metro Bundle Generation | Clean offline JS bundle generation (`index.android.bundle`) | M3 | R4 |
| 22 | Android Release APK Compilation | Compile signed standalone release APK using Gradle with JDK 21 (`assembleRelease`) | M3 | R4 |
| 23 | Release APK Dual Deployment | Publish APK to `apps/web/public/downloads/` and `release/` | M3 | R4 |
| 24 | Backend CRUD Integration Tests | New automated test suite `apps/api/tests/crud-expansion.test.js` | M1 | R5 |
| 25 | Cloud Verification Suite Expansion | Expand `scripts/verify-cloud.js` from 80 to 90 assertions | M4 | R5 |
| 26 | Git Commit & Push to Main | Atomic versioned commit and push to remote repository | M4 | R5 |
| 27 | Coolify VPS Live Redeployment | Trigger redeployments of `b2b-api` and `b2b-web` on VPS (`server.anagataitsolutions.in`) | M4 | R5 |
| 28 | Live Production Multi-Persona & Cloud Verification | 100% pass on `test-personas.js` and `verify-cloud.js` (90/90 assertions) | M4 | R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Backend API CRUD Hardening & Schemas | Fastify routes (`GET/PUT/DELETE /api/seller/products/:id`, `GET/PATCH /api/orders/:id`, `GET/PUT /api/retailers/:id`, `GET/PUT /api/users/:id`, `GET /api/pos/bills/:id`), `InMemoryDataStore`, `docker/init.sql`, and `tests/crud-expansion.test.js` | none | DONE |
| M2 | Web Universal View & Edit CRUD, Orders & UX Polish | `SlideOverDrawer.tsx`, `SellerProductStudio.tsx` (View/Edit/Archive), `OrderDetailsDrawer.tsx`, `AgentCrmDashboard.tsx` (360/Edit), User desks (View/Edit), `RetailPosCheckoutDesk.tsx` (Bill History Drawer/Reprint), Kirana Retailer My Orders Tab & live polling, Design system polish | M1 | DONE |
| M3 | React Native Mobile Parity & Standalone Release APK | `ProductDetailModal.tsx` with margin calculator, `RetailerOrdersScreen.tsx` with Delivery OTP, `RetailerProfileScreen.tsx`, sub-tab navigation in `App.tsx`, Metro bundle, Gradle release APK compilation, dual deployment | M1 | DONE |
| M4 | Cloud Deployment & Live Verification | Expand `scripts/verify-cloud.js` to 90 assertions, Git commit & push, Coolify redeployment on VPS, 100% test pass on `test-personas.js` and `verify-cloud.js` | M1, M2, M3 | DONE |

## Interface Contracts

### 1. Seller Products CRUD
- `GET /api/seller/products/:id`: Returns 200 `{ success: true, product }`.
- `PUT /api/seller/products/:id`: Body: `{ name?, category?, brand?, description?, hsnCode?, gstRatePct?, imageUrl?, status?, isArchived?, wholesalePrice?, mrp?, stock?, moq?, unitTitle?, packMultiplier?, cartonMultiplier?, pricingSlabs?, isActive?, skus? }`. Updates attributes, recalculates `marginPct = ((mrp - wholesalePrice) / mrp) * 100`, returns 200 `{ success: true, message: "Product updated successfully", product }`.
- `DELETE /api/seller/products/:id?archive=true`: If `archive=true`, sets `status = "ARCHIVED"` and `isArchived = true`. If `hardDelete=true`, splices from store. Returns 200 `{ success: true, message: string, product? }`.

### 2. Universal Order Details & Status
- `GET /api/orders/:id`: Resolves by master `orderId` or vendor `subOrderId`. Enriches with store details, buyer KYC, complete line items, delivery OTP, and invoice reference. Returns 200 `{ success: true, order }`.
- `PATCH /api/orders/:id`: Body: `{ status?: "RECEIVED" | "ACCEPTED" | "PACKED" | "DISPATCHED" | "DELIVERED", deliveryNotes?, paymentStatus? }`. On `DELIVERED`, logs transit duration in minutes. Returns 200 `{ success: true, order }`.

### 3. Retailer Store Profile & CRM
- `GET /api/retailers/:id`: Returns 200 `{ success: true, retailer: { id, storeName, ownerName, phone, address, latitude, longitude, creditLimit, paymentTerms, documents, kycStatus, ordersCount, lifetimeValue } }`.
- `PUT /api/retailers/:id`: Body: `{ storeName?, ownerName?, phone?, address?, latitude?, longitude?, creditLimit?, paymentTerms?, documents? }`. Checks 15m collision if GPS changed. Returns 200 `{ success: true, retailer }`.

### 4. Universal User Registry
- `GET /api/users/:id`: Returns 200 `{ success: true, user: { id, name, email, phone, role, title, status, permissions, organizationId, retailerId, lastLoginAt, auditLog } }`.
- `PUT /api/users/:id`: Body: `{ name?, title?, role?, status?: "ACTIVE" | "SUSPENDED", permissions?: string[], organizationId?, retailerId? }`. Logs audit entry to store. Returns 200 `{ success: true, user }`.

### 5. Retail POS Counter Bills
- `GET /api/pos/bills/:id`: Returns 200 `{ success: true, bill: { id, billNumber, retailerId, items, subtotal, taxAmount, grandTotal, paymentMode, cashierName, createdAt, escPosThermalReceipt: string } }`.

## Code Layout
- `apps/api/src/server.ts`: Fastify route definitions
- `apps/api/src/store/data-store.ts`: In-memory data store methods
- `apps/api/tests/crud-expansion.test.js`: Integration tests for CRUD routes
- `apps/web/src/components/common/SlideOverDrawer.tsx`: Reusable drawer
- `apps/web/src/components/seller/SellerProductStudio.tsx`: Seller catalog studio
- `apps/web/src/components/orders/OrderDetailsDrawer.tsx`: Reusable order details drawer
- `apps/web/src/components/crm/AgentCrmDashboard.tsx`: Agent CRM lead desk
- `apps/web/src/components/users/TenantUserManagementDesk.tsx`: Tenant user desk
- `apps/web/src/components/admin/SuperAdminUserRegistryDesk.tsx`: Super admin user desk
- `apps/web/src/components/pos/RetailPosCheckoutDesk.tsx`: POS checkout desk
- `apps/web/src/components/layout/AppShell.tsx`: Navigation items
- `apps/web/src/app/page.tsx`: Workspace role tabs & My Orders view
- `apps/mobile/src/screens/retailer/RetailerHomeScreen.tsx`: Catalog cards & ProductDetailModal
- `apps/mobile/src/screens/retailer/RetailerOrdersScreen.tsx`: My Orders screen
- `apps/mobile/src/screens/retailer/RetailerProfileScreen.tsx`: Store profile view/edit
- `apps/mobile/App.tsx`: Role navigation and retailer sub-tabs
- `scripts/verify-cloud.js`: Comprehensive cloud verification suite
- `scripts/test-personas.js`: Multi-persona login verification
