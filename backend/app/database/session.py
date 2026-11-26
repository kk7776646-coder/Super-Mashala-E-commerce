import os
import sqlite3
import re
import json
from contextlib import contextmanager
from ..core.config import settings

# Determine DB file path for SQLite
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, settings.LOCAL_DB_FILE)

# Optional PostgreSQL Connection Pool
pg_pool = None
if settings.DATABASE_URL:
    try:
        import psycopg2
        from psycopg2 import pool
        from psycopg2.extras import RealDictCursor
        db_url = settings.DATABASE_URL
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        pg_pool = psycopg2.pool.ThreadedConnectionPool(minconn=1, maxconn=10, dsn=db_url)
        print("Connected to PostgreSQL production database successfully.")
    except Exception as e:
        print(f"Warning: Failed to initialize PostgreSQL pool ({e}). Falling back to SQLite.")
        pg_pool = None

CATEGORIES_SEED = [
    ("cat_masala_powder", "Masala Powder", "masala-powder", "Authentic stone ground spice powders", "/assets/products/masala-powder/garam-masala.png", 1),
    ("cat_whole_spices", "Whole Spices", "whole-spices", "Natural sun-dried whole spices and seeds", "/assets/products/whole-spices/rai.png", 2),
    ("cat_premium_spices", "Premium Spices", "premium-spices", "Hand-selected royal aromatic spices", "/assets/products/premium-spices/elaichi.png", 3),
    ("cat_dry_fruits", "Dry Fruits", "dry-fruits", "Wholesale dry fruits & nuts (Coming Soon)", "/assets/categories/dry-fruits.jpg", 4),
]

PRODUCTS_SEED = [
    # CATEGORY A: MASALA POWDER
    ("p_garam_masala", "Garam Masala", "garam-masala", "cat_masala_powder", "Authentic rich garam masala blend for retail counters", 45.0, "Packet", "Standard Packet", None, None, "/assets/products/masala-powder/garam-masala.png", 100, 1),
    ("p_sabji_masala", "Sabji Masala", "sabji-masala", "cat_masala_powder", "Everyday aromatic vegetable curry masala", 45.0, "Packet", "Standard Packet", None, None, "/assets/products/masala-powder/sabji-masala.png", 100, 1),

    # CATEGORY B: WHOLE SPICES
    ("p_kafur", "Kafur", "kafur", "cat_whole_spices", "Pure fragrant whole kafur packets", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/kafur.png", 100, 1),
    ("p_rai", "Rai", "rai", "cat_whole_spices", "Cleaned bold black mustard seeds", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/rai.png", 100, 1),
    ("p_jira", "Jira (Jeera)", "jira", "cat_whole_spices", "High aroma cumin seeds", 40.0, "Packet", "Standard Packet", None, None, "/assets/products/whole-spices/jira.png", 100, 1),
    ("p_methi", "Methi", "methi", "cat_whole_spices", "Golden fenugreek seeds", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/methi.png", 100, 1),
    ("p_saunf", "Saunf (Souf)", "saunf", "cat_whole_spices", "Sweet aromatic green fennel seeds", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/saunf.png", 100, 1),
    ("p_ajwain", "Ajwain", "ajwain", "cat_whole_spices", "Strong pungent carom seeds", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/ajwain.png", 100, 1),
    ("p_panchforan", "Panchforan", "panchforan", "cat_whole_spices", "Traditional 5-spice whole blend", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/panchforan.png", 100, 1),
    ("p_tej_patta", "Tej Patta", "tej-patta", "cat_whole_spices", "Whole aromatic Indian bay leaves", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/tej-patta.png", 100, 1),
    ("p_kali_mirch", "Kali Mirch (Kala Miri)", "kali-mirch", "cat_whole_spices", "Bold Tellicherry black peppercorns", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/kali-mirch.png", 100, 1),
    ("p_laung", "Laung (Long)", "laung", "cat_whole_spices", "Handpicked oil-rich whole cloves", 35.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/whole-spices/laung.png", 100, 1),

    # CATEGORY C: PREMIUM SPICES
    ("p_elaichi", "Elaichi (Chhoti Elaichi)", "elaichi", "cat_premium_spices", "Premium bold green cardamom", 50.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/premium-spices/elaichi.png", 100, 1),
    ("p_khas_khas", "Khas Khas", "khas-khas", "cat_premium_spices", "Pure unadulterated white poppy seeds", 50.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/premium-spices/khas-khas.png", 100, 1),
    ("p_badi_elaichi", "Badi Elaichi", "badi-elaichi", "cat_premium_spices", "Bold smokey black cardamom pods", 50.0, "Packet", "12 Pieces Packet", 12, None, "/assets/products/premium-spices/badi-elaichi.png", 100, 1),
]

class DatabaseWrapper:
    """Standardized database wrapper providing unified dict-like access for SQLite and PostgreSQL"""
    def __init__(self):
        self.is_postgres = pg_pool is not None

    def get_connection(self):
        if self.is_postgres:
            from psycopg2.extras import RealDictCursor
            conn = pg_pool.getconn()
            conn.autocommit = False
            return conn
        else:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            return conn

    def release_connection(self, conn):
        if self.is_postgres:
            pg_pool.putconn(conn)
        else:
            conn.close()

db_wrapper = DatabaseWrapper()

@contextmanager
def get_db():
    """Context manager for safe database transactions"""
    conn = db_wrapper.get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        db_wrapper.release_connection(conn)

def get_db_connection():
    """Legacy compatibility function returning an open connection"""
    return db_wrapper.get_connection()

def close_db_connection(conn):
    """Legacy compatibility helper to close or release a connection"""
    db_wrapper.release_connection(conn)

def check_db_health() -> dict:
    """Verifies database connectivity without exposing secrets"""
    res = {"connected": False, "provider": "unknown"}
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            res["connected"] = True
            res["provider"] = "PostgreSQL" if db_wrapper.is_postgres else "SQLite (Persistent)"
    except Exception as e:
        res["error"] = str(e)

    # Check Supabase status if configured
    supabase_url = settings.effective_supabase_url
    service_key = settings.effective_service_role_key
    if supabase_url and service_key:
        try:
            import httpx
            r = httpx.get(
                f"{supabase_url}/auth/v1/health",
                headers={"apikey": service_key, "Authorization": f"Bearer {service_key}", "User-Agent": "SuperMashalaBackend/1.0"},
                timeout=3.0
            )
            if r.status_code == 200:
                res["supabase_status"] = "connected"
            else:
                res["supabase_status"] = f"status_{r.status_code}"
        except Exception:
            res["supabase_status"] = "unreachable"

    return res

def init_db():
    """Create all required tables, migrations, and seeds"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as conn:
        c = conn.cursor()
        
        # SQLite execution
        if not db_wrapper.is_postgres:
            c.executescript('''
            CREATE TABLE IF NOT EXISTS admin_allowlist (
                email TEXT PRIMARY KEY,
                phone TEXT,
                name TEXT,
                password TEXT DEFAULT '',
                authorized_by TEXT DEFAULT 'System Superadmin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                shop_name TEXT,
                mobile_number TEXT UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT,
                google_id TEXT,
                avatar_url TEXT,
                delivery_address TEXT,
                city TEXT DEFAULT 'Thane, Mumbai',
                area_locality TEXT,
                role TEXT DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                category_name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                description TEXT,
                image_path TEXT,
                display_order INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                category_id TEXT NOT NULL,
                description TEXT,
                packet_price REAL NOT NULL,
                selling_unit TEXT DEFAULT 'Packet',
                packet_size TEXT,
                pieces_per_packet INTEGER,
                packet_weight TEXT,
                image_path TEXT,
                stock_quantity INTEGER DEFAULT 100,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories (id)
            );

            CREATE TABLE IF NOT EXISTS product_variants (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                variant_name TEXT,
                pieces_per_packet INTEGER,
                packet_weight TEXT,
                packet_price REAL NOT NULL,
                stock_quantity INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
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
                order_number TEXT UNIQUE,
                customer_id TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                shop_name TEXT NOT NULL,
                contact_number TEXT NOT NULL,
                delivery_address TEXT NOT NULL,
                subtotal REAL NOT NULL,
                subtotal_amount REAL DEFAULT 0.0,
                delivery_fee REAL DEFAULT 0.0,
                total_amount REAL NOT NULL,
                payment_method TEXT NOT NULL,
                payment_status TEXT DEFAULT 'Pending',
                order_status TEXT DEFAULT 'Order Placed',
                status TEXT DEFAULT 'Order Placed',
                transaction_id TEXT,
                payment_verified_at TIMESTAMP,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                product_id TEXT NOT NULL,
                variant_id TEXT,
                product_name TEXT,
                product_name_snapshot TEXT NOT NULL,
                unit_price REAL,
                packet_price_snapshot REAL NOT NULL,
                quantity INTEGER,
                packet_quantity INTEGER NOT NULL,
                pieces_per_packet_snapshot INTEGER,
                packet_weight TEXT,
                packet_weight_snapshot TEXT,
                item_total REAL,
                line_total REAL NOT NULL,
                image_url TEXT,
                FOREIGN KEY (order_id) REFERENCES orders (id)
            );

            CREATE TABLE IF NOT EXISTS invoices (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL UNIQUE,
                invoice_number TEXT NOT NULL UNIQUE,
                print_count INTEGER DEFAULT 1,
                last_printed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders (id)
            );

            CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                customer_id TEXT,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'INR',
                payment_method TEXT DEFAULT 'UPI',
                transaction_id TEXT UNIQUE,
                payment_status TEXT NOT NULL,
                provider_payload TEXT,
                verified_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders (id)
            );
            ''')

            # Safe SQLite column migrations
            order_cols = [r[1] for r in c.execute('PRAGMA table_info(orders)')]
            if 'order_number' not in order_cols:
                c.execute('ALTER TABLE orders ADD COLUMN order_number TEXT')
            if 'order_status' not in order_cols:
                c.execute("ALTER TABLE orders ADD COLUMN order_status TEXT DEFAULT 'Order Placed'")
            if 'subtotal' not in order_cols:
                c.execute('ALTER TABLE orders ADD COLUMN subtotal REAL DEFAULT 0.0')
            if 'subtotal_amount' not in order_cols:
                c.execute('ALTER TABLE orders ADD COLUMN subtotal_amount REAL DEFAULT 0.0')
            if 'status' not in order_cols:
                c.execute("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'Order Placed'")
            if 'updated_at' not in order_cols:
                c.execute('ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP')
            if 'transaction_id' not in order_cols:
                c.execute('ALTER TABLE orders ADD COLUMN transaction_id TEXT')
            if 'payment_verified_at' not in order_cols:
                c.execute('ALTER TABLE orders ADD COLUMN payment_verified_at TIMESTAMP')

            item_cols = [r[1] for r in c.execute('PRAGMA table_info(order_items)')]
            if 'product_name_snapshot' not in item_cols:
                c.execute('ALTER TABLE order_items ADD COLUMN product_name_snapshot TEXT')
            if 'packet_price_snapshot' not in item_cols:
                c.execute('ALTER TABLE order_items ADD COLUMN packet_price_snapshot REAL')
            if 'packet_quantity' not in item_cols:
                c.execute('ALTER TABLE order_items ADD COLUMN packet_quantity INTEGER')
            if 'line_total' not in item_cols:
                c.execute('ALTER TABLE order_items ADD COLUMN line_total REAL')

            admin_cols = [r[1] for r in c.execute('PRAGMA table_info(admin_allowlist)')]
            if 'phone' not in admin_cols:
                c.execute('ALTER TABLE admin_allowlist ADD COLUMN phone TEXT')
            if 'password' not in admin_cols:
                c.execute("ALTER TABLE admin_allowlist ADD COLUMN password TEXT DEFAULT ''")

            # Seed admin allowlist
            c.execute("DELETE FROM admin_allowlist WHERE LOWER(email) IN ('admin@supermashala.com')")
            c.execute("INSERT OR REPLACE INTO admin_allowlist (email, phone, name, password) VALUES (?, ?, ?, ?)",
                      ("mdanwar.mashala@gmail.com", "9527898176", "Md Anwar (Business Owner)", settings.ADMIN_INITIAL_PASSWORD))
            c.execute("INSERT OR IGNORE INTO admin_allowlist (email, phone, name, password) VALUES (?, ?, ?, ?)",
                      ("supermashala.official@gmail.com", "9527898176", "Super Mashala Official", settings.ADMIN_INITIAL_PASSWORD))

            # Seed Categories
            for cat in CATEGORIES_SEED:
                c.execute('''
                INSERT OR IGNORE INTO categories (id, category_name, slug, description, image_path, display_order, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 1)
                ''', (cat[0], cat[1], cat[2], cat[3], cat[4], cat[5]))

            # Seed WhatsApp Products
            for p in PRODUCTS_SEED:
                c.execute('''
                INSERT OR REPLACE INTO products (
                    id, product_name, slug, category_id, description,
                    packet_price, selling_unit, packet_size, pieces_per_packet, packet_weight,
                    image_path, stock_quantity, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', p)

        else:
            # PostgreSQL execution
            c.execute('''
            CREATE TABLE IF NOT EXISTS admin_allowlist (
                email VARCHAR(255) PRIMARY KEY,
                phone VARCHAR(50),
                name VARCHAR(150),
                password VARCHAR(255) DEFAULT '',
                authorized_by VARCHAR(150) DEFAULT 'System Superadmin',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS profiles (
                id VARCHAR(100) PRIMARY KEY,
                full_name VARCHAR(150) NOT NULL,
                shop_name VARCHAR(200),
                mobile_number VARCHAR(50) UNIQUE,
                email VARCHAR(255) UNIQUE,
                password_hash TEXT,
                google_id VARCHAR(150),
                avatar_url TEXT,
                delivery_address TEXT,
                city VARCHAR(100) DEFAULT 'Thane, Mumbai',
                area_locality VARCHAR(150),
                role VARCHAR(50) DEFAULT 'customer',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(100) PRIMARY KEY,
                category_name VARCHAR(150) NOT NULL,
                slug VARCHAR(150) UNIQUE NOT NULL,
                description TEXT,
                image_path TEXT,
                display_order INT DEFAULT 0,
                is_active INT DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(100) PRIMARY KEY,
                product_name VARCHAR(200) NOT NULL,
                slug VARCHAR(200) UNIQUE NOT NULL,
                category_id VARCHAR(100) NOT NULL,
                description TEXT,
                packet_price NUMERIC(10, 2) NOT NULL,
                selling_unit VARCHAR(50) DEFAULT 'Packet',
                packet_size VARCHAR(100),
                pieces_per_packet INT,
                packet_weight VARCHAR(50),
                image_path TEXT,
                stock_quantity INT DEFAULT 100,
                is_active INT DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS orders (
                id VARCHAR(100) PRIMARY KEY,
                order_number VARCHAR(100) UNIQUE,
                customer_id VARCHAR(100) NOT NULL,
                customer_name VARCHAR(150) NOT NULL,
                shop_name VARCHAR(200) NOT NULL,
                contact_number VARCHAR(50) NOT NULL,
                delivery_address TEXT NOT NULL,
                subtotal NUMERIC(12, 2) NOT NULL,
                subtotal_amount NUMERIC(12, 2) DEFAULT 0.0,
                delivery_fee NUMERIC(10, 2) DEFAULT 0.0,
                total_amount NUMERIC(12, 2) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                payment_status VARCHAR(50) DEFAULT 'Pending',
                order_status VARCHAR(50) DEFAULT 'Order Placed',
                status VARCHAR(50) DEFAULT 'Order Placed',
                transaction_id VARCHAR(100),
                payment_verified_at TIMESTAMP WITH TIME ZONE,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id VARCHAR(100) PRIMARY KEY,
                order_id VARCHAR(100) NOT NULL,
                product_id VARCHAR(100) NOT NULL,
                variant_id VARCHAR(100),
                product_name VARCHAR(200),
                product_name_snapshot VARCHAR(200) NOT NULL,
                unit_price NUMERIC(10, 2),
                packet_price_snapshot NUMERIC(10, 2) NOT NULL,
                quantity INT,
                packet_quantity INT NOT NULL,
                pieces_per_packet_snapshot INT,
                packet_weight VARCHAR(50),
                packet_weight_snapshot VARCHAR(50),
                item_total NUMERIC(12, 2),
                line_total NUMERIC(12, 2) NOT NULL,
                image_url TEXT
            );

            CREATE TABLE IF NOT EXISTS invoices (
                id VARCHAR(100) PRIMARY KEY,
                order_id VARCHAR(100) NOT NULL UNIQUE,
                invoice_number VARCHAR(100) NOT NULL UNIQUE,
                print_count INT DEFAULT 1,
                last_printed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS payments (
                id VARCHAR(100) PRIMARY KEY,
                order_id VARCHAR(100) NOT NULL,
                customer_id VARCHAR(100),
                amount NUMERIC(12, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'INR',
                payment_method VARCHAR(50) DEFAULT 'UPI',
                transaction_id VARCHAR(100) UNIQUE,
                payment_status VARCHAR(50) NOT NULL,
                provider_payload TEXT,
                verified_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            ''')

            # Seed Categories
            for cat in CATEGORIES_SEED:
                c.execute('''
                INSERT INTO categories (id, category_name, slug, description, image_path, display_order, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
                ON CONFLICT (id) DO NOTHING
                ''', (cat[0], cat[1], cat[2], cat[3], cat[4], cat[5]))

            # Seed WhatsApp Products
            for p in PRODUCTS_SEED:
                c.execute('''
                INSERT INTO products (
                    id, product_name, slug, category_id, description,
                    packet_price, selling_unit, packet_size, pieces_per_packet, packet_weight,
                    image_path, stock_quantity, is_active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    packet_price = EXCLUDED.packet_price,
                    pieces_per_packet = EXCLUDED.pieces_per_packet,
                    stock_quantity = EXCLUDED.stock_quantity
                ''', p)

            # Seed admin allowlist
            c.execute("DELETE FROM admin_allowlist WHERE LOWER(email) IN ('admin@supermashala.com')")
            c.execute('''
            INSERT INTO admin_allowlist (email, phone, name, password)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
            ''', ("mdanwar.mashala@gmail.com", "9527898176", "Md Anwar (Business Owner)", settings.ADMIN_INITIAL_PASSWORD))

            c.execute('''
            INSERT INTO admin_allowlist (email, phone, name, password)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING
            ''', ("supermashala.official@gmail.com", "9527898176", "Super Mashala Official", settings.ADMIN_INITIAL_PASSWORD))
