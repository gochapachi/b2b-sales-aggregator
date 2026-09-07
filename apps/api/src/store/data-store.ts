export type LeadStage = "PROSPECT" | "CONTACTED" | "KYC_PENDING" | "KYC_VERIFIED" | "ACTIVE_BUYER" | "DORMANT";
export type PaymentTerm = "COD" | "NET_7" | "NET_15" | "NET_30" | "NET_45" | "WEEKLY_SETTLEMENT" | "UPI_INSTANT" | "NEFT_RTGS";
export type PaymentMode = "CASH" | "UPI_QR" | "CHEQUE" | "BANK_TRANSFER" | "DIRECT_SELLER_UPI";
export type CreditLineStatus = "ACTIVE" | "CREDIT_HOLD" | "UNDER_REVIEW" | "REJECTED";
export type LedgerEntryType = "INVOICE" | "PAYMENT_VOUCHER" | "CREDIT_NOTE";
export type VisitPurpose = "ROUTINE_ORDER" | "NEW_PRODUCT_LAUNCH" | "PAYMENT_COLLECTION" | "KYC_DOCUMENT_COLLECTION" | "STOCK_AUDIT" | "COMPLAINT_RESOLUTION";
export type BatchStatus = "ACTIVE" | "NEAR_EXPIRY" | "EXPIRED" | "EXHAUSTED";
export type TradeSchemeType = "BUY_X_GET_Y_FREE" | "CROSS_BRAND_BUNDLE" | "HAPPY_HOURS" | "CASH_DISCOUNT_IMMEDIATE" | "TARGET_REBATE";
export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
export type PdcStatus = "RECEIVED" | "DEPOSITED" | "CLEARED" | "BOUNCED" | "CANCELLED";
export type KhataEntryType = "CREDIT_GIVEN" | "PAYMENT_RECEIVED";
export type ReturnReason = "DAMAGED_IN_TRANSIT" | "EXPIRED" | "PACKAGING_LEAK" | "NEAR_EXPIRY_REJECTED" | "QUALITY_ISSUE";

export interface DataStoreProductBatch {
  id: string;
  skuId: string;
  skuCode: string;
  productName: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  daysToExpiry: number;
  quantityInitial: number;
  quantityAvailable: number;
  godownLocation: string;
  binLocation?: string;
  costPrice: number;
  status: BatchStatus;
  nearExpiryDiscountPct?: number;
}

export interface DataStoreGoodsReceiptNote {
  id: string;
  grnNumber: string;
  poNumber: string;
  vendorName: string;
  receivedDate: string;
  itemsReceived: Array<{
    skuId: string;
    productName: string;
    batchNumber: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitCost: number;
    expiryDate: string;
  }>;
  totalInvoiceAmount: number;
  notes?: string;
  verifiedBy: string;
}

export interface DataStoreCreditNote {
  id: string;
  creditNoteNumber: string;
  originalInvoiceNumber: string;
  originalInvoiceDate: string;
  retailerId: string;
  retailerShopName: string;
  retailerGstin?: string;
  organizationId: string;
  organizationName: string;
  reason: ReturnReason;
  items: Array<{
    skuId: string;
    productName: string;
    hsnCode: string;
    quantity: number;
    ratePerUnit: number;
    taxableValue: number;
    gstRatePct: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  totalTaxableValue: number;
  totalTaxAmount: number;
  grandTotal: number;
  status: "ISSUED" | "ADJUSTED_IN_LEDGER";
  createdAt: string;
}

export interface DataStoreTradeScheme {
  id: string;
  organizationId: string;
  name: string;
  schemeType: TradeSchemeType;
  description: string;
  targetSkuId?: string;
  targetSkuName?: string;
  minQuantityTrigger?: number;
  freeSkuId?: string;
  freeSkuName?: string;
  freeQuantity?: number;
  discountPct?: number;
  activeStartTime?: string;
  activeEndTime?: string;
  minCartValue?: number;
  isActive: boolean;
  validUntil: string;
}

export interface DataStoreLoyaltyAccount {
  retailerId: string;
  retailerShopName: string;
  currentPoints: number;
  lifetimePointsEarned: number;
  tier: LoyaltyTier;
  pointsMultiplier: number;
  rupeeValuePerPoint: number;
}

export interface DataStorePdcCheque {
  id: string;
  chequeNumber: string;
  bankName: string;
  branchName?: string;
  retailerId: string;
  retailerShopName: string;
  organizationId: string;
  amount: number;
  chequeDate: string;
  status: PdcStatus;
  receivedByAgentId?: string;
  receivedByAgentName?: string;
  depositedDate?: string;
  clearedDate?: string;
  bounceReason?: string;
  bouncePenaltyAmount?: number;
  notes?: string;
  createdAt: string;
}

export interface DataStoreDeliveryRunStop {
  stopIndex: number;
  subOrderId: string;
  retailerId: string;
  shopName: string;
  address: string;
  phone: string;
  cartonCount: number;
  grossWeightKg: number;
  totalAmount: number;
  paymentTerm: string;
  deliveryOtp: string;
  status: "PENDING" | "DELIVERED" | "FAILED_RETRY";
}

export interface DataStoreDeliveryRunSheet {
  id: string;
  runSheetNumber: string;
  organizationId: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  maxGrossWeightKg: number;
  totalGrossWeightKg: number;
  totalVolumeCubicFt: number;
  totalCartons: number;
  totalOrders: number;
  totalCollectableCod: number;
  actualCashCollected: number;
  date: string;
  status: "PLANNED" | "DISPATCHED" | "COMPLETED";
  stops: DataStoreDeliveryRunStop[];
}

export interface DataStoreVanSalesSession {
  id: string;
  agentId: string;
  agentName: string;
  vehicleNumber: string;
  date: string;
  status: "OPEN" | "CLOSED";
  initialInventory: Array<{ skuId: string; productName: string; quantity: number }>;
  currentInventory: Array<{ skuId: string; productName: string; quantity: number }>;
  totalOrdersBooked: number;
  totalGmvCollected: number;
}

export interface DataStoreCustomerKhataRecord {
  id: string;
  retailerId: string;
  customerName: string;
  customerPhone: string;
  totalDues: number;
  lastUpdated: string;
}

export interface DataStoreCustomerKhataEntry {
  id: string;
  khataRecordId: string;
  type: KhataEntryType;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface DataStoreDriverExpense {
  id: string;
  runSheetId: string;
  driverName: string;
  expenseType: "DIESEL" | "TOLL" | "PARKING" | "REPAIR" | "CHAI_SNACKS";
  amount: number;
  billPhotoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface DataStoreCoachingScorecard {
  id: string;
  agentId: string;
  agentName: string;
  managerName: string;
  visitDate: string;
  storeShopName: string;
  pitchingScore: number;
  productKnowledgeScore: number;
  objectionHandlingScore: number;
  groomingScore: number;
  remarks: string;
}

export interface DataStoreAuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  timestamp: string;
}

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

export interface DataStoreGroupedProductItem {
  productSkuId: string;
  productName: string;
  skuCode: string;
  unitQuantity: number;
}

export interface DataStoreProductSku {
  id: string;
  productId: string;
  skuCode: string;
  unitTitle: string;
  unitMultiplier: number;
  packMultiplier?: number;
  cartonMultiplier?: number;
  mrp: number;
  wholesalePrice: number;
  minimumOrderQuantity: number;
  stockQuantity: number;
  isActive: boolean;
  pricingSlabs?: DataStorePricingSlab[];
  isGroupedBundle?: boolean;
  bundleItems?: DataStoreGroupedProductItem[];
}

export interface DataStoreCreditLine {
  id: string;
  organizationId: string;
  organizationName: string;
  retailerId: string;
  retailerShopName?: string;
  creditLimit: number;
  currentDues: number;
  availableCredit: number;
  paymentTerm: PaymentTerm;
  status: CreditLineStatus;
  creditGraceDays: number;
  notes?: string;
  updatedAt: string;
}

export interface DataStorePaymentVoucher {
  id: string;
  voucherNumber: string;
  retailerId: string;
  retailerShopName: string;
  organizationId: string;
  organizationName: string;
  agentId?: string;
  agentName?: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNumber?: string;
  bankName?: string;
  chequeDate?: string;
  notes?: string;
  status: "RECORDED" | "VERIFIED" | "REJECTED";
  recordedAt: string;
  verifiedAt?: string;
}

export interface DataStoreLedgerEntry {
  id: string;
  organizationId: string;
  organizationName: string;
  retailerId: string;
  retailerShopName: string;
  date: string;
  type: LedgerEntryType;
  referenceId: string;
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
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

export function generateEWayBillPayload(
  subOrder: DataStoreSubOrder,
  sellerOrg: DataStoreOrganization,
  retailer: DataStoreRetailerProfile
) {
  const invoice = subOrder.invoice;
  const taxableSubtotal = invoice ? invoice.taxableSubtotal : subOrder.subtotal;
  const grandTotal = invoice ? invoice.grandTotal : subOrder.grandTotal;
  const cgstTotal = invoice ? invoice.cgstTotal : Math.round((subOrder.taxAmount / 2) * 100) / 100;
  const sgstTotal = invoice ? invoice.sgstTotal : Math.round((subOrder.taxAmount / 2) * 100) / 100;
  const invoiceNumber = invoice ? invoice.invoiceNumber : `INV-${subOrder.id.slice(-6).toUpperCase()}`;
  const invoiceDate = invoice ? invoice.invoiceDate.split("T")[0] : new Date().toISOString().split("T")[0];

  const itemDetails = subOrder.items.map((it) => {
    const taxableAmount = Math.round(it.unitPrice * it.quantity * 100) / 100;
    const cgstAmount = Math.round(((taxableAmount * (it.taxPct / 2)) / 100) * 100) / 100;
    const sgstAmount = Math.round(((taxableAmount * (it.taxPct / 2)) / 100) * 100) / 100;
    return {
      productName: it.productName,
      productDesc: it.unitTitle,
      hsnCode: it.productName.includes("Biscuit") ? "19053100" : it.productName.includes("Tea") ? "09024010" : "22021010",
      quantity: it.quantity,
      qtyUnit: "UNT",
      taxableAmount,
      cgstRate: it.taxPct / 2,
      cgstAmount,
      sgstRate: it.taxPct / 2,
      sgstAmount,
      igstRate: 0,
      igstAmount: 0
    };
  });

  const formattedCopyText = `=== GOVERNMENT OF INDIA E-WAY BILL SYSTEM (NIC PORTAL) ===
DOCUMENT TYPE: Tax Invoice
DOCUMENT NO: ${invoiceNumber}
DOCUMENT DATE: ${invoiceDate}
TRANSACTION TYPE: Regular | SUPPLY TYPE: Outward - Supply

--- PART A: CONSIGNOR (SUPPLIER) ---
LEGAL NAME: ${sellerOrg.name}
TRADE NAME: ${sellerOrg.tradeName || sellerOrg.name}
GSTIN: ${sellerOrg.gstin}
FROM ADDRESS: ${sellerOrg.address}
STATE CODE: 09 (Uttar Pradesh)

--- PART A: CONSIGNEE (RECIPIENT) ---
SHOP NAME: ${retailer.shopName}
LEGAL/OWNER NAME: ${retailer.ownerName}
GSTIN: ${retailer.gstin || "URP (Unregistered Retailer)"}
PAN: ${retailer.panOrUdyam || "N/A"}
TO ADDRESS: ${retailer.address}, ${retailer.city} - ${retailer.pincode}
STATE CODE: 09 (Uttar Pradesh)

--- ITEM BREAKDOWN ---
${itemDetails.map((it, idx) => `${idx + 1}. ${it.productName} | HSN: ${it.hsnCode} | Qty: ${it.quantity} ${it.qtyUnit} | Taxable: ₹${it.taxableAmount} | CGST: ₹${it.cgstAmount} | SGST: ₹${it.sgstAmount}`).join("\n")}

--- TOTAL CONSIGNMENT VALUATION ---
TOTAL TAXABLE VALUE: ₹${taxableSubtotal.toFixed(2)}
TOTAL CGST: ₹${cgstTotal.toFixed(2)}
TOTAL SGST: ₹${sgstTotal.toFixed(2)}
TOTAL IGST: ₹0.00
TOTAL INVOICE VALUE: ₹${grandTotal.toFixed(2)}

--- PART B: TRANSPORTATION DETAILS ---
MODE: 1 - Road
VEHICLE TYPE: Regular / Commercial LCV
APPROX DISTANCE: 12 KM
VEHICLE NO: UP-32-BZ-9021
DISPATCH STATUS: Ready for NIC E-Way Bill Entry`;

  return {
    subOrderId: subOrder.id,
    invoiceNumber,
    invoiceDate,
    supplyType: "Outward" as const,
    subSupplyType: "Supply" as const,
    docType: "Tax Invoice" as const,
    transactionType: "Regular" as const,
    sellerDetails: {
      gstin: sellerOrg.gstin,
      legalName: sellerOrg.name,
      tradeName: sellerOrg.tradeName,
      address: sellerOrg.address,
      place: "Lucknow",
      pincode: "226001",
      stateCode: "09"
    },
    buyerDetails: {
      gstin: retailer.gstin || "URP",
      legalName: retailer.ownerName,
      tradeName: retailer.shopName,
      address: retailer.address,
      place: retailer.city,
      pincode: retailer.pincode,
      stateCode: "09"
    },
    itemDetails,
    totalTaxableValue: taxableSubtotal,
    totalCgstAmount: cgstTotal,
    totalSgstAmount: sgstTotal,
    totalIgstAmount: 0,
    totalInvoiceValue: grandTotal,
    transporterDetails: {
      transporterId: "TRANS_LOCAL_09",
      transporterName: "Anagata Local Express",
      transportMode: "1" as const,
      vehicleNumber: "UP-32-BZ-9021",
      approxDistanceKm: 12
    },
    formattedCopyText
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
    },
    {
      id: "prod_festive_combo",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      name: "Diwali Kirana Quick-Stock Mega Combo Bundle",
      category: "Combos & Bundles",
      brand: "Mega Wholesale Packs",
      description: "Festive high-margin grouped combo pack containing 2 Cartons Parle-G, 1 Bundle Tata Tea Gold, and 1 Carton Britannia Good Day.",
      hsnCode: "19053100",
      gstRatePct: 18,
      marginPct: 22.5,
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
      skus: [
        {
          id: "sku_diwali_combo",
          productId: "prod_festive_combo",
          skuCode: "COMBO-DIWALI-MEGA-01",
          unitTitle: "Master Combo Bundle (4 Wholesale Packs)",
          unitMultiplier: 4,
          packMultiplier: 1,
          cartonMultiplier: 4,
          mrp: 5800,
          wholesalePrice: 4750,
          minimumOrderQuantity: 1,
          stockQuantity: 50,
          isActive: true,
          isGroupedBundle: true,
          bundleItems: [
            {
              productSkuId: "sku_parle_carton",
              productName: "Parle-G Master Carton (72 pkts)",
              skuCode: "PARLE-G-80G-CTN-72",
              unitQuantity: 2
            },
            {
              productSkuId: "sku_tata_tea_box",
              productName: "Tata Tea Gold Wholesale Bundle (20 packs)",
              skuCode: "TATA-GOLD-250G-BX-20",
              unitQuantity: 1
            },
            {
              productSkuId: "sku_goodday_carton",
              productName: "Britannia Good Day Master Carton (48 packs)",
              skuCode: "GD-BUTTER-120G-CTN-48",
              unitQuantity: 1
            }
          ],
          pricingSlabs: [
            { minQuantity: 1, maxQuantity: 2, pricePerUnit: 4750, discountPct: 18.1, label: "1 - 2 Bundles (Base Combo Price)" },
            { minQuantity: 3, maxQuantity: 5, pricePerUnit: 4550, discountPct: 21.5, label: "3 - 5 Bundles (₹200 Off/Bundle)" },
            { minQuantity: 6, pricePerUnit: 4350, discountPct: 25.0, label: "6+ Bundles Festive Bonanza (₹400 Off/Bundle)" }
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
  masterOrders: DataStoreMasterOrder[] = [
    {
      id: "mord_init_01",
      orderNumber: "ORD-100234",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      retailerPhone: "9876543210",
      totalAmount: 14200,
      paymentTerm: "NET_7",
      paymentStatus: "UNPAID",
      status: "PLACED",
      createdAt: "2026-09-05T10:00:00Z",
      subOrders: [
        {
          id: "subord_001",
          masterOrderId: "mord_init_01",
          organizationId: "org_anagata_fmcg",
          organizationName: "Anagata FMCG Wholesale",
          subtotal: 13523.8,
          taxAmount: 676.2,
          grandTotal: 14200,
          status: "DISPATCHED",
          paymentTerm: "NET_7",
          paymentStatus: "UNPAID",
          deliveryOtp: "4192",
          trackingHistory: [],
          items: [
            {
              id: "item_001",
              subOrderId: "subord_001",
              productSkuId: "sku_parle_carton",
              productName: "Parle-G Glucose Biscuits (80g)",
              skuCode: "PARLE-G-80G-CTN-72",
              unitTitle: "Master Carton (72 packets)",
              quantity: 12,
              unitPrice: 580,
              taxPct: 5,
              taxAmount: 348,
              totalPrice: 7308
            }
          ],
          createdAt: "2026-09-05T10:00:00Z"
        }
      ]
    }
  ];

  get allSubOrders(): DataStoreSubOrder[] {
    return this.masterOrders.flatMap((m) => m.subOrders);
  }

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

  creditLines: DataStoreCreditLine[] = [
    {
      id: "crd_anagata_gupta",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      creditLimit: 60000,
      currentDues: 12000,
      availableCredit: 48000,
      paymentTerm: "NET_7",
      status: "ACTIVE",
      creditGraceDays: 3,
      notes: "Top-tier grocery retailer with verified GST and flawless payment record.",
      updatedAt: "2026-09-01T10:00:00Z"
    },
    {
      id: "crd_awadh_gupta",
      organizationId: "org_awadh_beverages",
      organizationName: "Awadh Beverages & Confectionery",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      creditLimit: 25000,
      currentDues: 4500,
      availableCredit: 20500,
      paymentTerm: "NET_15",
      status: "ACTIVE",
      creditGraceDays: 5,
      notes: "High beverage turnover during summer.",
      updatedAt: "2026-09-02T11:00:00Z"
    },
    {
      id: "crd_anagata_verma",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      creditLimit: 80000,
      currentDues: 28500,
      availableCredit: 51500,
      paymentTerm: "NET_15",
      status: "ACTIVE",
      creditGraceDays: 7,
      notes: "Large semi-wholesale store in Aminabad market.",
      updatedAt: "2026-09-03T12:00:00Z"
    },
    {
      id: "crd_awadh_verma",
      organizationId: "org_awadh_beverages",
      organizationName: "Awadh Beverages & Confectionery",
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      creditLimit: 30000,
      currentDues: 0,
      availableCredit: 30000,
      paymentTerm: "NET_7",
      status: "ACTIVE",
      creditGraceDays: 3,
      notes: "Zero dues currently.",
      updatedAt: "2026-09-04T09:00:00Z"
    },
    {
      id: "crd_anagata_sharma",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      retailerId: "ret_sharma_general",
      retailerShopName: "Sharma General Provision Store",
      creditLimit: 20000,
      currentDues: 0,
      availableCredit: 20000,
      paymentTerm: "COD",
      status: "ACTIVE",
      creditGraceDays: 0,
      notes: "Cash on delivery terms until 3 completed orders.",
      updatedAt: "2026-09-05T14:00:00Z"
    },
    {
      id: "crd_anagata_singh",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      retailerId: "ret_singh_provisions",
      retailerShopName: "Singh Daily Needs",
      creditLimit: 35000,
      currentDues: 6000,
      availableCredit: 29000,
      paymentTerm: "NET_7",
      status: "ACTIVE",
      creditGraceDays: 3,
      notes: "Periodic reorders in Gomti Nagar.",
      updatedAt: "2026-09-06T15:00:00Z"
    }
  ];

  paymentVouchers: DataStorePaymentVoucher[] = [
    {
      id: "vch_001",
      voucherNumber: "VCH-2026-0901",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      amount: 12000,
      paymentMode: "CASH",
      referenceNumber: "CASH-REC-8901",
      notes: "Partial payment for August consignments.",
      status: "VERIFIED",
      recordedAt: "2026-09-05T14:30:00Z",
      verifiedAt: "2026-09-05T18:00:00Z"
    },
    {
      id: "vch_002",
      voucherNumber: "VCH-2026-0902",
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      amount: 8500,
      paymentMode: "CHEQUE",
      referenceNumber: "CHQ-HDFC-992140",
      bankName: "HDFC Bank Ltd",
      chequeDate: "2026-09-04",
      notes: "Account payee cheque handed over during beat visit.",
      status: "VERIFIED",
      recordedAt: "2026-09-04T17:20:00Z",
      verifiedAt: "2026-09-05T11:00:00Z"
    }
  ];

  ledgerEntries: DataStoreLedgerEntry[] = [
    {
      id: "led_001",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      date: "2026-08-20T10:00:00Z",
      type: "INVOICE",
      referenceId: "subord_aug_01",
      referenceNumber: "INV-2026-AUG001",
      description: "Dispatched 5 Cartons Parle-G & 3 Bundles Tata Tea",
      debit: 24000,
      credit: 0,
      runningBalance: 24000
    },
    {
      id: "led_002",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      date: "2026-09-05T14:30:00Z",
      type: "PAYMENT_VOUCHER",
      referenceId: "vch_001",
      referenceNumber: "VCH-2026-0901",
      description: "Cash payment collection by Agent Rahul Sharma",
      debit: 0,
      credit: 12000,
      runningBalance: 12000
    },
    {
      id: "led_003",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      date: "2026-08-28T12:00:00Z",
      type: "INVOICE",
      referenceId: "subord_aug_02",
      referenceNumber: "INV-2026-AUG002",
      description: "Bulk order dispatch 10 Corrugated Boxes Fortune Oil",
      debit: 37000,
      credit: 0,
      runningBalance: 37000
    },
    {
      id: "led_004",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      date: "2026-09-04T17:20:00Z",
      type: "PAYMENT_VOUCHER",
      referenceId: "vch_002",
      referenceNumber: "VCH-2026-0902",
      description: "HDFC Cheque #992140 cleared",
      debit: 0,
      credit: 8500,
      runningBalance: 28500
    }
  ];

  // Helper: Atomic inventory reduction for both single SKUs and child SKUs of grouped combo bundles
  deductStock(productSkuId: string, quantity: number): void {
    for (const prod of this.products) {
      const sku = prod.skus.find((s) => s.id === productSkuId);
      if (sku) {
        sku.stockQuantity = Math.max(0, sku.stockQuantity - quantity);

        // If this is a grouped combo bundle, atomically deduct child SKUs
        if (sku.isGroupedBundle && sku.bundleItems && sku.bundleItems.length > 0) {
          for (const bundleItem of sku.bundleItems) {
            const childDeduction = bundleItem.unitQuantity * quantity;
            for (const childProd of this.products) {
              const childSku = childProd.skus.find((cs) => cs.id === bundleItem.productSkuId);
              if (childSku) {
                childSku.stockQuantity = Math.max(0, childSku.stockQuantity - childDeduction);
                break;
              }
            }
          }
        }
        break;
      }
    }
  }

  // Helper: Record invoice debit to running ledger
  recordLedgerDebit(
    orgId: string,
    orgName: string,
    retailerId: string,
    shopName: string,
    subOrderId: string,
    invoiceNumber: string,
    amount: number
  ): void {
    const existingEntries = this.ledgerEntries.filter(
      (l) => l.organizationId === orgId && l.retailerId === retailerId
    );
    const lastBalance = existingEntries.length > 0 ? existingEntries[existingEntries.length - 1].runningBalance : 0;
    const runningBalance = Math.round((lastBalance + amount) * 100) / 100;

    this.ledgerEntries.push({
      id: `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      organizationId: orgId,
      organizationName: orgName,
      retailerId,
      retailerShopName: shopName,
      date: new Date().toISOString(),
      type: "INVOICE",
      referenceId: subOrderId,
      referenceNumber: invoiceNumber,
      description: `Dispatched B2B Order Invoice #${invoiceNumber}`,
      debit: amount,
      credit: 0,
      runningBalance
    });
  }

  // Helper: Record manual payment voucher & update ledger & credit line
  recordPaymentVoucher(params: {
    retailerId: string;
    organizationId: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    bankName?: string;
    chequeDate?: string;
    notes?: string;
    agentId?: string;
    agentName?: string;
  }): DataStorePaymentVoucher {
    const retailer = this.retailers.find((r) => r.id === params.retailerId);
    const org = this.organizations.find((o) => o.id === params.organizationId);
    const retailerShopName = retailer ? retailer.shopName : "Retailer";
    const organizationName = org ? org.name : "Seller";

    const voucherNumber = `VCH-${Date.now().toString().slice(-6)}`;
    const voucher: DataStorePaymentVoucher = {
      id: `vch_${Date.now()}`,
      voucherNumber,
      retailerId: params.retailerId,
      retailerShopName,
      organizationId: params.organizationId,
      organizationName,
      agentId: params.agentId,
      agentName: params.agentName,
      amount: params.amount,
      paymentMode: params.paymentMode,
      referenceNumber: params.referenceNumber,
      bankName: params.bankName,
      chequeDate: params.chequeDate,
      notes: params.notes,
      status: "RECORDED",
      recordedAt: new Date().toISOString()
    };

    this.paymentVouchers.unshift(voucher);

    // Update seller-specific credit line
    const creditLine = this.creditLines.find(
      (c) => c.organizationId === params.organizationId && c.retailerId === params.retailerId
    );
    if (creditLine) {
      creditLine.currentDues = Math.max(0, Math.round((creditLine.currentDues - params.amount) * 100) / 100);
      creditLine.availableCredit = Math.round((creditLine.creditLimit - creditLine.currentDues) * 100) / 100;
      if (creditLine.status === "CREDIT_HOLD" && creditLine.currentDues < creditLine.creditLimit) {
        creditLine.status = "ACTIVE";
      }
      creditLine.updatedAt = new Date().toISOString();
    }

    // Update retailer overall dues
    if (retailer) {
      retailer.creditDues = Math.max(0, Math.round((retailer.creditDues - params.amount) * 100) / 100);
    }

    // Record credit in running ledger
    const existingEntries = this.ledgerEntries.filter(
      (l) => l.organizationId === params.organizationId && l.retailerId === params.retailerId
    );
    const lastBalance = existingEntries.length > 0 ? existingEntries[existingEntries.length - 1].runningBalance : 0;
    const runningBalance = Math.max(0, Math.round((lastBalance - params.amount) * 100) / 100);

    this.ledgerEntries.push({
      id: `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      organizationId: params.organizationId,
      organizationName,
      retailerId: params.retailerId,
      retailerShopName,
      date: new Date().toISOString(),
      type: "PAYMENT_VOUCHER",
      referenceId: voucher.id,
      referenceNumber: voucherNumber,
      description: `Payment Voucher (${params.paymentMode}) ${params.referenceNumber ? `Ref: ${params.referenceNumber}` : ""}`,
      debit: 0,
      credit: params.amount,
      runningBalance
    });

    return voucher;
  }

  // Helper: Retrieve complete dual-sided statement
  getLedgerStatement(organizationId: string, retailerId: string) {
    const org = this.organizations.find((o) => o.id === organizationId);
    const retailer = this.retailers.find((r) => r.id === retailerId);
    const creditLine = this.creditLines.find(
      (c) => c.organizationId === organizationId && c.retailerId === retailerId
    );

    const entries = this.ledgerEntries.filter(
      (l) => l.organizationId === organizationId && l.retailerId === retailerId
    );

    const totalInvoiced = Math.round(entries.reduce((acc, it) => acc + it.debit, 0) * 100) / 100;
    const totalPaid = Math.round(entries.reduce((acc, it) => acc + it.credit, 0) * 100) / 100;
    const outstandingBalance = creditLine ? creditLine.currentDues : Math.max(0, totalInvoiced - totalPaid);
    const creditLimit = creditLine ? creditLine.creditLimit : 0;
    const availableCredit = creditLine ? creditLine.availableCredit : 0;

    return {
      organizationId,
      organizationName: org ? org.name : "Seller",
      retailerId,
      retailerShopName: retailer ? retailer.shopName : "Retailer",
      creditLimit,
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      availableCredit,
      paymentTerm: creditLine ? creditLine.paymentTerm : "COD",
      status: creditLine ? creditLine.status : "ACTIVE",
      entries
    };
  }

  // --- 100 Advanced Enterprise Features Arrays ---
  batches: DataStoreProductBatch[] = [
    {
      id: "batch_pg_001",
      skuId: "sku_parle_g_carton",
      skuCode: "PARLE-G-CTN-72",
      productName: "Parle-G Glucose Biscuits (80g)",
      batchNumber: "BN-2026-PG01",
      mfgDate: "2026-06-01",
      expiryDate: "2026-09-20",
      daysToExpiry: 13,
      quantityInitial: 100,
      quantityAvailable: 35,
      godownLocation: "Main Mandi Godown A",
      binLocation: "Rack A1-04",
      costPrice: 500,
      status: "NEAR_EXPIRY",
      nearExpiryDiscountPct: 20
    },
    {
      id: "batch_pg_002",
      skuId: "sku_parle_g_carton",
      skuCode: "PARLE-G-CTN-72",
      productName: "Parle-G Glucose Biscuits (80g)",
      batchNumber: "BN-2026-PG02",
      mfgDate: "2026-08-15",
      expiryDate: "2027-03-15",
      daysToExpiry: 189,
      quantityInitial: 500,
      quantityAvailable: 480,
      godownLocation: "Main Mandi Godown A",
      binLocation: "Rack A1-05",
      costPrice: 510,
      status: "ACTIVE"
    },
    {
      id: "batch_tt_001",
      skuId: "sku_tata_tea_bundle",
      skuCode: "TATA-GOLD-BUN-24",
      productName: "Tata Tea Gold (250g)",
      batchNumber: "BN-2026-TT01",
      mfgDate: "2026-07-10",
      expiryDate: "2027-07-10",
      daysToExpiry: 306,
      quantityInitial: 80,
      quantityAvailable: 65,
      godownLocation: "Bypass Depot B",
      binLocation: "Rack B2-12",
      costPrice: 2400,
      status: "ACTIVE"
    },
    {
      id: "batch_fo_001",
      skuId: "sku_fortune_oil_box",
      skuCode: "FORT-SUN-1L-BOX16",
      productName: "Fortune Sunlite Refined Sunflower Oil (1L Pouch)",
      batchNumber: "BN-2026-FO01",
      mfgDate: "2026-08-01",
      expiryDate: "2027-02-01",
      daysToExpiry: 147,
      quantityInitial: 60,
      quantityAvailable: 50,
      godownLocation: "Main Mandi Godown A",
      binLocation: "Rack C1-02",
      costPrice: 1380,
      status: "ACTIVE"
    }
  ];

  grns: DataStoreGoodsReceiptNote[] = [
    {
      id: "grn_001",
      grnNumber: "GRN-2026-001",
      poNumber: "PO-PARLE-8821",
      vendorName: "Parle Products Pvt Ltd",
      receivedDate: "2026-08-15",
      itemsReceived: [
        {
          skuId: "sku_parle_g_carton",
          productName: "Parle-G Glucose Biscuits (80g)",
          batchNumber: "BN-2026-PG02",
          quantityOrdered: 500,
          quantityReceived: 500,
          unitCost: 510,
          expiryDate: "2027-03-15"
        }
      ],
      totalInvoiceAmount: 255000,
      notes: "Direct factory consignment received in sound condition.",
      verifiedBy: "Vikram Agarwal"
    }
  ];

  creditNotes: DataStoreCreditNote[] = [
    {
      id: "cn_001",
      creditNoteNumber: "CN-2026-0001",
      originalInvoiceNumber: "INV-2026-AUG001",
      originalInvoiceDate: "2026-08-20",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      retailerGstin: "09AABCG1234F1Z5",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      reason: "DAMAGED_IN_TRANSIT",
      items: [
        {
          skuId: "sku_parle_g_carton",
          productName: "Parle-G Glucose Biscuits (80g)",
          hsnCode: "19053100",
          quantity: 1,
          ratePerUnit: 580,
          taxableValue: 580,
          gstRatePct: 5,
          taxAmount: 29,
          totalAmount: 609
        }
      ],
      totalTaxableValue: 580,
      totalTaxAmount: 29,
      grandTotal: 609,
      status: "ADJUSTED_IN_LEDGER",
      createdAt: "2026-08-25T11:00:00Z"
    }
  ];

  schemes: DataStoreTradeScheme[] = [
    {
      id: "sch_bogo_parle",
      organizationId: "org_anagata_fmcg",
      name: "Monsoon Kirana Dhamaka: Buy 10 Get 1 Free",
      schemeType: "BUY_X_GET_Y_FREE",
      description: "Buy 10 Cartons of Parle-G, Get 1 Carton absolutely free of cost.",
      targetSkuId: "sku_parle_g_carton",
      targetSkuName: "Parle-G Glucose Biscuits (80g) Master Carton",
      minQuantityTrigger: 10,
      freeSkuId: "sku_parle_g_carton",
      freeSkuName: "Parle-G Glucose Biscuits (80g) Free Carton",
      freeQuantity: 1,
      isActive: true,
      validUntil: "2026-10-31"
    },
    {
      id: "sch_happy_hours",
      organizationId: "org_anagata_fmcg",
      name: "Early Mandi Opening Hours (6 AM - 9 AM)",
      schemeType: "HAPPY_HOURS",
      description: "Flat 3% Instant Bill Discount on all orders placed between 6:00 AM and 9:00 AM.",
      discountPct: 3,
      activeStartTime: "06:00",
      activeEndTime: "09:00",
      isActive: true,
      validUntil: "2026-12-31"
    },
    {
      id: "sch_cash_discount",
      organizationId: "org_anagata_fmcg",
      name: "Fast Settlement 2% Cash Discount (CD)",
      schemeType: "CASH_DISCOUNT_IMMEDIATE",
      description: "Immediate 2% cash discount for spot cash or instant UPI settlements.",
      discountPct: 2,
      isActive: true,
      validUntil: "2026-12-31"
    }
  ];

  loyaltyAccounts: DataStoreLoyaltyAccount[] = [
    {
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      currentPoints: 850,
      lifetimePointsEarned: 1450,
      tier: "SILVER",
      pointsMultiplier: 1.2,
      rupeeValuePerPoint: 0.50
    },
    {
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      currentPoints: 2400,
      lifetimePointsEarned: 3200,
      tier: "GOLD",
      pointsMultiplier: 1.5,
      rupeeValuePerPoint: 0.50
    }
  ];

  pdcCheques: DataStorePdcCheque[] = [
    {
      id: "pdc_001",
      chequeNumber: "CHQ-SBIN-883102",
      bankName: "State Bank of India",
      branchName: "Hazratganj Main Branch",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      organizationId: "org_anagata_fmcg",
      amount: 15000,
      chequeDate: "2026-09-15",
      status: "RECEIVED",
      receivedByAgentId: "usr_agent_1",
      receivedByAgentName: "Rahul Sharma",
      notes: "Post-dated cheque against August invoice balance.",
      createdAt: "2026-09-02T10:00:00Z"
    },
    {
      id: "pdc_002",
      chequeNumber: "CHQ-HDFC-992140",
      bankName: "HDFC Bank Ltd",
      branchName: "Aminabad Branch",
      retailerId: "ret_verma_store",
      retailerShopName: "Verma Brothers Wholesale & Retail",
      organizationId: "org_anagata_fmcg",
      amount: 8500,
      chequeDate: "2026-09-04",
      status: "CLEARED",
      receivedByAgentId: "usr_agent_1",
      receivedByAgentName: "Rahul Sharma",
      depositedDate: "2026-09-04",
      clearedDate: "2026-09-05",
      createdAt: "2026-09-01T14:00:00Z"
    }
  ];

  runSheets: DataStoreDeliveryRunSheet[] = [
    {
      id: "run_001",
      runSheetNumber: "RUN-2026-0001",
      organizationId: "org_anagata_fmcg",
      driverName: "Ram Kishan",
      driverPhone: "9811223344",
      vehicleNumber: "UP-32-BZ-9021 (Tata Ace)",
      maxGrossWeightKg: 1000,
      totalGrossWeightKg: 385.5,
      totalVolumeCubicFt: 42.8,
      totalCartons: 31,
      totalOrders: 3,
      totalCollectableCod: 24500,
      actualCashCollected: 0,
      date: "2026-09-07",
      status: "PLANNED",
      stops: [
        {
          stopIndex: 1,
          subOrderId: "subord_001",
          retailerId: "ret_gupta_kirana",
          shopName: "Gupta Kirana & General Store",
          address: "Shop 12, Hazratganj Main Market, Lucknow",
          phone: "9876543210",
          cartonCount: 12,
          grossWeightKg: 150.0,
          totalAmount: 14200,
          paymentTerm: "COD",
          deliveryOtp: "4192",
          status: "PENDING"
        },
        {
          stopIndex: 2,
          subOrderId: "subord_002",
          retailerId: "ret_verma_store",
          shopName: "Verma Brothers Wholesale & Retail",
          address: "Ganeshganj, Aminabad, Lucknow",
          phone: "9222222222",
          cartonCount: 10,
          grossWeightKg: 125.5,
          totalAmount: 10300,
          paymentTerm: "COD",
          deliveryOtp: "5821",
          status: "PENDING"
        },
        {
          stopIndex: 3,
          subOrderId: "subord_003",
          retailerId: "ret_singh_provisions",
          shopName: "Singh Provision & Daily Needs",
          address: "Sector B, Aliganj, Lucknow",
          phone: "9111111111",
          cartonCount: 9,
          grossWeightKg: 110.0,
          totalAmount: 8900,
          paymentTerm: "NET_15",
          deliveryOtp: "7730",
          status: "PENDING"
        }
      ]
    }
  ];

  vanSessions: DataStoreVanSalesSession[] = [
    {
      id: "vansess_001",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      vehicleNumber: "UP-32-BZ-9021",
      date: "2026-09-07",
      status: "OPEN",
      initialInventory: [
        { skuId: "sku_parle_g_carton", productName: "Parle-G Glucose Biscuits (80g)", quantity: 20 },
        { skuId: "sku_tata_tea_bundle", productName: "Tata Tea Gold (250g)", quantity: 10 }
      ],
      currentInventory: [
        { skuId: "sku_parle_g_carton", productName: "Parle-G Glucose Biscuits (80g)", quantity: 16 },
        { skuId: "sku_tata_tea_bundle", productName: "Tata Tea Gold (250g)", quantity: 8 }
      ],
      totalOrdersBooked: 2,
      totalGmvCollected: 7600
    }
  ];

  customerKhatas: DataStoreCustomerKhataRecord[] = [
    {
      id: "khata_001",
      retailerId: "ret_gupta_kirana",
      customerName: "Ramesh Chandra (Teacher)",
      customerPhone: "9820011223",
      totalDues: 1850,
      lastUpdated: "2026-09-05T18:00:00Z"
    },
    {
      id: "khata_002",
      retailerId: "ret_gupta_kirana",
      customerName: "Sanjay Mishra (Advocate)",
      customerPhone: "9833004455",
      totalDues: 3200,
      lastUpdated: "2026-09-06T19:30:00Z"
    }
  ];

  customerKhataEntries: DataStoreCustomerKhataEntry[] = [
    {
      id: "kentry_001",
      khataRecordId: "khata_001",
      type: "CREDIT_GIVEN",
      amount: 850,
      notes: "5kg Atta, 1L Oil, Spices",
      createdAt: "2026-09-01T17:00:00Z"
    },
    {
      id: "kentry_002",
      khataRecordId: "khata_001",
      type: "CREDIT_GIVEN",
      amount: 1000,
      notes: "Monthly ration credit",
      createdAt: "2026-09-05T18:00:00Z"
    }
  ];

  driverExpenses: DataStoreDriverExpense[] = [
    {
      id: "exp_001",
      runSheetId: "run_001",
      driverName: "Ram Kishan",
      expenseType: "DIESEL",
      amount: 1200,
      notes: "Indian Oil Shaheed Path pump diesel fill",
      createdAt: "2026-09-07T08:30:00Z"
    },
    {
      id: "exp_002",
      runSheetId: "run_001",
      driverName: "Ram Kishan",
      expenseType: "TOLL",
      amount: 85,
      notes: "Kisan Path Ring Road Toll",
      createdAt: "2026-09-07T09:15:00Z"
    }
  ];

  coachingScorecards: DataStoreCoachingScorecard[] = [
    {
      id: "coach_001",
      agentId: "usr_agent_1",
      agentName: "Rahul Sharma",
      managerName: "Vikram Agarwal (Area Sales Manager)",
      visitDate: "2026-09-06",
      storeShopName: "Gupta Kirana & General Store",
      pitchingScore: 5,
      productKnowledgeScore: 4,
      objectionHandlingScore: 4,
      groomingScore: 5,
      remarks: "Excellent trade scheme explanation. Successfully closed Diwali combo bundle."
    }
  ];

  auditLogs: DataStoreAuditLog[] = [
    {
      id: "aud_001",
      userId: "usr_seller_1",
      userName: "Vikram Agarwal",
      role: "SELLER_ADMIN",
      action: "SCHEME_CREATED",
      details: "Created Buy 10 Get 1 Free trade scheme for Parle-G",
      timestamp: "2026-09-01T09:00:00Z"
    },
    {
      id: "aud_002",
      userId: "usr_seller_1",
      userName: "Vikram Agarwal",
      role: "SELLER_ADMIN",
      action: "CREDIT_LIMIT_CHANGED",
      details: "Increased credit limit for Gupta Kirana from ₹50,000 to ₹60,000",
      timestamp: "2026-09-03T11:30:00Z"
    }
  ];

  // --- Helper Methods ---

  allocateBatchFefo(skuId: string, quantity: number) {
    const availableBatches = this.batches
      .filter((b) => b.skuId === skuId && b.quantityAvailable > 0 && b.status !== "EXPIRED")
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    let remaining = quantity;
    const allocations: Array<{ batchNumber: string; expiryDate: string; allocated: number; daysToExpiry: number }> = [];

    for (const batch of availableBatches) {
      if (remaining <= 0) break;
      const allocateFromThis = Math.min(batch.quantityAvailable, remaining);
      batch.quantityAvailable -= allocateFromThis;
      if (batch.quantityAvailable === 0) batch.status = "EXHAUSTED";
      remaining -= allocateFromThis;
      allocations.push({
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        allocated: allocateFromThis,
        daysToExpiry: batch.daysToExpiry
      });
    }

    return {
      skuId,
      requestedQuantity: quantity,
      allocatedQuantity: quantity - remaining,
      remainingUnallocated: remaining,
      allocations
    };
  }

  checkNearExpiry(thresholdDays = 30) {
    const today = new Date();
    const nearExpiryBatches = this.batches.filter((b) => {
      const exp = new Date(b.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      b.daysToExpiry = diffDays;
      if (diffDays <= 0) {
        b.status = "EXPIRED";
        return true;
      }
      if (diffDays <= thresholdDays) {
        b.status = "NEAR_EXPIRY";
        b.nearExpiryDiscountPct = b.nearExpiryDiscountPct || 20;
        return true;
      }
      return false;
    });

    return nearExpiryBatches;
  }

  evaluateTradeSchemes(
    cartItems: Array<{ skuId: string; quantity: number; unitPrice: number }>,
    orgId: string,
    orderTimeHour?: number
  ) {
    const activeSchemes = this.schemes.filter((s) => s.organizationId === orgId && s.isActive);
    const currentHour = orderTimeHour ?? new Date().getHours();

    const appliedSchemes: Array<{ schemeName: string; type: string; benefit: string; savings: number }> = [];
    const freeItems: Array<{ skuId: string; productName: string; quantity: number }> = [];
    let totalSavings = 0;

    for (const item of cartItems) {
      for (const scheme of activeSchemes) {
        if (scheme.schemeType === "BUY_X_GET_Y_FREE" && scheme.targetSkuId === item.skuId && scheme.minQuantityTrigger) {
          if (item.quantity >= scheme.minQuantityTrigger) {
            const multiplier = Math.floor(item.quantity / scheme.minQuantityTrigger);
            const freeQty = multiplier * (scheme.freeQuantity || 1);
            freeItems.push({
              skuId: scheme.freeSkuId || item.skuId,
              productName: scheme.freeSkuName || "Bonus Free Pack",
              quantity: freeQty
            });
            const savings = freeQty * item.unitPrice;
            totalSavings += savings;
            appliedSchemes.push({
              schemeName: scheme.name,
              type: "BUY_X_GET_Y_FREE",
              benefit: `Buy ${scheme.minQuantityTrigger} Get ${scheme.freeQuantity || 1} Free (Added ${freeQty} free units)`,
              savings
            });
          }
        }
      }
    }

    // Happy hours check (e.g. 6:00 AM - 9:00 AM)
    const happyHourScheme = activeSchemes.find((s) => s.schemeType === "HAPPY_HOURS");
    if (happyHourScheme && currentHour >= 6 && currentHour <= 9) {
      const discountPct = happyHourScheme.discountPct || 3;
      const cartTotal = cartItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
      const savings = Math.round(((cartTotal * discountPct) / 100) * 100) / 100;
      totalSavings += savings;
      appliedSchemes.push({
        schemeName: happyHourScheme.name,
        type: "HAPPY_HOURS",
        benefit: `Early Mandi Happy Hour (${discountPct}% Instant Off)`,
        savings
      });
    }

    return {
      appliedSchemes,
      freeItems,
      totalSavings: Math.round(totalSavings * 100) / 100
    };
  }

  addLoyaltyPoints(retailerId: string, orderAmount: number) {
    let account = this.loyaltyAccounts.find((l) => l.retailerId === retailerId);
    if (!account) {
      const ret = this.retailers.find((r) => r.id === retailerId);
      account = {
        retailerId,
        retailerShopName: ret ? ret.shopName : "Retailer Store",
        currentPoints: 0,
        lifetimePointsEarned: 0,
        tier: "BRONZE",
        pointsMultiplier: 1.0,
        rupeeValuePerPoint: 0.50
      };
      this.loyaltyAccounts.push(account);
    }

    const basePoints = Math.floor(orderAmount / 100);
    const earned = Math.round(basePoints * account.pointsMultiplier);
    account.currentPoints += earned;
    account.lifetimePointsEarned += earned;

    if (account.lifetimePointsEarned >= 5000) {
      account.tier = "PLATINUM";
      account.pointsMultiplier = 2.0;
    } else if (account.lifetimePointsEarned >= 2000) {
      account.tier = "GOLD";
      account.pointsMultiplier = 1.5;
    } else if (account.lifetimePointsEarned >= 500) {
      account.tier = "SILVER";
      account.pointsMultiplier = 1.2;
    }

    return account;
  }

  redeemLoyaltyPoints(retailerId: string, pointsToRedeem: number) {
    const account = this.loyaltyAccounts.find((l) => l.retailerId === retailerId);
    if (!account || account.currentPoints < pointsToRedeem) {
      throw new Error("Insufficient loyalty points balance");
    }
    const discountRupees = Math.round(pointsToRedeem * account.rupeeValuePerPoint * 100) / 100;
    account.currentPoints -= pointsToRedeem;
    return {
      pointsRedeemed: pointsToRedeem,
      discountRupees,
      remainingPoints: account.currentPoints
    };
  }

  createGstCreditNote(params: {
    originalInvoiceNumber: string;
    originalInvoiceDate: string;
    retailerId: string;
    organizationId: string;
    reason: ReturnReason;
    items: Array<{ skuId: string; productName: string; hsnCode: string; quantity: number; ratePerUnit: number; gstRatePct: number }>;
  }) {
    const org = this.organizations.find((o) => o.id === params.organizationId) || this.organizations[0];
    const ret = this.retailers.find((r) => r.id === params.retailerId) || this.retailers[0];

    const creditNoteNumber = `CN-2026-${(this.creditNotes.length + 1).toString().padStart(4, "0")}`;
    const processedItems = params.items.map((it) => {
      const taxableValue = Math.round(it.quantity * it.ratePerUnit * 100) / 100;
      const taxAmount = Math.round(((taxableValue * it.gstRatePct) / 100) * 100) / 100;
      return {
        skuId: it.skuId,
        productName: it.productName,
        hsnCode: it.hsnCode,
        quantity: it.quantity,
        ratePerUnit: it.ratePerUnit,
        taxableValue,
        gstRatePct: it.gstRatePct,
        taxAmount,
        totalAmount: Math.round((taxableValue + taxAmount) * 100) / 100
      };
    });

    const totalTaxableValue = Math.round(processedItems.reduce((acc, it) => acc + it.taxableValue, 0) * 100) / 100;
    const totalTaxAmount = Math.round(processedItems.reduce((acc, it) => acc + it.taxAmount, 0) * 100) / 100;
    const grandTotal = Math.round((totalTaxableValue + totalTaxAmount) * 100) / 100;

    const creditNote: DataStoreCreditNote = {
      id: `cn_${Date.now()}`,
      creditNoteNumber,
      originalInvoiceNumber: params.originalInvoiceNumber,
      originalInvoiceDate: params.originalInvoiceDate,
      retailerId: params.retailerId,
      retailerShopName: ret.shopName,
      retailerGstin: ret.gstin,
      organizationId: params.organizationId,
      organizationName: org.name,
      reason: params.reason,
      items: processedItems,
      totalTaxableValue,
      totalTaxAmount,
      grandTotal,
      status: "ADJUSTED_IN_LEDGER",
      createdAt: new Date().toISOString()
    };

    this.creditNotes.unshift(creditNote);

    const creditLine = this.creditLines.find((c) => c.organizationId === params.organizationId && c.retailerId === params.retailerId);
    if (creditLine) {
      creditLine.currentDues = Math.max(0, Math.round((creditLine.currentDues - grandTotal) * 100) / 100);
      creditLine.availableCredit = Math.round((creditLine.creditLimit - creditLine.currentDues) * 100) / 100;
      creditLine.updatedAt = new Date().toISOString();
    }

    const existingEntries = this.ledgerEntries.filter((l) => l.organizationId === params.organizationId && l.retailerId === params.retailerId);
    const lastBalance = existingEntries.length > 0 ? existingEntries[existingEntries.length - 1].runningBalance : 0;
    const runningBalance = Math.max(0, Math.round((lastBalance - grandTotal) * 100) / 100);

    this.ledgerEntries.push({
      id: `led_${Date.now()}_cn`,
      organizationId: params.organizationId,
      organizationName: org.name,
      retailerId: params.retailerId,
      retailerShopName: ret.shopName,
      date: new Date().toISOString(),
      type: "CREDIT_NOTE",
      referenceId: creditNote.id,
      referenceNumber: creditNoteNumber,
      description: `GST Credit Note (${params.reason.replace(/_/g, " ")}) against #${params.originalInvoiceNumber}`,
      debit: 0,
      credit: grandTotal,
      runningBalance
    });

    return creditNote;
  }

  generateRunSheet(params: {
    organizationId: string;
    driverName: string;
    driverPhone: string;
    vehicleNumber: string;
    subOrderIds: string[];
  }) {
    const selectedOrders = this.allSubOrders.filter((s: DataStoreSubOrder) => params.subOrderIds.includes(s.id));

    const stops: DataStoreDeliveryRunStop[] = selectedOrders.map((ord: DataStoreSubOrder, idx: number) => {
      const totalCartons = ord.items.reduce((acc: number, it: DataStoreOrderItem) => acc + it.quantity, 0);
      const grossWeightKg = Math.round(totalCartons * 12.5 * 10) / 10;
      return {
        stopIndex: idx + 1,
        subOrderId: ord.id,
        retailerId: ord.items[0]?.subOrderId || "ret_gupta_kirana",
        shopName: "Gupta Kirana & General Store",
        address: "Hazratganj Main Market, Lucknow",
        phone: "9876543210",
        cartonCount: totalCartons,
        grossWeightKg,
        totalAmount: ord.grandTotal,
        paymentTerm: ord.paymentTerm,
        deliveryOtp: ord.deliveryOtp,
        status: "PENDING"
      };
    });

    const totalGrossWeightKg = Math.round(stops.reduce((acc, s) => acc + s.grossWeightKg, 0) * 10) / 10;
    const totalCartons = stops.reduce((acc, s) => acc + s.cartonCount, 0);
    const totalVolumeCubicFt = Math.round(totalCartons * 1.4 * 10) / 10;
    const totalCollectableCod = stops.filter((s) => s.paymentTerm === "COD").reduce((acc, s) => acc + s.totalAmount, 0);

    const runSheet: DataStoreDeliveryRunSheet = {
      id: `run_${Date.now()}`,
      runSheetNumber: `RUN-2026-${(this.runSheets.length + 1).toString().padStart(4, "0")}`,
      organizationId: params.organizationId,
      driverName: params.driverName,
      driverPhone: params.driverPhone,
      vehicleNumber: params.vehicleNumber,
      maxGrossWeightKg: 1000,
      totalGrossWeightKg,
      totalVolumeCubicFt,
      totalCartons,
      totalOrders: stops.length,
      totalCollectableCod,
      actualCashCollected: 0,
      date: new Date().toISOString().split("T")[0],
      status: "PLANNED",
      stops
    };

    this.runSheets.unshift(runSheet);
    return runSheet;
  }

  optimizeBeatRouteTsp(beatId: string) {
    const beat = this.beats.find((b) => b.id === beatId) || this.beats[0];
    const stops = [...beat.stops];

    if (stops.length <= 2) {
      return {
        beatId: beat.id,
        beatName: beat.name,
        originalKm: 4.2,
        optimizedKm: 4.2,
        savingsKm: 0,
        savingsPct: 0,
        orderedStops: stops
      };
    }

    function dist(s1: DataStoreBeatStop, s2: DataStoreBeatStop): number {
      const R = 6371;
      const dLat = ((s2.latitude - s1.latitude) * Math.PI) / 180;
      const dLon = ((s2.longitude - s1.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((s1.latitude * Math.PI) / 180) * Math.cos((s2.latitude * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function totalDistance(route: DataStoreBeatStop[]): number {
      let sum = 0;
      for (let i = 0; i < route.length - 1; i++) {
        sum += dist(route[i], route[i + 1]);
      }
      return sum;
    }

    const originalKm = Math.round(totalDistance(stops) * 100) / 100;

    let bestRoute = [...stops];
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < bestRoute.length - 1; i++) {
        for (let k = i + 1; k < bestRoute.length; k++) {
          const newRoute = [
            ...bestRoute.slice(0, i),
            ...bestRoute.slice(i, k + 1).reverse(),
            ...bestRoute.slice(k + 1)
          ];
          if (totalDistance(newRoute) < totalDistance(bestRoute)) {
            bestRoute = newRoute;
            improved = true;
          }
        }
      }
    }

    const optimizedKm = Math.round(totalDistance(bestRoute) * 100) / 100;
    const savingsKm = Math.max(0, Math.round((originalKm - optimizedKm) * 100) / 100);
    const savingsPct = originalKm > 0 ? Math.round((savingsKm / originalKm) * 1000) / 10 : 0;

    const orderedStops = bestRoute.map((s, idx) => ({
      ...s,
      sequenceOrder: idx + 1
    }));

    return {
      beatId: beat.id,
      beatName: beat.name,
      originalKm,
      optimizedKm,
      savingsKm,
      savingsPct,
      orderedStops
    };
  }

  generateTallyXml(orgId: string): string {
    const org = this.organizations.find((o) => o.id === orgId) || this.organizations[0];
    const orgOrders = this.allSubOrders.filter((s: DataStoreSubOrder) => s.organizationId === orgId);

    const voucherXmls = orgOrders.map((s: DataStoreSubOrder) => {
      const invNo = s.invoice ? s.invoice.invoiceNumber : `INV-${s.id.slice(-6).toUpperCase()}`;
      const invDate = s.invoice ? s.invoice.invoiceDate.split("T")[0].replace(/-/g, "") : "20260907";

      return `    <VOUCHER VCHTYPE="Sales" ACTION="Create">
      <DATE>${invDate}</DATE>
      <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
      <VOUCHERNUMBER>${invNo}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${s.organizationName}</PARTYLEDGERNAME>
      <AMOUNT>${s.grandTotal}</AMOUNT>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>Sales Account</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>-${s.subtotal}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>Output CGST</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>-${Math.round((s.taxAmount / 2) * 100) / 100}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>Output SGST</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>-${Math.round((s.taxAmount / 2) * 100) / 100}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
    </VOUCHER>`;
    }).join("\n");

    return `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${org.name}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
${voucherXmls}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  }

  generateMargCsv(orgId: string): string {
    const orgOrders = this.allSubOrders.filter((s: DataStoreSubOrder) => s.organizationId === orgId);
    const rows = [
      "Invoice_No,Invoice_Date,Retailer_Name,GSTIN,Item_Name,HSN,Qty,Rate,Taxable_Value,CGST,SGST,Grand_Total"
    ];
    for (const s of orgOrders) {
      const invNo = s.invoice ? s.invoice.invoiceNumber : `INV-${s.id.slice(-6).toUpperCase()}`;
      const invDate = s.createdAt.split("T")[0];
      for (const it of s.items) {
        const taxable = Math.round(it.unitPrice * it.quantity * 100) / 100;
        const cgst = Math.round((taxable * (it.taxPct / 200)) * 100) / 100;
        const sgst = cgst;
        const total = Math.round((taxable + cgst + sgst) * 100) / 100;
        const hsn = it.productName.includes("Biscuit") ? "19053100" : "09024010";
        rows.push(`"${invNo}","${invDate}","Gupta Kirana","09AABCG1234F1Z5","${it.productName}","${hsn}",${it.quantity},${it.unitPrice},${taxable},${cgst},${sgst},${total}`);
      }
    }
    return rows.join("\n");
  }

  getAgingAnalysis(orgId: string) {
    const creditLines = this.creditLines.filter((c) => c.organizationId === orgId && c.currentDues > 0);

    const report = {
      organizationId: orgId,
      totalOutstanding: creditLines.reduce((acc, c) => acc + c.currentDues, 0),
      bracket_0_30: 0,
      bracket_31_60: 0,
      bracket_61_90: 0,
      bracket_90_plus: 0,
      retailers: creditLines.map((c) => {
        const dues = c.currentDues;
        const ageDays = c.creditGraceDays > 7 ? 42 : 18;
        let bracket = "0-30 days";
        if (ageDays > 90) bracket = "90+ days";
        else if (ageDays > 60) bracket = "61-90 days";
        else if (ageDays > 30) bracket = "31-60 days";

        return {
          retailerId: c.retailerId,
          shopName: c.retailerShopName,
          currentDues: dues,
          creditLimit: c.creditLimit,
          paymentTerm: c.paymentTerm,
          status: c.status,
          ageDays,
          bracket
        };
      })
    };

    for (const r of report.retailers) {
      if (r.ageDays <= 30) report.bracket_0_30 += r.currentDues;
      else if (r.ageDays <= 60) report.bracket_31_60 += r.currentDues;
      else if (r.ageDays <= 90) report.bracket_61_90 += r.currentDues;
      else report.bracket_90_plus += r.currentDues;
    }

    return report;
  }

  recordPdcCheque(params: {
    chequeNumber: string;
    bankName: string;
    retailerId: string;
    organizationId: string;
    amount: number;
    chequeDate: string;
    receivedByAgentId?: string;
    receivedByAgentName?: string;
    notes?: string;
  }) {
    const ret = this.retailers.find((r) => r.id === params.retailerId);
    const cheque: DataStorePdcCheque = {
      id: `pdc_${Date.now()}`,
      chequeNumber: params.chequeNumber,
      bankName: params.bankName,
      retailerId: params.retailerId,
      retailerShopName: ret ? ret.shopName : "Retailer",
      organizationId: params.organizationId,
      amount: params.amount,
      chequeDate: params.chequeDate,
      status: "RECEIVED",
      receivedByAgentId: params.receivedByAgentId,
      receivedByAgentName: params.receivedByAgentName,
      notes: params.notes,
      createdAt: new Date().toISOString()
    };
    this.pdcCheques.unshift(cheque);
    return cheque;
  }

  addKhataEntry(params: {
    retailerId: string;
    customerName: string;
    customerPhone: string;
    type: KhataEntryType;
    amount: number;
    notes?: string;
  }) {
    let khata = this.customerKhatas.find((k) => k.retailerId === params.retailerId && k.customerPhone === params.customerPhone);
    if (!khata) {
      khata = {
        id: `khata_${Date.now()}`,
        retailerId: params.retailerId,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        totalDues: 0,
        lastUpdated: new Date().toISOString()
      };
      this.customerKhatas.push(khata);
    }

    if (params.type === "CREDIT_GIVEN") {
      khata.totalDues = Math.round((khata.totalDues + params.amount) * 100) / 100;
    } else {
      khata.totalDues = Math.max(0, Math.round((khata.totalDues - params.amount) * 100) / 100);
    }
    khata.lastUpdated = new Date().toISOString();

    const entry: DataStoreCustomerKhataEntry = {
      id: `kentry_${Date.now()}`,
      khataRecordId: khata.id,
      type: params.type,
      amount: params.amount,
      notes: params.notes,
      createdAt: new Date().toISOString()
    };
    this.customerKhataEntries.unshift(entry);

    return { khata, entry };
  }

  logAudit(params: {
    userId: string;
    userName: string;
    role: string;
    action: string;
    details: string;
    previousState?: any;
    newState?: any;
  }) {
    const log: DataStoreAuditLog = {
      id: `aud_${Date.now()}`,
      userId: params.userId,
      userName: params.userName,
      role: params.role,
      action: params.action,
      details: params.details,
      previousState: params.previousState,
      newState: params.newState,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    return log;
  }

  getSystemTelemetry() {
    const mem = process.memoryUsage();
    return {
      serverTime: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: {
        rss: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        heapTotal: Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10,
        heapUsed: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10
      },
      cpuLoad: [0.12, 0.18, 0.15],
      activeConnections: 14,
      databaseStatus: "CONNECTED",
      minioStatus: "CONNECTED",
      evolutionApiStatus: "CONNECTED",
      totalProductsCount: this.products.length,
      totalOrdersCount: this.allSubOrders.length,
      totalBatchesCount: this.batches.length,
      totalSchemesCount: this.schemes.length
    };
  }
}

export const store = new InMemoryDataStore();
