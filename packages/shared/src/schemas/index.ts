import { z } from 'zod';
import {
  UserRole,
  KycDocumentType,
  BeatDay,
  VisitDisposition,
  SubOrderStatus,
  SubscriptionTier
} from '../constants';

export const LoginSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const RegisterUserSchema = z.object({
  phone: z.string().min(10, 'Valid mobile number required').max(15),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole)
});

export const SellerKycSubmissionSchema = z.object({
  name: z.string().min(2),
  tradeName: z.string().optional(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid Indian GSTIN format'),
  address: z.string().min(5),
  contactPhone: z.string().min(10),
  minimumOrderValue: z.number().min(0).default(1000),
  subscriptionTier: z.nativeEnum(SubscriptionTier).default(SubscriptionTier.STARTER_BEAT),
  kycDocUrl: z.string().url().optional()
});

export const RetailerKycSubmissionSchema = z.object({
  shopName: z.string().min(2, 'Shop name required'),
  ownerName: z.string().min(2, 'Owner name required'),
  phone: z.string().min(10),
  whatsappNumber: z.string().min(10),
  documentType: z.nativeEnum(KycDocumentType),
  gstin: z.string().optional(),
  panOrUdyam: z.string().optional(),
  kycDocUrl: z.string().url().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit Indian PIN code'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  shopPhotoUrl: z.string().url().optional()
});

export const AdminKycDecisionSchema = z.object({
  approved: z.boolean(),
  reason: z.string().optional()
});

export const ProductSkuSchema = z.object({
  skuCode: z.string().min(1),
  unitTitle: z.string().min(1),
  unitMultiplier: z.number().min(1).default(1),
  mrp: z.number().positive(),
  wholesalePrice: z.number().positive(),
  minimumOrderQuantity: z.number().int().min(1).default(1),
  stockQuantity: z.number().int().min(0).default(100),
  isActive: z.boolean().default(true)
});

export const CreateProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  brand: z.string().min(2),
  description: z.string().optional(),
  hsnCode: z.string().min(2),
  gstRatePct: z.number().min(0).max(28),
  imageUrl: z.string().url().optional(),
  skus: z.array(ProductSkuSchema).min(1, 'At least 1 SKU variation required')
});

export const GeofenceCheckinSchema = z.object({
  agentId: z.string(),
  retailerId: z.string(),
  beatId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  storeSelfieUrl: z.string().url().optional()
});

export const StoreGeotagLockSchema = z.object({
  retailerId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  shopPhotoUrl: z.string().url().optional()
});

export const VisitDispositionSchema = z.object({
  visitId: z.string(),
  disposition: z.nativeEnum(VisitDisposition),
  notes: z.string().optional()
});

export const CartItemOrderSchema = z.object({
  productSkuId: z.string(),
  quantity: z.number().int().min(1)
});

export const CreateOrderCheckoutSchema = z.object({
  retailerId: z.string(),
  placedByAgentId: z.string().optional(),
  visitId: z.string().optional(),
  items: z.array(CartItemOrderSchema).min(1, 'Order must contain at least 1 item')
});

export const VerifyDeliveryOtpSchema = z.object({
  subOrderId: z.string(),
  enteredOtp: z.string().length(4, 'Delivery OTP must be exactly 4 digits'),
  deliveryBoyName: z.string().optional(),
  deliveryBoyPhone: z.string().optional()
});
