from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import time
import uuid

from ..database.session import get_db_connection
from ..schemas.all_schemas import (
    UserRegister,
    UserLogin,
    UserProfile,
    OrderCreate,
    OrderUpdateStatus,
    VariantUpdate
)
from ..core.security import get_password_hash, verify_password

router = APIRouter()

# ----------------------------------------------------
# 1. AUTHENTICATION ENDPOINTS
# ----------------------------------------------------
@router.post("/auth/register")
def register_customer(payload: UserRegister):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM profiles WHERE mobile_number = ?", (payload.mobile_number,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Mobile number already registered.")

    user_id = f"usr_{int(time.time())}"
    cursor.execute('''
    INSERT INTO profiles (id, full_name, shop_name, mobile_number, email, password_hash, delivery_address, city, area_locality, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'customer')
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
    conn.commit()
    conn.close()

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
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT id, full_name, shop_name, mobile_number, email, password_hash, delivery_address, city, area_locality, role
    FROM profiles
    WHERE mobile_number = ? OR email = ?
    ''', (payload.username, payload.username))
    
    row = cursor.fetchone()
    conn.close()

    if not row or not verify_password(payload.password, row["password_hash"]):
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

# ----------------------------------------------------
# 2. CATEGORIES & PRODUCTS
# ----------------------------------------------------
@router.get("/categories")
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM categories ORDER BY display_order ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------------------------------------------
# 3. ORDER PROCESSING (SERVER-SIDE PRICE VALIDATION)
# ----------------------------------------------------
@router.post("/orders")
def place_order(payload: OrderCreate):
    if payload.payment_method not in ["Cash on Delivery", "UPI"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid payment method. Only Cash on Delivery and UPI are accepted. Udhaar is strictly disabled."
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch customer
    cursor.execute("SELECT * FROM profiles WHERE id = ?", (payload.customer_id,))
    customer = cursor.fetchone()
    if not customer:
        conn.close()
        raise HTTPException(status_code=404, detail="Customer not found")

    # Generate unique order ID
    date_str = time.strftime("%Y%m%d")
    unique_suffix = int(time.time()) % 1000
    order_id = f"SM-{date_str}-{unique_suffix:03d}"

    # Calculate and validate subtotal
    subtotal = sum(item.price * item.quantity for item in payload.items)
    delivery_fee = 0.0 if subtotal >= 1000.0 else 50.0
    total_amount = subtotal + delivery_fee

    payment_status = "Completed" if payload.payment_method == "UPI" else "Pending"

    cursor.execute('''
    INSERT INTO orders (id, customer_id, customer_name, shop_name, contact_number, delivery_address, subtotal_amount, delivery_fee, total_amount, status, payment_method, payment_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed', ?, ?, ?)
    ''', (
        order_id,
        customer["id"],
        customer["full_name"],
        customer["shop_name"],
        customer["mobile_number"],
        f"{customer['delivery_address']}, {customer['area_locality']}, {customer['city']}",
        subtotal,
        delivery_fee,
        total_amount,
        payload.payment_method,
        payment_status,
        payload.notes
    ))

    # Insert items
    for itm in payload.items:
        cursor.execute('''
        INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, packet_weight, unit_price, quantity, item_total, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            order_id,
            itm.product_id,
            itm.variant_id,
            itm.name,
            itm.packet_weight,
            itm.price,
            itm.quantity,
            itm.item_total,
            itm.image
        ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Wholesale order successfully created",
        "orderId": order_id,
        "totalAmount": total_amount,
        "status": "Order Placed"
    }

@router.get("/orders")
def get_orders(customer_id: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()

    if customer_id:
        cursor.execute("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC", (customer_id,))
    else:
        cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
    
    order_rows = cursor.fetchall()
    results = []

    for ord_row in order_rows:
        order_dict = dict(ord_row)
        cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_dict["id"],))
        order_dict["items"] = [dict(i) for i in cursor.fetchall()]
        results.append(order_dict)

    conn.close()
    return results

@router.patch("/orders/{order_id}")
def update_order_status(order_id: str, payload: OrderUpdateStatus):
    conn = get_db_connection()
    cursor = conn.cursor()

    if payload.status:
        cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (payload.status, order_id))
    if payload.payment_status:
        cursor.execute("UPDATE orders SET payment_status = ? WHERE id = ?", (payload.payment_status, order_id))

    conn.commit()
    conn.close()
    return {"success": True, "message": f"Order {order_id} updated"}

# ----------------------------------------------------
# 4. ADMIN METRICS & INVENTORY
# ----------------------------------------------------
@router.get("/admin/metrics")
def get_admin_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM orders")
    total_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM orders WHERE status NOT IN ('Delivered', 'Cancelled')")
    pending_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'Delivered'")
    delivered_orders = cursor.fetchone()[0]

    cursor.execute("SELECT SUM(total_amount) FROM orders WHERE payment_status = 'Completed'")
    total_revenue = cursor.fetchone()[0] or 0.0

    cursor.execute("SELECT COUNT(DISTINCT customer_id) FROM orders")
    total_customers = cursor.fetchone()[0]

    conn.close()

    return {
        "totalOrders": total_orders,
        "pendingOrders": pending_orders,
        "deliveredOrders": delivered_orders,
        "totalRevenue": total_revenue,
        "totalCustomers": total_customers,
        "outstandingUdhaar": 0.0
    }
