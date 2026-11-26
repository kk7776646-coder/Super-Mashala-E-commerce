-- ====================================================================
-- SUPER MASHALA & DRY FRUITS - DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- B2B Wholesale Ordering Platform for Spices & Dry Fruits
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'Order Placed',
        'Confirmed',
        'Packing',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('Cash on Delivery', 'UPI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('Pending', 'Completed', 'Failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Admin Allowlist (Stores specifically authorized admin Google emails)
CREATE TABLE IF NOT EXISTS admin_allowlist (
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(150),
    authorized_by VARCHAR(150) DEFAULT 'System Superadmin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-authorized business owner admin emails
INSERT INTO admin_allowlist (email, name) VALUES 
('admin@supermashala.com', 'Super Mashala Management'),
('kalamuddin.mashala@gmail.com', 'Kalamuddin')
ON CONFLICT (email) DO NOTHING;

-- 4. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    shop_name VARCHAR(200) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    google_id VARCHAR(100),
    avatar_url TEXT,
    role user_role DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Addresses Table (Shopkeeper Delivery Locations)
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    shop_name VARCHAR(200) NOT NULL,
    address_line TEXT NOT NULL,
    area_locality VARCHAR(150) NOT NULL,
    city VARCHAR(100) DEFAULT 'Kolhapur',
    state VARCHAR(100) DEFAULT 'Maharashtra',
    pincode VARCHAR(10),
    landmark VARCHAR(150),
    is_default BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    short_description TEXT,
    long_description TEXT,
    ingredients TEXT,
    storage_instructions TEXT,
    image_url TEXT NOT NULL,
    gallery_urls TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Product Variants Table (100g, 250g, 500g, 1kg)
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(120) PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    packet_weight VARCHAR(50) NOT NULL, -- e.g., '100g', '250g', '500g', '1kg'
    weight_in_grams INT NOT NULL,
    fixed_wholesale_price NUMERIC(10, 2) NOT NULL CHECK (fixed_wholesale_price >= 0),
    sku VARCHAR(100) UNIQUE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    variant_id VARCHAR(120) PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 10,
    last_restocked_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'SM-202611-001'
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    customer_name VARCHAR(150) NOT NULL,
    shop_name VARCHAR(200) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    delivery_address TEXT NOT NULL,
    subtotal_amount NUMERIC(12, 2) NOT NULL CHECK (subtotal_amount >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status order_status DEFAULT 'Order Placed',
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- 11. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id VARCHAR(120) NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(200) NOT NULL,
    packet_weight VARCHAR(50) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    item_total NUMERIC(12, 2) NOT NULL CHECK (item_total >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Invoices Table (Supports duplicate copy tracking)
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    issued_date TIMESTAMPTZ DEFAULT NOW(),
    print_count INT DEFAULT 1,
    last_printed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Payments Table (Cash and UPI Only - Strictly No Udhaar/Credit)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    upi_transaction_ref VARCHAR(100),
    status payment_status DEFAULT 'Pending',
    collected_by VARCHAR(150),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

-- Customers can only read and manage their own profile and orders
CREATE POLICY "Customer view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customer update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Customer view own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customer insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Admins: Only users whose email is in admin_allowlist have admin access
CREATE POLICY "Admin check allowlist" ON admin_allowlist FOR SELECT 
    USING (EXISTS (SELECT 1 FROM admin_allowlist WHERE email = auth.jwt()->>'email'));
