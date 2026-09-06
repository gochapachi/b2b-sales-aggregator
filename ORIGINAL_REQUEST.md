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
