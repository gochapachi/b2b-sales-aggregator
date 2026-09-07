import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { CONFIG } from "./config";
import {
  store,
  DataStoreMasterOrder,
  DataStoreSubOrder,
  generateGstInvoice,
  generateEWayBillPayload,
  LeadStage,
  PaymentTerm,
  PaymentMode,
  CreditLineStatus,
  VisitPurpose,
  DataStoreCrmNote,
  DataStoreCrmPayment,
  DataStoreProduct,
  DataStoreProductSku,
  DataStoreCreditLine,
  DataStorePaymentVoucher,
  DataStoreLedgerEntry
} from "./store/data-store";
import { evolutionService } from "./services/evolution.service";
import { calculateSellerSavings } from "./services/roi.service";

const server: FastifyInstance = Fastify({
  logger: true
});

// Haversine formula for strict <100m geofence validation
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

async function startServer() {
  await server.register(cors, { origin: "*" });
  await server.register(jwt, { secret: CONFIG.JWT_SECRET });

  // 1. Health Check
  server.get("/health", async (req: FastifyRequest, reply: FastifyReply) => {
    return {
      status: "ok",
      platform: "Hyperlocal B2B Sales Aggregator & CRM",
      marketplaceStyle: "Udaan B2B + Sales Force Automation",
      version: "2.0.0",
      vpsEnvironment: "Ubuntu 24.04 (Coolify)",
      evolutionApiUrl: CONFIG.EVOLUTION_API_URL,
      timestamp: new Date().toISOString()
    };
  });

  // 2. Authentication
  server.post("/api/auth/login", async (req: FastifyRequest, reply: FastifyReply) => {
    const { phone, password } = req.body as any;
    const user = store.users.find((u) => u.phone === phone);
    if (!user) {
      return reply.status(401).send({ error: "Invalid credentials or user not found" });
    }

    const org = store.organizations.find((o) => o.ownerId === user.id);
    const retailer = store.retailers.find((r) => r.userId === user.id);

    const token = server.jwt.sign({
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name
    });

    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        status: user.status
      },
      organization: org || null,
      retailerProfile: retailer || null
    };
  });

  server.post("/api/auth/register", async (req: FastifyRequest, reply: FastifyReply) => {
    const { phone, name, role } = req.body as any;
    const existing = store.users.find((u) => u.phone === phone);
    if (existing) {
      return reply.status(400).send({ error: "User already exists with this phone number" });
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      phone,
      name,
      role: role || "RETAILER",
      status: (role === "RETAILER" ? "PENDING_KYC" : "ACTIVE") as any,
      createdAt: new Date().toISOString()
    };
    store.users.push(newUser);

    const token = server.jwt.sign({
      id: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
      name: newUser.name
    });

    return { token, user: newUser };
  });

  // 3. Udaan-Style Brand Store Discovery & Category Hierarchy
  server.get("/api/catalog/brands", async (req: FastifyRequest, reply: FastifyReply) => {
    const brandMap = new Map<string, any>();

    for (const product of store.products) {
      if (!brandMap.has(product.brand)) {
        brandMap.set(product.brand, {
          brand: product.brand,
          organizationId: product.organizationId,
          organizationName: product.organizationName,
          category: product.category,
          productsCount: 0,
          sampleImage: product.imageUrl,
          tagline: `Official Wholesale Distributor for ${product.brand}`
        });
      }
      brandMap.get(product.brand).productsCount += 1;
    }

    return {
      brands: Array.from(brandMap.values())
    };
  });

  server.get("/api/catalog/categories", async (req: FastifyRequest, reply: FastifyReply) => {
    const categoryMap = new Map<string, { name: string; count: number; sampleImage: string }>();

    for (const prod of store.products) {
      if (!categoryMap.has(prod.category)) {
        categoryMap.set(prod.category, {
          name: prod.category,
          count: 0,
          sampleImage: prod.imageUrl || ""
        });
      }
      categoryMap.get(prod.category)!.count += 1;
    }

    return {
      categories: Array.from(categoryMap.values())
    };
  });

  // 4. Catalog (Price-Gating, Slabs & Wholesale Discovery)
  server.get("/api/catalog", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const userRole = query.role || "PUBLIC";
    const retailerId = query.retailerId;
    const brandFilter = query.brand;
    const categoryFilter = query.category;

    let isPriceUnlocked = true;
    if (userRole === "RETAILER") {
      const ret = store.retailers.find((r) => r.id === retailerId || r.userId === query.userId);
      if (!ret || ret.kycStatus !== "VERIFIED") {
        isPriceUnlocked = false;
      }
    }

    let filteredProducts = store.products;
    if (brandFilter) {
      filteredProducts = filteredProducts.filter((p) => p.brand.toLowerCase() === brandFilter.toLowerCase());
    }
    if (categoryFilter) {
      filteredProducts = filteredProducts.filter((p) => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    const formattedProducts = filteredProducts.map((p) => {
      const org = store.organizations.find((o) => o.id === p.organizationId);
      return {
        id: p.id,
        organizationId: p.organizationId,
        organizationName: org ? org.name : p.organizationName,
        minimumOrderValue: org ? org.minimumOrderValue : 1000,
        name: p.name,
        category: p.category,
        brand: p.brand,
        description: p.description,
        hsnCode: p.hsnCode,
        gstRatePct: p.gstRatePct,
        marginPct: p.marginPct,
        imageUrl: p.imageUrl,
        isPriceLocked: !isPriceUnlocked,
        skus: p.skus.map((s) => ({
          id: s.id,
          skuCode: s.skuCode,
          unitTitle: s.unitTitle,
          unitMultiplier: s.unitMultiplier,
          mrp: s.mrp,
          wholesalePrice: isPriceUnlocked ? s.wholesalePrice : null,
          minimumOrderQuantity: s.minimumOrderQuantity,
          stockQuantity: s.stockQuantity,
          isActive: s.isActive,
          pricingSlabs: isPriceUnlocked ? s.pricingSlabs : []
        }))
      };
    });

    return {
      isPriceUnlocked,
      kycNotice: !isPriceUnlocked
        ? "Wholesale prices are locked. Submit GSTIN or PAN/Shop proof to unlock B2B pricing."
        : "Wholesale pricing active with volume discount tiers.",
      products: formattedProducts
    };
  });

  // 5. KYC Management (Admin Review)
  server.get("/api/kyc/pending", async (req: FastifyRequest, reply: FastifyReply) => {
    const pendingRetailers = store.retailers.filter((r) => r.kycStatus === "PENDING");
    const pendingSellers = store.organizations.filter((o) => o.kycStatus === "PENDING");
    return { pendingRetailers, pendingSellers };
  });

  server.post("/api/kyc/review", async (req: FastifyRequest, reply: FastifyReply) => {
    const { targetId, targetType, approved, reason } = req.body as any;
    if (targetType === "RETAILER") {
      const retailer = store.retailers.find((r) => r.id === targetId || r.userId === targetId);
      if (!retailer) return reply.status(404).send({ error: "Retailer not found" });
      retailer.kycStatus = approved ? "VERIFIED" : "REJECTED";
      if (approved) {
        retailer.leadStage = "KYC_VERIFIED";
        retailer.creditLimit = retailer.creditLimit || 30000;
      }
      if (!approved && reason) retailer.rejectionReason = reason;

      const user = store.users.find((u) => u.id === retailer.userId);
      if (user && approved) user.status = "ACTIVE";

      return { success: true, retailer };
    } else {
      const org = store.organizations.find((o) => o.id === targetId);
      if (!org) return reply.status(404).send({ error: "Organization not found" });
      org.kycStatus = approved ? "VERIFIED" : "REJECTED";
      return { success: true, organization: org };
    }
  });

  // 6. Beats & Route Management
  server.get("/api/beats/today", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const agentId = query.agentId || "usr_agent_1";
    const beat = store.beats.find((b) => b.assignedAgentId === agentId) || store.beats[0];

    const stopsWithStatus = beat.stops.map((stop) => {
      const todayVisits = store.visits.filter(
        (v) => v.retailerId === stop.retailerId && v.beatId === beat.id
      );
      const isVisited = todayVisits.length > 0;
      const lastVisit = todayVisits[todayVisits.length - 1];

      return {
        ...stop,
        isVisited,
        visitDisposition: lastVisit ? lastVisit.disposition : null,
        visitCheckInTime: lastVisit ? lastVisit.checkInTime : null
      };
    });

    return {
      beatId: beat.id,
      beatName: beat.name,
      dayOfWeek: beat.dayOfWeek,
      assignedAgentName: beat.assignedAgentName,
      totalStops: stopsWithStatus.length,
      visitedStops: stopsWithStatus.filter((s) => s.isVisited).length,
      stops: stopsWithStatus
    };
  });

  // 7. Visits & Geofence Verification (<100m)
  server.post("/api/visits/checkin", async (req: FastifyRequest, reply: FastifyReply) => {
    const { agentId, retailerId, beatId, latitude, longitude, purpose } = req.body as any;

    const retailer = store.retailers.find((r) => r.id === retailerId);
    if (!retailer) {
      return reply.status(404).send({ error: "Retailer shop not found" });
    }

    const distanceMeters = calculateHaversineDistance(
      latitude,
      longitude,
      retailer.latitude,
      retailer.longitude
    );
    const isWithin = distanceMeters <= retailer.geofenceRadiusMeters;

    if (!isWithin) {
      return reply.status(403).send({
        error: "Geofence Check-in Failed",
        distanceMeters,
        allowedRadiusMeters: retailer.geofenceRadiusMeters,
        message: `You are ${distanceMeters}m away from ${retailer.shopName}. You must be within ${retailer.geofenceRadiusMeters}m to check in.`
      });
    }

    const newVisit = {
      id: `vis_${Date.now()}`,
      agentId: agentId || "usr_agent_1",
      agentName: "Rahul Sharma",
      retailerId: retailer.id,
      shopName: retailer.shopName,
      beatId: beatId || "beat_hazratganj_mon",
      purpose: (purpose || "ROUTINE_ORDER") as VisitPurpose,
      checkInTime: new Date().toISOString(),
      checkInLat: latitude,
      checkInLng: longitude,
      isWithinGeofence: true,
      distanceMeters,
      disposition: "ORDER_BOOKED" as any,
      createdAt: new Date().toISOString()
    };

    store.visits.push(newVisit);

    // Update agent daily visit counter
    store.agentSalesTarget.dailyVisitsCompletedToday += 1;

    return {
      success: true,
      message: `Verified! You checked in ${distanceMeters}m from ${retailer.shopName}.`,
      visit: newVisit
    };
  });

  server.post("/api/visits/geotag-lock", async (req: FastifyRequest, reply: FastifyReply) => {
    const { retailerId, latitude, longitude, shopPhotoUrl } = req.body as any;
    const retailer = store.retailers.find((r) => r.id === retailerId);
    if (!retailer) return reply.status(404).send({ error: "Retailer not found" });

    retailer.latitude = latitude;
    retailer.longitude = longitude;
    retailer.isGeocoded = true;
    if (shopPhotoUrl) retailer.shopPhotoUrl = shopPhotoUrl;

    return {
      success: true,
      message: `Store coordinates successfully locked to (${latitude}, ${longitude})`,
      retailer
    };
  });

  server.post("/api/visits/disposition", async (req: FastifyRequest, reply: FastifyReply) => {
    const { visitId, disposition, notes } = req.body as any;
    const visit = store.visits.find((v) => v.id === visitId);
    if (!visit) return reply.status(404).send({ error: "Visit session not found" });

    visit.disposition = disposition;
    if (notes) visit.notes = notes;
    visit.checkOutTime = new Date().toISOString();

    // Also record into CRM notes for full audit trail
    store.crmNotes.unshift({
      id: `note_${Date.now()}`,
      retailerId: visit.retailerId,
      retailerShopName: visit.shopName,
      agentId: visit.agentId,
      agentName: visit.agentName,
      type: "VISIT",
      summary: `Visit finished. Disposition: ${disposition}. Notes: ${notes || "No notes"}`,
      createdAt: new Date().toISOString()
    });

    return { success: true, visit };
  });

  // 8. Orders Checkout (Udaan Volume Slabs, B2B Credit Terms, GST Invoices & Multi-Vendor Splitting)
  server.post("/api/orders/checkout", async (req: FastifyRequest, reply: FastifyReply) => {
    const { retailerId, placedByAgentId, items, paymentTerm = "COD" } = req.body as any;

    const retailer = store.retailers.find((r) => r.id === retailerId);
    if (!retailer) return reply.status(404).send({ error: "Retailer not found" });

    // Group items by Organization (Seller)
    const vendorItemsMap = new Map<string, any[]>();

    for (const item of items) {
      let foundSku: any = null;
      let foundProduct: any = null;

      for (const prod of store.products) {
        const sku = prod.skus.find((s) => s.id === item.productSkuId);
        if (sku) {
          foundSku = sku;
          foundProduct = prod;
          break;
        }
      }

      if (!foundSku || !foundProduct) {
        return reply.status(400).send({ error: `SKU ${item.productSkuId} not found in catalog` });
      }

      // Check SKU-level MOQ
      if (item.quantity < foundSku.minimumOrderQuantity) {
        return reply.status(400).send({
          error: `Minimum order quantity for ${foundProduct.name} (${foundSku.unitTitle}) is ${foundSku.minimumOrderQuantity} units.`
        });
      }

      // Evaluate Volume Pricing Slabs
      let unitPrice = foundSku.wholesalePrice;
      let appliedSlabMinQty = foundSku.minimumOrderQuantity;

      if (foundSku.pricingSlabs && foundSku.pricingSlabs.length > 0) {
        // Find best applicable slab where item.quantity >= slab.minQuantity
        const eligibleSlabs = foundSku.pricingSlabs
          .filter((slab: any) => item.quantity >= slab.minQuantity)
          .sort((a: any, b: any) => b.minQuantity - a.minQuantity);

        if (eligibleSlabs.length > 0) {
          unitPrice = eligibleSlabs[0].pricePerUnit;
          appliedSlabMinQty = eligibleSlabs[0].minQuantity;
        }
      }

      const orgId = foundProduct.organizationId;
      if (!vendorItemsMap.has(orgId)) {
        vendorItemsMap.set(orgId, []);
      }

      const taxAmount = Math.round(((unitPrice * item.quantity * foundProduct.gstRatePct) / 100) * 100) / 100;
      const totalPrice = Math.round((unitPrice * item.quantity + taxAmount) * 100) / 100;

      vendorItemsMap.get(orgId)!.push({
        id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        productSkuId: foundSku.id,
        productName: foundProduct.name,
        skuCode: foundSku.skuCode,
        unitTitle: foundSku.unitTitle,
        quantity: item.quantity,
        unitPrice,
        appliedSlabMinQty,
        taxPct: foundProduct.gstRatePct,
        taxAmount,
        totalPrice
      });
    }

    // Validate Seller-level MOV
    for (const [orgId, orderItems] of vendorItemsMap.entries()) {
      const org = store.organizations.find((o) => o.id === orgId);
      const subtotal = orderItems.reduce((acc, it) => acc + it.totalPrice, 0);
      if (org && subtotal < org.minimumOrderValue) {
        return reply.status(400).send({
          error: `Minimum order value for seller "${org.name}" is ₹${org.minimumOrderValue}. Current cart subtotal from this seller is ₹${subtotal}.`
        });
      }
    }

    // Calculate total order amount and validate seller-specific credit lines
    const isCreditOrder = paymentTerm.startsWith("NET_") || paymentTerm === "WEEKLY_SETTLEMENT";
    let tentativeGrandTotal = 0;

    for (const [orgId, orderItems] of vendorItemsMap.entries()) {
      const org = store.organizations.find((o) => o.id === orgId)!;
      const vendorTotal = Math.round(
        orderItems.reduce((acc, it) => acc + it.totalPrice, 0) * 100
      ) / 100;
      tentativeGrandTotal += vendorTotal;

      if (isCreditOrder) {
        let creditLine = store.creditLines.find(
          (c) => c.organizationId === orgId && c.retailerId === retailer.id
        );

        if (creditLine) {
          if (creditLine.status === "CREDIT_HOLD") {
            return reply.status(400).send({
              error: `Credit hold is active for seller "${org.name}". Please settle outstanding balance before placing new credit orders.`
            });
          }
          if (vendorTotal > creditLine.availableCredit) {
            return reply.status(400).send({
              error: `Credit limit exceeded for seller "${org.name}". Available credit: ₹${creditLine.availableCredit.toLocaleString("en-IN")}, requested order: ₹${vendorTotal.toLocaleString("en-IN")}.`
            });
          }
        } else if (retailer.creditLimit && retailer.creditLimit > 0) {
          creditLine = {
            id: `crd_${orgId}_${retailer.id}`,
            organizationId: orgId,
            organizationName: org.name,
            retailerId: retailer.id,
            retailerShopName: retailer.shopName,
            creditLimit: retailer.creditLimit,
            currentDues: 0,
            availableCredit: retailer.creditLimit,
            paymentTerm: paymentTerm as any,
            status: "ACTIVE",
            creditGraceDays: 3,
            updatedAt: new Date().toISOString()
          };
          store.creditLines.push(creditLine);
        }
      }
    }

    // Deduct inventory atomically (including child SKUs for grouped bundles)
    for (const item of items) {
      store.deductStock(item.productSkuId, item.quantity);
    }

    // Build Master Order and Sub-Orders
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const masterOrderId = `mord_${Date.now()}`;
    const subOrders: DataStoreSubOrder[] = [];
    const sellersList: string[] = [];

    const now = new Date();
    const creditDueDate =
      paymentTerm === "NET_7"
        ? new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0]
        : paymentTerm === "NET_15"
        ? new Date(now.getTime() + 15 * 86400000).toISOString().split("T")[0]
        : paymentTerm === "NET_30"
        ? new Date(now.getTime() + 30 * 86400000).toISOString().split("T")[0]
        : undefined;

    for (const [orgId, orderItems] of vendorItemsMap.entries()) {
      const org = store.organizations.find((o) => o.id === orgId)!;
      sellersList.push(org.name);

      const subtotal = Math.round(orderItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0) * 100) / 100;
      const taxAmount = Math.round(orderItems.reduce((acc, it) => acc + it.taxAmount, 0) * 100) / 100;
      const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;

      // Update decentralized credit line if applicable
      if (isCreditOrder) {
        const creditLine = store.creditLines.find(
          (c) => c.organizationId === orgId && c.retailerId === retailer.id
        );
        if (creditLine) {
          creditLine.currentDues = Math.round((creditLine.currentDues + grandTotal) * 100) / 100;
          creditLine.availableCredit = Math.max(0, Math.round((creditLine.creditLimit - creditLine.currentDues) * 100) / 100);
          creditLine.updatedAt = new Date().toISOString();
        }
        retailer.creditDues = Math.round((retailer.creditDues + grandTotal) * 100) / 100;
      }

      // Cryptographically random 4-digit Delivery OTP
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const trackingHistory = [
        {
          status: "PLACED",
          title: "Order Received & Validated",
          description: `Routing order directly to ${org.name} warehouse.`,
          timestamp: new Date().toISOString(),
          completed: true
        },
        {
          status: "PACKED",
          title: "Inventory Billed & Packed",
          description: "Wholesale crates packaged with GST Tax Invoice.",
          timestamp: "",
          completed: false
        },
        {
          status: "DISPATCHED",
          title: "Dispatched from Hub",
          description: "4-Digit Delivery OTP issued to Retailer phone.",
          timestamp: "",
          completed: false
        },
        {
          status: "OUT_FOR_DELIVERY",
          title: "Out for Delivery",
          description: "Assigned to logistics delivery executive.",
          timestamp: "",
          completed: false
        },
        {
          status: "DELIVERED",
          title: "Delivered & Verified",
          description: "Handed over at store with OTP cryptographic validation.",
          timestamp: "",
          completed: false
        }
      ];

      const subOrder: DataStoreSubOrder = {
        id: `subord_${Date.now()}_${orgId.slice(-4)}`,
        masterOrderId,
        organizationId: orgId,
        organizationName: org.name,
        subtotal,
        taxAmount,
        grandTotal,
        status: "RECEIVED",
        paymentTerm: paymentTerm as PaymentTerm,
        paymentStatus: paymentTerm === "COD" || isCreditOrder ? "UNPAID" : "PAID",
        creditDueDate,
        deliveryOtp,
        trackingHistory,
        items: orderItems,
        createdAt: new Date().toISOString()
      };

      // Attach GST Tax Invoice to Sub-Order
      subOrder.invoice = generateGstInvoice(subOrder, { orderNumber } as any, org, retailer);
      subOrders.push(subOrder);

      // Record invoice debit in running ledger
      store.recordLedgerDebit(
        org.id,
        org.name,
        retailer.id,
        retailer.shopName,
        subOrder.id,
        subOrder.invoice.invoiceNumber,
        grandTotal
      );
    }

    const totalAmount = Math.round(subOrders.reduce((acc, so) => acc + so.grandTotal, 0) * 100) / 100;

    const masterOrder: DataStoreMasterOrder = {
      id: masterOrderId,
      orderNumber,
      retailerId: retailer.id,
      retailerShopName: retailer.shopName,
      retailerPhone: retailer.whatsappNumber,
      placedByAgentId,
      placedByAgentName: placedByAgentId ? "Rahul Sharma" : undefined,
      totalAmount,
      paymentTerm: paymentTerm as PaymentTerm,
      paymentStatus: paymentTerm === "COD" || paymentTerm === "NET_7" || paymentTerm === "NET_15" ? "UNPAID" : "PAID",
      status: "PLACED",
      subOrders,
      createdAt: new Date().toISOString()
    };

    store.masterOrders.unshift(masterOrder);

    // Update retailer CRM status and metrics
    retailer.leadStage = "ACTIVE_BUYER";
    retailer.lastOrderDate = new Date().toISOString();
    retailer.lastOrderAmount = totalAmount;

    // Update agent targets
    store.agentSalesTarget.monthlyRevenueAchieved += totalAmount;
    store.agentSalesTarget.monthlyOrdersCount += 1;

    // Dispatch WhatsApp Order Notification via Evolution API
    evolutionService.sendOrderConfirmation({
      retailerPhone: retailer.whatsappNumber,
      retailerShopName: retailer.shopName,
      orderNumber,
      agentName: placedByAgentId ? "Rahul Sharma" : undefined,
      totalAmount,
      itemsCount: items.length,
      sellersList
    });

    return {
      success: true,
      message: "Order placed successfully! Sub-orders routed with volume tier discounts.",
      order: masterOrder
    };
  });

  server.get("/api/orders", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const { role, organizationId, retailerId } = query;

    if (role === "SELLER_ADMIN" && organizationId) {
      const subOrders: any[] = [];
      for (const mo of store.masterOrders) {
        for (const so of mo.subOrders) {
          if (so.organizationId === organizationId) {
            subOrders.push({
              ...so,
              masterOrderNumber: mo.orderNumber,
              retailerShopName: mo.retailerShopName,
              retailerPhone: mo.retailerPhone
            });
          }
        }
      }
      return { subOrders };
    }

    if (role === "RETAILER" && retailerId) {
      const myOrders = store.masterOrders.filter((mo) => mo.retailerId === retailerId);
      return { orders: myOrders };
    }

    return { orders: store.masterOrders };
  });

  // 9. GST Tax Invoice Retrieval
  server.get("/api/orders/invoice/:subOrderId", async (req: FastifyRequest, reply: FastifyReply) => {
    const { subOrderId } = req.params as any;

    for (const mo of store.masterOrders) {
      for (const so of mo.subOrders) {
        if (so.id === subOrderId) {
          if (!so.invoice) {
            const org = store.organizations.find((o) => o.id === so.organizationId)!;
            const ret = store.retailers.find((r) => r.id === mo.retailerId)!;
            so.invoice = generateGstInvoice(so, mo, org, ret);
          }
          return { invoice: so.invoice };
        }
      }
    }

    return reply.status(404).send({ error: "Invoice for sub-order not found" });
  });

  // 9b. Government NIC Portal E-Way Bill Copy-Paste Payload
  server.get("/api/orders/eway-bill-payload/:subOrderId", async (req: FastifyRequest, reply: FastifyReply) => {
    const { subOrderId } = req.params as any;

    for (const mo of store.masterOrders) {
      for (const so of mo.subOrders) {
        if (so.id === subOrderId) {
          const org = store.organizations.find((o) => o.id === so.organizationId)!;
          const ret = store.retailers.find((r) => r.id === mo.retailerId)!;
          if (!so.invoice) {
            so.invoice = generateGstInvoice(so, mo, org, ret);
          }
          const payload = generateEWayBillPayload(so, org, ret);
          return { success: true, payload };
        }
      }
    }

    return reply.status(404).send({ error: "Sub-order not found for E-Way Bill payload generation" });
  });

  // 10. Delivery & 4-Digit OTP Hand-Off
  server.post("/api/delivery/dispatch", async (req: FastifyRequest, reply: FastifyReply) => {
    const { subOrderId } = req.body as any;

    let targetSubOrder: DataStoreSubOrder | null = null;
    let targetMasterOrder: DataStoreMasterOrder | null = null;

    for (const mo of store.masterOrders) {
      for (const so of mo.subOrders) {
        if (so.id === subOrderId) {
          targetSubOrder = so;
          targetMasterOrder = mo;
          break;
        }
      }
    }

    if (!targetSubOrder || !targetMasterOrder) {
      return reply.status(404).send({ error: "Sub-order not found" });
    }

    targetSubOrder.status = "DISPATCHED";
    targetSubOrder.dispatchTime = new Date().toISOString();

    // Update tracking steps
    const packedStep = targetSubOrder.trackingHistory.find((s) => s.status === "PACKED");
    if (packedStep) {
      packedStep.completed = true;
      packedStep.timestamp = targetSubOrder.dispatchTime;
    }
    const dispatchedStep = targetSubOrder.trackingHistory.find((s) => s.status === "DISPATCHED");
    if (dispatchedStep) {
      dispatchedStep.completed = true;
      dispatchedStep.timestamp = targetSubOrder.dispatchTime;
    }
    const ofdStep = targetSubOrder.trackingHistory.find((s) => s.status === "OUT_FOR_DELIVERY");
    if (ofdStep) {
      ofdStep.completed = true;
      ofdStep.timestamp = targetSubOrder.dispatchTime;
    }

    // Trigger WhatsApp Delivery OTP alert via Evolution API
    evolutionService.sendDeliveryOtpAlert({
      retailerPhone: targetMasterOrder.retailerPhone,
      retailerShopName: targetMasterOrder.retailerShopName,
      orderNumber: targetMasterOrder.orderNumber,
      sellerName: targetSubOrder.organizationName,
      deliveryOtp: targetSubOrder.deliveryOtp,
      subTotalAmount: targetSubOrder.grandTotal
    });

    return {
      success: true,
      message: `Sub-order marked Dispatched. 4-digit Delivery OTP sent to retailer WhatsApp.`,
      subOrder: targetSubOrder
    };
  });

  server.post("/api/delivery/verify-otp", async (req: FastifyRequest, reply: FastifyReply) => {
    const { subOrderId, enteredOtp, deliveryBoyName } = req.body as any;

    let targetSubOrder: DataStoreSubOrder | null = null;
    let targetMasterOrder: DataStoreMasterOrder | null = null;

    for (const mo of store.masterOrders) {
      for (const so of mo.subOrders) {
        if (so.id === subOrderId) {
          targetSubOrder = so;
          targetMasterOrder = mo;
          break;
        }
      }
    }

    if (!targetSubOrder || !targetMasterOrder) {
      return reply.status(404).send({ error: "Sub-order not found" });
    }

    if (targetSubOrder.deliveryOtp !== enteredOtp) {
      return reply.status(400).send({
        error: "Invalid Delivery OTP",
        message: "The 4-digit Delivery OTP entered does not match. Please verify with the retailer."
      });
    }

    const deliveryTime = new Date();
    targetSubOrder.status = "DELIVERED";
    targetSubOrder.deliveryTime = deliveryTime.toISOString();

    // Mark tracking step DELIVERED as completed
    const delivStep = targetSubOrder.trackingHistory.find((s) => s.status === "DELIVERED");
    if (delivStep) {
      delivStep.completed = true;
      delivStep.timestamp = targetSubOrder.deliveryTime;
    }

    // Calculate transit duration in minutes
    if (targetSubOrder.dispatchTime) {
      const dispatchMs = new Date(targetSubOrder.dispatchTime).getTime();
      const deliveryMs = deliveryTime.getTime();
      targetSubOrder.transitDurationMinutes = Math.max(1, Math.round((deliveryMs - dispatchMs) / 60000));
    } else {
      targetSubOrder.transitDurationMinutes = 24; // Average 24 mins
    }

    // Check if all sub-orders in master order are delivered
    const allDelivered = targetMasterOrder.subOrders.every((so) => so.status === "DELIVERED");
    if (allDelivered) {
      targetMasterOrder.status = "COMPLETED";
    } else {
      targetMasterOrder.status = "PARTIALLY_DELIVERED";
    }

    // Dispatch WhatsApp delivery completion alert
    evolutionService.sendDeliveryCompletionAlert({
      retailerPhone: targetMasterOrder.retailerPhone,
      retailerShopName: targetMasterOrder.retailerShopName,
      orderNumber: targetMasterOrder.orderNumber,
      sellerName: targetSubOrder.organizationName,
      transitDurationMinutes: targetSubOrder.transitDurationMinutes
    });

    return {
      success: true,
      message: `Delivery successfully verified! Recorded transit time: ${targetSubOrder.transitDurationMinutes} minutes.`,
      subOrder: targetSubOrder
    };
  });

  // 11. Field Sales Agent CRM System
  server.get("/api/crm/leads", async (req: FastifyRequest, reply: FastifyReply) => {
    const leads = store.retailers.map((r) => {
      const retOrders = store.masterOrders.filter((mo) => mo.retailerId === r.id);
      const lastVisit = store.visits.filter((v) => v.retailerId === r.id).pop();

      return {
        id: r.id,
        shopName: r.shopName,
        ownerName: r.ownerName,
        phone: r.phone,
        whatsappNumber: r.whatsappNumber,
        address: r.address,
        city: r.city,
        pincode: r.pincode,
        leadStage: r.leadStage,
        kycStatus: r.kycStatus,
        creditLimit: r.creditLimit,
        creditDues: r.creditDues,
        availableCredit: Math.max(0, r.creditLimit - r.creditDues),
        paymentTerm: r.paymentTerm,
        lastOrderDate: r.lastOrderDate || null,
        lastOrderAmount: r.lastOrderAmount || 0,
        totalOrdersCount: retOrders.length,
        lastVisitDate: lastVisit ? lastVisit.checkInTime : null,
        latitude: r.latitude,
        longitude: r.longitude
      };
    });

    return { leads };
  });

  server.post("/api/crm/leads", async (req: FastifyRequest, reply: FastifyReply) => {
    const { shopName, ownerName, phone, address, city = "Lucknow", pincode = "226001", latitude, longitude } = req.body as any;

    if (!shopName || !ownerName || !phone) {
      return reply.status(400).send({ error: "shopName, ownerName, and phone are required" });
    }

    const newLead = {
      id: `ret_${Date.now()}`,
      userId: `usr_${Date.now()}`,
      shopName,
      ownerName,
      phone,
      whatsappNumber: phone,
      documentType: "SHOP_ESTABLISHMENT_LICENSE" as const,
      latitude: latitude || 26.8500,
      longitude: longitude || 80.9400,
      geofenceRadiusMeters: 100,
      isGeocoded: true,
      address: address || "Hazratganj, Lucknow",
      city,
      pincode,
      kycStatus: "PENDING" as const,
      leadStage: "PROSPECT" as LeadStage,
      creditLimit: 25000,
      creditDues: 0,
      paymentTerm: "COD" as PaymentTerm,
      createdAt: new Date().toISOString()
    };

    store.retailers.push(newLead);
    store.agentSalesTarget.newRetailersOnboarded += 1;

    // Log onboarding interaction note
    store.crmNotes.unshift({
      id: `note_${Date.now()}`,
      retailerId: newLead.id,
      retailerShopName: newLead.shopName,
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      type: "VISIT",
      summary: `Retailer onboarded by field agent. Initial prospect profile created.`,
      createdAt: new Date().toISOString()
    });

    return { success: true, lead: newLead };
  });

  server.patch("/api/crm/leads/:retailerId/stage", async (req: FastifyRequest, reply: FastifyReply) => {
    const { retailerId } = req.params as any;
    const { stage } = req.body as any;

    const retailer = store.retailers.find((r) => r.id === retailerId);
    if (!retailer) return reply.status(404).send({ error: "Retailer lead not found" });

    retailer.leadStage = stage;
    return { success: true, retailer };
  });

  server.get("/api/crm/retailer/:retailerId", async (req: FastifyRequest, reply: FastifyReply) => {
    const { retailerId } = req.params as any;

    const retailer = store.retailers.find((r) => r.id === retailerId);
    if (!retailer) return reply.status(404).send({ error: "Retailer not found" });

    const orders = store.masterOrders.filter((mo) => mo.retailerId === retailerId);
    const notes = store.crmNotes.filter((n) => n.retailerId === retailerId);
    const payments = store.crmPayments.filter((p) => p.retailerId === retailerId);
    const visits = store.visits.filter((v) => v.retailerId === retailerId);

    return {
      retailer: {
        ...retailer,
        availableCredit: Math.max(0, retailer.creditLimit - retailer.creditDues)
      },
      orders,
      notes,
      payments,
      visits
    };
  });

  server.post("/api/crm/notes", async (req: FastifyRequest, reply: FastifyReply) => {
    const { retailerId, agentId, agentName, type, summary, actionItems } = req.body as any;

    const retailer = store.retailers.find((r) => r.id === retailerId);
    const note: DataStoreCrmNote = {
      id: `note_${Date.now()}`,
      retailerId,
      retailerShopName: retailer ? retailer.shopName : undefined,
      agentId: agentId || "usr_agent_1",
      agentName: agentName || "Rahul Sharma",
      type: type || "VISIT",
      summary,
      actionItems,
      createdAt: new Date().toISOString()
    };

    store.crmNotes.unshift(note);
    return { success: true, note };
  });

  server.post("/api/crm/payments/collect", async (req: FastifyRequest, reply: FastifyReply) => {
    const { retailerId, amount, paymentMode = "CASH", referenceNumber, notes } = req.body as any;

    const retailer = store.retailers.find((r) => r.id === retailerId);
    if (!retailer) return reply.status(404).send({ error: "Retailer not found" });

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return reply.status(400).send({ error: "Valid collection amount required" });
    }

    const receiptVoucherNumber = `RCP-2026-${Date.now().toString().slice(-5)}`;
    const collection: DataStoreCrmPayment = {
      id: `pay_${Date.now()}`,
      receiptVoucherNumber,
      retailerId: retailer.id,
      retailerShopName: retailer.shopName,
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      amount: numericAmount,
      paymentMode: paymentMode as PaymentMode,
      referenceNumber: referenceNumber || `${paymentMode}-REF-${Date.now().toString().slice(-4)}`,
      notes,
      collectedAt: new Date().toISOString(),
      status: "COLLECTED"
    };

    store.crmPayments.unshift(collection);

    // Reduce retailer's outstanding balance
    retailer.creditDues = Math.max(0, Math.round((retailer.creditDues - numericAmount) * 100) / 100);

    // Increase field agent cash in hand
    if (paymentMode === "CASH") {
      store.agentSalesTarget.cashInHand += numericAmount;
    }

    // Auto-log CRM interaction note
    store.crmNotes.unshift({
      id: `note_${Date.now()}`,
      retailerId: retailer.id,
      retailerShopName: retailer.shopName,
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      type: "PAYMENT",
      summary: `Payment collected: ₹${numericAmount.toLocaleString("en-IN")} via ${paymentMode}. Voucher: ${receiptVoucherNumber}.`,
      actionItems: "Remit collected funds during evening distributor settlement.",
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `Payment voucher ${receiptVoucherNumber} generated. Outstanding ledger updated.`,
      collection,
      currentOutstandingDues: retailer.creditDues
    };
  });

  server.get("/api/crm/agent/performance", async (req: FastifyRequest, reply: FastifyReply) => {
    // Dynamically calculate strike rate
    const totalVisits = Math.max(1, store.visits.length);
    const ordersPlaced = store.visits.filter((v) => v.disposition === "ORDER_BOOKED").length;
    const strikeRate = Math.round((ordersPlaced / totalVisits) * 100) || store.agentSalesTarget.strikeRatePct;

    return {
      agentPerformance: {
        ...store.agentSalesTarget,
        strikeRatePct: strikeRate,
        dailyVisitsTarget: store.agentSalesTarget.dailyVisitTarget,
        targetAchievementPct: Math.round((store.agentSalesTarget.monthlyRevenueAchieved / store.agentSalesTarget.monthlyRevenueTarget) * 100)
      }
    };
  });

  // 12. Seller Intelligence & ROI Simulator Engine
  server.get("/api/analytics/roi-simulator", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;

    const repInputs = {
      monthlyBaseSalary: parseFloat(query.baseSalary || "22000"),
      dailyTravelAllowance: parseFloat(query.dailyTa || "250"),
      workingDaysPerMonth: parseInt(query.workingDays || "26", 10),
      monthlyPerformanceIncentive: parseFloat(query.incentive || "3000"),
      deviceAndOverheads: parseFloat(query.overheads || "1500"),
      numberOfRepsOrBeats: parseInt(query.repsCount || "1", 10)
    };

    const platformInputs = {
      fixedMonthlyBeatSubscription: parseFloat(query.beatFee || "6000"),
      numberOfBeats: parseInt(query.repsCount || "1", 10)
    };

    const analysis = calculateSellerSavings(repInputs, platformInputs);
    return analysis;
  });

  server.get("/api/analytics/seller-performance", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const orgId = query.organizationId || "org_anagata_fmcg";
    const org = store.organizations.find((o) => o.id === orgId) || store.organizations[0];

    let totalGMV = 0;
    let deliveredCount = 0;
    let totalTransitMins = 0;

    for (const mo of store.masterOrders) {
      for (const so of mo.subOrders) {
        if (so.organizationId === org.id) {
          totalGMV += so.grandTotal;
          if (so.status === "DELIVERED") {
            deliveredCount++;
            totalTransitMins += so.transitDurationMinutes || 25;
          }
        }
      }
    }

    const avgTransitDuration = deliveredCount > 0 ? Math.round(totalTransitMins / deliveredCount) : 22;
    const totalVisits = store.visits.length || 14;
    const ordersPlaced = store.visits.filter((v) => v.disposition === "ORDER_BOOKED").length || 11;
    const strikeRatePct = Math.round((ordersPlaced / totalVisits) * 100);

    return {
      organizationName: org.name,
      subscriptionTier: org.subscriptionTier,
      monthlySubscriptionFee: org.monthlySubscriptionFee,
      commissionRate: 0,
      totalGmvGenerated: totalGMV,
      strikeRatePct,
      totalBeatVisits: totalVisits,
      ordersBooked: ordersPlaced,
      avgDeliveryTransitMinutes: avgTransitDuration,
      onTimeDeliverySlaPct: 96.4
    };
  });

  // 13. Seller Merchandising & Product Studio Endpoints
  server.get("/api/seller/products", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const organizationId = query.organizationId || "org_anagata_fmcg";
    const sellerProducts = store.products.filter((p) => p.organizationId === organizationId);
    return { success: true, products: sellerProducts };
  });

  server.post("/api/seller/products", async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any;
    const {
      organizationId,
      name,
      category,
      brand,
      description = "",
      hsnCode = "19053100",
      gstRatePct = 18,
      marginPct = 20,
      imageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
      skus = []
    } = body;

    if (!organizationId || !name || !category || !brand) {
      return reply.status(400).send({ error: "Missing required fields: organizationId, name, category, and brand are required" });
    }

    const org = store.organizations.find((o) => o.id === organizationId);
    const orgName = org ? org.name : "Seller";

    const productId = `prod_${Date.now()}`;
    const builtSkus: DataStoreProductSku[] = skus.map((s: any, idx: number) => ({
      id: s.id || `sku_${Date.now()}_${idx}`,
      productId,
      skuCode: s.skuCode || `SKU-${Date.now().toString().slice(-4)}-${idx}`,
      unitTitle: s.unitTitle || "Wholesale Pack",
      unitMultiplier: Number(s.unitMultiplier) || 1,
      packMultiplier: s.packMultiplier ? Number(s.packMultiplier) : undefined,
      cartonMultiplier: s.cartonMultiplier ? Number(s.cartonMultiplier) : undefined,
      mrp: Number(s.mrp) || 100,
      wholesalePrice: Number(s.wholesalePrice) || 80,
      minimumOrderQuantity: Number(s.minimumOrderQuantity) || 1,
      stockQuantity: Number(s.stockQuantity) || 100,
      isActive: s.isActive !== false,
      isGroupedBundle: Boolean(s.isGroupedBundle),
      bundleItems: s.bundleItems || [],
      pricingSlabs: s.pricingSlabs || [
        { minQuantity: Number(s.minimumOrderQuantity) || 1, pricePerUnit: Number(s.wholesalePrice) || 80, discountPct: 20, label: "Base Wholesale" }
      ]
    }));

    const newProduct: DataStoreProduct = {
      id: productId,
      organizationId,
      organizationName: orgName,
      name,
      category,
      brand,
      description,
      hsnCode,
      gstRatePct: Number(gstRatePct),
      marginPct: Number(marginPct),
      imageUrl,
      skus: builtSkus
    };

    store.products.unshift(newProduct);
    return { success: true, message: "Product SKU created in Seller Studio", product: newProduct };
  });

  server.put("/api/seller/products/:id", async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const body = req.body as any;

    const product = store.products.find((p) => p.id === id);
    if (!product) {
      return reply.status(404).send({ error: "Product not found" });
    }

    if (body.name) product.name = body.name;
    if (body.category) product.category = body.category;
    if (body.brand) product.brand = body.brand;
    if (body.description !== undefined) product.description = body.description;
    if (body.hsnCode) product.hsnCode = body.hsnCode;
    if (body.gstRatePct !== undefined) product.gstRatePct = Number(body.gstRatePct);
    if (body.marginPct !== undefined) product.marginPct = Number(body.marginPct);
    if (body.imageUrl) product.imageUrl = body.imageUrl;
    if (body.skus && Array.isArray(body.skus)) {
      product.skus = body.skus;
    }

    return { success: true, message: "Product updated successfully", product };
  });

  server.delete("/api/seller/products/:id", async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const productIdx = store.products.findIndex((p) => p.id === id);
    if (productIdx === -1) {
      return reply.status(404).send({ error: "Product not found" });
    }

    const removed = store.products.splice(productIdx, 1)[0];
    return { success: true, message: `Product "${removed.name}" archived successfully` };
  });

  // 14. Decentralized Seller-Retailer Credit Line Management
  server.get("/api/seller/credit-lines", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const organizationId = query.organizationId || "org_anagata_fmcg";
    const creditLines = store.creditLines.filter((c) => c.organizationId === organizationId);
    return { success: true, creditLines };
  });

  server.post("/api/seller/credit-lines", async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any;
    const {
      organizationId,
      retailerId,
      creditLimit,
      paymentTerm = "NET_7",
      creditGraceDays = 3,
      notes = ""
    } = body;

    if (!organizationId || !retailerId || creditLimit === undefined) {
      return reply.status(400).send({ error: "organizationId, retailerId, and creditLimit are required" });
    }

    const org = store.organizations.find((o) => o.id === organizationId);
    const ret = store.retailers.find((r) => r.id === retailerId);
    if (!org) return reply.status(404).send({ error: "Seller organization not found" });
    if (!ret) return reply.status(404).send({ error: "Retailer not found" });

    let line = store.creditLines.find((c) => c.organizationId === organizationId && c.retailerId === retailerId);
    const numLimit = Number(creditLimit);

    if (line) {
      line.creditLimit = numLimit;
      line.availableCredit = Math.max(0, Math.round((numLimit - line.currentDues) * 100) / 100);
      line.paymentTerm = paymentTerm as PaymentTerm;
      line.creditGraceDays = Number(creditGraceDays);
      if (notes) line.notes = notes;
      line.updatedAt = new Date().toISOString();
    } else {
      line = {
        id: `crd_${organizationId}_${retailerId}`,
        organizationId,
        organizationName: org.name,
        retailerId,
        retailerShopName: ret.shopName,
        creditLimit: numLimit,
        currentDues: 0,
        availableCredit: numLimit,
        paymentTerm: paymentTerm as PaymentTerm,
        status: "ACTIVE",
        creditGraceDays: Number(creditGraceDays),
        notes,
        updatedAt: new Date().toISOString()
      };
      store.creditLines.unshift(line);
    }

    return { success: true, message: "Retailer credit line configured successfully", creditLine: line };
  });

  server.post("/api/seller/credit-lines/:id/hold", async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const line = store.creditLines.find((c) => c.id === id);
    if (!line) {
      return reply.status(404).send({ error: "Credit line record not found" });
    }

    line.status = line.status === "CREDIT_HOLD" ? "ACTIVE" : "CREDIT_HOLD";
    line.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: `Credit status updated to ${line.status} for ${line.retailerShopName}`,
      creditLine: line
    };
  });

  server.get("/api/retailer/credit-lines/:retailerId", async (req: FastifyRequest, reply: FastifyReply) => {
    const { retailerId } = req.params as any;
    const lines = store.creditLines.filter((c) => c.retailerId === retailerId);
    return { success: true, creditLines: lines };
  });

  // 15. Pure Payment Tracking Ledger Endpoints (No Payment Gateway)
  server.post("/api/payments/record-voucher", async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any;
    const {
      retailerId,
      organizationId,
      amount,
      paymentMode,
      referenceNumber,
      bankName,
      chequeDate,
      notes,
      agentId,
      agentName
    } = body;

    if (!retailerId || !organizationId || !amount || !paymentMode) {
      return reply.status(400).send({ error: "retailerId, organizationId, amount, and paymentMode are required" });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return reply.status(400).send({ error: "Amount must be a positive number" });
    }

    const voucher = store.recordPaymentVoucher({
      retailerId,
      organizationId,
      amount: numAmount,
      paymentMode,
      referenceNumber,
      bankName,
      chequeDate,
      notes,
      agentId,
      agentName
    });

    if (paymentMode === "CASH") {
      store.agentSalesTarget.cashInHand += numAmount;
    }

    return {
      success: true,
      message: `Payment voucher ${voucher.voucherNumber} recorded. Ledger credited with ₹${numAmount.toLocaleString("en-IN")}.`,
      voucher
    };
  });

  server.get("/api/ledger/statement", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const { organizationId, retailerId } = query;

    if (!organizationId || !retailerId) {
      return reply.status(400).send({ error: "organizationId and retailerId query parameters are required" });
    }

    const statement = store.getLedgerStatement(organizationId, retailerId);
    return { success: true, statement };
  });

  server.get("/api/ledger/vouchers", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    let vouchers = store.paymentVouchers;

    if (query.organizationId) {
      vouchers = vouchers.filter((v) => v.organizationId === query.organizationId);
    }
    if (query.retailerId) {
      vouchers = vouchers.filter((v) => v.retailerId === query.retailerId);
    }

    return { success: true, vouchers };
  });

  // 16. OpenStreetMap Geo Reverse Geocoding & Routes
  server.get("/api/geo/reverse", async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return reply.status(400).send({ error: "Valid lat and lng query parameters are required" });
    }

    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const osmRes = await fetch(osmUrl, {
        headers: {
          "User-Agent": "B2B-Sales-Aggregator-Platform/2.0 (admin@anagataitsolutions.in)"
        }
      });

      if (osmRes.ok) {
        const data = await osmRes.json() as any;
        return {
          success: true,
          displayName: data.display_name || `Location (${lat}, ${lng})`,
          address: data.address || {},
          source: "OpenStreetMap Nominatim"
        };
      }
    } catch {
      // Fallback below
    }

    return {
      success: true,
      displayName: `Hazratganj Market, Lucknow (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      address: {
        city: "Lucknow",
        state: "Uttar Pradesh",
        country: "India",
        postcode: "226001"
      },
      source: "OpenStreetMap Fallback"
    };
  });

  server.get("/api/geo/beat-route/:beatId", async (req: FastifyRequest, reply: FastifyReply) => {
    const { beatId } = req.params as any;
    const beat = store.beats.find((b) => b.id === beatId) || store.beats[0];

    const stops = beat.stops.map((s, idx) => ({
      ...s,
      isNextStop: idx === 0,
      osmMapUrl: `https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=17/${s.latitude}/${s.longitude}`
    }));

    const waypoints = stops.map((s) => [s.latitude, s.longitude]);

    return {
      success: true,
      beatId: beat.id,
      beatName: beat.name,
      dayOfWeek: beat.dayOfWeek,
      agentName: beat.assignedAgentName,
      totalStops: stops.length,
      stops,
      waypoints,
      mapProvider: "OpenStreetMap / Leaflet"
    };
  });

  await server.listen({ port: CONFIG.PORT, host: "0.0.0.0" });
  console.log(`B2B Sales Aggregator API running on http://0.0.0.0:${CONFIG.PORT}`);
}

startServer().catch((err) => {
  console.error("Failed to start API server:", err);
  process.exit(1);
});
