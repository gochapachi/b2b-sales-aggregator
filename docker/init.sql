-- =============================================================================
-- Hyperlocal B2B Sales Aggregator - Database Initialization Schema (PostgreSQL 16)
-- Target VPS: Ubuntu 24.04 via Coolify (https://server.anagataitsolutions.in)
-- Database: b2b_aggregator
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS retail_pos_bills CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS territory_transfers CASCADE;
DROP TABLE IF EXISTS stock_reservations CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS sub_orders CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS beat_schedules CASCADE;
DROP TABLE IF EXISTS beats CASCADE;
DROP TABLE IF EXISTS seller_sku_listings CASCADE;
DROP TABLE IF EXISTS master_skus CASCADE;
DROP TABLE IF EXISTS product_skus CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS retailers CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Users Table
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'SELLER_ADMIN', 'SELLER_STAFF', 'SALES_AGENT', 'RETAILER', 'RETAILER_STAFF', 'SUPPLY_BD_AGENT')),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_KYC', 'PENDING_APPROVAL', 'SUSPENDED')),
    login_id VARCHAR(64),
    password_hash VARCHAR(255),
    staff_title VARCHAR(100),
    permissions TEXT[],
    organization_id VARCHAR(64),
    retailer_id VARCHAR(64),
    quick_pin VARCHAR(10),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. Organizations Table (Wholesalers, Brands, Manufacturers)
-- -----------------------------------------------------------------------------
CREATE TABLE organizations (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    gstin VARCHAR(20),
    address TEXT,
    contact_phone VARCHAR(20),
    minimum_order_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'STARTER_BEAT' CHECK (subscription_tier IN ('FREE_LISTING', 'STARTER_BEAT', 'GROWTH_BEAT', 'ENTERPRISE_BEAT')),
    monthly_subscription_fee NUMERIC(12, 2) NOT NULL DEFAULT 6000.00,
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED' CHECK (kyc_status IN ('PENDING', 'PENDING_APPROVAL', 'VERIFIED', 'REJECTED')),
    kyc_doc_url TEXT,
    rejection_reason TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    warehouse_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. Retailers Table (Kirana Stores, General Provision Shops)
-- -----------------------------------------------------------------------------
CREATE TABLE retailers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    shop_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    gstin VARCHAR(20),
    pan_or_udyam VARCHAR(50),
    document_type VARCHAR(50) NOT NULL DEFAULT 'GSTIN' CHECK (document_type IN ('GSTIN', 'PAN', 'UDYAM', 'SHOP_ESTABLISHMENT_LICENSE', 'TRADE_LICENSE')),
    kyc_doc_url TEXT,
    shop_photo_url TEXT,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    geofence_radius_meters INTEGER NOT NULL DEFAULT 100,
    is_geocoded BOOLEAN NOT NULL DEFAULT TRUE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Lucknow',
    pincode VARCHAR(10) NOT NULL DEFAULT '226001',
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED' CHECK (kyc_status IN ('PENDING', 'PENDING_APPROVAL', 'VERIFIED', 'REJECTED')),
    rejection_reason TEXT,
    assigned_agent_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    lead_stage VARCHAR(50) DEFAULT 'PROSPECT',
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    credit_dues NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_term VARCHAR(50) NOT NULL DEFAULT 'COD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. Products Table (Master Catalog)
-- -----------------------------------------------------------------------------
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    description TEXT,
    hsn_code VARCHAR(20),
    gst_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    margin_pct NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. Product SKUs Table (Carton / Box / Wholesale Bundles)
-- -----------------------------------------------------------------------------
CREATE TABLE product_skus (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku_code VARCHAR(100) NOT NULL UNIQUE,
    unit_title VARCHAR(100) NOT NULL,
    unit_multiplier INTEGER NOT NULL DEFAULT 1,
    pack_multiplier INTEGER DEFAULT 1,
    carton_multiplier INTEGER DEFAULT 1,
    mrp NUMERIC(10, 2) NOT NULL,
    wholesale_price NUMERIC(10, 2) NOT NULL,
    minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
    stock_quantity INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    pricing_slabs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. Beats Table (Geofenced Sales Routes)
-- -----------------------------------------------------------------------------
CREATE TABLE beats (
    id VARCHAR(64) PRIMARY KEY,
    territory_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    assigned_agent_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. Beat Schedules Table (Scheduled Retailer Stops on Beat)
-- -----------------------------------------------------------------------------
CREATE TABLE beat_schedules (
    id VARCHAR(64) PRIMARY KEY,
    beat_id VARCHAR(64) NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    retailer_id VARCHAR(64) NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    planned_time TIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_beat_sequence UNIQUE (beat_id, sequence_order)
);

-- -----------------------------------------------------------------------------
-- 8. Orders Table (Master Aggregated Orders)
-- -----------------------------------------------------------------------------
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    retailer_id VARCHAR(64) NOT NULL REFERENCES retailers(id) ON DELETE RESTRICT,
    placed_by_agent_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLACED' CHECK (status IN ('PLACED', 'PARTIALLY_DELIVERED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 9. Sub Orders Table (Seller-Split Orders with Delivery OTP)
-- -----------------------------------------------------------------------------
CREATE TABLE sub_orders (
    id VARCHAR(64) PRIMARY KEY,
    master_order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL,
    grand_total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'ACCEPTED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED')),
    delivery_otp VARCHAR(10) NOT NULL,
    delivery_notes TEXT,
    dispatch_time TIMESTAMP WITH TIME ZONE,
    delivery_time TIMESTAMP WITH TIME ZONE,
    transit_duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 10. Order Items Table (Line Items with Tax and Pricing)
-- -----------------------------------------------------------------------------
CREATE TABLE order_items (
    id VARCHAR(64) PRIMARY KEY,
    sub_order_id VARCHAR(64) NOT NULL REFERENCES sub_orders(id) ON DELETE CASCADE,
    product_sku_id VARCHAR(64) NOT NULL REFERENCES product_skus(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    sku_code VARCHAR(100) NOT NULL,
    unit_title VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    tax_pct NUMERIC(5, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 11. Visits Table (Field Agent Geofenced Visits & Dispositions)
-- -----------------------------------------------------------------------------
CREATE TABLE visits (
    id VARCHAR(64) PRIMARY KEY,
    agent_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    retailer_id VARCHAR(64) NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    beat_id VARCHAR(64) NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_in_lat NUMERIC(10, 6) NOT NULL,
    check_in_lng NUMERIC(10, 6) NOT NULL,
    is_within_geofence BOOLEAN NOT NULL DEFAULT TRUE,
    distance_meters NUMERIC(10, 2) NOT NULL,
    disposition VARCHAR(50) NOT NULL CHECK (disposition IN ('ORDER_BOOKED', 'STOCK_FULL', 'OWNER_UNAVAILABLE', 'STORE_CLOSED', 'PRICE_ISSUE', 'OTHER')),
    notes TEXT,
    store_selfie_url TEXT,
    master_order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 12. Master SKUs Table (Multi-Seller Common Catalog)
-- -----------------------------------------------------------------------------
CREATE TABLE master_skus (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    hsn_code VARCHAR(20),
    gst_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    mrp NUMERIC(10, 2) NOT NULL,
    unit_title VARCHAR(100) NOT NULL,
    unit_multiplier INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 13. Seller SKU Listings Table (Competing Multi-Seller Offers)
-- -----------------------------------------------------------------------------
CREATE TABLE seller_sku_listings (
    id VARCHAR(64) PRIMARY KEY,
    master_sku_id VARCHAR(64) NOT NULL REFERENCES master_skus(id) ON DELETE CASCADE,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    seller_sku_code VARCHAR(100) NOT NULL,
    wholesale_price NUMERIC(10, 2) NOT NULL,
    landed_cost NUMERIC(10, 2) NOT NULL,
    minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
    stock_quantity INTEGER NOT NULL DEFAULT 100,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    fulfillment_sla_hours INTEGER NOT NULL DEFAULT 24,
    reliability_score NUMERIC(3, 2) NOT NULL DEFAULT 4.80 CHECK (reliability_score >= 1.00 AND reliability_score <= 5.00),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    pricing_slabs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_org_master_sku UNIQUE (master_sku_id, organization_id)
);

-- -----------------------------------------------------------------------------
-- 14. Stock Reservations Table (15-min TTL Checkout Locks)
-- -----------------------------------------------------------------------------
CREATE TABLE stock_reservations (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    sub_order_id VARCHAR(64) REFERENCES sub_orders(id) ON DELETE CASCADE,
    seller_sku_listing_id VARCHAR(64) NOT NULL REFERENCES seller_sku_listings(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RESERVED' CHECK (status IN ('RESERVED', 'COMMITTED', 'RELEASED', 'FALLBACK_REROUTED')),
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    released_at TIMESTAMP WITH TIME ZONE,
    fallback_listing_id VARCHAR(64) REFERENCES seller_sku_listings(id)
);

-- -----------------------------------------------------------------------------
-- 15. Territory Transfers Table (Store Exclusivity & Reassignment Audit)
-- -----------------------------------------------------------------------------
CREATE TABLE territory_transfers (
    id VARCHAR(64) PRIMARY KEY,
    retailer_id VARCHAR(64) NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    source_agent_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    target_agent_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    transferred_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 15b. Retail POS Counter Bills
-- -----------------------------------------------------------------------------
CREATE TABLE retail_pos_bills (
    id VARCHAR(64) PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    retailer_id VARCHAR(64) NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    customer_id VARCHAR(64),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    cashier_name VARCHAR(255),
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'CASH',
    cash_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    upi_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    khata_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    round_off NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL,
    items JSONB NOT NULL,
    printed_at TIMESTAMP WITH TIME ZONE,
    whatsapp_receipt_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 16. GPS Collision Enforcement Trigger (<15m Radius Prevention)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_retailer_gps_collision()
RETURNS TRIGGER AS $$
DECLARE
  colliding_id VARCHAR(64);
  colliding_name VARCHAR(255);
  detected_distance NUMERIC;
BEGIN
  SELECT id, shop_name,
    ROUND((6371000 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(NEW.latitude)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(NEW.longitude)) +
        sin(radians(NEW.latitude)) * sin(radians(latitude))
      ))
    ))::numeric, 2)
  INTO colliding_id, colliding_name, detected_distance
  FROM retailers
  WHERE id <> COALESCE(NEW.id, '')
    AND (
      6371000 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(NEW.latitude)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(NEW.longitude)) +
          sin(radians(NEW.latitude)) * sin(radians(latitude))
        ))
      )
    ) < 15.0
  LIMIT 1;

  IF colliding_name IS NOT NULL THEN
    RAISE EXCEPTION 'GPS_COLLISION_15M: Store % is already registered within % meters (ID: %)',
      colliding_name, detected_distance, colliding_id
      USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_retailer_gps_collision ON retailers;
CREATE TRIGGER trg_check_retailer_gps_collision
BEFORE INSERT OR UPDATE OF latitude, longitude ON retailers
FOR EACH ROW EXECUTE FUNCTION check_retailer_gps_collision();

-- =============================================================================
-- SEED DATA: FMCG Ecosystem (Lucknow Territory)
-- =============================================================================

-- 1. Users
INSERT INTO users (id, phone, name, role, status) VALUES
('usr_superadmin', '9999999999', 'Platform SuperAdmin', 'SUPER_ADMIN', 'ACTIVE'),
('usr_seller_1', '9888888888', 'Vikram Agarwal (Anagata FMCG)', 'SELLER_ADMIN', 'ACTIVE'),
('usr_seller_2', '9777777777', 'Amit Tandon (Awadh Beverages)', 'SELLER_ADMIN', 'ACTIVE'),
('usr_agent_1', '9666666666', 'Rahul Sharma (Field Sales Agent)', 'SALES_AGENT', 'ACTIVE'),
('usr_ret_1', '9555555555', 'Ramesh Gupta', 'RETAILER', 'ACTIVE'),
('usr_ret_2', '9444444444', 'Suresh Sharma', 'RETAILER', 'PENDING_KYC');

-- 2. Organizations
INSERT INTO organizations (id, owner_id, name, trade_name, gstin, address, contact_phone, minimum_order_value, subscription_tier, monthly_subscription_fee, kyc_status, kyc_doc_url) VALUES
('org_anagata_fmcg', 'usr_seller_1', 'Anagata FMCG Wholesale', 'Anagata IT & Wholesale Solutions', '09AABCA1234F1Z5', 'Plot 12, Transport Nagar, Lucknow, UP', '9888888888', 1500.00, 'STARTER_BEAT', 6000.00, 'VERIFIED', 'https://server.anagataitsolutions.in/docs/gst_anagata.pdf'),
('org_awadh_beverages', 'usr_seller_2', 'Awadh Beverages & Confectionery', 'Awadh Beverage Distributors LLP', '09XYZAB5678M1Z2', 'Warehouse 4, Aishbagh Industrial Area, Lucknow', '9777777777', 2000.00, 'GROWTH_BEAT', 9000.00, 'VERIFIED', 'https://server.anagataitsolutions.in/docs/gst_awadh.pdf');

-- 3. Retailers
INSERT INTO retailers (id, user_id, shop_name, owner_name, phone, whatsapp_number, gstin, pan_or_udyam, document_type, kyc_doc_url, shop_photo_url, latitude, longitude, geofence_radius_meters, is_geocoded, address, city, pincode, kyc_status) VALUES
('ret_gupta_kirana', 'usr_ret_1', 'Gupta Kirana & General Store', 'Ramesh Gupta', '9555555555', '9555555555', '09ABCDE1234F1Z8', NULL, 'GSTIN', 'https://server.anagataitsolutions.in/docs/gupta_gst.pdf', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500', 26.846700, 80.946200, 100, TRUE, 'Shop 4, Near Mayfair, Hazratganj', 'Lucknow', '226001', 'VERIFIED'),
('ret_sharma_general', 'usr_ret_2', 'Sharma General Provision Store', 'Suresh Sharma', '9444444444', '9444444444', NULL, 'UDYAM-UP-28-0012345', 'UDYAM', 'https://server.anagataitsolutions.in/docs/sharma_udyam.pdf', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500', 26.852000, 80.949000, 100, TRUE, 'Main Road, Narahi Market, Hazratganj', 'Lucknow', '226001', 'PENDING');

-- 4. Products
INSERT INTO products (id, organization_id, name, category, brand, description, hsn_code, gst_rate_pct, image_url) VALUES
('prod_parleg', 'org_anagata_fmcg', 'Parle-G Glucose Biscuits (80g)', 'Biscuits & Confectionery', 'Parle', 'Original Glucose biscuit pack. High rotation fast-moving retail SKU.', '19053100', 18.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500'),
('prod_tata_tea', 'org_anagata_fmcg', 'Tata Tea Gold (250g)', 'Tea & Beverages', 'Tata', 'Rich premium tea blend with 15% long leaves.', '09024010', 5.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500'),
('prod_limca', 'org_awadh_beverages', 'Limca Lemon Drink (750ml PET)', 'Cold Drinks & Beverages', 'Coca-Cola / Limca', 'Refreshing lemon drink in easy-to-chill 750ml bottles.', '22021010', 28.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500');

-- 5. Product SKUs
INSERT INTO product_skus (id, product_id, sku_code, unit_title, unit_multiplier, mrp, wholesale_price, minimum_order_quantity, stock_quantity, is_active) VALUES
('sku_parle_carton', 'prod_parleg', 'PARLE-G-80G-CTN-72', 'Master Carton (72 packets)', 72, 720.00, 580.00, 2, 240, TRUE),
('sku_tata_tea_box', 'prod_tata_tea', 'TATA-GOLD-250G-BX-20', 'Wholesale Bundle (20 packs)', 20, 3200.00, 2650.00, 1, 110, TRUE),
('sku_limca_crate', 'prod_limca', 'LIMCA-750ML-CRATE-24', 'Cold Storage Crate (24 bottles)', 24, 960.00, 740.00, 2, 95, TRUE);

-- 6. Beats
INSERT INTO beats (id, territory_id, name, day_of_week, assigned_agent_id) VALUES
('beat_hazratganj_mon', 'terr_lucknow_central', 'Hazratganj & Narahi Beat (Monday)', 'MONDAY', 'usr_agent_1');

-- 7. Beat Schedules
INSERT INTO beat_schedules (id, beat_id, retailer_id, sequence_order, planned_time, is_active) VALUES
('stop_1', 'beat_hazratganj_mon', 'ret_gupta_kirana', 1, '10:00:00', TRUE),
('stop_2', 'beat_hazratganj_mon', 'ret_sharma_general', 2, '11:15:00', TRUE);

-- 8. Sample Orders
INSERT INTO orders (id, order_number, retailer_id, placed_by_agent_id, total_amount, status, created_at) VALUES
('ord_sample_01', 'ORD-871718', 'ret_gupta_kirana', 'usr_agent_1', 6992.90, 'PARTIALLY_DELIVERED', CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- 9. Sub Orders
INSERT INTO sub_orders (id, master_order_id, organization_id, subtotal, tax_amount, grand_total, status, delivery_otp, dispatch_time, delivery_time, transit_duration_minutes, created_at) VALUES
('subord_sample_fmcg', 'ord_sample_01', 'org_anagata_fmcg', 3810.00, 341.30, 4151.30, 'DELIVERED', '4871', CURRENT_TIMESTAMP - INTERVAL '105 minutes', CURRENT_TIMESTAMP - INTERVAL '83 minutes', 22, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('subord_sample_bev', 'ord_sample_01', 'org_awadh_beverages', 2220.00, 621.60, 2841.60, 'DISPATCHED', '8488', CURRENT_TIMESTAMP - INTERVAL '45 minutes', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- 10. Order Items
INSERT INTO order_items (id, sub_order_id, product_sku_id, product_name, sku_code, unit_title, quantity, unit_price, tax_pct, tax_amount, total_price) VALUES
('item_parle_01', 'subord_sample_fmcg', 'sku_parle_carton', 'Parle-G Glucose Biscuits (80g)', 'PARLE-G-80G-CTN-72', 'Master Carton (72 packets)', 2, 580.00, 18.00, 208.80, 1368.80),
('item_tata_01', 'subord_sample_fmcg', 'sku_tata_tea_box', 'Tata Tea Gold (250g)', 'TATA-GOLD-250G-BX-20', 'Wholesale Bundle (20 packs)', 1, 2650.00, 5.00, 132.50, 2782.50),
('item_limca_01', 'subord_sample_bev', 'sku_limca_crate', 'Limca Lemon Drink (750ml PET)', 'LIMCA-750ML-CRATE-24', 'Cold Storage Crate (24 bottles)', 3, 740.00, 28.00, 621.60, 2841.60);

-- 11. Sample Visits
INSERT INTO visits (id, agent_id, retailer_id, beat_id, check_in_time, check_out_time, check_in_lat, check_in_lng, is_within_geofence, distance_meters, disposition, notes, master_order_id) VALUES
('vis_sample_01', 'usr_agent_1', 'ret_gupta_kirana', 'beat_hazratganj_mon', CURRENT_TIMESTAMP - INTERVAL '130 minutes', CURRENT_TIMESTAMP - INTERVAL '110 minutes', 26.846900, 80.946200, TRUE, 22.20, 'ORDER_BOOKED', 'Order booked for Parle-G & Tata Tea. Store requested priority delivery before 2 PM.', 'ord_sample_01');

-- 12. Master SKUs Seed
INSERT INTO master_skus (id, name, brand, category, barcode, hsn_code, gst_rate_pct, mrp, unit_title, unit_multiplier, image_url) VALUES
('msku_parle_g_80g', 'Parle-G Glucose Biscuits (80g)', 'Parle', 'Biscuits & Confectionery', '8901719101014', '19053100', 18.00, 720.00, 'Master Carton (72 packets)', 72, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500'),
('msku_tata_tea_gold', 'Tata Tea Gold (250g)', 'Tata', 'Tea & Beverages', '8901052003112', '09024010', 5.00, 3200.00, 'Wholesale Bundle (20 packs)', 20, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500'),
('msku_tata_salt_1kg', 'Tata Salt Vacuum Evaporated (1kg)', 'Tata', 'Staples & Grains', '8901052000012', '25010010', 5.00, 700.00, 'Wholesale Bag (25 packs)', 25, 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=500');

-- 13. Seller SKU Listings Seed (Multi-Seller Competition)
INSERT INTO seller_sku_listings (id, master_sku_id, organization_id, seller_sku_code, wholesale_price, landed_cost, minimum_order_quantity, stock_quantity, reserved_stock, fulfillment_sla_hours, reliability_score, is_active) VALUES
('list_anagata_parle', 'msku_parle_g_80g', 'org_anagata_fmcg', 'ANA-PARLE-CTN', 580.00, 595.00, 2, 240, 0, 24, 4.90, TRUE),
('list_awadh_parle', 'msku_parle_g_80g', 'org_awadh_beverages', 'AWD-PARLE-CTN', 590.00, 610.00, 1, 150, 0, 36, 4.70, TRUE),
('list_anagata_tata_tea', 'msku_tata_tea_gold', 'org_anagata_fmcg', 'ANA-TATA-BX', 2650.00, 2700.00, 1, 110, 0, 24, 4.90, TRUE),
('list_awadh_tata_tea', 'msku_tata_tea_gold', 'org_awadh_beverages', 'AWD-TATA-BX', 2680.00, 2740.00, 1, 80, 0, 48, 4.60, TRUE),
('list_anagata_tata_salt', 'msku_tata_salt_1kg', 'org_anagata_fmcg', 'ANA-SALT-BAG', 550.00, 565.00, 2, 300, 0, 24, 4.90, TRUE),
('list_awadh_tata_salt', 'msku_tata_salt_1kg', 'org_awadh_beverages', 'AWD-SALT-BAG', 560.00, 580.00, 1, 200, 0, 24, 4.75, TRUE);

-- Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_retailers_phone ON retailers(phone);
CREATE INDEX IF NOT EXISTS idx_retailers_coords ON retailers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON product_skus(product_id);
CREATE INDEX IF NOT EXISTS idx_beat_schedules_beat_id ON beat_schedules(beat_id);
CREATE INDEX IF NOT EXISTS idx_sub_orders_master_order_id ON sub_orders(master_order_id);
CREATE INDEX IF NOT EXISTS idx_sub_orders_org_id ON sub_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sub_order_id ON order_items(sub_order_id);
CREATE INDEX IF NOT EXISTS idx_visits_agent_id ON visits(agent_id);
CREATE INDEX IF NOT EXISTS idx_visits_retailer_id ON visits(retailer_id);
CREATE INDEX IF NOT EXISTS idx_master_skus_barcode ON master_skus(barcode);
CREATE INDEX IF NOT EXISTS idx_seller_listings_master_sku ON seller_sku_listings(master_sku_id);
CREATE INDEX IF NOT EXISTS idx_seller_listings_org ON seller_sku_listings(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_listing ON stock_reservations(seller_sku_listing_id);
CREATE INDEX IF NOT EXISTS idx_territory_transfers_retailer ON territory_transfers(retailer_id);
