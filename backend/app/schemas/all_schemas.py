from pydantic import BaseModel, Field
from typing import List, Optional, Any, Union

# Auth Schemas
class UserRegister(BaseModel):
    full_name: str
    shop_name: str
    mobile_number: str
    email: Optional[str] = None
    password: str
    delivery_address: str
    city: str = "Kolhapur"
    area_locality: str

class UserLogin(BaseModel):
    username: str # mobile or email
    password: str

class UserProfile(BaseModel):
    id: str
    full_name: str
    shop_name: str
    mobile_number: str
    email: Optional[str] = None
    delivery_address: Optional[str] = None
    city: Optional[str] = "Kolhapur"
    area_locality: Optional[str] = None
    role: str = "customer"

class AdminLogin(BaseModel):
    identifier: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = ""
    credential: Optional[str] = None

class AdminResetPassword(BaseModel):
    phone: str
    otp: str
    newPassword: str

class GoogleAuthPayload(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    sub: Optional[str] = None
    picture: Optional[str] = None

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    categoryId: str = "cat_whole_spices"
    packetPrice: Optional[float] = None
    price: Optional[float] = None
    piecesPerPacket: Optional[Any] = None
    packetWeight: Optional[str] = None
    stock: Optional[int] = 100
    stock_quantity: Optional[int] = None
    image: Optional[str] = None
    image_path: Optional[str] = None
    description: Optional[str] = ""
    sellingUnit: Optional[str] = "Packet"

class ProductUpdate(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    product_name: Optional[str] = None
    packetPrice: Optional[float] = None
    packet_price: Optional[float] = None
    price: Optional[float] = None
    piecesPerPacket: Optional[Any] = None
    pieces_per_packet: Optional[Any] = None
    packetWeight: Optional[str] = None
    packet_weight: Optional[str] = None
    stock: Optional[int] = None
    stock_quantity: Optional[int] = None
    isActive: Optional[bool] = None
    is_active: Optional[Any] = None
    image: Optional[str] = None
    image_path: Optional[str] = None
    categoryId: Optional[str] = None
    category_id: Optional[str] = None

# Order Schemas
class OrderItemPayload(BaseModel):
    productId: Optional[str] = None
    product_id: Optional[str] = None
    variantId: Optional[str] = None
    variant_id: Optional[str] = None
    name: Optional[str] = "Spice Packet"
    product_name: Optional[str] = None
    price: Optional[float] = 0.0
    packetPrice: Optional[float] = None
    unit_price: Optional[float] = None
    quantity: Optional[int] = 1
    packet_quantity: Optional[int] = None
    piecesPerPacket: Optional[Any] = None
    pieces_per_packet_snapshot: Optional[Any] = None
    packetWeight: Optional[str] = None
    packet_weight: Optional[str] = None
    itemTotal: Optional[float] = None
    item_total: Optional[float] = None
    line_total: Optional[float] = None
    image: Optional[str] = None
    image_url: Optional[str] = None

class OrderCreatePayload(BaseModel):
    id: Optional[str] = None
    customerId: Optional[str] = None
    customer_id: Optional[str] = None
    customerName: Optional[str] = None
    customer_name: Optional[str] = None
    shopName: Optional[str] = None
    shop_name: Optional[str] = None
    contactNumber: Optional[str] = None
    contact_number: Optional[str] = None
    deliveryAddress: Optional[str] = None
    delivery_address: Optional[str] = None
    paymentMethod: Optional[str] = None
    payment_method: Optional[str] = None
    items: List[OrderItemPayload]
    notes: Optional[str] = ""

class OrderUpdateStatus(BaseModel):
    status: Optional[str] = None
    order_status: Optional[str] = None
    payment_status: Optional[str] = None
    paymentStatus: Optional[str] = None

class PaymentVerifyPayload(BaseModel):
    orderId: Optional[str] = None
    order_id: Optional[str] = None
    transactionId: Optional[str] = None
    transaction_id: Optional[str] = None

class InvoicePrintPayload(BaseModel):
    orderId: str
