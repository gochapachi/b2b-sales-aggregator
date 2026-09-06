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
  createdAt: string;
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
  taxPct: number;
  taxAmount: number;
  totalPrice: number;
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
  deliveryOtp: string;
  dispatchTime?: string;
  deliveryTime?: string;
  transitDurationMinutes?: number;
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
  status: "PLACED" | "PARTIALLY_DELIVERED" | "COMPLETED" | "CANCELLED";
  subOrders: DataStoreSubOrder[];
  createdAt: string;
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
          isActive: true
        }
      ]
    },
    {
      id: "prod_tata_tea",
      organizationId: "org_anagata_fmcg",
      organizationName: "Anagata FMCG Wholesale",
      name: "Tata Tea Gold (250g)",
      category: "Tea & Beverages",
      brand: "Tata",
      description: "Rich premium tea blend with 15% long leaves.",
      hsnCode: "09024010",
      gstRatePct: 5,
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
          isActive: true
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
          isActive: true
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
        }
      ]
    }
  ];

  visits: DataStoreVisit[] = [];
  masterOrders: DataStoreMasterOrder[] = [];
}

export const store = new InMemoryDataStore();
