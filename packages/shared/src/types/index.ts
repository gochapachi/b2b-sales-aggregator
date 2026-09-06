import {
  UserRole,
  UserStatus,
  KycStatus,
  KycDocumentType,
  BeatDay,
  VisitDisposition,
  MasterOrderStatus,
  SubOrderStatus,
  SubscriptionTier
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
  createdAt: string;
  updatedAt: string;
}

export interface ProductSku {
  id: string;
  productId: string;
  skuCode: string;
  unitTitle: string;
  unitMultiplier: number;
  mrp: number;
  wholesalePrice: number;
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
  brand: string;
  description?: string;
  hsnCode: string;
  gstRatePct: number;
  imageUrl?: string;
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
  taxPct: number;
  taxAmount: number;
  totalPrice: number;
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
  deliveryOtp: string; // 4-digit code
  dispatchTime?: string;
  deliveryTime?: string;
  transitDurationMinutes?: number;
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
  status: MasterOrderStatus;
  subOrders: SubOrder[];
  createdAt: string;
}

export interface EvolutionApiMessagePayload {
  number: string;
  text: string;
}
