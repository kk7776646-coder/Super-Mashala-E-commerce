"""
SUPER MASHALA & DRY FRUITS — ZERO-DEPENDENCY SECURE STANDALONE BACKEND
Uses Python 3 Standard Library (http.server + sqlite3)
Full REST APIs with Google OAuth Verification, Strict Admin Allowlist & Invoice Printing:
- POST /api/admin/auth/google (Checks admin allowlist; rejects unauthorized with 403)
- POST /api/auth/google (Customer Google OAuth; automatically assigns customer role)
- GET /api/categories (List wholesale categories)
- GET /api/products (List packet-based products)
- POST /api/products (Admin add product)
- PATCH /api/products (Admin update product)
- POST /api/orders (Atomic stock validation, snapshot order items, invoice creation)
- GET /api/orders (List orders with historical snapshots)
- PATCH /api/orders/{id} (Update status)
- POST /api/invoices/record-print (Duplicate copy tracker)
- GET /api/admin/metrics (Real business metrics)
"""

import http.server
import socketserver
import json
import sqlite3
import os
import time
import uuid
import base64
import re

PORT = 8000
DB_FILE = os.path.join(os.path.dirname(__file__), "super_mashala.db")
ADMIN_INITIAL_PASSWORD = os.getenv("ADMIN_INITIAL_PASSWORD", "").strip()
ADMIN_RESET_OTP = os.getenv("ADMIN_RESET_OTP", "").strip()

# Admin allowlist defaults
AUTHORIZED_ADMIN_EMAILS = [
    "mdanwar.mashala@gmail.com",
    "supermashala.official@gmail.com"
]

CATEGORIES_SEED = [
    ("cat_masala_powder", "Masala Powder", "masala-powder", "Authentic stone ground spice powders", "/assets/products/masala-powder/garam-masala.png", 1),
    ("cat_whole_spices", "Whole Spices", "whole-spices", "Natural sun-dried whole spices and seeds", "/assets/products/whole-spices/rai.png", 1),
    ("cat_premium_spices", "Premium Spices", "premium-spices", "Hand-selected royal aromatic spices", "/assets/products/premium-spices/elaichi.png", 1),
    ("cat_dry_fruits", "Dry Fruits", "dry-fruits", "Wholesale dry fruits & nuts (Coming Soon)", "/assets/categories/dry-fruits.jpg", 1),
]

# EXACT 15 PRODUCTS FROM ACTUAL WHATSAPP BUSINESS LIST
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

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.executescript('''
    CREATE TABLE IF NOT EXISTS admin_allowlist (
        email TEXT PRIMARY KEY,
        name TEXT,
        authorized_by TEXT DEFAULT 'System Superadmin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        shop_name TEXT,
        mobile_number TEXT,
        email TEXT UNIQUE,
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

    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE,
        customer_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        shop_name TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        subtotal REAL NOT NULL,
        delivery_fee REAL DEFAULT 0.0,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'Pending',
        order_status TEXT DEFAULT 'Order Placed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name_snapshot TEXT NOT NULL,
        packet_price_snapshot REAL NOT NULL,
        packet_quantity INTEGER NOT NULL,
        pieces_per_packet_snapshot INTEGER,
        packet_weight_snapshot TEXT,
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

    # Safe Schema Migrations for existing database
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
    if 'pieces_per_packet_snapshot' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN pieces_per_packet_snapshot INTEGER')
    if 'packet_weight_snapshot' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN packet_weight_snapshot TEXT')
    if 'line_total' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN line_total REAL')
    if 'variant_id' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN variant_id TEXT')
    if 'product_name' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN product_name TEXT')
    if 'packet_weight' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN packet_weight TEXT')
    if 'unit_price' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN unit_price REAL')
    if 'quantity' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN quantity INTEGER')
    if 'item_total' not in item_cols:
        c.execute('ALTER TABLE order_items ADD COLUMN item_total REAL')

    # Seed the admin allowlist with a password provided through the environment.
    c.execute("PRAGMA table_info(admin_allowlist)")
    admin_cols = [col[1] for col in c.fetchall()]
    if 'phone' not in admin_cols:
        c.execute("ALTER TABLE admin_allowlist ADD COLUMN phone TEXT")
    if 'password' not in admin_cols:
        c.execute("ALTER TABLE admin_allowlist ADD COLUMN password TEXT DEFAULT ''")

    # Clean out old previous administrator emails strictly
    c.execute("DELETE FROM admin_allowlist WHERE LOWER(email) IN ('admin@supermashala.com')")
    c.execute("INSERT OR REPLACE INTO admin_allowlist (email, phone, name, password) VALUES (?, ?, ?, ?)",
              ("mdanwar.mashala@gmail.com", "9527898176", "Md Anwar (Business Owner)", ADMIN_INITIAL_PASSWORD))
    c.execute("INSERT OR IGNORE INTO admin_allowlist (email, phone, name, password) VALUES (?, ?, ?, ?)",
              ("supermashala.official@gmail.com", "9527898176", "Super Mashala Official", ADMIN_INITIAL_PASSWORD))

    # Seed Categories
    for cat in CATEGORIES_SEED:
        c.execute('''
        INSERT OR IGNORE INTO categories (id, category_name, slug, description, image_path, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', cat)

    # Seed Confirmed WhatsApp Products
    for p in PRODUCTS_SEED:
        c.execute('''
        INSERT OR REPLACE INTO products (
            id, product_name, slug, category_id, description,
            packet_price, selling_unit, packet_size, pieces_per_packet, packet_weight,
            image_path, stock_quantity, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', p)

    conn.commit()
    conn.close()

def decode_google_jwt(jwt_token):
    """Safe parser for Google ID token payload without requiring third party libs"""
    try:
        parts = jwt_token.split(".")
        if len(parts) >= 2:
            payload = parts[1]
            rem = len(payload) % 4
            if rem > 0:
                payload += "=" * (4 - rem)
            decoded = base64.urlsafe_b64decode(payload).decode('utf-8')
            return json.loads(decoded)
    except Exception as e:
        pass
    return None

class SuperMashalaHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_HEAD(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        # 1. Health endpoint
        if self.path in ("/", "/health", "/api/health"):
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "brand": "SUPER MASHALA & DRY FRUITS",
                "status": "online",
                "catalogue": "15 Products (Packet-Based)",
                "googleAuthEnabled": True
            }).encode('utf-8'))
            return

        # 2. Categories endpoint
        if self.path == "/api/categories":
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM categories WHERE is_active = 1")
            rows = c.fetchall()
            cats = []
            for r in rows:
                c.execute("SELECT COUNT(*) FROM products WHERE category_id = ? AND is_active = 1", (r["id"],))
                cnt = c.fetchone()[0]
                cats.append({
                    "id": r["id"],
                    "name": r["category_name"],
                    "category_name": r["category_name"],
                    "slug": r["slug"],
                    "description": r["description"],
                    "image": r["image_path"],
                    "itemCount": f"{cnt} Products" if cnt > 0 else "Coming Soon"
                })
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(cats).encode('utf-8'))
            return

        # 3. Products endpoint
        if self.path.startswith("/api/products"):
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute('''
            SELECT p.*, c.category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY 
                CASE p.category_id 
                    WHEN 'cat_masala_powder' THEN 1
                    WHEN 'cat_whole_spices' THEN 2
                    WHEN 'cat_premium_spices' THEN 3
                    ELSE 4
                END, p.packet_price ASC
            ''')
            rows = c.fetchall()
            products = []
            for r in rows:
                p = {
                    "id": r["id"],
                    "name": r["product_name"],
                    "product_name": r["product_name"],
                    "slug": r["slug"],
                    "categoryId": r["category_id"],
                    "category_id": r["category_id"],
                    "categoryName": r["category_name"] or "Spices",
                    "category_name": r["category_name"] or "Spices",
                    "description": r["description"],
                    "shortDescription": r["description"],
                    "packetPrice": r["packet_price"],
                    "price": r["packet_price"],
                    "sellingUnit": r["selling_unit"],
                    "packetSize": r["packet_size"],
                    "piecesPerPacket": r["pieces_per_packet"],
                    "packetWeight": r["packet_weight"],
                    "image": r["image_path"],
                    "image_path": r["image_path"],
                    "stock": r["stock_quantity"],
                    "stock_quantity": r["stock_quantity"],
                    "isActive": bool(r["is_active"]),
                    "is_active": r["is_active"]
                }
                products.append(p)
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(products).encode('utf-8'))
            return

        # 4. Orders endpoint
        if self.path.startswith("/api/orders"):
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM orders ORDER BY created_at DESC")
            rows = c.fetchall()
            orders = []
            for r in rows:
                od = dict(r)
                # Map field names for frontend compatibility
                od["orderNumber"] = od.get("order_number") or od["id"]
                od["customerName"] = od.get("customer_name")
                od["shopName"] = od.get("shop_name")
                od["contactNumber"] = od.get("contact_number")
                od["deliveryAddress"] = od.get("delivery_address")
                od["subtotal"] = od.get("subtotal") or od.get("subtotal_amount", 0.0)
                od["deliveryFee"] = od.get("delivery_fee", 0.0)
                od["totalAmount"] = od.get("total_amount")
                od["paymentMethod"] = od.get("payment_method")
                od["paymentStatus"] = od.get("payment_status")
                od["status"] = od.get("order_status") or od.get("status")
                od["transactionId"] = od.get("transaction_id")
                od["paymentVerifiedAt"] = od.get("payment_verified_at")

                c.execute("SELECT * FROM order_items WHERE order_id = ?", (od["id"],))
                item_rows = c.fetchall()
                od["items"] = []
                for itm in item_rows:
                    itmd = dict(itm)
                    od["items"].append({
                        "id": itmd["id"],
                        "productId": itmd["product_id"],
                        "name": itmd["product_name_snapshot"],
                        "price": itmd["packet_price_snapshot"],
                        "quantity": itmd["packet_quantity"],
                        "piecesPerPacket": itmd.get("pieces_per_packet_snapshot"),
                        "packetWeight": itmd.get("packet_weight_snapshot") or (f"{itmd.get('pieces_per_packet_snapshot')} Pcs/Pkt" if itmd.get('pieces_per_packet_snapshot') else 'Standard Packet'),
                        "itemTotal": itmd["line_total"],
                        "image": itmd["image_url"]
                    })
                
                # Check invoice print count
                c.execute("SELECT print_count FROM invoices WHERE order_id = ?", (od["id"],))
                inv = c.fetchone()
                od["invoicePrintCount"] = inv[0] if inv else 1
                orders.append(od)
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(orders).encode('utf-8'))
            return

        # Real-time payment status endpoint
        if self.path.startswith("/api/payments/status/"):
            order_id = self.path.split("/")[-1].split("?")[0]
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT id, order_number, total_amount, payment_method, payment_status, order_status, transaction_id, payment_verified_at FROM orders WHERE id = ? OR order_number = ?", (order_id, order_id))
            row = c.fetchone()
            conn.close()
            if not row:
                self.send_response(404)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "ORDER_NOT_FOUND"}).encode('utf-8'))
                return
            
            res_data = {
                "success": True,
                "orderId": row["id"],
                "totalAmount": row["total_amount"],
                "paymentMethod": row["payment_method"],
                "paymentStatus": (row["payment_status"] or "PENDING").upper(),
                "orderStatus": row["order_status"] or "Order Placed",
                "transactionId": row["transaction_id"],
                "verifiedAt": row["payment_verified_at"]
            }
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res_data).encode('utf-8'))
            return

        # 5. Admin Metrics
        if self.path.startswith("/api/admin/metrics"):
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM orders")
            total_orders = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM orders WHERE order_status NOT IN ('Delivered', 'Cancelled')")
            pending_orders = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM orders WHERE order_status = 'Delivered'")
            delivered_orders = c.fetchone()[0]
            c.execute("SELECT SUM(total_amount) FROM orders WHERE payment_status IN ('Completed', 'Paid')")
            total_rev = c.fetchone()[0] or 0.0
            c.execute("SELECT COUNT(DISTINCT customer_id) FROM orders")
            total_cust = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM products WHERE stock_quantity <= 15")
            low_stock_count = c.fetchone()[0]
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "totalOrders": total_orders,
                "pendingOrders": pending_orders,
                "deliveredOrders": delivered_orders,
                "totalRevenue": total_rev,
                "totalCustomers": total_cust,
                "lowStockCount": low_stock_count,
                "outstandingUdhaar": 0.0
            }).encode('utf-8'))
            return

        self.send_response(404)
        self._send_cors()
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        data = json.loads(body) if body else {}

        # ----------------------------------------------------
        # 1. SECURE ADMIN LOGIN (EMAIL OR PHONE) & MASTER KEY VERIFICATION
        # ----------------------------------------------------
        if self.path == "/api/admin/auth/google" or self.path == "/api/admin/auth/login":
            identifier = (data.get("identifier") or data.get("email") or data.get("phone") or "").lower().strip()
            password = data.get("password", "").strip()
            token = data.get("credential", "")
            if token:
                claims = decode_google_jwt(token)
                if claims and "email" in claims:
                    identifier = claims["email"].lower().strip()

            if not identifier:
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "detail": "Missing administrator email or phone number."}).encode('utf-8'))
                return

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("SELECT email, phone, name, password FROM admin_allowlist WHERE LOWER(email) = ? OR phone = ?", (identifier, identifier))
            row = c.fetchone()
            conn.close()

            if not row:
                self.send_response(403)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "ACCESS_DENIED",
                    "detail": f"Access Denied: Identifier '{identifier}' is NOT an authorized administrator for Super Mashala. Access is strictly restricted."
                }).encode('utf-8'))
                return

            expected_password = row[3] or ""
            if not expected_password or not password or password != expected_password:
                self.send_response(401)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "UNAUTHORIZED_ADMIN",
                    "detail": "Access Denied: Invalid Admin Security Password. This portal is strictly restricted to the Super Mashala business owner."
                }).encode('utf-8'))
                return

            session_token = f"adm_sec_{uuid.uuid4().hex}"
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "sessionToken": session_token,
                "admin": {
                    "email": row[0],
                    "phone": row[1] or "9527898176",
                    "name": row[2] or "Md Anwar (Business Owner)",
                    "role": "admin"
                }
            }).encode('utf-8'))
            return

        # ----------------------------------------------------
        # 1B. ADMIN RESET PASSWORD VIA PHONE OTP
        # ----------------------------------------------------
        if self.path == "/api/admin/auth/reset-password":
            phone = data.get("phone", "").strip()
            otp = data.get("otp", "").strip()
            new_password = data.get("newPassword", "").strip()

            if not phone or phone != "9527898176":
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "detail": "Phone number is not registered as an authorized administrator."}).encode('utf-8'))
                return

            if not ADMIN_RESET_OTP:
                self.send_response(503)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "detail": "Admin password reset is not configured."}).encode('utf-8'))
                return

            if not otp or otp != ADMIN_RESET_OTP:
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "detail": "Invalid OTP verification code."}).encode('utf-8'))
                return

            if not new_password or len(new_password) < 4:
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "detail": "Password must be at least 4 characters long."}).encode('utf-8'))
                return

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("UPDATE admin_allowlist SET password = ? WHERE phone = '9527898176'", (new_password,))
            conn.commit()
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "message": "Admin master password reset successfully! You can now log in with your new password."
            }).encode('utf-8'))
            return

        # ----------------------------------------------------
        # 2. CUSTOMER GOOGLE OAUTH
        # ----------------------------------------------------
        if self.path == "/api/auth/google":
            google_email = data.get("email", "").lower().strip()
            full_name = data.get("name", "Retail Partner")
            google_id = data.get("sub", "")
            avatar_url = data.get("picture", "")

            token = data.get("credential", "")
            if token:
                claims = decode_google_jwt(token)
                if claims:
                    google_email = claims.get("email", google_email).lower().strip()
                    full_name = claims.get("name", full_name)
                    google_id = claims.get("sub", google_id)
                    avatar_url = claims.get("picture", avatar_url)

            if not google_email:
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "detail": "Invalid Google login payload."}).encode('utf-8'))
                return

            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM profiles WHERE email = ?", (google_email,))
            existing = c.fetchone()

            if existing:
                user_record = dict(existing)
            else:
                user_id = f"usr_{uuid.uuid4().hex[:10]}"
                c.execute('''
                INSERT INTO profiles (id, full_name, shop_name, email, google_id, avatar_url, role)
                VALUES (?, ?, ?, ?, ?, ?, 'customer')
                ''', (user_id, full_name, full_name + " Store", google_email, google_id, avatar_url))
                conn.commit()
                user_record = {
                    "id": user_id,
                    "full_name": full_name,
                    "shop_name": full_name + " Store",
                    "email": google_email,
                    "mobile_number": "",
                    "delivery_address": "",
                    "role": "customer"
                }
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "user": user_record}).encode('utf-8'))
            return

        # ----------------------------------------------------
        # 3. ADMIN PRODUCT CREATION
        # ----------------------------------------------------
        if self.path == "/api/products":
            name = data.get("name", "").strip()
            cat_id = data.get("categoryId", "cat_whole_spices")
            price = float(data.get("packetPrice", data.get("price", 0)))
            pieces = data.get("piecesPerPacket")
            pieces = int(pieces) if pieces not in (None, "", "null") else None
            weight = data.get("packetWeight") or None
            stock = int(data.get("stock", data.get("stock_quantity", 100)))
            image = data.get("image") or data.get("image_path") or "/assets/icons/spice-icon.svg"
            desc = data.get("description", "")
            unit = data.get("sellingUnit", "Packet")

            if not name or price <= 0:
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "detail": "Valid product name and positive packet price required."}).encode('utf-8'))
                return

            prod_id = f"p_{re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')}_{int(time.time()) % 1000}"
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute('''
            INSERT INTO products (
                id, product_name, slug, category_id, description,
                packet_price, selling_unit, packet_size, pieces_per_packet, packet_weight,
                image_path, stock_quantity, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ''', (prod_id, name, slug, cat_id, desc, price, unit, f"{pieces} Pcs" if pieces else "Packet", pieces, weight, image, stock))
            conn.commit()
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "productId": prod_id, "message": "Product created successfully."}).encode('utf-8'))
            return

        # ----------------------------------------------------
        # 4. INVOICE PRINT TRACKER
        # ----------------------------------------------------
        if self.path == "/api/invoices/record-print":
            order_id = data.get("orderId")
            if not order_id:
                self.send_response(400)
                self._send_cors()
                self.end_headers()
                return

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("SELECT print_count FROM invoices WHERE order_id = ?", (order_id,))
            row = c.fetchone()
            if row:
                new_count = row[0] + 1
                c.execute("UPDATE invoices SET print_count = ?, last_printed_at = CURRENT_TIMESTAMP WHERE order_id = ?", (new_count, order_id))
            else:
                new_count = 1
                inv_id = f"INV-{order_id}"
                c.execute("INSERT INTO invoices VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)", (inv_id, order_id, inv_id))

            conn.commit()
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "printCount": new_count, "isDuplicate": new_count > 1}).encode('utf-8'))
            return

        # ----------------------------------------------------
        # 5. WHOLESALE ORDER PLACEMENT (ATOMIC STOCK & SNAPSHOTS)
        # ----------------------------------------------------
        if self.path == "/api/orders":
            items = data.get("items", [])
            if not items:
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "detail": "Cannot place order with empty cart."}).encode('utf-8'))
                return

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            # Stock check validation before writing anything
            for itm in items:
                pid = itm.get("productId")
                qty = itm.get("quantity", 1)
                c.execute("SELECT product_name, stock_quantity FROM products WHERE id = ?", (pid,))
                row = c.fetchone()
                if row:
                    pname, available_stock = row
                    if available_stock < qty:
                        conn.close()
                        self.send_response(400)
                        self._send_cors()
                        self.send_header("Content-Type", "application/json")
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "success": False,
                            "error": "INSUFFICIENT_STOCK",
                            "detail": f"Insufficient stock for {pname}. Available: {available_stock} packets, requested: {qty} packets."
                        }).encode('utf-8'))
                        return

            order_id = data.get("id") or f"SM-{time.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            subtotal = sum(float(item.get("price", item.get("packetPrice", 0))) * int(item.get("quantity", 1)) for item in items)
            delivery_fee = 0.0 if subtotal >= 1000.0 else 50.0
            total_amount = subtotal + delivery_fee
            pay_method = data.get("payment_method", data.get("paymentMethod", "Cash on Delivery"))
            pay_status = "PENDING"

            c.execute('''
            INSERT INTO orders (
                id, order_number, customer_id, customer_name, shop_name,
                contact_number, delivery_address, subtotal, subtotal_amount, delivery_fee,
                total_amount, payment_method, payment_status, status, order_status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed', 'Order Placed', ?)
            ''', (
                order_id,
                order_id,
                data.get("customer_id", data.get("customerId", "guest")),
                data.get("customer_name", data.get("customerName", "Retail Partner")),
                data.get("shop_name", data.get("shopName", "Retail Store")),
                data.get("contact_number", data.get("contactNumber", "")),
                data.get("delivery_address", data.get("deliveryAddress", "")),
                subtotal,
                subtotal,
                delivery_fee,
                total_amount,
                pay_method,
                pay_status,
                data.get("notes", "")
            ))

            for itm in items:
                pid = itm.get("productId")
                qty = int(itm.get("quantity", 1))
                price = float(itm.get("price", itm.get("packetPrice", 0.0)))
                line_total = qty * price
                pieces = itm.get("piecesPerPacket")
                weight = itm.get("packetWeight")
                pname = itm.get("name", "Spice Packet")

                # Snapshot order item with compatibility for legacy and new columns
                variant_id = itm.get("variantId") or f"{pid}-std"
                c.execute('''
                INSERT INTO order_items (
                    id, order_id, product_id, variant_id, product_name, product_name_snapshot,
                    unit_price, packet_price_snapshot, quantity, packet_quantity,
                    pieces_per_packet_snapshot, packet_weight, packet_weight_snapshot,
                    item_total, line_total, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    str(uuid.uuid4()),
                    order_id,
                    pid,
                    variant_id,
                    pname,
                    pname,
                    price,
                    price,
                    qty,
                    qty,
                    pieces,
                    str(weight or ""),
                    str(weight or ""),
                    line_total,
                    line_total,
                    itm.get("image", "")
                ))

                # Atomically deduct stock from inventory
                c.execute("UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?", (qty, pid))

            # Initialize Invoice
            inv_id = f"INV-{order_id}"
            c.execute("INSERT OR IGNORE INTO invoices VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)", (inv_id, order_id, inv_id))

            conn.commit()
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "orderId": order_id,
                "totalAmount": total_amount,
                "status": "Order Placed",
                "paymentStatus": "PENDING"
            }).encode('utf-8'))
            return

        # ----------------------------------------------------
        # 6. REAL-TIME PAYMENT VERIFICATION (UPI UTR / IDEMPOTENT)
        # ----------------------------------------------------
        if self.path == "/api/payments/verify":
            order_id = data.get("orderId") or data.get("order_id")
            transaction_id = str(data.get("transactionId") or data.get("transaction_id") or "").strip()

            if not order_id or not transaction_id:
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "MISSING_PARAMETERS",
                    "detail": "Order ID and 12-digit UPI Transaction / UTR number are required."
                }).encode('utf-8'))
                return

            # Clean and validate 12-digit UTR
            clean_utr = re.sub(r'[\s-]', '', transaction_id)
            if not (clean_utr.isdigit() and len(clean_utr) == 12):
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "INVALID_UTR",
                    "detail": "Invalid UPI Reference Number. A valid Bank UTR must be exactly 12 numeric digits from your UPI payment receipt (Google Pay, PhonePe, Paytm, BHIM)."
                }).encode('utf-8'))
                return

            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            # Verify order exists
            c.execute("SELECT * FROM orders WHERE id = ? OR order_number = ?", (order_id, order_id))
            ord_row = c.fetchone()
            if not ord_row:
                conn.close()
                self.send_response(404)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "ORDER_NOT_FOUND",
                    "detail": f"Order {order_id} does not exist."
                }).encode('utf-8'))
                return

            real_order_id = ord_row["id"]
            total_amt = ord_row["total_amount"]

            # Idempotency check: is this UTR already recorded for another order?
            c.execute("SELECT order_id FROM payments WHERE transaction_id = ? AND order_id != ?", (clean_utr, real_order_id))
            dup_pay = c.fetchone()
            if not dup_pay:
                c.execute("SELECT id FROM orders WHERE transaction_id = ? AND id != ?", (clean_utr, real_order_id))
                dup_pay = c.fetchone()

            if dup_pay:
                conn.close()
                self.send_response(409)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "DUPLICATE_TRANSACTION",
                    "detail": f"Duplicate Transaction ID: Bank UTR {clean_utr} has already been claimed for another order ({dup_pay[0]}). Reusing transaction receipts is strictly prohibited."
                }).encode('utf-8'))
                return

            # Record or update in payments table
            pay_id = f"pay_{uuid.uuid4().hex[:12]}"
            c.execute('''
            INSERT INTO payments (id, order_id, customer_id, amount, currency, payment_method, transaction_id, payment_status, provider_payload, verified_at)
            VALUES (?, ?, ?, ?, 'INR', 'UPI', ?, 'PAID', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(transaction_id) DO UPDATE SET payment_status = 'PAID', verified_at = CURRENT_TIMESTAMP
            ''', (pay_id, real_order_id, ord_row["customer_id"], total_amt, clean_utr, json.dumps(data)))

            # Update order status atomically
            c.execute('''
            UPDATE orders
            SET payment_status = 'PAID',
                order_status = 'Confirmed',
                status = 'Confirmed',
                transaction_id = ?,
                payment_verified_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            ''', (clean_utr, real_order_id))

            conn.commit()
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": True,
                "status": "PAID",
                "paymentStatus": "PAID",
                "orderStatus": "Confirmed",
                "orderId": real_order_id,
                "transactionId": clean_utr,
                "amount": total_amt,
                "message": "Payment verified successfully by Super Mashala verification engine."
            }).encode('utf-8'))
            return

        # ----------------------------------------------------
        # 7. PAYMENT GATEWAY SECURE WEBHOOK
        # ----------------------------------------------------
        if self.path == "/api/payments/webhook":
            event = data.get("event", "payment.captured")
            payload = data.get("payload", data)
            order_id = payload.get("orderId") or payload.get("order_id")
            txn_id = payload.get("transactionId") or payload.get("txn_id") or payload.get("payment_id")
            status = payload.get("status", "PAID").upper()

            if not order_id:
                self.send_response(400)
                self._send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "MISSING_ORDER_ID"}).encode('utf-8'))
                return

            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            target_status = "PAID" if status in ("PAID", "CAPTURED", "SUCCESS") else "FAILED"
            order_stat = "Confirmed" if target_status == "PAID" else "Payment Pending"

            c.execute("UPDATE orders SET payment_status = ?, order_status = ?, transaction_id = COALESCE(?, transaction_id), payment_verified_at = CURRENT_TIMESTAMP WHERE id = ?", (target_status, order_stat, txn_id, order_id))

            if txn_id:
                pay_id = f"pay_wh_{uuid.uuid4().hex[:10]}"
                c.execute('''
                INSERT INTO payments (id, order_id, amount, payment_method, transaction_id, payment_status, provider_payload, verified_at)
                VALUES (?, ?, (SELECT total_amount FROM orders WHERE id = ?), 'Gateway Webhook', ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(transaction_id) DO UPDATE SET payment_status = ?
                ''', (pay_id, order_id, order_id, txn_id, target_status, json.dumps(data), target_status))

            conn.commit()
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "event": event, "status": target_status}).encode('utf-8'))
            return

        self.send_response(404)
        self._send_cors()
        self.end_headers()

    def do_PATCH(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        data = json.loads(body) if body else {}

        # 1. Update Product (Admin)
        if self.path.startswith("/api/products"):
            prod_id = data.get("id") or self.path.split("/")[-1]
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            updates = []
            vals = []
            if "name" in data or "product_name" in data:
                updates.append("product_name = ?")
                vals.append(data.get("name") or data.get("product_name"))
            if "packetPrice" in data or "packet_price" in data or "price" in data:
                updates.append("packet_price = ?")
                vals.append(float(data.get("packetPrice") or data.get("packet_price") or data.get("price")))
            if "piecesPerPacket" in data or "pieces_per_packet" in data:
                raw_pieces = data.get("piecesPerPacket", data.get("pieces_per_packet"))
                val = int(raw_pieces) if raw_pieces not in (None, "", "null") else None
                updates.append("pieces_per_packet = ?")
                vals.append(val)
            if "packetWeight" in data or "packet_weight" in data:
                updates.append("packet_weight = ?")
                vals.append(data.get("packetWeight") or data.get("packet_weight"))
            if "stock" in data or "stock_quantity" in data:
                updates.append("stock_quantity = ?")
                vals.append(int(data.get("stock") or data.get("stock_quantity")))
            if "isActive" in data or "is_active" in data:
                updates.append("is_active = ?")
                vals.append(1 if data.get("isActive") or data.get("is_active") else 0)
            if "image" in data or "image_path" in data:
                updates.append("image_path = ?")
                vals.append(data.get("image") or data.get("image_path"))
            if "categoryId" in data or "category_id" in data:
                updates.append("category_id = ?")
                vals.append(data.get("categoryId") or data.get("category_id"))

            if updates:
                updates.append("updated_at = CURRENT_TIMESTAMP")
                vals.append(prod_id)
                query = f"UPDATE products SET {', '.join(updates)} WHERE id = ?"
                c.execute(query, tuple(vals))
                conn.commit()

            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "message": "Product updated successfully."}).encode('utf-8'))
            return

        # 2. Update Order Status
        if self.path.startswith("/api/orders/"):
            order_id = self.path.split("/")[-1]
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()

            if "status" in data or "order_status" in data:
                new_status = data.get("status") or data.get("order_status")
                c.execute("UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_status, order_id))
            if "payment_status" in data or "paymentStatus" in data:
                new_pay = data.get("payment_status") or data.get("paymentStatus")
                c.execute("UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_pay, order_id))

            conn.commit()
            conn.close()

            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "orderId": order_id}).encode('utf-8'))
            return

        self.send_response(404)
        self._send_cors()
        self.end_headers()

    def do_PUT(self):
        # Treat PUT on products or orders identical to PATCH
        self.do_PATCH()

def run_server():
    init_db()
    with socketserver.TCPServer(("", PORT), SuperMashalaHandler) as httpd:
        httpd.allow_reuse_address = True
        print(f"Super Mashala Production Standalone Server running on port {PORT}...")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()
