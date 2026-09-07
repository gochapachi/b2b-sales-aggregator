import {
  UserRole,
  UserStatus,
  KycStatus,
  KycDocumentType,
  BeatDay,
  VisitDisposition,
  MasterOrderStatus,
  SubOrderStatus,
  SubscriptionTier,
  LeadStage,
  PaymentTerm,
  CreditLineStatus,
  LedgerEntryType,
  VisitPurpose,
  PaymentMode,
  FmcgCategory,
  StaffRole,
  BatchStatus,
  TradeSchemeType,
  LoyaltyTier,
  PdcStatus,
  KhataEntryType,
  ReturnReason,
  AuditAction
} from '../constants';

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  tradeName?: string;
  gstin: string;
  address: string;
  contactPhone: string;
  contactEmail?: string;
  minimumOrderValue: number; // MOV
  subscriptionTier: SubscriptionTier;
  monthlySubscriptionFee: number;
  kycStatus: KycStatus;
  kycDocUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  categories?: string[];
  rating?: number;
  badges?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RetailerProfile {
  id: string;
  userId: string;
  shopName: string;
  ownerName: string;
  phone: string;
  whatsappNumber: string;
  gstin?: string;
  panOrUdyam?: string;
  documentType: KycDocumentType;
  kycDocUrl?: string;
  shopPhotoUrl?: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  isGeocoded: boolean;
  address: string;
  city: string;
  pincode: string;
  kycStatus: KycStatus;
  rejectionReason?: string;
  // CRM Enhancements
  leadStage?: LeadStage;
  creditLimit?: number;
  creditBalance?: number;
  outstandingDues?: number;
  lifetimeRevenue?: number;
  totalOrdersCount?: number;
  averageOrderValue?: number;
  lastVisitDate?: string;
  lastOrderDate?: string;
  category?: string;
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingSlab {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  discountPct: number;
}

export interface GroupedProductItem {
  productSkuId: string;
  productName: string;
  skuCode: string;
  unitQuantity: number;
}

export interface ProductSku {
  id: string;
  productId: string;
  skuCode: string;
  unitTitle: string;
  unitMultiplier: number;
  packMultiplier?: number;
  cartonMultiplier?: number;
  mrp: number;
  wholesalePrice: number;
  pricingSlabs?: PricingSlab[];
  marginPct?: number;
  minimumOrderQuantity: number; // MOQ
  stockQuantity: number;
  isActive: boolean;
  isGroupedBundle?: boolean;
  bundleItems?: GroupedProductItem[];
}

export interface SellerProductCreateInput {
  organizationId: string;
  name: string;
  category: string;
  subCategory?: string;
  brand: string;
  description?: string;
  hsnCode: string;
  gstRatePct: number;
  marginPct?: number;
  imageUrl?: string;
  tags?: string[];
  skus: Array<{
    skuCode: string;
    unitTitle: string;
    unitMultiplier: number;
    packMultiplier?: number;
    cartonMultiplier?: number;
    mrp: number;
    wholesalePrice: number;
    minimumOrderQuantity: number;
    stockQuantity: number;
    pricingSlabs?: PricingSlab[];
    isGroupedBundle?: boolean;
    bundleItems?: GroupedProductItem[];
  }>;
}

export interface Product {
  id: string;
  organizationId: string;
  organizationName?: string;
  name: string;
  category: string;
  subCategory?: string;
  brand: string;
  description?: string;
  hsnCode: string;
  gstRatePct: number;
  imageUrl?: string;
  tags?: string[];
  rating?: number;
  reviewsCount?: number;
  skus: ProductSku[];
  createdAt: string;
  updatedAt: string;
}

export interface Territory {
  id: string;
  name: string;
  city: string;
  state: string;
  pincodes: string[];
}

export interface BeatStop {
  id: string;
  beatId: string;
  retailerId: string;
  retailerName: string;
  shopName: string;
  sequenceOrder: number;
  latitude: number;
  longitude: number;
  address: string;
  whatsappNumber: string;
  lastVisitDate?: string;
  lastOrderAmount?: number;
  creditDues?: number;
  leadStage?: LeadStage;
}

export interface Beat {
  id: string;
  territoryId: string;
  name: string;
  dayOfWeek: BeatDay;
  assignedAgentId?: string;
  assignedAgentName?: string;
  stopsCount: number;
  stops?: BeatStop[];
}

export interface VisitRecord {
  id: string;
  agentId: string;
  agentName?: string;
  retailerId: string;
  shopName?: string;
  beatId: string;
  purpose?: VisitPurpose;
  checkInTime: string;
  checkOutTime?: string;
  checkInLat: number;
  checkInLng: number;
  isWithinGeofence: boolean;
  distanceMeters: number;
  disposition: VisitDisposition;
  notes?: string;
  storeSelfieUrl?: string;
  masterOrderId?: string;
  paymentCollectedAmount?: number;
  createdAt: string;
}

export interface OrderItem {
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

export interface OrderTrackingStep {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface GstTaxInvoiceItem {
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

export interface GstTaxInvoice {
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
  items: GstTaxInvoiceItem[];
  taxableSubtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  irn: string;
  qrCodeData: string;
}

export interface SubOrder {
  id: string;
  masterOrderId: string;
  organizationId: string;
  organizationName: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: SubOrderStatus;
  paymentTerm?: PaymentTerm;
  paymentStatus?: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID';
  creditDueDate?: string;
  deliveryOtp: string; // 4-digit code
  dispatchTime?: string;
  deliveryTime?: string;
  transitDurationMinutes?: number;
  trackingHistory?: OrderTrackingStep[];
  invoice?: GstTaxInvoice;
  items: OrderItem[];
  createdAt: string;
}

export interface MasterOrder {
  id: string;
  orderNumber: string;
  retailerId: string;
  retailerShopName: string;
  retailerPhone: string;
  placedByAgentId?: string;
  placedByAgentName?: string;
  totalAmount: number;
  paymentTerm?: PaymentTerm;
  paymentStatus?: 'UNPAID' | 'PAID' | 'PARTIALLY_PAID';
  status: MasterOrderStatus;
  subOrders: SubOrder[];
  createdAt: string;
}

export interface CrmInteractionNote {
  id: string;
  retailerId: string;
  retailerShopName?: string;
  agentId: string;
  agentName: string;
  type: 'VISIT' | 'PHONE_CALL' | 'PAYMENT' | 'COMPLAINT' | 'REORDER';
  summary: string;
  actionItems?: string;
  createdAt: string;
}

export interface CrmPaymentCollection {
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
  status: 'COLLECTED' | 'DEPOSITED_TO_COMPANY';
}

export interface AgentSalesTarget {
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

export interface EvolutionApiMessagePayload {
  number: string;
  text: string;
}

export interface SellerRetailerCreditLine {
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

export interface PaymentVoucherRecord {
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
  status: 'RECORDED' | 'VERIFIED' | 'REJECTED';
  recordedAt: string;
  verifiedAt?: string;
}

export interface LedgerStatementEntry {
  id: string;
  date: string;
  type: LedgerEntryType;
  referenceId: string;
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface SellerRetailerLedgerStatement {
  organizationId: string;
  organizationName: string;
  retailerId: string;
  retailerShopName: string;
  creditLimit: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  availableCredit: number;
  entries: LedgerStatementEntry[];
}

export interface EWayBillNicPayload {
  subOrderId: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplyType: 'Outward' | 'Inward';
  subSupplyType: 'Supply';
  docType: 'Tax Invoice';
  transactionType: 'Regular';
  sellerDetails: {
    gstin: string;
    legalName: string;
    tradeName?: string;
    address: string;
    place: string;
    pincode: string;
    stateCode: string;
  };
  buyerDetails: {
    gstin: string;
    legalName: string;
    tradeName?: string;
    address: string;
    place: string;
    pincode: string;
    stateCode: string;
  };
  itemDetails: Array<{
    productName: string;
    productDesc: string;
    hsnCode: string;
    quantity: number;
    qtyUnit: string;
    taxableAmount: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate: number;
    igstAmount: number;
  }>;
  totalTaxableValue: number;
  totalCgstAmount: number;
  totalSgstAmount: number;
  totalIgstAmount: number;
  totalInvoiceValue: number;
  transporterDetails?: {
    transporterId?: string;
    transporterName?: string;
    transportMode: '1' | '2' | '3' | '4';
    vehicleNumber?: string;
    approxDistanceKm: number;
  };
  formattedCopyText: string;
}

export interface ProductBatchRecord {
  id: string;
  skuId: string;
  skuCode: string;
  productName: string;
  batchNumber: string;
  mfgDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  daysToExpiry: number;
  quantityInitial: number;
  quantityAvailable: number;
  godownLocation: string;
  binLocation?: string;
  costPrice: number;
  status: BatchStatus;
  nearExpiryDiscountPct?: number;
}

export interface GoodsReceiptNote {
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

export interface CreditNoteGst {
  id: string;
  creditNoteNumber: string; // e.g. CN-2026-001
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
  status: 'ISSUED' | 'ADJUSTED_IN_LEDGER';
  createdAt: string;
}

export interface TradeSchemeRule {
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
  activeStartTime?: string; // e.g. "06:00"
  activeEndTime?: string; // e.g. "09:00"
  minCartValue?: number;
  isActive: boolean;
  validUntil: string;
}

export interface LoyaltyAccount {
  retailerId: string;
  retailerShopName: string;
  currentPoints: number;
  lifetimePointsEarned: number;
  tier: LoyaltyTier;
  pointsMultiplier: number;
  rupeeValuePerPoint: number;
}

export interface PdcChequeRecord {
  id: string;
  chequeNumber: string;
  bankName: string;
  branchName?: string;
  retailerId: string;
  retailerShopName: string;
  organizationId: string;
  amount: number;
  chequeDate: string; // maturity date
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

export interface DeliveryRunStop {
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
  status: 'PENDING' | 'DELIVERED' | 'FAILED_RETRY';
}

export interface DeliveryRunSheet {
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
  status: 'PLANNED' | 'DISPATCHED' | 'COMPLETED';
  stops: DeliveryRunStop[];
}

export interface VanSalesSession {
  id: string;
  agentId: string;
  agentName: string;
  vehicleNumber: string;
  date: string;
  status: 'OPEN' | 'CLOSED';
  initialInventory: Array<{
    skuId: string;
    productName: string;
    quantity: number;
  }>;
  currentInventory: Array<{
    skuId: string;
    productName: string;
    quantity: number;
  }>;
  totalOrdersBooked: number;
  totalGmvCollected: number;
}

export interface CustomerKhataRecord {
  id: string;
  retailerId: string;
  customerName: string;
  customerPhone: string;
  totalDues: number;
  lastUpdated: string;
}

export interface CustomerKhataEntry {
  id: string;
  khataRecordId: string;
  type: KhataEntryType;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface DriverExpenseRecord {
  id: string;
  runSheetId: string;
  driverName: string;
  expenseType: 'DIESEL' | 'TOLL' | 'PARKING' | 'REPAIR' | 'CHAI_SNACKS';
  amount: number;
  billPhotoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface CoachingScorecard {
  id: string;
  agentId: string;
  agentName: string;
  managerName: string;
  visitDate: string;
  storeShopName: string;
  pitchingScore: number; // 1-5
  productKnowledgeScore: number; // 1-5
  objectionHandlingScore: number; // 1-5
  groomingScore: number; // 1-5
  remarks: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: AuditAction;
  details: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemTelemetryStats {
  serverTime: string;
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  cpuLoad: number[];
  activeConnections: number;
  databaseStatus: 'CONNECTED' | 'DISCONNECTED';
  minioStatus: 'CONNECTED' | 'DISCONNECTED';
  totalProductsCount: number;
  totalOrdersCount: number;
}


