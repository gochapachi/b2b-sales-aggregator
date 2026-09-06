export type LeadStage = "PROSPECT" | "CONTACTED" | "KYC_PENDING" | "KYC_VERIFIED" | "ACTIVE_BUYER" | "DORMANT";
export type PaymentTerm = "COD" | "NET_7" | "NET_15" | "NET_30" | "UPI_INSTANT" | "NEFT_RTGS";
export type PaymentMode = "CASH" | "UPI_QR" | "CHEQUE" | "BANK_TRANSFER";
export type VisitPurpose = "ROUTINE_ORDER" | "NEW_PRODUCT_LAUNCH" | "PAYMENT_COLLECTION" | "KYC_DOCUMENT_COLLECTION" | "STOCK_AUDIT" | "COMPLAINT_RESOLUTION";

export interface DataStoreUser {
  id: string;
  phone: string;
  name: string;
  role: "SUPER_ADMIN" | "SELLER_ADMIN" | "SALES_AGENT" | "RETAILER";
  status: "ACTIVE" | "PENDING_KYC" | "SUSPENDED";
  createdAt: string;
}

export interface DataStoreOrganization {
  id: string;
  ownerId: string;
  name: string;
  tradeName: string;
  gstin: string;
  address: string;
  contactPhone: string;
  minimumOrderValue: number;
  subscriptionTier: "FREE_LISTING" | "STARTER_BEAT" | "GROWTH_BEAT" | "ENTERPRISE_BEAT";
  monthlySubscriptionFee: number;
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
  kycDocUrl?: string;
  createdAt: string;
}

export interface DataStoreRetailerProfile {
  id: string;
  userId: string;
  shopName: string;
  ownerName: string;
  phone: string;
  whatsappNumber: string;
  gstin?: string;
  panOrUdyam?: string;
  documentType: "GSTIN" | "PAN" | "UDYAM" | "SHOP_ESTABLISHMENT_LICENSE" | "TRADE_LICENSE";
  kycDocUrl?: string;
  shopPhotoUrl?: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  isGeocoded: boolean;
  address: string;
  city: string;
  pincode: string;
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  leadStage: LeadStage;
  creditLimit: number;
  creditDues: number;
  paymentTerm: PaymentTerm;
  lastOrderDate?: string;
  lastOrderAmount?: number;
  createdAt: string;
}

export interface DataStorePricingSlab {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  discountPct: number;
  label: string;
}

export interface DataStoreProductSku {
  id: string;
  productId: string;
  skuCode: string;
  unitTitle: string;
  unitMultiplier: number;
  mrp: number;
  wholesalePrice: number;
  minimumOrderQuantity: number;
  stockQuantity: number;
  isActive: boolean;
  pricingSlabs?: DataStorePricingSlab[];
}

export interface DataStoreProduct {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  hsnCode: string;
  gstRatePct: number;
  marginPct: number;
  imageUrl?: string;
  skus: DataStoreProductSku[];
}

export interface DataStoreBeatStop {
  id: string;
  beatId: string;
  retailerId: string;
  shopName: string;
  ownerName: string;
  sequenceOrder: number;
  latitude: number;
  longitude: number;
  address: string;
  whatsappNumber: string;
}

export interface DataStoreBeat {
  id: string;
  territoryId: string;
  name: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
  assignedAgentId: string;
  assignedAgentName: string;
  stops: DataStoreBeatStop[];
}

export interface DataStoreVisit {
  id: string;
  agentId: string;
  agentName: string;
  retailerId: string;
  shopName: string;
  beatId: string;
  purpose?: VisitPurpose;
  checkInTime: string;
  checkOutTime?: string;
  checkInLat: number;
  checkInLng: number;
  isWithinGeofence: boolean;
  distanceMeters: number;
  disposition: "ORDER_BOOKED" | "STOCK_FULL" | "OWNER_UNAVAILABLE" | "STORE_CLOSED" | "PRICE_ISSUE" | "OTHER";
  notes?: string;
  storeSelfieUrl?: string;
  masterOrderId?: string;
  paymentCollectedAmount?: number;
  createdAt: string;
}

export interface DataStoreOrderItem {
  id: string;
  subOrderId: string;
  productSkuId: string;
  productName: string;
  skuCode: string;
  unitTitle: string;
  quantity: number;
  unitPrice: number;
  appliedSlabMinQty?: number;
  taxPct: number;
  taxAmount: number;
  totalPrice: number;
}

export interface DataStoreOrderTrackingStep {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface DataStoreGstTaxInvoiceItem {
  itemDescription: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface DataStoreGstTaxInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  seller: {
    name: string;
    tradeName?: string;
    gstin: string;
    address: string;
    phone: string;
    state: string;
    stateCode: string;
  };
  buyer: {
    shopName: string;
    ownerName: string;
    gstin?: string;
    pan?: string;
    address: string;
    phone: string;
    state: string;
    stateCode: string;
  };
  orderNumber: string;
  subOrderId: string;
  paymentTerm: PaymentTerm;
  items: DataStoreGstTaxInvoiceItem[];
  taxableSubtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  irn: string;
  qrCodeData: string;
}

export interface DataStoreSubOrder {
  id: string;
  masterOrderId: string;
  organizationId: string;
  organizationName: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: "RECEIVED" | "ACCEPTED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  paymentTerm: PaymentTerm;
  paymentStatus: "UNPAID" | "PAID" | "PARTIALLY_PAID";
  creditDueDate?: string;
  deliveryOtp: string;
  dispatchTime?: string;
  deliveryTime?: string;
  transitDurationMinutes?: number;
  trackingHistory: DataStoreOrderTrackingStep[];
  invoice?: DataStoreGstTaxInvoice;
  items: DataStoreOrderItem[];
  createdAt: string;
}

export interface DataStoreMasterOrder {
  id: string;
  orderNumber: string;
  retailerId: string;
  retailerShopName: string;
  retailerPhone: string;
  placedByAgentId?: string;
  placedByAgentName?: string;
  totalAmount: number;
  paymentTerm: PaymentTerm;
  paymentStatus: "UNPAID" | "PAID" | "PARTIALLY_PAID";
  status: "PLACED" | "PARTIALLY_DELIVERED" | "COMPLETED" | "CANCELLED";
  subOrders: DataStoreSubOrder[];
  createdAt: string;
}

export interface DataStoreCrmNote {
  id: string;
  retailerId: string;
  retailerShopName?: string;
  agentId: string;
  agentName: string;
  type: "VISIT" | "PHONE_CALL" | "PAYMENT" | "COMPLAINT" | "REORDER";
  summary: string;
  actionItems?: string;
  createdAt: string;
}

export interface DataStoreCrmPayment {
  id: string;
  receiptVoucherNumber: string;
  retailerId: string;
  retailerShopName: string;
  agentId: string;
  agentName: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNumber?: string;
  notes?: string;
  collectedAt: string;
  status: "COLLECTED" | "DEPOSITED_TO_COMPANY";
}

export interface DataStoreAgentSalesTarget {
  agentId: string;
  agentName: string;
  month: string;
  monthlyRevenueTarget: number;
  monthlyRevenueAchieved: number;
  dailyVisitTarget: number;
  dailyVisitsCompletedToday: number;
  strikeRatePct: number;
  monthlyOrdersCount: number;
  newRetailersOnboarded: number;
  cashInHand: number;
  incentiveEarned: number;
}

export function generateGstInvoice(
  subOrder: DataStoreSubOrder,
  masterOrder: DataStoreMasterOrder,
  sellerOrg: DataStoreOrganization,
  retailer: DataStoreRetailerProfile
): DataStoreGstTaxInvoice {
  const invoiceNumber = `INV-2026-${subOrder.id.slice(-6).toUpperCase()}`;
  const invoiceDate = new Date().toISOString();

  const invoiceItems: DataStoreGstTaxInvoiceItem[] = subOrder.items.map((item) => {
    const taxableValue = Math.round(item.unitPrice * item.quantity * 100) / 100;
    const halfRate = item.taxPct / 2;
    const cgstAmount = Math.round(((taxableValue * halfRate) / 100) * 100) / 100;
    const sgstAmount = Math.round(((taxableValue * halfRate) / 100) * 100) / 100;
    const totalAmount = Math.round((taxableValue + cgstAmount + sgstAmount) * 100) / 100;

    return {
      itemDescription: `${item.productName} (${item.unitTitle})`,
      hsnCode: item.productName.includes("Biscuit") ? "19053100" : item.productName.includes("Tea") ? "09024010" : "22021010",
      quantity: item.quantity,
      unit: "UNITS",
      rate: item.unitPrice,
      taxableValue,
      cgstRate: halfRate,
      cgstAmount,
      sgstRate: halfRate,
      sgstAmount,
      igstRate: 0,
      igstAmount: 0,
      totalAmount
    };
  });

  const taxableSubtotal = invoiceItems.reduce((acc, it) => acc + it.taxableValue, 0);
  const cgstTotal = invoiceItems.reduce((acc, it) => acc + it.cgstAmount, 0);
  const sgstTotal = invoiceItems.reduce((acc, it) => acc + it.sgstAmount, 0);
  const grandTotal = Math.round((taxableSubtotal + cgstTotal + sgstTotal) * 100) / 100;

  return {
    invoiceNumber,
    invoiceDate,
    seller: {
      name: sellerOrg.name,
      tradeName: sellerOrg.tradeName,
      gstin: sellerOrg.gstin,
      address: sellerOrg.address,
      phone: sellerOrg.contactPhone,
      state: "Uttar Pradesh",
      stateCode: "09"
    },
    buyer: {
      shopName: retailer.shopName,
      ownerName: retailer.ownerName,
      gstin: retailer.gstin,
      pan: retailer.panOrUdyam,
      address: retailer.address,
      phone: retailer.whatsappNumber,
      state: "Uttar Pradesh",
      stateCode: "09"
    },
    orderNumber: masterOrder.orderNumber,
    subOrderId: subOrder.id,
    paymentTerm: subOrder.paymentTerm,
    items: invoiceItems,
    taxableSubtotal: Math.round(taxableSubtotal * 100) / 100,
    cgstTotal: Math.round(cgstTotal * 100) / 100,
    sgstTotal: Math.round(sgstTotal * 100) / 100,
    igstTotal: 0,
    grandTotal,
    irn: `8f3b${Date.now().toString(16)}a9c1482e90df54a72d3f99b24e6a0d`,
    qrCodeData: `upi://pay?pa=billing@anagata.b2b&pn=${encodeURIComponent(sellerOrg.name)}&am=${grandTotal}&cu=INR&tr=${invoiceNumber}`
  };
}

class InMemoryDataStore {
  users: DataStoreUser[] = [
    {
      id: "usr_superadmin",
      phone: "9999999999",
      name: "Platform SuperAdmin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_seller_1",
      phone: "9888888888",
      name: "Vikram Agarwal (Anagata FMCG)",
      role: "SELLER_ADMIN",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_seller_2",
      phone: "9777777777",
      name: "Amit Tandon (Awadh Beverages)",
      role: "SELLER_ADMIN",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_agent_1",
      phone: "9666666666",
      name: "Rahul Sharma (Field Sales Agent)",
      role: "SALES_AGENT",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_ret_1",
      phone: "9555555555",
      name: "Ramesh Gupta",
      role: "RETAILER",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_ret_2",
      phone: "9444444444",
      name: "Suresh Sharma",
      role: "RETAILER",
      status: "PENDING_KYC",
      createdAt: new Date().toISOString()
    }
  ];

  organizations: DataStoreOrganization[] = [
    {
      id: "org_anagata_fmcg",
      ownerId: "usr_seller_1",
      name: "Anagata FMCG Wholesale",
      tradeName: "Anagata IT & Wholesale Solutions",
      gstin: "09AABCA1234F1Z5",
      address: "Plot 12, Transport Nagar, Lucknow, UP",
      contactPhone: "9888888888",
      minimumOrderValue: 1500,
      subscriptionTier: "STARTER_BEAT",
      monthlySubscriptionFee: 6000,
      kycStatus: "VERIFIED",
      kycDocUrl: "https://server.anagataitsolutions.in/docs/gst_anagata.pdf",
      createdAt: new Date().toISOString()
    },
    {
      id: "org_awadh_beverages",
      ownerId: "usr_seller_2",
      name: "Awadh Beverages & Confectionery",
      tradeName: "Awadh Beverage Distributors LLP",
      gstin: "09XYZAB5678M1Z2",
      address: "Warehouse 4, Aishbagh Industrial Area, Lucknow",
      contactPhone: "9777777777",
      minimumOrderValue: 2000,
      subscriptionTier: "GROWTH_BEAT",
      monthlySubscriptionFee: 9000,
      kycStatus: "VERIFIED",
      kycDocUrl: "https://server.anagataitsolutions.in/docs/gst_awadh.pdf",
      createdAt: new Date().toISOString()
    }
  ];

  retailers: DataStoreRetailerProfile[] = [
    {
      id: "ret_gupta_kirana",
      userId: "usr_ret_1",
      shopName: "Gupta Kirana & General Store",
      ownerName: "Ramesh Gupta",
      phone: "9555555555",
      whatsappNumber: "9555555555",
      gstin: "09ABCDE1234F1Z8",
      documentType: "GSTIN",
      kycDocUrl: "https://server.anagataitsolutions.in/docs/gupta_gst.pdf",
      shopPhotoUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
      latitude: 26.8467,
      longitude: 80.9462,
      geofenceRadiusMeters: 100,
      isGeocoded: true,
      address: "Shop 4, Near Mayfair, Hazratganj",
      city: "Lucknow",
      pincode: "226001",
      kycStatus: "VERIFIED",
      leadStage: "ACTIVE_BUYER",
      creditLimit: 50000,
      creditDues: 14200,
      paymentTerm: "NET_7",
      lastOrderDate: "2026-09-04T10:30:00Z",
      lastOrderAmount: 8450,
      createdAt: new Date().toISOString()
    },
    {
      id: "ret_sharma_general",
      userId: "usr_ret_2",
      shopName: "Sharma General Provision Store",
      ownerName: "Suresh Sharma",
      phone: "9444444444",
      whatsappNumber: "9444444444",
      panOrUdyam: "UDYAM-UP-28-0012345",
      documentType: "UDYAM",
      kycDocUrl: "https://server.anagataitsolutions.in/docs/sharma_udyam.pdf",
      shopPhotoUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500",
      latitude: 26.852,
      longitude: 80.949,
      geofenceRadiusMeters: 100,
      isGeocoded: true,
      address: "Main Road, Narahi Market, Hazratganj",
      city: "Lucknow",
      pincode: "226001",
      kycStatus: "PENDING",
      leadStage: "KYC_PENDING",
      creditLimit: 0,
      creditDues: 0,
      paymentTerm: "COD",
      createdAt: new Date().toISOString()
    },
    {
      id: "ret_maurya_traders",
      userId: "usr_ret_3",
      shopName: "Maurya Super Mart",
      ownerName: "Vinod Maurya",
      phone: "9333333333",
      whatsappNumber: "9333333333",
      gstin: "09AABCM9876K1Z1",
      documentType: "GSTIN",
      shopPhotoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
      latitude: 26.8215,
      longitude: 80.9124,
      geofenceRadiusMeters: 100,
      isGeocoded: true,
      address: "VIP Road, Alambagh",
      city: "Lucknow",
      pincode: "226005",
      kycStatus: "VERIFIED",
      leadStage: "PROSPECT",
      creditLimit: 30000,
      creditDues: 0,
      paymentTerm: "COD",
      createdAt: new Date().toISOString()
    },
    {
      id: "ret_verma_store",
      userId: "usr_ret_4",
      shopName: "Verma Brothers Wholesale & Retail",
      ownerName: "Rajesh Verma",
      phone: "9222222222",
      whatsappNumber: "9222222222",
      gstin: "09XYZVB4321R1Z9",
      documentType: "GSTIN",
      shopPhotoUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500",
      latitude: 26.8485,
      longitude: 80.9321,
      geofenceRadiusMeters: 100,
      isGeocoded: true,
      address: "Ganeshganj, Aminabad",
      city: "Lucknow",
      pincode: "226018",
      kycStatus: "VERIFIED",
      leadStage: "ACTIVE_BUYER",
      creditLimit: 75000,
      creditDues: 28500,
      paymentTerm: "NET_15",
      lastOrderDate: "2026-09-02T14:15:00Z",
      lastOrderAmount: 14200,
      createdAt: new Date().toISOString()
    },
    {
      id: "ret_singh_provisions",
      userId: "usr_ret_5",
      shopName: "Singh Daily Needs",
      ownerName: "Amarjeet Singh",
      phone: "9111111111",
      whatsappNumber: "9111111111",
      documentType: "PAN",
      panOrUdyam: "ABCPS1234D",
      latitude: 26.8621,
      longitude: 80.9984,
      geofenceRadiusMeters: 100,
      isGeocoded: true,
      address: "Patrakarpuram, Gomti Nagar",
      city: "Lucknow",
      pincode: "226010",
      kycStatus: "VERIFIED",
      leadStage: "DORMANT",
      creditLimit: 35000,
      creditDues: 6000,
      paymentTerm: "NET_7",
      lastOrderDate: "2026-08-15T11:00:00Z",
      lastOrderAmount: 6000,
      createdAt: new Date().toISOString()
    }
  ];

  products: DataStoreProduct[] = [
    {
      id: "prod_parleg",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      name: "Parle-G Glucose Biscuits (80g)",
      category: "Biscuits & Confectionery",
      brand: "Parle",
      description: "Original Glucose biscuit pack. High rotation fast-moving retail SKU.",
      hsnCode: "19053100",
      gstRatePct: 18,
      marginPct: 19.4,
      imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500",
      skus: [
        {
          id: "sku_parle_carton",
          productId: "prod_parleg",
          skuCode: "PARLE-G-80G-CTN-72",
          unitTitle: "Master Carton (72 packets)",
          unitMultiplier: 72,
          mrp: 720,
          wholesalePrice: 580,
          minimumOrderQuantity: 2,
          stockQuantity: 240,
          isActive: true,
          pricingSlabs: [
            { minQuantity: 2, maxQuantity: 4, pricePerUnit: 580, discountPct: 19.4, label: "2 - 4 Cartons (Base Wholesale)" },
            { minQuantity: 5, maxQuantity: 9, pricePerUnit: 560, discountPct: 22.2, label: "5 - 9 Cartons (₹20 Off/Ctn)" },
            { minQuantity: 10, pricePerUnit: 540, discountPct: 25.0, label: "10+ Cartons Super Saver (₹40 Off/Ctn)" }
          ]
        }
      ]
    },
    {
      id: "prod_tata_tea",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      name: "Tata Tea Gold (250g)",
      category: "Tea & Beverages",
      brand: "Tata Consumer",
      description: "Rich premium tea blend with 15% long leaves.",
      hsnCode: "09024010",
      gstRatePct: 5,
      marginPct: 17.2,
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500",
      skus: [
        {
          id: "sku_tata_tea_box",
          productId: "prod_tata_tea",
          skuCode: "TATA-GOLD-250G-BX-20",
          unitTitle: "Wholesale Bundle (20 packs)",
          unitMultiplier: 20,
          mrp: 3200,
          wholesalePrice: 2650,
          minimumOrderQuantity: 1,
          stockQuantity: 110,
          isActive: true,
          pricingSlabs: [
            { minQuantity: 1, maxQuantity: 2, pricePerUnit: 2650, discountPct: 17.2, label: "1 - 2 Bundles (Base)" },
            { minQuantity: 3, maxQuantity: 5, pricePerUnit: 2580, discountPct: 19.4, label: "3 - 5 Bundles (₹70 Off)" },
            { minQuantity: 6, pricePerUnit: 2490, discountPct: 22.2, label: "6+ Bundles Distributor Rate (₹160 Off)" }
          ]
        }
      ]
    },
    {
      id: "prod_limca",
      organizationId: "org_awadh_beverages",
      organizationName: "Awadh Beverages & Confectionery",
      name: "Limca Lemon Drink (750ml PET)",
      category: "Cold Drinks & Beverages",
      brand: "Coca-Cola / Limca",
      description: "Refreshing lemon drink in easy-to-chill 750ml bottles.",
      hsnCode: "22021010",
      gstRatePct: 28,
      marginPct: 22.9,
      imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
      skus: [
        {
          id: "sku_limca_crate",
          productId: "prod_limca",
          skuCode: "LIMCA-750ML-CRATE-24",
          unitTitle: "Cold Storage Crate (24 bottles)",
          unitMultiplier: 24,
          mrp: 960,
          wholesalePrice: 740,
          minimumOrderQuantity: 2,
          stockQuantity: 95,
          isActive: true,
          pricingSlabs: [
            { minQuantity: 2, maxQuantity: 4, pricePerUnit: 740, discountPct: 22.9, label: "2 - 4 Crates (Base)" },
            { minQuantity: 5, maxQuantity: 9, pricePerUnit: 710, discountPct: 26.0, label: "5 - 9 Crates (₹30 Off/Crate)" },
            { minQuantity: 10, pricePerUnit: 675, discountPct: 29.7, label: "10+ Crates High Volume (₹65 Off/Crate)" }
          ]
        }
      ]
    },
    {
      id: "prod_amul_taaza",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      name: "Amul Taaza Homogenised Toned Milk (1L)",
      category: "Dairy & Spreads",
      brand: "Amul",
      description: "Pure cow-buffalo milk processed with UHT technology. 90 days shelf life.",
      hsnCode: "04012000",
      gstRatePct: 5,
      marginPct: 11.1,
      imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500",
      skus: [
        {
          id: "sku_amul_carton",
          productId: "prod_amul_taaza",
          skuCode: "AMUL-TAAZA-1L-CTN-24",
          unitTitle: "Master Box (24 packs)",
          unitMultiplier: 24,
          mrp: 1728,
          wholesalePrice: 1536,
          minimumOrderQuantity: 2,
          stockQuantity: 150,
          isActive: true,
          pricingSlabs: [
            { minQuantity: 2, maxQuantity: 4, pricePerUnit: 1536, discountPct: 11.1, label: "2 - 4 Boxes (Wholesale)" },
            { minQuantity: 5, maxQuantity: 9, pricePerUnit: 1500, discountPct: 13.2, label: "5 - 9 Boxes (Bulk Rate)" },
            { minQuantity: 10, pricePerUnit: 1464, discountPct: 15.3, label: "10+ Boxes Dairy Hub Rate" }
          ]
        }
      ]
    },
    {
      id: "prod_britannia_goodday",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      name: "Britannia Good Day Butter Cookies (120g)",
      category: "Biscuits & Confectionery",
      brand: "Britannia",
      description: "Smile cookies baked with richness of butter and cashew crunch.",
      hsnCode: "19053100",
      gstRatePct: 18,
      marginPct: 18.1,
      imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
      skus: [
        {
          id: "sku_goodday_carton",
          productId: "prod_britannia_goodday",
          skuCode: "GD-BUTTER-120G-CTN-48",
          unitTitle: "Master Carton (48 packs)",
          unitMultiplier: 48,
          mrp: 1440,
          wholesalePrice: 1180,
          minimumOrderQuantity: 2,
          stockQuantity: 180,
          isActive: true,
          pricingSlabs: [
            { minQuantity: 2, maxQuantity: 4, pricePerUnit: 1180, discountPct: 18.1, label: "2 - 4 Cartons" },
            { minQuantity: 5, maxQuantity: 9, pricePerUnit: 1140, discountPct: 20.8, label: "5 - 9 Cartons (₹40 Off)" },
            { minQuantity: 10, pricePerUnit: 1090, discountPct: 24.3, label: "10+ Cartons Super Deal (₹90 Off)" }
          ]
        }
      ]
    },
    {
      id: "prod_fortune_oil",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      name: "Fortune Sunlite Refined Sunflower Oil (1L Pouch)",
      category: "Edibles & Oils",
      brand: "Fortune (Adani Wilmar)",
      description: "Light and healthy refined sunflower cooking oil with Vitamin A & D.",
      hsnCode: "15121910",
      gstRatePct: 5,
      marginPct: 13.3,
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
      skus: [
        {
          id: "sku_fortune_box",
          productId: "prod_fortune_oil",
          skuCode: "FORTUNE-SUN-1L-BX-12",
          unitTitle: "Corrugated Box (12 pouches)",
          unitMultiplier: 12,
          mrp: 1800,
          wholesalePrice: 1560,
          minimumOrderQuantity: 2,
          stockQuantity: 130,
          isActive: true,
          pricingSlabs: [
            { minQuantity: 2, maxQuantity: 4, pricePerUnit: 1560, discountPct: 13.3, label: "2 - 4 Boxes" },
            { minQuantity: 5, maxQuantity: 9, pricePerUnit: 1510, discountPct: 16.1, label: "5 - 9 Boxes (₹50 Off)" },
            { minQuantity: 10, pricePerUnit: 1450, discountPct: 19.4, label: "10+ Boxes Wholesale Special (₹110 Off)" }
          ]
        }
      ]
    }
  ];

  beats: DataStoreBeat[] = [
    {
      id: "beat_hazratganj_mon",
      territoryId: "terr_lucknow_central",
      name: "Hazratganj & Narahi Beat (Monday)",
      dayOfWeek: "MONDAY",
      assignedAgentId: "usr_agent_1",
      assignedAgentName: "Rahul Sharma",
      stops: [
        {
          id: "stop_1",
          beatId: "beat_hazratganj_mon",
          retailerId: "ret_gupta_kirana",
          shopName: "Gupta Kirana & General Store",
          ownerName: "Ramesh Gupta",
          sequenceOrder: 1,
          latitude: 26.8467,
          longitude: 80.9462,
          address: "Shop 4, Near Mayfair, Hazratganj",
          whatsappNumber: "9555555555"
        },
        {
          id: "stop_2",
          beatId: "beat_hazratganj_mon",
          retailerId: "ret_sharma_general",
          shopName: "Sharma General Provision Store",
          ownerName: "Suresh Sharma",
          sequenceOrder: 2,
          latitude: 26.852,
          longitude: 80.949,
          address: "Main Road, Narahi Market, Hazratganj",
          whatsappNumber: "9444444444"
        },
        {
          id: "stop_3",
          beatId: "beat_hazratganj_mon",
          retailerId: "ret_verma_store",
          shopName: "Verma Brothers Wholesale & Retail",
          ownerName: "Rajesh Verma",
          sequenceOrder: 3,
          latitude: 26.8485,
          longitude: 80.9321,
          address: "Ganeshganj, Aminabad",
          whatsappNumber: "9222222222"
        }
      ]
    }
  ];

  visits: DataStoreVisit[] = [];
  masterOrders: DataStoreMasterOrder[] = [];

  crmNotes: DataStoreCrmNote[] = [
    {
      id: "note_1",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      type: "VISIT",
      summary: "In-store beat visit conducted. Booked 3 cartons Parle-G & 2 crates Limca under Net-7 credit terms.",
      actionItems: "Follow up for next Monday reorder and dispatch reminder via WhatsApp.",
      createdAt: "2026-09-04T11:00:00Z"
    },
    {
      id: "note_2",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      type: "PAYMENT",
      summary: "Collected ₹12,000 in cash against pending balance. Physical receipt voucher issued.",
      actionItems: "Deposit cash to company distributor counter by 7 PM.",
      createdAt: "2026-09-05T14:30:00Z"
    },
    {
      id: "note_3",
      retailerId: "ret_sharma_general",
      retailerShopName: "Sharma General Provision Store",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      type: "VISIT",
      summary: "KYC document verified physically. Udyam cert scanned and shop geofence validated within 100m.",
      actionItems: "Admin to approve KYC so retailer can unlock wholesale tier pricing.",
      createdAt: "2026-09-05T16:15:00Z"
    },
    {
      id: "note_4",
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      type: "REORDER",
      summary: "Confirmed high festive demand for Tata Tea Gold and Fortune Sunflower oil. Order ready for Net-15 approval.",
      actionItems: "Review credit dues before extending additional ₹30,000 credit limit.",
      createdAt: "2026-09-06T10:00:00Z"
    }
  ];

  crmPayments: DataStoreCrmPayment[] = [
    {
      id: "pay_1",
      receiptVoucherNumber: "RCP-2026-0811",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      amount: 12000,
      paymentMode: "CASH",
      referenceNumber: "CASH-LKO-9941",
      notes: "Part-clearance for August delivery sub-orders",
      collectedAt: "2026-09-05T14:30:00Z",
      status: "COLLECTED"
    },
    {
      id: "pay_2",
      receiptVoucherNumber: "RCP-2026-0804",
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      amount: 8500,
      paymentMode: "UPI_QR",
      referenceNumber: "UPI/394857284910/OKBIZAXIS",
      notes: "Instant settlement via on-spot dynamic QR",
      collectedAt: "2026-09-04T17:20:00Z",
      status: "DEPOSITED_TO_COMPANY"
    }
  ];

  agentSalesTarget: DataStoreAgentSalesTarget = {
    agentId: "usr_agent_1",
    agentName: "Rahul Sharma",
    month: "September 2026",
    monthlyRevenueTarget: 500000,
    monthlyRevenueAchieved: 384500,
    dailyVisitTarget: 18,
    dailyVisitsCompletedToday: 14,
    strikeRatePct: 78,
    monthlyOrdersCount: 42,
    newRetailersOnboarded: 8,
    cashInHand: 18400,
    incentiveEarned: 11535
  };
}

export const store = new InMemoryDataStore();
