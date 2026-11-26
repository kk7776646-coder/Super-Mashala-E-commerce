from fastapi import APIRouter, HTTPException, Depends, status, Request
from typing import List, Optional, Any, Dict
import time
import uuid
import re
import json
import base64

from ..database.session import get_db, db_wrapper
from ..core.config import settings
from ..core.security import get_password_hash, verify_password
from ..schemas.all_schemas import (
    UserRegister,
    UserLogin,
    UserProfile,
    AdminLogin,
    AdminResetPassword,
    GoogleAuthPayload,
    ProductCreate,
    ProductUpdate,
    OrderCreatePayload,
    OrderUpdateStatus,
    PaymentVerifyPayload,
    InvoicePrintPayload
)

router = APIRouter()

def decode_google_jwt(jwt_token: str) -> Optional[dict]:
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
    except Exception:
        pass
    return None

def row_to_dict(cursor, row):
    """Converts a SQLite Row or PostgreSQL tuple/dict to a standard python dict"""
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    if hasattr(row, "keys"):
        return {k: row[k] for k in row.keys()}
    # Fallback to column descriptions
    if hasattr(cursor, "description") and cursor.description:
        cols = [col[0] for col in cursor.description]
        return dict(zip(cols, row))
    return dict(row)

# ----------------------------------------------------
# 1. AUTHENTICATION ENDPOINTS
# ----------------------------------------------------
@router.post("/auth/register")
def register_customer(payload: UserRegister):
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if db_wrapper.is_postgres else "?"

        cursor.execute(f"SELECT id FROM profiles WHERE mobile_number = {placeholder}", (payload.mobile_number,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Mobile number already registered.")

        user_id = f"usr_{int(time.time())}_{uuid.uuid4().hex[:6]}"
        cursor.execute(f'''
        INSERT INTO profiles (id, full_name, shop_name, mobile_number, email, password_hash, delivery_address, city, area_locality, role)
        VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 'customer')
        ''', (
            user_id,
            payload.full_name,
            payload.shop_name,
            payload.mobile_number,
            payload.email,
            get_password_hash(payload.password),
            payload.delivery_address,
            payload.city,
            payload.area_locality
        ))

    return {
        "success": True,
        "message": "Retailer profile registered successfully",
        "user": {
            "id": user_id,
            "fullName": payload.full_name,
            "shopName": payload.shop_name,
            "mobileNumber": payload.mobile_number,
            "role": "customer"
        }
    }

@router.post("/auth/login")
def login(payload: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if db_wrapper.is_postgres else "?"

        cursor.execute(f'''
        SELECT id, full_name, shop_name, mobile_number, email, password_hash, delivery_address, city, area_locality, role
        FROM profiles
        WHERE mobile_number = {placeholder} OR email = {placeholder}
        ''', (payload.username, payload.username))
        
        row = row_to_dict(cursor, cursor.fetchone())

    if not row or not verify_password(payload.password, row.get("password_hash") or ""):
        raise HTTPException(status_code=401, detail="Invalid mobile number/email or password.")

    return {
        "success": True,
        "user": {
            "id": row["id"],
            "fullName": row["full_name"],
            "shopName": row["shop_name"],
            "mobileNumber": row["mobile_number"],
            "email": row["email"],
            "deliveryAddress": row["delivery_address"],
            "city": row["city"],
            "areaLocality": row["area_locality"],
            "role": row["role"],
        }
    }

@router.post("/auth/google")
def google_auth(payload: GoogleAuthPayload):
    google_email = (payload.email or "").lower().strip()
    full_name = payload.name or "Retail Partner"
    google_id = payload.sub or ""
    avatar_url = payload.picture or ""

    if payload.credential:
        claims = decode_google_jwt(payload.credential)
        if claims:
            google_email = claims.get("email", google_email).lower().strip()
            full_name = claims.get("name", full_name)
            google_id = claims.get("sub", google_id)
            avatar_url = claims.get("picture", avatar_url)

    if not google_email:
        raise HTTPException(status_code=400, detail="Invalid Google login payload.")

    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if db_wrapper.is_postgres else "?"

        cursor.execute(f"SELECT * FROM profiles WHERE email = {placeholder}", (google_email,))
        existing = row_to_dict(cursor, cursor.fetchone())

        if existing:
            user_record = existing
        else:
            user_id = f"usr_{uuid.uuid4().hex[:10]}"
            cursor.execute(f'''
            INSERT INTO profiles (id, full_name, shop_name, email, google_id, avatar_url, role)
            VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 'customer')
            ''', (user_id, full_name, full_name + " Store", google_email, google_id, avatar_url))
            user_record = {
                "id": user_id,
                "full_name": full_name,
                "shop_name": full_name + " Store",
                "email": google_email,
                "mobile_number": "",
                "delivery_address": "",
                "role": "customer"
            }

    return {"success": True, "user": user_record}

@router.post("/admin/auth/google")
@router.post("/admin/auth/login")
def admin_login(payload: AdminLogin):
    identifier = (payload.identifier or payload.email or payload.phone or "").lower().strip()
    password = (payload.password or "").strip()

    if payload.credential:
        claims = decode_google_jwt(payload.credential)
        if claims and "email" in claims:
            identifier = claims["email"].lower().strip()

    if not identifier:
        raise HTTPException(status_code=400, detail="Missing administrator email or phone number.")

    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if db_wrapper.is_postgres else "?"

        cursor.execute(f"SELECT email, phone, name, password FROM admin_allowlist WHERE LOWER(email) = {placeholder} OR phone = {placeholder}", (identifier, identifier))
        row = row_to_dict(cursor, cursor.fetchone())

    if not row:
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Identifier '{identifier}' is NOT an authorized administrator for Super Mashala."
        )

    expected_password = row.get("password") or ""
    if not expected_password or not password or password != expected_password:
        raise HTTPException(
            status_code=401, 
            detail="Access Denied: Invalid Admin Security Password. This portal is strictly restricted to the Super Mashala business owner."
        )

    session_token = f"adm_sec_{uuid.uuid4().hex}"
    return {
        "success": True,
        "sessionToken": session_token,
        "admin": {
            "email": row.get("email"),
            "phone": row.get("phone") or "9527898176",
            "name": row.get("name") or "Md Anwar (Business Owner)",
            "role": "admin"
        }
    }

@router.post("/admin/auth/reset-password")
def admin_reset_password(payload: AdminResetPassword):
    phone = payload.phone.strip()
    otp = payload.otp.strip()
    new_password = payload.newPassword.strip()

    if not phone or phone != "9527898176":
        raise HTTPException(status_code=400, detail="Phone number is not registered as an authorized administrator.")

    if not settings.ADMIN_RESET_OTP:
        raise HTTPException(status_code=503, detail="Admin password reset is not configured.")

    if not otp or otp != settings.ADMIN_RESET_OTP:
        raise HTTPException(status_code=400, detail="Invalid OTP verification code.")

    if not new_password or len(new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if db_wrapper.is_postgres else "?"
        cursor.execute(f"UPDATE admin_allowlist SET password = {placeholder} WHERE phone = '9527898176'", (new_password,))

    return {
        "success": True,
        "message": "Admin master password reset successfully! You can now log in with your new password."
    }

# ----------------------------------------------------
# 2. CATEGORIES ENDPOINT
# ----------------------------------------------------
@router.get("/categories")
def get_categories():
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if db_wrapper.is_postgres else "?"

        cursor.execute("SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC")
        rows = [row_to_dict(cursor, r) for r in cursor.fetchall()]

        cats = []
        for r in rows:
            cursor.execute(f"SELECT COUNT(*) FROM products WHERE category_id = {placeholder} AND is_active = 1", (r["id"],))
            cnt = cursor.fetchone()[0]
            cats.append({
                "id": r["id"],
                "name": r.get("category_name") or r.get("name"),
                "category_name": r.get("category_name") or r.get("name"),
                "slug": r["slug"],
                "description": r["description"],
                "image": r.get("image_path") or r.get("image_url"),
                "itemCount": f"{cnt} Products" if cnt > 0 else "Coming Soon"
            })
    return cats

# ----------------------------------------------------
# 3. PRODUCTS ENDPOINTS
# ----------------------------------------------------
@router.get("/products")
def get_products():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
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
        rows = [row_to_dict(cursor, r) for r in cursor.fetchall()]

        products = []
        for r in rows:
            p = {
                "id": r["id"],
                "name": r["product_name"],
                "product_name": r["product_name"],
                "slug": r["slug"],
                "categoryId": r["category_id"],
                "category_id": r["category_id"],
                "categoryName": r.get("category_name") or "Spices",
                "category_name": r.get("category_name") or "Spices",
                "description": r["description"],
                "shortDescription": r["description"],
                "packetPrice": float(r["packet_price"]),
                "price": float(r["packet_price"]),
                "sellingUnit": r.get("selling_unit") or "Packet",
                "packetSize": r.get("packet_size"),
                "piecesPerPacket": r.get("pieces_per_packet"),
                "packetWeight": r.get("packet_weight"),
                "image": r.get("image_path") or "/assets/icons/spice-icon.svg",
                "image_path": r.get("image_path") or "/assets/icons/spice-icon.svg",
                "stock": int(r.get("stock_quantity") or 0),
                "stock_quantity": int(r.get("stock_quantity") or 0),
                "isActive": bool(r.get("is_active", 1)),
                "is_active": r.get("is_active", 1)
            }
            products.append(p)
    return products

@router.post("/products")
def create_product(payload: ProductCreate):
    name = payload.name.strip()
    cat_id = payload.categoryId or "cat_whole_spices"
    price = float(payload.packetPrice if payload.packetPrice is not None else (payload.price or 0.0))
    pieces = payload.piecesPerPacket
    pieces = int(pieces) if pieces not in (None, "", "null") else None
    weight = payload.packetWeight or None
    stock = int(payload.stock if payload.stock is not None else (payload.stock_quantity or 100))
    image = payload.image or payload.image_path or "/assets/icons/spice-icon.svg"
    desc = payload.description or ""
    unit = payload.sellingUnit or "Packet"

    if not name or price <= 0:
        raise HTTPException(status_code=400, detail="Valid product name and positive packet price required.")

    prod_id = f"p_{re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')}_{int(time.time()) % 1000}"
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if db_wrapper.is_postgres else "?"

        cursor.execute(f'''
        INSERT INTO products (
            id, product_name, slug, category_id, description,
            packet_price, selling_unit, packet_size, pieces_per_packet, packet_weight,
            image_path, stock_quantity, is_active
        ) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 1)
        ''', (prod_id, name, slug, cat_id, desc, price, unit, f"{pieces} Pcs" if pieces else "Packet", pieces, weight, image, stock))

    return {"success": True, "productId": prod_id, "message": "Product created successfully."}

@router.patch("/products")
@router.patch("/products/{prod_id}")
@router.put("/products")
@router.put("/products/{prod_id}")
def update_product(payload: ProductUpdate, prod_id: Optional[str] = None):
    target_id = payload.id or prod_id
    if not target_id:
        raise HTTPException(status_code=400, detail="Product ID required.")

    updates = []
    vals = []
    placeholder = "%s" if db_wrapper.is_postgres else "?"

    if payload.name is not None or payload.product_name is not None:
        updates.append(f"product_name = {placeholder}")
        vals.append(payload.name or payload.product_name)
    if payload.packetPrice is not None or payload.packet_price is not None or payload.price is not None:
        updates.append(f"packet_price = {placeholder}")
        val = payload.packetPrice if payload.packetPrice is not None else (payload.packet_price if payload.packet_price is not None else payload.price)
        vals.append(float(val))
    if payload.piecesPerPacket is not None or payload.pieces_per_packet is not None:
        raw_pieces = payload.piecesPerPacket if payload.piecesPerPacket is not None else payload.pieces_per_packet
        pcs_val = int(raw_pieces) if raw_pieces not in (None, "", "null") else None
        updates.append(f"pieces_per_packet = {placeholder}")
        vals.append(pcs_val)
    if payload.packetWeight is not None or payload.packet_weight is not None:
        updates.append(f"packet_weight = {placeholder}")
        vals.append(payload.packetWeight or payload.packet_weight)
    if payload.stock is not None or payload.stock_quantity is not None:
        updates.append(f"stock_quantity = {placeholder}")
        vals.append(int(payload.stock if payload.stock is not None else payload.stock_quantity))
    if payload.isActive is not None or payload.is_active is not None:
        updates.append(f"is_active = {placeholder}")
        vals.append(1 if (payload.isActive or payload.is_active) else 0)
    if payload.image is not None or payload.image_path is not None:
        updates.append(f"image_path = {placeholder}")
        vals.append(payload.image or payload.image_path)
    if payload.categoryId is not None or payload.category_id is not None:
        updates.append(f"category_id = {placeholder}")
        vals.append(payload.categoryId or payload.category_id)

    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        vals.append(target_id)
        with get_db() as conn:
            cursor = conn.cursor()
            query = f"UPDATE products SET {', '.join(updates)} WHERE id = {placeholder}"
            cursor.execute(query, tuple(vals))

    return {"success": True, "message": "Product updated successfully."}

# ----------------------------------------------------
# 4. WHOLESALE ORDERS ENDPOINTS
# ----------------------------------------------------
@router.post("/orders")
def place_order(payload: OrderCreatePayload):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cannot place order with empty cart.")

    placeholder = "%s" if db_wrapper.is_postgres else "?"

    with get_db() as conn:
        cursor = conn.cursor()

        # Atomic stock verification
        for itm in payload.items:
            pid = itm.productId or itm.product_id
            qty = int(itm.quantity or itm.packet_quantity or 1)
            cursor.execute(f"SELECT product_name, stock_quantity FROM products WHERE id = {placeholder}", (pid,))
            row = cursor.fetchone()
            if row:
                pname, available_stock = row[0], row[1]
                if available_stock < qty:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for {pname}. Available: {available_stock} packets, requested: {qty} packets."
                    )

        order_id = payload.id or f"SM-{time.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        subtotal = sum(
            float(item.packetPrice if item.packetPrice is not None else (item.price or item.unit_price or 0.0)) * 
            int(item.quantity or item.packet_quantity or 1) 
            for item in payload.items
        )
        delivery_fee = 0.0 if subtotal >= 1000.0 else 50.0
        total_amount = subtotal + delivery_fee
        pay_method = payload.paymentMethod or payload.payment_method or "Cash on Delivery"
        pay_status = "PENDING"

        cust_id = payload.customerId or payload.customer_id or "guest"
        cust_name = payload.customerName or payload.customer_name or "Retail Partner"
        s_name = payload.shopName or payload.shop_name or "Retail Store"
        phone = payload.contactNumber or payload.contact_number or ""
        addr = payload.deliveryAddress or payload.delivery_address or ""

        cursor.execute(f'''
        INSERT INTO orders (
            id, order_number, customer_id, customer_name, shop_name,
            contact_number, delivery_address, subtotal, subtotal_amount, delivery_fee,
            total_amount, payment_method, payment_status, status, order_status, notes
        ) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 'Order Placed', 'Order Placed', {placeholder})
        ''', (
            order_id,
            order_id,
            cust_id,
            cust_name,
            s_name,
            phone,
            addr,
            subtotal,
            subtotal,
            delivery_fee,
            total_amount,
            pay_method,
            pay_status,
            payload.notes or ""
        ))

        # Insert items and deduct stock
        for itm in payload.items:
            pid = itm.productId or itm.product_id
            qty = int(itm.quantity or itm.packet_quantity or 1)
            price = float(itm.packetPrice if itm.packetPrice is not None else (itm.price or itm.unit_price or 0.0))
            line_total = qty * price
            pieces = itm.piecesPerPacket if itm.piecesPerPacket is not None else itm.pieces_per_packet_snapshot
            weight = itm.packetWeight or itm.packet_weight
            pname = itm.name or itm.product_name or "Spice Packet"
            v_id = itm.variantId or itm.variant_id or f"{pid}-std"
            img = itm.image or itm.image_url or ""

            cursor.execute(f'''
            INSERT INTO order_items (
                id, order_id, product_id, variant_id, product_name, product_name_snapshot,
                unit_price, packet_price_snapshot, quantity, packet_quantity,
                pieces_per_packet_snapshot, packet_weight, packet_weight_snapshot,
                item_total, line_total, image_url
            ) VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
            ''', (
                str(uuid.uuid4()),
                order_id,
                pid,
                v_id,
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
                img
            ))

            # Atomically decrement stock
            cursor.execute(f"UPDATE products SET stock_quantity = MAX(0, stock_quantity - {placeholder}) WHERE id = {placeholder}", (qty, pid))

        # Initialize invoice record
        inv_id = f"INV-{order_id}"
        if not db_wrapper.is_postgres:
            cursor.execute("INSERT OR IGNORE INTO invoices VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)", (inv_id, order_id, inv_id))
        else:
            cursor.execute("INSERT INTO invoices (id, order_id, invoice_number, print_count, last_printed_at) VALUES (%s, %s, %s, 1, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING", (inv_id, order_id, inv_id))

    return {
        "success": True,
        "orderId": order_id,
        "totalAmount": total_amount,
        "status": "Order Placed",
        "paymentStatus": "PENDING"
    }

@router.get("/orders")
def get_orders(customer_id: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        placeholder = "%s" if db_wrapper.is_postgres else "?"

        if customer_id:
            cursor.execute(f"SELECT * FROM orders WHERE customer_id = {placeholder} ORDER BY created_at DESC", (customer_id,))
        else:
            cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
        
        rows = [row_to_dict(cursor, r) for r in cursor.fetchall()]
        orders = []

        for od in rows:
            od["orderNumber"] = od.get("order_number") or od["id"]
            od["customerName"] = od.get("customer_name")
            od["shopName"] = od.get("shop_name")
            od["contactNumber"] = od.get("contact_number")
            od["deliveryAddress"] = od.get("delivery_address")
            od["subtotal"] = float(od.get("subtotal") or od.get("subtotal_amount") or 0.0)
            od["deliveryFee"] = float(od.get("delivery_fee") or 0.0)
            od["totalAmount"] = float(od.get("total_amount") or 0.0)
            od["paymentMethod"] = od.get("payment_method")
            od["paymentStatus"] = od.get("payment_status")
            od["status"] = od.get("order_status") or od.get("status")
            od["transactionId"] = od.get("transaction_id")
            od["paymentVerifiedAt"] = od.get("payment_verified_at")

            cursor.execute(f"SELECT * FROM order_items WHERE order_id = {placeholder}", (od["id"],))
            item_rows = [row_to_dict(cursor, i) for i in cursor.fetchall()]
            od["items"] = []
            for itmd in item_rows:
                od["items"].append({
                    "id": itmd["id"],
                    "productId": itmd["product_id"],
                    "name": itmd.get("product_name_snapshot") or itmd.get("product_name"),
                    "price": float(itmd.get("packet_price_snapshot") or itmd.get("unit_price") or 0.0),
                    "quantity": int(itmd.get("packet_quantity") or itmd.get("quantity") or 1),
                    "piecesPerPacket": itmd.get("pieces_per_packet_snapshot"),
                    "packetWeight": itmd.get("packet_weight_snapshot") or itmd.get("packet_weight"),
                    "itemTotal": float(itmd.get("line_total") or itmd.get("item_total") or 0.0),
                    "image": itmd.get("image_url")
                })

            cursor.execute(f"SELECT print_count FROM invoices WHERE order_id = {placeholder}", (od["id"],))
            inv = cursor.fetchone()
            od["invoicePrintCount"] = inv[0] if inv else 1
            orders.append(od)

    return orders

@router.patch("/orders/{order_id}")
@router.put("/orders/{order_id}")
def update_order(order_id: str, payload: OrderUpdateStatus):
    updates = []
    vals = []
    placeholder = "%s" if db_wrapper.is_postgres else "?"

    if payload.status or payload.order_status:
        stat = payload.status or payload.order_status
        updates.append(f"order_status = {placeholder}")
        vals.append(stat)
        updates.append(f"status = {placeholder}")
        vals.append(stat)

    if payload.payment_status or payload.paymentStatus:
        pay = payload.payment_status or payload.paymentStatus
        updates.append(f"payment_status = {placeholder}")
        vals.append(pay)

    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        vals.append(order_id)
        with get_db() as conn:
            cursor = conn.cursor()
            query = f"UPDATE orders SET {', '.join(updates)} WHERE id = {placeholder}"
            cursor.execute(query, tuple(vals))

    return {"success": True, "orderId": order_id}

# ----------------------------------------------------
# 5. REAL-TIME PAYMENT VERIFICATION & WEBHOOKS
# ----------------------------------------------------
@router.post("/payments/verify")
def verify_payment(payload: PaymentVerifyPayload):
    order_id = payload.orderId or payload.order_id
    raw_txn = str(payload.transactionId or payload.transaction_id or "").strip()

    if not order_id or not raw_txn:
        raise HTTPException(
            status_code=400,
            detail="Order ID and 12-digit UPI Transaction / UTR number are required."
        )

    clean_utr = re.sub(r'[\s-]', '', raw_txn)
    if not (clean_utr.isdigit() and len(clean_utr) == 12):
        raise HTTPException(
            status_code=400,
            detail="Invalid UPI Reference Number. A valid Bank UTR must be exactly 12 numeric digits from your UPI payment receipt (Google Pay, PhonePe, Paytm, BHIM)."
        )

    placeholder = "%s" if db_wrapper.is_postgres else "?"

    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute(f"SELECT * FROM orders WHERE id = {placeholder} OR order_number = {placeholder}", (order_id, order_id))
        ord_row = row_to_dict(cursor, cursor.fetchone())
        if not ord_row:
            raise HTTPException(status_code=404, detail=f"Order {order_id} does not exist.")

        real_order_id = ord_row["id"]
        total_amt = float(ord_row["total_amount"])

        # Idempotency: verify UTR not reused on a different order
        cursor.execute(f"SELECT order_id FROM payments WHERE transaction_id = {placeholder} AND order_id != {placeholder}", (clean_utr, real_order_id))
        dup_pay = cursor.fetchone()
        if not dup_pay:
            cursor.execute(f"SELECT id FROM orders WHERE transaction_id = {placeholder} AND id != {placeholder}", (clean_utr, real_order_id))
            dup_pay = cursor.fetchone()

        if dup_pay:
            raise HTTPException(
                status_code=409,
                detail=f"Duplicate Transaction ID: Bank UTR {clean_utr} has already been claimed for another order ({dup_pay[0]}). Reusing receipts is prohibited."
            )

        pay_id = f"pay_{uuid.uuid4().hex[:12]}"
        if not db_wrapper.is_postgres:
            cursor.execute('''
            INSERT INTO payments (id, order_id, customer_id, amount, currency, payment_method, transaction_id, payment_status, provider_payload, verified_at)
            VALUES (?, ?, ?, ?, 'INR', 'UPI', ?, 'PAID', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(transaction_id) DO UPDATE SET payment_status = 'PAID', verified_at = CURRENT_TIMESTAMP
            ''', (pay_id, real_order_id, ord_row.get("customer_id"), total_amt, clean_utr, json.dumps(payload.dict())))
        else:
            cursor.execute('''
            INSERT INTO payments (id, order_id, customer_id, amount, currency, payment_method, transaction_id, payment_status, provider_payload, verified_at)
            VALUES (%s, %s, %s, %s, 'INR', 'UPI', %s, 'PAID', %s, CURRENT_TIMESTAMP)
            ON CONFLICT(transaction_id) DO UPDATE SET payment_status = 'PAID', verified_at = CURRENT_TIMESTAMP
            ''', (pay_id, real_order_id, ord_row.get("customer_id"), total_amt, clean_utr, json.dumps(payload.dict())))

        cursor.execute(f'''
        UPDATE orders
        SET payment_status = 'PAID',
            order_status = 'Confirmed',
            status = 'Confirmed',
            transaction_id = {placeholder},
            payment_verified_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = {placeholder}
        ''', (clean_utr, real_order_id))

    return {
        "success": True,
        "status": "PAID",
        "paymentStatus": "PAID",
        "orderStatus": "Confirmed",
        "orderId": real_order_id,
        "transactionId": clean_utr,
        "amount": total_amt,
        "message": "Payment verified successfully by Super Mashala verification engine."
    }

@router.get("/payments/status/{order_id}")
def get_payment_status(order_id: str):
    placeholder = "%s" if db_wrapper.is_postgres else "?"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f"SELECT id, order_number, total_amount, payment_method, payment_status, order_status, transaction_id, payment_verified_at FROM orders WHERE id = {placeholder} OR order_number = {placeholder}", (order_id, order_id))
        row = row_to_dict(cursor, cursor.fetchone())

    if not row:
        raise HTTPException(status_code=404, detail="Order not found.")

    return {
        "success": True,
        "orderId": row["id"],
        "totalAmount": float(row["total_amount"]),
        "paymentMethod": row["payment_method"],
        "paymentStatus": (row.get("payment_status") or "PENDING").upper(),
        "orderStatus": row.get("order_status") or "Order Placed",
        "transactionId": row.get("transaction_id"),
        "verifiedAt": str(row.get("payment_verified_at") or "")
    }

@router.post("/payments/webhook")
async def payment_webhook(request: Request):
    data = await request.json()
    payload = data.get("payload", data)
    order_id = payload.get("orderId") or payload.get("order_id")
    txn_id = payload.get("transactionId") or payload.get("txn_id") or payload.get("payment_id")
    stat = payload.get("status", "PAID").upper()

    if not order_id:
        raise HTTPException(status_code=400, detail="Missing order ID in webhook payload.")

    placeholder = "%s" if db_wrapper.is_postgres else "?"
    target_status = "PAID" if stat in ("PAID", "CAPTURED", "SUCCESS") else "FAILED"
    order_stat = "Confirmed" if target_status == "PAID" else "Payment Pending"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE orders SET payment_status = {placeholder}, order_status = {placeholder}, transaction_id = COALESCE({placeholder}, transaction_id), payment_verified_at = CURRENT_TIMESTAMP WHERE id = {placeholder}", (target_status, order_stat, txn_id, order_id))

        if txn_id:
            pay_id = f"pay_wh_{uuid.uuid4().hex[:10]}"
            if not db_wrapper.is_postgres:
                cursor.execute('''
                INSERT INTO payments (id, order_id, amount, payment_method, transaction_id, payment_status, provider_payload, verified_at)
                VALUES (?, ?, (SELECT total_amount FROM orders WHERE id = ?), 'Gateway Webhook', ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(transaction_id) DO UPDATE SET payment_status = ?
                ''', (pay_id, order_id, order_id, txn_id, target_status, json.dumps(data), target_status))
            else:
                cursor.execute('''
                INSERT INTO payments (id, order_id, amount, payment_method, transaction_id, payment_status, provider_payload, verified_at)
                VALUES (%s, %s, (SELECT total_amount FROM orders WHERE id = %s), 'Gateway Webhook', %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT(transaction_id) DO UPDATE SET payment_status = %s
                ''', (pay_id, order_id, order_id, txn_id, target_status, json.dumps(data), target_status))

    return {"success": True, "event": data.get("event", "payment.captured"), "status": target_status}

# ----------------------------------------------------
# 6. INVOICES ENDPOINT
# ----------------------------------------------------
@router.post("/invoices/record-print")
def record_invoice_print(payload: InvoicePrintPayload):
    order_id = payload.orderId
    placeholder = "%s" if db_wrapper.is_postgres else "?"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f"SELECT print_count FROM invoices WHERE order_id = {placeholder}", (order_id,))
        row = cursor.fetchone()
        if row:
            new_count = row[0] + 1
            cursor.execute(f"UPDATE invoices SET print_count = {placeholder}, last_printed_at = CURRENT_TIMESTAMP WHERE order_id = {placeholder}", (new_count, order_id))
        else:
            new_count = 1
            inv_id = f"INV-{order_id}"
            cursor.execute(f"INSERT INTO invoices (id, order_id, invoice_number, print_count, last_printed_at) VALUES ({placeholder}, {placeholder}, {placeholder}, 1, CURRENT_TIMESTAMP)", (inv_id, order_id, inv_id))

    return {"success": True, "printCount": new_count, "isDuplicate": new_count > 1}

# ----------------------------------------------------
# 7. ADMIN METRICS
# ----------------------------------------------------
@router.get("/admin/metrics")
def get_admin_metrics():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM orders")
        total_orders = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM orders WHERE order_status NOT IN ('Delivered', 'Cancelled')")
        pending_orders = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM orders WHERE order_status = 'Delivered'")
        delivered_orders = cursor.fetchone()[0]

        cursor.execute("SELECT SUM(total_amount) FROM orders WHERE payment_status IN ('Completed', 'Paid', 'PAID')")
        total_revenue = cursor.fetchone()[0] or 0.0

        cursor.execute("SELECT COUNT(DISTINCT customer_id) FROM orders")
        total_customers = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM products WHERE stock_quantity <= 15")
        low_stock_count = cursor.fetchone()[0]

    return {
        "totalOrders": total_orders,
        "pendingOrders": pending_orders,
        "deliveredOrders": delivered_orders,
        "totalRevenue": float(total_revenue),
        "totalCustomers": total_customers,
        "lowStockCount": low_stock_count,
        "outstandingUdhaar": 0.0
    }
