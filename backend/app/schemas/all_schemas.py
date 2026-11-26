from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

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
    delivery_address: str
    city: str
    area_locality: str
    role: str

# Variant & Product Schemas
class VariantSchema(BaseModel):
    id: str
    packet_weight: str
    weight_in_grams: int
    fixed_wholesale_price: float
    sku: Optional[str] = None
    stock: int = 50

class ProductSchema(BaseModel):
    id: str
    category_id: str
    name: str
    slug: str
    short_description: Optional[str] = None
    image_url: str
    is_featured: bool = False
    is_bestseller: bool = False
    variants: List[VariantSchema] = []

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: str
    variant_id: str
    name: str
    packet_weight: str
    price: float
    quantity: int
    item_total: float
    image: Optional[str] = None

class OrderCreate(BaseModel):
    customer_id: str
    payment_method: str # 'Cash on Delivery' or 'UPI'
    items: List[OrderItemCreate]
    notes: Optional[str] = ""

class OrderUpdateStatus(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None

class VariantUpdate(BaseModel):
    price: float
    stock: int
