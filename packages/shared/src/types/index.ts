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
  VisitPurpose,
  PaymentMode,
  FmcgCategory
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

export interface ProductSku {
  id: string;
  productId: string;
  skuCode: string;
  unitTitle: string;
  unitMultiplier: number;
  mrp: number;
  wholesalePrice: number;
  pricingSlabs?: PricingSlab[];
  marginPct?: number;
  minimumOrderQuantity: number; // MOQ
  stockQuantity: number;
  isActive: boolean;
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

