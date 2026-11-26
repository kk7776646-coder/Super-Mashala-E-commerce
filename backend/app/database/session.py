import sqlite3
import os
import json
from ..core.config import settings
from ..core.security import get_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), settings.LOCAL_DB_FILE)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create tables
    cursor.executescript('''
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        shop_name TEXT NOT NULL,
        mobile_number TEXT NOT NULL UNIQUE,
        email TEXT,
        password_hash TEXT,
        delivery_address TEXT,
        city TEXT DEFAULT 'Kolhapur',
        area_locality TEXT,
        role TEXT DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        short_description TEXT,
        long_description TEXT,
        ingredients TEXT,
        storage_instructions TEXT,
        image_url TEXT NOT NULL,
        is_featured INTEGER DEFAULT 0,
        is_bestseller INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS product_variants (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        packet_weight TEXT NOT NULL,
        weight_in_grams INTEGER NOT NULL,
        fixed_wholesale_price REAL NOT NULL,
        sku TEXT UNIQUE,
        is_available INTEGER DEFAULT 1,
        FOREIGN KEY (product_id) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS inventory (
        variant_id TEXT PRIMARY KEY,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        low_stock_threshold INTEGER NOT NULL DEFAULT 10,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (variant_id) REFERENCES product_variants (id)
    );

    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        shop_name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        subtotal_amount REAL NOT NULL,
        delivery_fee REAL DEFAULT 0.0,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'Order Placed',
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        variant_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        packet_weight TEXT NOT NULL,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        item_total REAL NOT NULL,
        image_url TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id)
    );
    ''')

    # Strictly no fake seed profiles or orders

    # Seed categories if empty
    cursor.execute("SELECT COUNT(*) FROM categories")
    if cursor.fetchone()[0] == 0:
        cats = [
            ('cat_masala_powder', 'Masala Powder', 'masala-powder', 'Pure single-origin spice powders', '/assets/categories/masala-powder.jpg', 1),
            ('cat_whole_spices', 'Whole Spices', 'whole-spices', 'Bold whole pods & seeds', '/assets/categories/whole-spices.jpg', 2),
            ('cat_blended_masala', 'Blended Masala', 'blended-masala', 'Authentic royal spice blends', '/assets/categories/blended-masala.jpg', 3),
            ('cat_dry_fruits', 'Dry Fruits', 'dry-fruits', 'Premium almonds, cashews & raisins', '/assets/categories/dry-fruits.jpg', 4),
            ('cat_special_products', 'Special Products', 'special-products', 'Specialty spices & saffron', '/assets/categories/special-products.jpg', 5),
        ]
        cursor.executemany("INSERT INTO categories VALUES (?, ?, ?, ?, ?, ?)", cats)

    conn.commit()
    conn.close()
