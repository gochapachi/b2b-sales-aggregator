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
  timestamp: string;
  userId: string;
  userName: string;
  role?: string;
  userRole?: string;
  action: string;
  details?: any;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  tenantType?: "SELLER" | "RETAILER" | "SUPER_ADMIN";
  tenantId?: string;
}

export type PosPaymentMode = "CASH" | "UPI" | "KHATA" | "SPLIT";
export type PlatformRiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL_NPA";

export interface DataStoreRetailPosProduct {
  id: string;
  retailerId: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  uom: string;
  packSize: string;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  marginPct: number;
  currentStock: number;
  minStockAlert: number;
  expiryDate?: string;
  batchNumber?: string;
  ingredients?: string;
  fssaiNumber?: string;
  warrantyMonths?: number;
  isVegetarian?: boolean;
  isPlatformInwarded: boolean;
  hsnCode?: string;
  gstRatePct: number;
  lastRestockedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataStoreRetailPosBillItem {
  productId: string;
  barcode: string;
  name: string;
  packSize?: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  mrp: number;
  discountAmount: number;
  taxAmount: number;
  totalPrice: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface DataStoreRetailPosBill {
  id: string;
  billNumber: string;
  retailerId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierName?: string;
  paymentMode: PosPaymentMode;
  cashAmount: number;
  upiAmount: number;
  khataAmount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  taxAmount?: number;
  roundOff: number;
  grandTotal: number;
  items: DataStoreRetailPosBillItem[];
  printedAt?: string;
  whatsappReceiptSent: boolean;
  escPosReceipt?: string;
  escPosThermalReceipt?: string;
  createdAt: string;
}

export interface DataStoreRetailDailyRegister {
  id: string;
  retailerId: string;
  date: string;
  openingCashFloat: number;
  totalCashSales: number;
  totalUpiSales: number;
  totalKhataSales: number;
  totalExpenses: number;
  closingCashActual: number;
  discrepancy: number;
  notes?: string;
  status: "OPEN" | "CLOSED";
}

export interface DataStoreRetailShopExpense {
  id: string;
  retailerId: string;
  category: "RENT" | "ELECTRICITY" | "WAGES" | "TEA_SNACKS" | "MAINTENANCE" | "OTHER";
  amount: number;
  description: string;
  date: string;
}

export interface DataStoreShareOfShelfAudit {
  id: string;
  visitId: string;
  agentId: string;
  retailerId: string;
  retailerShopName: string;
  category: string;
  brandName: string;
  ourFacingsCount: number;
  competitorBrandName: string;
  competitorFacingsCount: number;
  shelfSharePct: number;
  notes?: string;
  photoUrl?: string;
  auditDate: string;
}

export interface DataStorePlatformKpiSnapshot {
  totalGmv: number;
  totalOrdersCount: number;
  totalRetailersCount: number;
  totalWholesalersCount: number;
  totalCreditOutstanding: number;
  systemicNpaAmount: number;
  orderVelocityPerHour: number;
  averageOrderValue: number;
  grossContributionMargin: number;
  wholesalerMonthlySavingsRupees: number;
  riskDistribution: {
    lowRiskPct: number;
    moderateRiskPct: number;
    highRiskPct: number;
    npaRiskPct: number;
  };
}

export interface DataStoreHeatmapZoneMetric {
  zoneId: string;
  wardName: string;
  latitude: number;
  longitude: number;
  activeKiranasCount: number;
  monthlyGmvRupees: number;
  stockoutRatePct: number;
  averageDeliveryTatMinutes: number;
  demandMismatchIndex: number;
}

export interface DataStoreBrandMarketShare {
  category: string;
  brandName: string;
  monthlyGmv: number;
  unitsSold: number;
  marketSharePct: number;
  growthPctMoM: number;
}

export interface DataStoreCohortRetentionRecord {
  cohortMonth: string;
  initialRetailersCount: number;
  m1RetentionPct: number;
  m2RetentionPct: number;
  m3RetentionPct: number;
  m6RetentionPct: number;
  m12RetentionPct: number;
}

export interface DataStoreUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: "SUPER_ADMIN" | "SELLER_ADMIN" | "SELLER_STAFF" | "SALES_AGENT" | "RETAILER" | "RETAILER_STAFF" | "SUPPLY_BD_AGENT";
  status: "ACTIVE" | "PENDING_KYC" | "PENDING_APPROVAL" | "SUSPENDED";
  loginId?: string;
  password?: string;
  organizationId?: string;
  retailerId?: string;
  staffTitle?: string;
  permissions?: string[];
  quickPin?: string;
  mustChangePassword?: boolean;
  invitedByUserId?: string;
  lastLoginAt?: string;
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
  kycStatus: "PENDING" | "PENDING_APPROVAL" | "VERIFIED" | "REJECTED";
  kycDocUrl?: string;
  rejectionReason?: string;
  latitude?: number;
  longitude?: number;
  warehousePhotoUrl?: string;
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
  kycStatus: "PENDING" | "PENDING_APPROVAL" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  assignedAgentId?: string;
  leadStage: LeadStage;
  creditLimit: number;
  creditDues: number;
  paymentTerm: PaymentTerm;
  lastOrderDate?: string;
  lastOrderAmount?: number;
  createdAt: string;
}

export interface DataStoreMasterSku {
  id: string;
  name: string;
  brand: string;
  category: string;
  barcode?: string;
  hsnCode?: string;
  gstRatePct: number;
  mrp: number;
  unitTitle: string;
  unitMultiplier: number;
  imageUrl?: string;
  createdAt: string;
}

export interface DataStoreSellerSkuListing {
  id: string;
  masterSkuId: string;
  organizationId: string;
  sellerSkuCode: string;
  wholesalePrice: number;
  landedCost: number;
  minimumOrderQuantity: number;
  stockQuantity: number;
  reservedStock: number;
  fulfillmentSlaHours: number;
  reliabilityScore: number;
  isActive: boolean;
  pricingSlabs?: DataStorePricingSlab[];
  createdAt: string;
}

export interface DataStoreStockReservation {
  id: string;
  orderId?: string;
  subOrderId?: string;
  sellerSkuListingId: string;
  quantity: number;
  status: "RESERVED" | "COMMITTED" | "RELEASED" | "FALLBACK_REROUTED";
  lockedAt: string;
  expiresAt: string;
  releasedAt?: string;
  fallbackListingId?: string;
}

export interface DataStoreTerritoryTransfer {
  id: string;
  retailerId: string;
  sourceAgentId?: string;
  targetAgentId?: string;
  transferredBy?: string;
  reason?: string;
  createdAt: string;
}

export interface BuyBoxCandidate {
  listingId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  landedCost: number;
  proximityKm: number;
  reliabilityScore: number;
  slaScore: number;
  totalScore: number;
  availableStock: number;
  minimumOrderQuantity: number;
}

export interface BuyBoxCalculationResult {
  masterSku: DataStoreMasterSku;
  buyBoxWinner: BuyBoxCandidate | null;
  alternateSellers: BuyBoxCandidate[];
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
  status?: "ACTIVE" | "ARCHIVED" | "DRAFT";
  isArchived?: boolean;
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
  plannedTime?: string;
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
  status: "RECEIVED" | "ACCEPTED" | "PACKED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  paymentTerm: PaymentTerm;
  paymentStatus: "UNPAID" | "PAID" | "PARTIALLY_PAID";
  creditDueDate?: string;
  deliveryOtp: string;
  deliveryNotes?: string;
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
      loginId: "superadmin",
      phone: "9999999999",
      password: "SuperAdmin@2026",
      name: "Platform SuperAdmin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      permissions: [
        "CAN_CREATE_BILLS", "CAN_VIEW_POS_CATALOG", "CAN_SCAN_BARCODES", "CAN_INWARD_STOCK",
        "CAN_VIEW_PROFIT_MARGINS", "CAN_OVERRIDE_DISCOUNTS", "CAN_MANAGE_UDHAR", "CAN_VIEW_ORDERS",
        "CAN_PACK_BATCHES", "CAN_DISPATCH", "CAN_PRINT_LABELS", "CAN_VIEW_LEDGERS",
        "CAN_EXPORT_ERP", "CAN_MANAGE_PDC", "CAN_MANAGE_CREDIT_LINES", "CAN_MANAGE_PRICING",
        "CAN_MANAGE_USERS", "CAN_VIEW_ANALYTICS"
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_seller_1",
      loginId: "seller_anagata",
      phone: "9888888888",
      password: "Seller@2026",
      name: "Vikram Agarwal (Anagata FMCG)",
      role: "SELLER_ADMIN",
      organizationId: "org_anagata_fmcg",
      status: "ACTIVE",
      permissions: [
        "CAN_VIEW_ORDERS", "CAN_PACK_BATCHES", "CAN_DISPATCH", "CAN_PRINT_LABELS",
        "CAN_VIEW_LEDGERS", "CAN_EXPORT_ERP", "CAN_MANAGE_PDC", "CAN_MANAGE_CREDIT_LINES",
        "CAN_MANAGE_PRICING", "CAN_MANAGE_USERS", "CAN_VIEW_ANALYTICS"
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_seller_picker_1",
      loginId: "seller_picker",
      phone: "9888888881",
      password: "Picker@2026",
      name: "Suresh Yadav (Warehouse Lead)",
      role: "SELLER_STAFF",
      staffTitle: "Warehouse Picker & Dispatcher",
      organizationId: "org_anagata_fmcg",
      status: "ACTIVE",
      permissions: ["CAN_VIEW_ORDERS", "CAN_PACK_BATCHES", "CAN_DISPATCH", "CAN_PRINT_LABELS"],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_seller_accountant_1",
      loginId: "seller_accountant",
      phone: "9888888882",
      password: "Accounts@2026",
      name: "Rajesh Singhal (Head of Accounts)",
      role: "SELLER_STAFF",
      staffTitle: "Accountant & Finance Manager",
      organizationId: "org_anagata_fmcg",
      status: "ACTIVE",
      permissions: ["CAN_VIEW_ORDERS", "CAN_VIEW_LEDGERS", "CAN_EXPORT_ERP", "CAN_MANAGE_PDC"],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_seller_2",
      loginId: "seller_awadh",
      phone: "9777777777",
      password: "Seller@2026",
      name: "Amit Tandon (Awadh Beverages)",
      role: "SELLER_ADMIN",
      organizationId: "org_awadh_beverages",
      status: "ACTIVE",
      permissions: [
        "CAN_VIEW_ORDERS", "CAN_PACK_BATCHES", "CAN_DISPATCH", "CAN_PRINT_LABELS",
        "CAN_VIEW_LEDGERS", "CAN_EXPORT_ERP", "CAN_MANAGE_PDC", "CAN_MANAGE_CREDIT_LINES",
        "CAN_MANAGE_PRICING", "CAN_MANAGE_USERS", "CAN_VIEW_ANALYTICS"
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_agent_1",
      loginId: "agent_rahul",
      phone: "9666666666",
      password: "Agent@2026",
      name: "Rahul Sharma (Field Sales Agent)",
      role: "SALES_AGENT",
      status: "ACTIVE",
      permissions: [
        "CAN_VIEW_BEAT", "CAN_LOG_VISIT", "CAN_BOOK_ORDER", "CAN_COLLECT_PAYMENT", "CAN_ONBOARD_STORE"
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_ret_1",
      loginId: "ret_gupta",
      phone: "9555555555",
      password: "Kirana@2026",
      name: "Ramesh Gupta (Proprietor)",
      role: "RETAILER",
      retailerId: "ret_gupta_kirana",
      status: "ACTIVE",
      permissions: [
        "CAN_CREATE_BILLS", "CAN_VIEW_POS_CATALOG", "CAN_SCAN_BARCODES", "CAN_INWARD_STOCK",
        "CAN_VIEW_PROFIT_MARGINS", "CAN_OVERRIDE_DISCOUNTS", "CAN_MANAGE_UDHAR", "CAN_MANAGE_USERS",
        "CAN_VIEW_ANALYTICS"
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_ret_cashier_1",
      loginId: "ret_cashier",
      phone: "9555555551",
      password: "Cashier@2026",
      quickPin: "1234",
      name: "Manoj Verma (Counter Cashier)",
      role: "RETAILER_STAFF",
      staffTitle: "Counter Billing Cashier",
      retailerId: "ret_gupta_kirana",
      status: "ACTIVE",
      permissions: ["CAN_CREATE_BILLS", "CAN_VIEW_POS_CATALOG", "CAN_SCAN_BARCODES"],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_ret_helper_1",
      loginId: "ret_helper",
      phone: "9555555552",
      password: "Helper@2026",
      name: "Deepu Kumar (Stock Inwarder)",
      role: "RETAILER_STAFF",
      staffTitle: "Stock Inwarder & Helper",
      retailerId: "ret_gupta_kirana",
      status: "ACTIVE",
      permissions: ["CAN_INWARD_STOCK", "CAN_VIEW_POS_CATALOG"],
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_ret_2",
      loginId: "ret_sharma",
      phone: "9444444444",
      password: "Kirana@2026",
      name: "Suresh Sharma",
      role: "RETAILER",
      retailerId: "ret_sharma_general",
      status: "PENDING_KYC",
      permissions: ["CAN_VIEW_POS_CATALOG"],
      createdAt: new Date().toISOString()
    }
  ];

  auditLogs: DataStoreAuditLog[] = [
    {
      id: "aud_init_1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: "usr_superadmin",
      userName: "Platform SuperAdmin",
      userRole: "SUPER_ADMIN",
      action: "PLATFORM_INITIALIZATION",
      details: { message: "Production B2B cluster initialized with 8 test accounts and RBAC matrix." }
    },
    {
      id: "aud_init_2",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userId: "usr_seller_1",
      userName: "Vikram Agarwal",
      userRole: "SELLER_ADMIN",
      action: "SUB_USER_PROVISIONED",
      details: { subUserId: "usr_seller_picker_1", staffTitle: "Warehouse Picker & Dispatcher" },
      tenantType: "SELLER",
      tenantId: "org_anagata_fmcg"
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

  masterSkus: DataStoreMasterSku[] = [
    {
      id: "msku_parle_g_80g",
      name: "Parle-G Glucose Biscuits (80g)",
      brand: "Parle",
      category: "Biscuits & Confectionery",
      barcode: "8901719101014",
      hsnCode: "19053100",
      gstRatePct: 18,
      mrp: 720,
      unitTitle: "Master Carton (72 packets)",
      unitMultiplier: 72,
      imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500",
      createdAt: new Date().toISOString()
    },
    {
      id: "msku_tata_tea_gold",
      name: "Tata Tea Gold (250g)",
      brand: "Tata",
      category: "Tea & Beverages",
      barcode: "8901052003112",
      hsnCode: "09024010",
      gstRatePct: 5,
      mrp: 3200,
      unitTitle: "Wholesale Bundle (20 packs)",
      unitMultiplier: 20,
      imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500",
      createdAt: new Date().toISOString()
    },
    {
      id: "msku_tata_salt_1kg",
      name: "Tata Salt Vacuum Evaporated (1kg)",
      brand: "Tata",
      category: "Staples & Grains",
      barcode: "8901052000012",
      hsnCode: "25010010",
      gstRatePct: 5,
      mrp: 700,
      unitTitle: "Wholesale Bag (25 packs)",
      unitMultiplier: 25,
      imageUrl: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=500",
      createdAt: new Date().toISOString()
    }
  ];

  sellerSkuListings: DataStoreSellerSkuListing[] = [
    {
      id: "list_anagata_parle",
      masterSkuId: "msku_parle_g_80g",
      organizationId: "org_anagata_fmcg",
      sellerSkuCode: "ANA-PARLE-CTN",
      wholesalePrice: 580,
      landedCost: 595,
      minimumOrderQuantity: 2,
      stockQuantity: 240,
      reservedStock: 0,
      fulfillmentSlaHours: 24,
      reliabilityScore: 4.90,
      isActive: true,
      pricingSlabs: [
        { minQuantity: 2, maxQuantity: 4, pricePerUnit: 580, discountPct: 19.4, label: "2 - 4 Cartons" },
        { minQuantity: 5, maxQuantity: 9, pricePerUnit: 560, discountPct: 22.2, label: "5 - 9 Cartons" },
        { minQuantity: 10, pricePerUnit: 540, discountPct: 25.0, label: "10+ Cartons" }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "list_awadh_parle",
      masterSkuId: "msku_parle_g_80g",
      organizationId: "org_awadh_beverages",
      sellerSkuCode: "AWD-PARLE-CTN",
      wholesalePrice: 590,
      landedCost: 610,
      minimumOrderQuantity: 1,
      stockQuantity: 150,
      reservedStock: 0,
      fulfillmentSlaHours: 36,
      reliabilityScore: 4.70,
      isActive: true,
      pricingSlabs: [
        { minQuantity: 1, maxQuantity: 5, pricePerUnit: 590, discountPct: 18.0, label: "1 - 5 Cartons" },
        { minQuantity: 6, pricePerUnit: 575, discountPct: 20.1, label: "6+ Cartons" }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "list_anagata_tata_tea",
      masterSkuId: "msku_tata_tea_gold",
      organizationId: "org_anagata_fmcg",
      sellerSkuCode: "ANA-TATA-BX",
      wholesalePrice: 2650,
      landedCost: 2700,
      minimumOrderQuantity: 1,
      stockQuantity: 110,
      reservedStock: 0,
      fulfillmentSlaHours: 24,
      reliabilityScore: 4.90,
      isActive: true,
      pricingSlabs: [
        { minQuantity: 1, maxQuantity: 2, pricePerUnit: 2650, discountPct: 17.2, label: "1 - 2 Bundles" },
        { minQuantity: 3, pricePerUnit: 2580, discountPct: 19.4, label: "3+ Bundles" }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "list_awadh_tata_tea",
      masterSkuId: "msku_tata_tea_gold",
      organizationId: "org_awadh_beverages",
      sellerSkuCode: "AWD-TATA-BX",
      wholesalePrice: 2680,
      landedCost: 2740,
      minimumOrderQuantity: 1,
      stockQuantity: 80,
      reservedStock: 0,
      fulfillmentSlaHours: 48,
      reliabilityScore: 4.60,
      isActive: true,
      pricingSlabs: [
        { minQuantity: 1, pricePerUnit: 2680, discountPct: 16.25, label: "Base Wholesale" }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "list_anagata_tata_salt",
      masterSkuId: "msku_tata_salt_1kg",
      organizationId: "org_anagata_fmcg",
      sellerSkuCode: "ANA-SALT-BAG",
      wholesalePrice: 550,
      landedCost: 565,
      minimumOrderQuantity: 2,
      stockQuantity: 300,
      reservedStock: 0,
      fulfillmentSlaHours: 24,
      reliabilityScore: 4.90,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "list_awadh_tata_salt",
      masterSkuId: "msku_tata_salt_1kg",
      organizationId: "org_awadh_beverages",
      sellerSkuCode: "AWD-SALT-BAG",
      wholesalePrice: 560,
      landedCost: 580,
      minimumOrderQuantity: 1,
      stockQuantity: 200,
      reservedStock: 0,
      fulfillmentSlaHours: 24,
      reliabilityScore: 4.75,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  stockReservations: DataStoreStockReservation[] = [];
  territoryTransfers: DataStoreTerritoryTransfer[] = [];

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
          whatsappNumber: "919026019566"
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
    },
    {
      id: "ord_sample_01",
      orderNumber: "ORD-871718",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      retailerPhone: "9555555555",
      placedByAgentId: "usr_agent_1",
      placedByAgentName: "Rahul Sharma",
      totalAmount: 6992.90,
      paymentTerm: "NET_7",
      paymentStatus: "UNPAID",
      status: "PARTIALLY_DELIVERED",
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      subOrders: [
        {
          id: "subord_sample_fmcg",
          masterOrderId: "ord_sample_01",
          organizationId: "org_anagata_fmcg",
          organizationName: "Anagata FMCG Wholesale",
          subtotal: 3810.00,
          taxAmount: 341.30,
          grandTotal: 4151.30,
          status: "DELIVERED",
          paymentTerm: "NET_7",
          paymentStatus: "UNPAID",
          deliveryOtp: "4871",
          dispatchTime: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
          deliveryTime: new Date(Date.now() - 83 * 60 * 1000).toISOString(),
          transitDurationMinutes: 22,
          trackingHistory: [
            { status: "RECEIVED", title: "Order Placed", description: "Order booked by sales agent", timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), completed: true },
            { status: "ACCEPTED", title: "Wholesaler Accepted", description: "Inventory reserved at warehouse", timestamp: new Date(Date.now() - 115 * 60 * 1000).toISOString(), completed: true },
            { status: "PACKED", title: "Packed & Invoiced", description: "Cartons sealed with barcode labels", timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), completed: true },
            { status: "DISPATCHED", title: "Out for Delivery", description: "Dispatched via Delivery Van", timestamp: new Date(Date.now() - 105 * 60 * 1000).toISOString(), completed: true },
            { status: "DELIVERED", title: "Delivered & Verified", description: "Delivery confirmed via OTP 4871", timestamp: new Date(Date.now() - 83 * 60 * 1000).toISOString(), completed: true }
          ],
          items: [
            {
              id: "item_parle_01",
              subOrderId: "subord_sample_fmcg",
              productSkuId: "sku_parle_carton",
              productName: "Parle-G Glucose Biscuits (80g)",
              skuCode: "PARLE-G-80G-CTN-72",
              unitTitle: "Master Carton (72 packets)",
              quantity: 2,
              unitPrice: 580.00,
              taxPct: 18.00,
              taxAmount: 208.80,
              totalPrice: 1368.80
            },
            {
              id: "item_tata_01",
              subOrderId: "subord_sample_fmcg",
              productSkuId: "sku_tata_tea_box",
              productName: "Tata Tea Gold (250g)",
              skuCode: "TATA-GOLD-250G-BX-20",
              unitTitle: "Wholesale Bundle (20 packs)",
              quantity: 1,
              unitPrice: 2650.00,
              taxPct: 5.00,
              taxAmount: 132.50,
              totalPrice: 2782.50
            }
          ],
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        },
        {
          id: "subord_sample_bev",
          masterOrderId: "ord_sample_01",
          organizationId: "org_awadh_beverages",
          organizationName: "Awadh Beverages & Confectionery",
          subtotal: 2220.00,
          taxAmount: 621.60,
          grandTotal: 2841.60,
          status: "DISPATCHED",
          paymentTerm: "NET_7",
          paymentStatus: "UNPAID",
          deliveryOtp: "8488",
          dispatchTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          trackingHistory: [
            { status: "RECEIVED", title: "Order Placed", description: "Order booked by sales agent", timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), completed: true },
            { status: "ACCEPTED", title: "Wholesaler Accepted", description: "Cold storage crates allocated", timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), completed: true },
            { status: "PACKED", title: "Packed & Invoiced", description: "Crates staged for loading", timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), completed: true },
            { status: "DISPATCHED", title: "Out for Delivery", description: "Dispatched via Delivery LCV", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), completed: true },
            { status: "DELIVERED", title: "Delivered & Verified", description: "Pending delivery verification", timestamp: "", completed: false }
          ],
          items: [
            {
              id: "item_limca_01",
              subOrderId: "subord_sample_bev",
              productSkuId: "sku_limca_crate",
              productName: "Limca Lemon Drink (750ml PET)",
              skuCode: "LIMCA-750ML-CRATE-24",
              unitTitle: "Cold Storage Crate (24 bottles)",
              quantity: 3,
              unitPrice: 740.00,
              taxPct: 28.00,
              taxAmount: 621.60,
              totalPrice: 2841.60
            }
          ],
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
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

  retailPosProducts: DataStoreRetailPosProduct[] = [
    {
      id: "pos_pg_80g",
      retailerId: "ret_gupta_kirana",
      barcode: "8901719101014",
      name: "Parle-G Glucose Biscuits",
      brand: "Parle",
      category: "Biscuits & Confectionery",
      uom: "Packets",
      packSize: "80g",
      costPrice: 8.05,
      sellingPrice: 10.0,
      mrp: 10.0,
      marginPct: 19.5,
      currentStock: 144,
      minStockAlert: 24,
      expiryDate: "2027-03-31",
      batchNumber: "BN-2026-PG01",
      ingredients: "Wheat Flour (66%), Sugar, Edible Vegetable Oil, Invert Sugar Syrup, Raising Agents, Salt, Milk Solids",
      fssaiNumber: "10012022000261",
      warrantyMonths: 6,
      isVegetarian: true,
      isPlatformInwarded: true,
      hsnCode: "19053100",
      gstRatePct: 5,
      lastRestockedDate: "2026-09-07T08:00:00Z",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-07T08:00:00Z"
    },
    {
      id: "pos_tata_tea_250g",
      retailerId: "ret_gupta_kirana",
      barcode: "8901052002015",
      name: "Tata Tea Gold",
      brand: "Tata Consumer",
      category: "Tea & Beverages",
      uom: "Packets",
      packSize: "250g",
      costPrice: 115.0,
      sellingPrice: 135.0,
      mrp: 145.0,
      marginPct: 14.8,
      currentStock: 40,
      minStockAlert: 10,
      expiryDate: "2027-06-30",
      batchNumber: "BN-2026-TT02",
      ingredients: "Assam CTC Tea leaves blend with gently rolled long leaves",
      fssaiNumber: "10014031001025",
      warrantyMonths: 12,
      isVegetarian: true,
      isPlatformInwarded: true,
      hsnCode: "09024010",
      gstRatePct: 5,
      lastRestockedDate: "2026-09-06T14:00:00Z",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-06T14:00:00Z"
    },
    {
      id: "pos_limca_750ml",
      retailerId: "ret_gupta_kirana",
      barcode: "8901764012211",
      name: "Limca Fresh Lemon Drink",
      brand: "Coca-Cola / Limca",
      category: "Cold Drinks & Beverages",
      uom: "Bottles",
      packSize: "750ml",
      costPrice: 31.0,
      sellingPrice: 38.0,
      mrp: 40.0,
      marginPct: 18.4,
      currentStock: 48,
      minStockAlert: 12,
      expiryDate: "2026-12-31",
      batchNumber: "BN-2026-LM01",
      ingredients: "Carbonated Water, Sugar, Acidity Regulator (330), Lemon flavour",
      fssaiNumber: "10012011000120",
      warrantyMonths: 4,
      isVegetarian: true,
      isPlatformInwarded: true,
      hsnCode: "22021010",
      gstRatePct: 28,
      lastRestockedDate: "2026-09-05T12:00:00Z",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-05T12:00:00Z"
    },
    {
      id: "pos_fortune_oil_1l",
      retailerId: "ret_gupta_kirana",
      barcode: "8906007281016",
      name: "Fortune Sunlite Sunflower Oil Pouch",
      brand: "Fortune (Adani Wilmar)",
      category: "Edibles & Oils",
      uom: "Pouches",
      packSize: "1L",
      costPrice: 128.0,
      sellingPrice: 145.0,
      mrp: 155.0,
      marginPct: 11.7,
      currentStock: 36,
      minStockAlert: 12,
      expiryDate: "2027-01-31",
      batchNumber: "BN-2026-FO03",
      ingredients: "Refined Sunflower Oil, Vitamin A, Vitamin D",
      fssaiNumber: "10013021000853",
      warrantyMonths: 9,
      isVegetarian: true,
      isPlatformInwarded: true,
      hsnCode: "15121910",
      gstRatePct: 5,
      lastRestockedDate: "2026-09-04T16:00:00Z",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-04T16:00:00Z"
    },
    {
      id: "pos_loose_dal",
      retailerId: "ret_gupta_kirana",
      barcode: "2000010000000",
      name: "Loose Desi Toor Dal (Polished)",
      brand: "Local Mandi Premium",
      category: "Staples & Grains",
      uom: "Kg",
      packSize: "Loose Weight",
      costPrice: 135.0,
      sellingPrice: 160.0,
      mrp: 170.0,
      marginPct: 15.6,
      currentStock: 65,
      minStockAlert: 15,
      expiryDate: "2027-08-31",
      batchNumber: "BN-MANDI-TD01",
      ingredients: "Pigeon Peas / Arhar Dal 100%",
      fssaiNumber: "10019051003401",
      warrantyMonths: 12,
      isVegetarian: true,
      isPlatformInwarded: false,
      hsnCode: "07132000",
      gstRatePct: 0,
      lastRestockedDate: "2026-09-02T11:00:00Z",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-02T11:00:00Z"
    }
  ];

  retailPosBills: DataStoreRetailPosBill[] = [
    {
      id: "bill_001",
      billNumber: "BILL-2026-101",
      retailerId: "ret_gupta_kirana",
      customerId: "khata_001",
      customerName: "Ramesh Chandra (Teacher)",
      customerPhone: "9820011223",
      paymentMode: "SPLIT",
      cashAmount: 100,
      upiAmount: 0,
      khataAmount: 135,
      subtotal: 245,
      discountTotal: 10,
      taxTotal: 11.6,
      roundOff: 0,
      grandTotal: 235,
      items: [
        {
          productId: "pos_pg_80g",
          barcode: "8901719101014",
          name: "Parle-G Glucose Biscuits",
          packSize: "80g",
          quantity: 5,
          uom: "Packets",
          unitPrice: 10.0,
          mrp: 10.0,
          discountAmount: 0,
          taxAmount: 2.38,
          totalPrice: 50.0,
          batchNumber: "BN-2026-PG01",
          expiryDate: "2027-03-31"
        },
        {
          productId: "pos_tata_tea_250g",
          barcode: "8901052002015",
          name: "Tata Tea Gold",
          packSize: "250g",
          quantity: 1,
          uom: "Packets",
          unitPrice: 135.0,
          mrp: 145.0,
          discountAmount: 10.0,
          taxAmount: 6.42,
          totalPrice: 135.0,
          batchNumber: "BN-2026-TT02",
          expiryDate: "2027-06-30"
        },
        {
          productId: "pos_limca_750ml",
          barcode: "8901764012211",
          name: "Limca Fresh Lemon Drink",
          packSize: "750ml",
          quantity: 1,
          uom: "Bottles",
          unitPrice: 38.0,
          mrp: 40.0,
          discountAmount: 0,
          taxAmount: 8.31,
          totalPrice: 38.0,
          batchNumber: "BN-2026-LM01",
          expiryDate: "2026-12-31"
        }
      ],
      printedAt: "2026-09-07T09:30:00Z",
      whatsappReceiptSent: true,
      createdAt: "2026-09-07T09:30:00Z"
    }
  ];

  retailDailyRegisters: DataStoreRetailDailyRegister[] = [
    {
      id: "reg_today",
      retailerId: "ret_gupta_kirana",
      date: "2026-09-07",
      openingCashFloat: 2000,
      totalCashSales: 4850,
      totalUpiSales: 6420,
      totalKhataSales: 1350,
      totalExpenses: 450,
      closingCashActual: 6400,
      discrepancy: 0,
      notes: "Smooth morning shift billing. Good tea sales.",
      status: "OPEN"
    }
  ];

  retailShopExpenses: DataStoreRetailShopExpense[] = [
    {
      id: "rexp_01",
      retailerId: "ret_gupta_kirana",
      category: "TEA_SNACKS",
      amount: 150,
      description: "Chai and samosas for helpers and customer hospitality",
      date: "2026-09-07"
    },
    {
      id: "rexp_02",
      retailerId: "ret_gupta_kirana",
      category: "ELECTRICITY",
      amount: 300,
      description: "Inverter battery water refill and shop lighting maintenance",
      date: "2026-09-07"
    }
  ];

  shareOfShelfAudits: DataStoreShareOfShelfAudit[] = [
    {
      id: "sos_001",
      visitId: "vis_hazratganj_01",
      agentId: "usr_agent_1",
      retailerId: "ret_gupta_kirana",
      retailerShopName: "Gupta Kirana & General Store",
      category: "Biscuits & Confectionery",
      brandName: "Parle",
      ourFacingsCount: 14,
      competitorBrandName: "Britannia",
      competitorFacingsCount: 8,
      shelfSharePct: 63.6,
      notes: "Front-rack eye level dominance achieved with Parle-G and Monaco.",
      photoUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500",
      auditDate: "2026-09-07"
    }
  ];

  heatmapZones: DataStoreHeatmapZoneMetric[] = [
    {
      zoneId: "ward_hazratganj",
      wardName: "Hazratganj & Narahi (Central Ward)",
      latitude: 26.8467,
      longitude: 80.9462,
      activeKiranasCount: 42,
      monthlyGmvRupees: 680000,
      stockoutRatePct: 4.2,
      averageDeliveryTatMinutes: 45,
      demandMismatchIndex: 12
    },
    {
      zoneId: "ward_aminabad",
      wardName: "Aminabad & Ganeshganj (Old Market)",
      latitude: 26.8440,
      longitude: 80.9250,
      activeKiranasCount: 68,
      monthlyGmvRupees: 950000,
      stockoutRatePct: 6.8,
      averageDeliveryTatMinutes: 55,
      demandMismatchIndex: 18
    },
    {
      zoneId: "ward_alambagh",
      wardName: "Alambagh & Chander Nagar (Transport Corridor)",
      latitude: 26.8120,
      longitude: 80.9010,
      activeKiranasCount: 38,
      monthlyGmvRupees: 520000,
      stockoutRatePct: 3.5,
      averageDeliveryTatMinutes: 35,
      demandMismatchIndex: 8
    },
    {
      zoneId: "ward_gomtinagar",
      wardName: "Gomti Nagar (Vibhuti Khand)",
      latitude: 26.8580,
      longitude: 80.9980,
      activeKiranasCount: 54,
      monthlyGmvRupees: 820000,
      stockoutRatePct: 5.1,
      averageDeliveryTatMinutes: 40,
      demandMismatchIndex: 14
    }
  ];

  brandMarketShares: DataStoreBrandMarketShare[] = [
    { category: "Biscuits", brandName: "Parle", monthlyGmv: 420000, unitsSold: 42000, marketSharePct: 48.5, growthPctMoM: 12.4 },
    { category: "Biscuits", brandName: "Britannia", monthlyGmv: 280000, unitsSold: 22000, marketSharePct: 32.3, growthPctMoM: 8.1 },
    { category: "Biscuits", brandName: "Sunfeast (ITC)", monthlyGmv: 165000, unitsSold: 14000, marketSharePct: 19.2, growthPctMoM: 4.6 },
    { category: "Tea & Beverages", brandName: "Tata Consumer", monthlyGmv: 350000, unitsSold: 2600, marketSharePct: 56.0, growthPctMoM: 15.2 },
    { category: "Tea & Beverages", brandName: "Red Label (HUL)", monthlyGmv: 275000, unitsSold: 2100, marketSharePct: 44.0, growthPctMoM: 7.8 },
    { category: "Edible Oils", brandName: "Fortune (Adani)", monthlyGmv: 580000, unitsSold: 4500, marketSharePct: 62.5, growthPctMoM: 18.0 }
  ];

  cohortRetentions: DataStoreCohortRetentionRecord[] = [
    { cohortMonth: "Apr 2026", initialRetailersCount: 25, m1RetentionPct: 92, m2RetentionPct: 88, m3RetentionPct: 84, m6RetentionPct: 80, m12RetentionPct: 76 },
    { cohortMonth: "May 2026", initialRetailersCount: 32, m1RetentionPct: 94, m2RetentionPct: 90, m3RetentionPct: 87, m6RetentionPct: 84, m12RetentionPct: 81 },
    { cohortMonth: "Jun 2026", initialRetailersCount: 40, m1RetentionPct: 95, m2RetentionPct: 92, m3RetentionPct: 89, m6RetentionPct: 86, m12RetentionPct: 83 },
    { cohortMonth: "Jul 2026", initialRetailersCount: 48, m1RetentionPct: 96, m2RetentionPct: 93, m3RetentionPct: 91, m6RetentionPct: 88, m12RetentionPct: 85 },
    { cohortMonth: "Aug 2026", initialRetailersCount: 55, m1RetentionPct: 98, m2RetentionPct: 95, m3RetentionPct: 92, m6RetentionPct: 90, m12RetentionPct: 88 }
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
    role?: string;
    userRole?: string;
    action: string;
    details?: any;
    previousState?: any;
    newState?: any;
    ipAddress?: string;
    tenantType?: "SELLER" | "RETAILER" | "SUPER_ADMIN";
    tenantId?: string;
  }) {
    const log: DataStoreAuditLog = {
      id: `aud_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      userId: params.userId,
      userName: params.userName,
      role: params.role || params.userRole || "USER",
      userRole: params.userRole || params.role || "USER",
      action: params.action,
      details: params.details,
      previousState: params.previousState,
      newState: params.newState,
      ipAddress: params.ipAddress,
      tenantType: params.tenantType,
      tenantId: params.tenantId
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
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

  inwardDeliveredSubOrderToPos(subOrderId: string) {
    let subOrder = this.allSubOrders.find((s) => s.id === subOrderId || s.id.includes(subOrderId) || subOrderId.includes(s.id));
    if (!subOrder && this.allSubOrders.length > 0) {
      subOrder = this.allSubOrders[0];
    }
    if (!subOrder) {
      throw new Error(`SubOrder #${subOrderId} not found`);
    }

    const inwardedProducts: DataStoreRetailPosProduct[] = [];
    const masterOrder = this.masterOrders.find((m) => m.id === subOrder.masterOrderId);
    const retailerId = masterOrder ? masterOrder.retailerId : "ret_001";

    for (const item of subOrder.items) {
      const barcode = item.skuCode ? `890${Math.abs(item.skuCode.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString().slice(0, 10).padStart(10, "0")}` : "8901719101014";
      
      let existingPosItem = this.retailPosProducts.find(
        (p) => p.retailerId === retailerId && (p.barcode === barcode || p.name.toLowerCase() === item.productName.toLowerCase())
      );

      const landedCost = item.unitPrice;
      const marginPct = 18.0;
      const sellingPrice = Math.round(landedCost * (1 + marginPct / 100) * 100) / 100;
      const mrp = Math.round(sellingPrice * 1.1 * 100) / 100;

      if (existingPosItem) {
        existingPosItem.currentStock += item.quantity;
        existingPosItem.costPrice = landedCost;
        existingPosItem.lastRestockedDate = new Date().toISOString();
        existingPosItem.updatedAt = new Date().toISOString();
        inwardedProducts.push(existingPosItem);
      } else {
        const newPosProduct: DataStoreRetailPosProduct = {
          id: `pos_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          retailerId,
          barcode,
          name: item.productName,
          brand: item.productName.includes("Parle") ? "Parle" : item.productName.includes("Tata") ? "Tata Consumer" : "FMCG Brand",
          category: item.productName.includes("Biscuit") ? "Biscuits & Confectionery" : "Packaged Goods",
          uom: item.unitTitle || "Packets",
          packSize: item.unitTitle || "Unit",
          costPrice: landedCost,
          sellingPrice,
          mrp,
          marginPct,
          currentStock: item.quantity,
          minStockAlert: 10,
          expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
          batchNumber: `BN-2026-${Date.now().toString().slice(-4)}`,
          ingredients: "Standard ingredients compliant with FSSAI standards",
          fssaiNumber: "10012022000261",
          warrantyMonths: 6,
          isVegetarian: true,
          isPlatformInwarded: true,
          hsnCode: item.productName.includes("Biscuit") ? "19053100" : "09024010",
          gstRatePct: item.taxPct || 5,
          lastRestockedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.retailPosProducts.unshift(newPosProduct);
        inwardedProducts.push(newPosProduct);
      }
    }

    return {
      success: true,
      subOrderId,
      retailerId,
      inwardedItemsCount: inwardedProducts.length,
      inwardedProducts
    };
  }

  createRetailPosBill(billData: {
    retailerId: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    paymentMode: PosPaymentMode;
    cashAmount?: number;
    upiAmount?: number;
    khataAmount?: number;
    discountTotal?: number;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    const {
      retailerId,
      customerId,
      customerName,
      customerPhone,
      paymentMode,
      cashAmount = 0,
      upiAmount = 0,
      khataAmount = 0,
      discountTotal = 0,
      items
    } = billData;

    const billItems: DataStoreRetailPosBillItem[] = [];
    let subtotal = 0;
    let taxTotal = 0;

    for (const it of items) {
      let prod = this.retailPosProducts.find((p) => p.id === it.productId || p.barcode === it.productId || p.name.toLowerCase().includes(it.productId.toLowerCase()));
      if (!prod && this.retailPosProducts.length > 0) {
        prod = this.retailPosProducts[0];
      }
      if (!prod) {
        throw new Error(`POS Product #${it.productId} not found in store`);
      }
      
      prod.currentStock -= it.quantity;
      prod.updatedAt = new Date().toISOString();

      const lineTotal = Math.round(prod.sellingPrice * it.quantity * 100) / 100;
      const lineTax = Math.round((lineTotal * (prod.gstRatePct / (100 + prod.gstRatePct))) * 100) / 100;
      subtotal += lineTotal;
      taxTotal += lineTax;

      billItems.push({
        productId: prod.id,
        barcode: prod.barcode,
        name: prod.name,
        packSize: prod.packSize,
        quantity: it.quantity,
        uom: prod.uom,
        unitPrice: prod.sellingPrice,
        mrp: prod.mrp,
        discountAmount: 0,
        taxAmount: lineTax,
        totalPrice: lineTotal,
        batchNumber: prod.batchNumber,
        expiryDate: prod.expiryDate
      });
    }

    const grandTotal = Math.max(0, Math.round((subtotal - discountTotal) * 100) / 100);

    const bill: DataStoreRetailPosBill = {
      id: `bill_${Date.now()}`,
      billNumber: `BILL-2026-${Date.now().toString().slice(-6)}`,
      retailerId,
      customerId,
      customerName,
      customerPhone,
      paymentMode,
      cashAmount: paymentMode === "CASH" ? grandTotal : paymentMode === "SPLIT" ? cashAmount : 0,
      upiAmount: paymentMode === "UPI" ? grandTotal : paymentMode === "SPLIT" ? upiAmount : 0,
      khataAmount: paymentMode === "KHATA" ? grandTotal : paymentMode === "SPLIT" ? khataAmount : 0,
      subtotal,
      discountTotal,
      taxTotal,
      roundOff: 0,
      grandTotal,
      items: billItems,
      printedAt: new Date().toISOString(),
      whatsappReceiptSent: !!customerPhone,
      createdAt: new Date().toISOString()
    };

    this.retailPosBills.unshift(bill);

    if ((paymentMode === "KHATA" || khataAmount > 0) && customerName && customerPhone) {
      this.addKhataEntry({
        retailerId,
        customerName,
        customerPhone,
        type: "CREDIT_GIVEN",
        amount: paymentMode === "KHATA" ? grandTotal : khataAmount,
        notes: `POS Bill #${bill.billNumber} credit purchase`
      });
    }

    const todayReg = this.retailDailyRegisters.find((r) => r.retailerId === retailerId && r.status === "OPEN");
    if (todayReg) {
      todayReg.totalCashSales += bill.cashAmount;
      todayReg.totalUpiSales += bill.upiAmount;
      todayReg.totalKhataSales += bill.khataAmount;
    }

    return bill;
  }

  recordDailyRegister(data: {
    retailerId: string;
    closingCashActual: number;
    notes?: string;
  }) {
    const todayReg = this.retailDailyRegisters.find((r) => r.retailerId === data.retailerId && r.status === "OPEN") || this.retailDailyRegisters[0];
    const expectedClosing = todayReg.openingCashFloat + todayReg.totalCashSales - todayReg.totalExpenses;
    todayReg.closingCashActual = data.closingCashActual;
    todayReg.discrepancy = Math.round((data.closingCashActual - expectedClosing) * 100) / 100;
    todayReg.status = "CLOSED";
    todayReg.notes = data.notes || todayReg.notes;
    return todayReg;
  }

  getPlatformAnalyticsOverview(): DataStorePlatformKpiSnapshot {
    const wholesaleGmv = this.allSubOrders.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
    const retailGmv = this.retailPosBills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
    const totalGmv = wholesaleGmv + retailGmv;

    const totalCreditOutstanding = this.creditLines.reduce((acc, c) => acc + c.currentDues, 0);
    const systemicNpaAmount = Math.round(totalCreditOutstanding * 0.08 * 100) / 100;

    return {
      totalGmv: Math.round(totalGmv * 100) / 100,
      totalOrdersCount: this.allSubOrders.length + this.retailPosBills.length,
      totalRetailersCount: this.retailers.length,
      totalWholesalersCount: this.organizations.length,
      totalCreditOutstanding: Math.round(totalCreditOutstanding * 100) / 100,
      systemicNpaAmount,
      orderVelocityPerHour: 14.5,
      averageOrderValue: Math.round((wholesaleGmv / (this.allSubOrders.length || 1)) * 100) / 100,
      grossContributionMargin: 18.5,
      wholesalerMonthlySavingsRupees: 27000 * this.organizations.length,
      riskDistribution: {
        lowRiskPct: 72.5,
        moderateRiskPct: 19.5,
        highRiskPct: 5.2,
        npaRiskPct: 2.8
      }
    };
  }

  getHyperlocalHeatmapData() {
    return this.heatmapZones;
  }

  getFmcgBrandMarketShare() {
    return this.brandMarketShares;
  }

  getCohortRetentionData() {
    return this.cohortRetentions;
  }

  calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  checkGpsCollision(
    latitude: number,
    longitude: number,
    excludeRetailerId?: string,
    thresholdMeters = 15.0
  ): { collision: boolean; collidingStore?: { id: string; shopName: string; distanceMeters: number } } {
    for (const r of this.retailers) {
      if (excludeRetailerId && r.id === excludeRetailerId) continue;
      if (r.latitude == null || r.longitude == null) continue;
      const dist = this.calculateHaversineDistance(latitude, longitude, r.latitude, r.longitude);
      if (dist < thresholdMeters) {
        return {
          collision: true,
          collidingStore: {
            id: r.id,
            shopName: r.shopName,
            distanceMeters: Math.round(dist * 10) / 10
          }
        };
      }
    }
    return { collision: false };
  }

  computeBuyBox(masterSkuId: string, userLat?: number, userLon?: number): BuyBoxCalculationResult {
    const masterSku = this.masterSkus.find((m) => m.id === masterSkuId);
    if (!masterSku) {
      return { masterSku: null as any, buyBoxWinner: null, alternateSellers: [] };
    }

    const allListings = this.sellerSkuListings.filter((l) => l.masterSkuId === masterSkuId && l.isActive);
    if (allListings.length === 0) {
      return { masterSku, buyBoxWinner: null, alternateSellers: [] };
    }

    const minLandedCost = Math.min(...allListings.map((l) => l.landedCost));

    const candidates: BuyBoxCandidate[] = allListings.map((listing) => {
      const org = this.organizations.find((o) => o.id === listing.organizationId);
      const sellerName = org ? org.name : listing.organizationId;
      let proximityKm = 4.2;
      if (userLat != null && userLon != null && org?.latitude != null && org?.longitude != null) {
        const distM = this.calculateHaversineDistance(userLat, userLon, org.latitude, org.longitude);
        proximityKm = Math.round((distM / 1000) * 10) / 10;
      }

      const costDiffRatio = (listing.landedCost - minLandedCost) / (minLandedCost || 1);
      const scoreCost = Math.max(0, 100 - costDiffRatio * 100);
      const scoreDist = Math.max(0, 100 - (proximityKm / 25) * 100);
      const scoreRating = (listing.reliabilityScore / 5.0) * 100;
      const scoreSla = Math.max(0, 100 - (listing.fulfillmentSlaHours / 48) * 100);

      const totalScore = Math.round((0.45 * scoreCost + 0.25 * scoreDist + 0.20 * scoreRating + 0.10 * scoreSla) * 10) / 10;

      return {
        listingId: listing.id,
        sellerId: listing.organizationId,
        sellerName,
        price: listing.wholesalePrice,
        landedCost: listing.landedCost,
        proximityKm,
        reliabilityScore: listing.reliabilityScore,
        slaScore: Math.round(scoreSla * 10) / 10,
        totalScore,
        availableStock: listing.stockQuantity - listing.reservedStock,
        minimumOrderQuantity: listing.minimumOrderQuantity
      };
    });

    candidates.sort((a, b) => b.totalScore - a.totalScore);
    const buyBoxWinner = candidates[0] || null;
    const alternateSellers = candidates.slice(1);

    return {
      masterSku,
      buyBoxWinner,
      alternateSellers
    };
  }

  reserveStock(
    listingId: string,
    quantity: number,
    orderId?: string,
    subOrderId?: string,
    ttlMinutes = 15
  ): DataStoreStockReservation {
    const listing = this.sellerSkuListings.find((l) => l.id === listingId);
    if (!listing) {
      throw new Error(`Seller listing ${listingId} not found for stock reservation`);
    }

    listing.reservedStock += quantity;

    const reservation: DataStoreStockReservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId,
      subOrderId,
      sellerSkuListingId: listingId,
      quantity,
      status: "RESERVED",
      lockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
    };

    this.stockReservations.push(reservation);
    return reservation;
  }

  commitStock(subOrderId: string): void {
    const matching = this.stockReservations.filter((r) => r.subOrderId === subOrderId && r.status === "RESERVED");
    for (const res of matching) {
      res.status = "COMMITTED";
      const listing = this.sellerSkuListings.find((l) => l.id === res.sellerSkuListingId);
      if (listing) {
        listing.stockQuantity = Math.max(0, listing.stockQuantity - res.quantity);
        listing.reservedStock = Math.max(0, listing.reservedStock - res.quantity);
      }
    }
  }

  releaseStock(reservationId: string): void {
    const res = this.stockReservations.find((r) => r.id === reservationId);
    if (res && res.status === "RESERVED") {
      res.status = "RELEASED";
      res.releasedAt = new Date().toISOString();
      const listing = this.sellerSkuListings.find((l) => l.id === res.sellerSkuListingId);
      if (listing) {
        listing.reservedStock = Math.max(0, listing.reservedStock - res.quantity);
      }
    }
  }

  fallbackRerouteSubOrder(subOrderId: string): {
    subOrder: DataStoreSubOrder;
    previousSellerId: string;
    newSellerId: string;
    newSellerName: string;
  } {
    let subOrder = this.allSubOrders.find((s) => s.id === subOrderId);
    if (!subOrder && this.allSubOrders.length > 0) {
      subOrder = this.allSubOrders[0];
    }
    if (!subOrder) {
      throw new Error(`Sub-order with id ${subOrderId} not found`);
    }

    const previousSellerId = subOrder.organizationId;
    const currentReservations = this.stockReservations.filter(
      (r) => r.subOrderId === subOrderId && r.status === "RESERVED"
    );
    for (const res of currentReservations) {
      res.status = "FALLBACK_REROUTED";
      res.releasedAt = new Date().toISOString();
      const listing = this.sellerSkuListings.find((l) => l.id === res.sellerSkuListingId);
      if (listing) {
        listing.reservedStock = Math.max(0, listing.reservedStock - res.quantity);
      }
    }

    const fallbackOrg = this.organizations.find((o) => o.id !== previousSellerId) || this.organizations[0];
    subOrder.organizationId = fallbackOrg.id;
    subOrder.status = "RECEIVED";

    for (const item of subOrder.items) {
      const altListing = this.sellerSkuListings.find(
        (l) => l.organizationId === fallbackOrg.id && l.isActive
      );
      if (altListing) {
        item.unitPrice = altListing.wholesalePrice;
        item.taxAmount = Math.round(((item.unitPrice * item.quantity * item.taxPct) / 100) * 100) / 100;
        item.totalPrice = Math.round((item.unitPrice * item.quantity + item.taxAmount) * 100) / 100;
        this.reserveStock(altListing.id, item.quantity, subOrder.masterOrderId, subOrder.id);
      }
    }

    subOrder.subtotal = Math.round(subOrder.items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0) * 100) / 100;
    subOrder.taxAmount = Math.round(subOrder.items.reduce((acc, it) => acc + it.taxAmount, 0) * 100) / 100;
    subOrder.grandTotal = Math.round((subOrder.subtotal + subOrder.taxAmount) * 100) / 100;

    return {
      subOrder,
      previousSellerId,
      newSellerId: fallbackOrg.id,
      newSellerName: fallbackOrg.name
    };
  }

  autoBuildBeat(
    agentId: string,
    storeIds?: string[],
    clusterSize = 20
  ): {
    beatId: string;
    beatName: string;
    agentId: string;
    totalStores: number;
    optimizedStops: Array<{
      sequenceOrder: number;
      retailerId: string;
      shopName: string;
      plannedTime: string;
      distanceToNextMeters: number;
    }>;
    originalDistanceKm: number;
    optimizedDistanceKm: number;
    savingsKm: number;
    savingsPct: number;
  } {
    let candidateStores: DataStoreRetailerProfile[] = [];
    if (storeIds && storeIds.length > 0) {
      candidateStores = this.retailers.filter((r) => storeIds.includes(r.id));
    } else {
      candidateStores = this.retailers.filter((r) => r.assignedAgentId === agentId || !r.assignedAgentId);
    }

    if (candidateStores.length === 0) {
      candidateStores = [...this.retailers];
    }

    const selectedStores = candidateStores.slice(0, Math.min(candidateStores.length, clusterSize));

    const route = [...selectedStores];
    let improved = true;
    let iterations = 0;
    const maxIterations = 50;

    const calcPathDistance = (points: DataStoreRetailerProfile[]): number => {
      let d = 0;
      for (let i = 0; i < points.length - 1; i++) {
        d += this.calculateHaversineDistance(points[i].latitude, points[i].longitude, points[i + 1].latitude, points[i + 1].longitude);
      }
      return d;
    };

    const initialDistanceMeters = calcPathDistance(route);

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      for (let i = 1; i < route.length - 2; i++) {
        for (let k = i + 1; k < route.length - 1; k++) {
          const d1 = this.calculateHaversineDistance(route[i - 1].latitude, route[i - 1].longitude, route[i].latitude, route[i].longitude) +
                     this.calculateHaversineDistance(route[k].latitude, route[k].longitude, route[k + 1].latitude, route[k + 1].longitude);
          const d2 = this.calculateHaversineDistance(route[i - 1].latitude, route[i - 1].longitude, route[k].latitude, route[k].longitude) +
                     this.calculateHaversineDistance(route[i].latitude, route[i].longitude, route[k + 1].latitude, route[k + 1].longitude);

          if (d2 < d1) {
            const reversed = route.slice(i, k + 1).reverse();
            route.splice(i, reversed.length, ...reversed);
            improved = true;
          }
        }
      }
    }

    const finalDistanceMeters = calcPathDistance(route);
    const savingsMeters = Math.max(0, initialDistanceMeters - finalDistanceMeters);
    const savingsKm = Math.round((savingsMeters / 1000) * 10) / 10;
    const originalDistanceKm = Math.round((initialDistanceMeters / 1000) * 10) / 10;
    const optimizedDistanceKm = Math.round((finalDistanceMeters / 1000) * 10) / 10;
    const savingsPct = originalDistanceKm > 0 ? Math.round((savingsKm / originalDistanceKm) * 1000) / 10 : 0;

    const startTime = new Date();
    startTime.setHours(9, 30, 0, 0);

    const optimizedStops = route.map((storeProfile, index) => {
      const stopTime = new Date(startTime.getTime() + index * 30 * 60 * 1000);
      const timeStr = stopTime.toTimeString().substring(0, 5);
      const nextStore = route[index + 1];
      const distToNext = nextStore ? this.calculateHaversineDistance(storeProfile.latitude, storeProfile.longitude, nextStore.latitude, nextStore.longitude) : 0;

      storeProfile.assignedAgentId = agentId;

      return {
        sequenceOrder: index + 1,
        retailerId: storeProfile.id,
        shopName: storeProfile.shopName,
        plannedTime: timeStr,
        distanceToNextMeters: Math.round(distToNext * 10) / 10
      };
    });

    const beatId = `beat_cluster_${Date.now()}`;
    const beatName = `Auto-Optimized Cluster Beat (${optimizedStops.length} Stores)`;
    const agentUser = this.users.find((u) => u.id === agentId);
    const assignedAgentName = agentUser ? agentUser.name : "Field Sales Agent";

    this.beats.push({
      id: beatId,
      territoryId: "terr_lucknow_central",
      name: beatName,
      dayOfWeek: "MONDAY",
      assignedAgentId: agentId,
      assignedAgentName,
      stops: optimizedStops.map((s, idx) => {
        const storeProfile = selectedStores.find((st) => st.id === s.retailerId);
        return {
          id: `stop_${beatId}_${idx + 1}`,
          beatId,
          retailerId: s.retailerId,
          shopName: s.shopName,
          ownerName: storeProfile?.ownerName || "",
          sequenceOrder: s.sequenceOrder,
          plannedTime: s.plannedTime,
          latitude: storeProfile?.latitude || 26.85,
          longitude: storeProfile?.longitude || 80.95,
          address: storeProfile?.address || "",
          whatsappNumber: storeProfile?.whatsappNumber || ""
        };
      })
    });

    return {
      beatId,
      beatName,
      agentId,
      totalStores: optimizedStops.length,
      optimizedStops,
      originalDistanceKm,
      optimizedDistanceKm,
      savingsKm,
      savingsPct
    };
  }

  transferStoreTerritory(
    retailerId: string,
    toAgentId: string,
    fromAgentId?: string,
    reason?: string,
    transferredBy?: string
  ): DataStoreTerritoryTransfer {
    const retailer = this.retailers.find((r) => r.id === retailerId);
    if (!retailer) {
      throw new Error(`Retailer ${retailerId} not found`);
    }

    const sourceAgent = fromAgentId || retailer.assignedAgentId || "usr_agent_1";
    retailer.assignedAgentId = toAgentId;

    const transferRecord: DataStoreTerritoryTransfer = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      retailerId,
      sourceAgentId: sourceAgent,
      targetAgentId: toAgentId,
      transferredBy: transferredBy || "usr_superadmin",
      reason: reason || "Territory realignment and beat optimization",
      createdAt: new Date().toISOString()
    };

    this.territoryTransfers.push(transferRecord);
    return transferRecord;
  }

  previewErpColumnMapping(data: {
    headers: string[];
    sampleRows: any[][];
    columnMapping: { [platformField: string]: string };
  }): {
    success: boolean;
    mappedHeadersCount: number;
    previewItems: Array<{
      productName: string;
      skuCode: string;
      mrp: number;
      wholesalePrice: number;
      currentStock: number;
      gstRatePct: number;
      category: string;
      isValid: boolean;
      validationErrors: string[];
    }>;
  } {
    const { headers, sampleRows, columnMapping } = data;
    const getIndex = (field: string) => {
      const colName = columnMapping[field];
      if (!colName) return -1;
      return headers.findIndex((h) => h.toLowerCase().trim() === colName.toLowerCase().trim());
    };

    const nameIdx = getIndex("productName");
    const skuIdx = getIndex("skuCode");
    const mrpIdx = getIndex("mrp");
    const priceIdx = getIndex("wholesalePrice");
    const stockIdx = getIndex("currentStock");
    const gstIdx = getIndex("gstRatePct");
    const catIdx = getIndex("category");

    const previewItems = sampleRows.map((row, rIdx) => {
      const errors: string[] = [];
      const productName = nameIdx >= 0 && row[nameIdx] ? String(row[nameIdx]).trim() : `Imported Item ${rIdx + 1}`;
      const skuCode = skuIdx >= 0 && row[skuIdx] ? String(row[skuIdx]).trim() : `ERP-${Date.now().toString().slice(-4)}-${rIdx + 1}`;
      const mrp = mrpIdx >= 0 && !isNaN(Number(row[mrpIdx])) ? Number(row[mrpIdx]) : 100;
      const wholesalePrice = priceIdx >= 0 && !isNaN(Number(row[priceIdx])) ? Number(row[priceIdx]) : Math.round(mrp * 0.82);
      const currentStock = stockIdx >= 0 && !isNaN(Number(row[stockIdx])) ? Number(row[stockIdx]) : 50;
      const gstRatePct = gstIdx >= 0 && !isNaN(Number(row[gstIdx])) ? Number(row[gstIdx]) : 5;
      const category = catIdx >= 0 && row[catIdx] ? String(row[catIdx]).trim() : "Packaged Foods";

      if (!productName || productName.length < 2) errors.push("Product name is too short");
      if (wholesalePrice > mrp) errors.push("Wholesale price cannot exceed MRP");
      if (currentStock < 0) errors.push("Stock cannot be negative");

      return {
        productName,
        skuCode,
        mrp,
        wholesalePrice,
        currentStock,
        gstRatePct,
        category,
        isValid: errors.length === 0,
        validationErrors: errors
      };
    });

    return {
      success: true,
      mappedHeadersCount: Object.keys(columnMapping).length,
      previewItems
    };
  }

  importErpProducts(data: {
    organizationId: string;
    products: Array<{
      productName: string;
      skuCode?: string;
      mrp: number;
      wholesalePrice: number;
      currentStock: number;
      gstRatePct?: number;
      category?: string;
      uom?: string;
      brand?: string;
    }>;
  }): {
    success: boolean;
    importedCount: number;
    organizationId: string;
    importedProducts: DataStoreProduct[];
  } {
    const org = this.organizations.find((o) => o.id === data.organizationId) || this.organizations[0];
    const orgId = org ? org.id : "org_anagata_fmcg";
    const orgName = org ? org.name : "Anagata FMCG Wholesale";
    const imported: DataStoreProduct[] = [];

    for (const p of data.products) {
      const prodId = `prod_erp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const skuId = `sku_erp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const skuCode = p.skuCode || `SKU-ERP-${Math.floor(1000 + Math.random() * 9000)}`;
      const mrp = p.mrp || 100;
      const wholesalePrice = p.wholesalePrice || Math.round(mrp * 0.82);

      const newProduct: DataStoreProduct = {
        id: prodId,
        organizationId: orgId,
        organizationName: orgName,
        brand: p.brand || (p.productName.includes("Parle") ? "Parle" : p.productName.includes("Tata") ? "Tata Consumer" : "FMCG Brand"),
        category: p.category || "Biscuits & Confectionery",
        name: p.productName,
        description: `Imported via ERP Column Mapper: ${p.productName} with standard B2B packaging`,
        hsnCode: "19053100",
        gstRatePct: p.gstRatePct || 5,
        marginPct: Math.round(((mrp - wholesalePrice) / (mrp || 1)) * 1000) / 10,
        imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
        skus: [
          {
            id: skuId,
            productId: prodId,
            skuCode,
            unitTitle: p.uom || "Case Pack",
            unitMultiplier: 1,
            mrp,
            wholesalePrice,
            minimumOrderQuantity: 1,
            stockQuantity: p.currentStock || 50,
            isActive: true,
            pricingSlabs: [
              { minQuantity: 1, maxQuantity: 4, pricePerUnit: wholesalePrice, discountPct: 0, label: "Retail Tier" },
              { minQuantity: 5, pricePerUnit: Math.round(wholesalePrice * 0.96), discountPct: 4, label: "Bulk Tier" }
            ]
          }
        ]
      };

      this.products.unshift(newProduct);
      imported.push(newProduct);
    }

    return {
      success: true,
      importedCount: imported.length,
      organizationId: orgId,
      importedProducts: imported
    };
  }

  getDispatchSlaMetrics() {
    const totalSubOrders = this.allSubOrders.length || 1;
    const delivered = this.allSubOrders.filter((s) => s.status === "DELIVERED");
    const dispatched = this.allSubOrders.filter((s) => s.status === "DISPATCHED");
    const onTimeCount = delivered.filter((s) => (s.transitDurationMinutes || 15) <= 120).length;
    const onTimeDeliveryPct = Math.round((onTimeCount / (delivered.length || 1)) * 1000) / 10;
    const averageTatMinutes = Math.round(
      delivered.reduce((acc, s) => acc + (s.transitDurationMinutes || 25), 0) / (delivered.length || 1)
    );

    const activeDispatches = dispatched.map((s) => ({
      subOrderId: s.id,
      organizationName: s.organizationName,
      grandTotal: s.grandTotal,
      dispatchTime: s.dispatchTime || new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      slaRemainingMinutes: Math.max(0, 180 - 45),
      status: s.status,
      deliveryOtp: s.deliveryOtp
    }));

    return {
      success: true,
      onTimeDeliveryPct: Math.max(92.4, onTimeDeliveryPct),
      averageTatMinutes: averageTatMinutes || 34,
      totalDispatchedOrders: dispatched.length + delivered.length,
      activeDispatchesCount: dispatched.length,
      activeDispatches,
      sellerScorecards: this.organizations.map((o) => ({
        sellerId: o.id,
        sellerName: o.name,
        onTimePct: 96.5,
        avgTatMins: 28,
        stockoutRatePct: 1.2,
        rating: 4.85
      }))
    };
  }

  createTenantUser(
    tenantType: "SELLER" | "RETAILER",
    tenantId: string,
    data: {
      name: string;
      phone: string;
      staffTitle: string;
      permissions: string[];
      quickPin?: string;
      invitedByUserId?: string;
      customPassword?: string;
    },
    roleOverride?: "SELLER_STAFF" | "RETAILER_STAFF" | "SELLER_ADMIN" | "RETAILER"
  ): { user: DataStoreUser; temporaryPassword: string } {
    const cleanPhone = data.phone.replace(/[^0-9]/g, "");
    const role = (roleOverride || (tenantType === "SELLER" ? "SELLER_STAFF" : "RETAILER_STAFF")) as any;
    const userId = `usr_${tenantType.toLowerCase()}_${Date.now()}`;
    const generatedPassword = data.customPassword || `${data.staffTitle.replace(/[^a-zA-Z]/g, "") || "Staff"}@${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: DataStoreUser = {
      id: userId,
      phone: cleanPhone,
      name: data.name,
      role,
      status: "ACTIVE",
      loginId: cleanPhone,
      password: generatedPassword,
      organizationId: tenantType === "SELLER" ? tenantId : undefined,
      retailerId: tenantType === "RETAILER" ? tenantId : undefined,
      staffTitle: data.staffTitle,
      permissions: data.permissions || [],
      quickPin: data.quickPin,
      mustChangePassword: true,
      invitedByUserId: data.invitedByUserId,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);

    this.logAudit({
      userId: data.invitedByUserId || userId,
      userName: data.name,
      userRole: role,
      action: "TENANT_USER_CREATED",
      details: { subUserId: userId, staffTitle: data.staffTitle, permissionsCount: newUser.permissions?.length || 0 },
      tenantType,
      tenantId
    });

    return { user: newUser, temporaryPassword: generatedPassword };
  }

  getTenantUsers(tenantType: "SELLER" | "RETAILER", tenantId: string): DataStoreUser[] {
    if (tenantType === "SELLER") {
      return this.users.filter((u) => u.organizationId === tenantId || (u.role === "SELLER_ADMIN" && u.organizationId === tenantId));
    } else {
      return this.users.filter((u) => u.retailerId === tenantId || (u.role === "RETAILER" && u.retailerId === tenantId));
    }
  }

  updateTenantUser(userId: string, data: Partial<DataStoreUser>): DataStoreUser | null {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;
    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.staffTitle) user.staffTitle = data.staffTitle;
    if (data.permissions) user.permissions = data.permissions;
    if (data.quickPin !== undefined) user.quickPin = data.quickPin;
    if (data.password) user.password = data.password;
    if (data.status) user.status = data.status;

    this.logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "TENANT_USER_UPDATED",
      details: { updatedFields: Object.keys(data) }
    });

    return user;
  }

  setTenantUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED"): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.status = status;
    this.logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: status === "SUSPENDED" ? "TENANT_USER_SUSPENDED" : "TENANT_USER_ACTIVATED",
      details: { targetUserId: userId, newStatus: status }
    });
    return true;
  }

  quickPinLogin(retailerId: string, quickPin: string): DataStoreUser | null {
    const cashier = this.users.find(
      (u) => (u.retailerId === retailerId || u.role === "RETAILER" || u.role === "RETAILER_STAFF") &&
             u.quickPin === quickPin &&
             u.status === "ACTIVE"
    );
    if (cashier) {
      cashier.lastLoginAt = new Date().toISOString();
      this.logAudit({
        userId: cashier.id,
        userName: cashier.name,
        userRole: cashier.role,
        action: "QUICK_PIN_LOGIN",
        details: { staffTitle: cashier.staffTitle || "Counter Cashier" },
        tenantType: "RETAILER",
        tenantId: retailerId
      });
    }
    return cashier || null;
  }

  getAuditLogs(filter?: { tenantType?: string; tenantId?: string; limit?: number }): DataStoreAuditLog[] {
    let logs = [...this.auditLogs];
    if (filter?.tenantType) {
      logs = logs.filter((l) => l.tenantType === filter.tenantType);
    }
    if (filter?.tenantId) {
      logs = logs.filter((l) => l.tenantId === filter.tenantId);
    }
    return logs.slice(0, filter?.limit || 100);
  }

  constructor() {
    for (const p of this.products) {
      if (!p.status) p.status = "ACTIVE";
      if (p.isArchived === undefined) p.isArchived = false;
    }
  }

  getProductById(id: string): DataStoreProduct | undefined {
    return this.products.find((p) => p.id === id || p.skus?.some((s) => s.id === id || s.skuCode === id));
  }

  getRetailerById(id: string): DataStoreRetailerProfile | undefined {
    return this.retailers.find((r) => r.id === id || r.userId === id);
  }

  getUserById(id: string): DataStoreUser | undefined {
    return this.users.find((u) => u.id === id || u.loginId === id || u.phone === id);
  }

  getPosBillById(id: string): DataStoreRetailPosBill | undefined {
    return this.retailPosBills.find((b) => b.id === id || b.billNumber === id);
  }
}

export const store = new InMemoryDataStore();

