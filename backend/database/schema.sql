-- ============================================================================
-- SUPER MASHALA & DRY FRUITS — PRODUCTION DATABASE SCHEMA
-- B2B Wholesale Ordering System with Packet-Based Architecture
-- ============================================================================

-- 1. ADMIN ALLOWLIST (Google OAuth Restriction)
CREATE TABLE IF NOT EXISTS admin_allowlist (
    email TEXT PRIMARY KEY,
    name TEXT,
    authorized_by TEXT DEFAULT 'System Superadmin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMER & SHOP PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    shop_name TEXT,
    mobile_number TEXT,
    email TEXT UNIQUE,
    google_id TEXT,
    avatar_url TEXT,
    delivery_address TEXT,
    city TEXT DEFAULT 'Kolhapur',
    area_locality TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    category_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_path TEXT,
    is_active INTEGER DEFAULT 1
);

-- 4. PRODUCTS (Packet-Based Wholesale Pricing)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id TEXT NOT NULL,
    description TEXT,
    packet_price NUMERIC NOT NULL CHECK (packet_price >= 0),
    selling_unit TEXT DEFAULT 'Packet',
    packet_size TEXT,
    pieces_per_packet INTEGER, -- 10, 12, or NULL if unconfirmed
    packet_weight TEXT,        -- Optional, e.g. '100g' or NULL
    image_path TEXT,
    stock_quantity INTEGER DEFAULT 100 CHECK (stock_quantity >= 0),
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- 5. PRODUCT VARIANTS (Optional future sub-packaging)
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    variant_name TEXT,
    pieces_per_packet INTEGER,
    packet_weight TEXT,
    packet_price NUMERIC NOT NULL CHECK (packet_price >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- 6. WHOLESALE ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC DEFAULT 0.0 CHECK (delivery_fee >= 0),
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash on Delivery', 'Cash', 'UPI')),
    payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Completed')),
    order_status TEXT DEFAULT 'Order Placed' CHECK (order_status IN ('Order Placed', 'Confirmed', 'Packing', 'Out for Delivery', 'Delivered', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ORDER ITEMS (Immutable Historical Price & Packaging Snapshots)
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name_snapshot TEXT NOT NULL,
    packet_price_snapshot NUMERIC NOT NULL,
    packet_quantity INTEGER NOT NULL CHECK (packet_quantity > 0),
    pieces_per_packet_snapshot INTEGER, -- Preserves pieces at order time
    packet_weight_snapshot TEXT,        -- Preserves weight at order time
    line_total NUMERIC NOT NULL,
    image_url TEXT,
    FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- 8. INVOICES & DUPLICATE TRACKING
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    invoice_number TEXT NOT NULL UNIQUE,
    print_count INTEGER DEFAULT 1,
    last_printed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- INDEXES FOR FAST B2B LOOKUPS
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices (order_id);
