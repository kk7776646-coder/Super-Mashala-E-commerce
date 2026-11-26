# SUPER MASHALA & DRY FRUITS — B2B WHOLESALE ORDERING PLATFORM

> **Premium Indian Spices & Dry Fruits B2B E-Commerce Web Application**  
> Specially architected for grocery and retail shopkeepers to order stone-ground spices and premium dry fruits directly from the packaging depot.

---

## 1. Business Profile & Directives

- **Brand Name**: SUPER MASHALA & DRY FRUITS
- **Contact Number**: `+91 9527898176`
- **Business Model**: Direct B2B Wholesale Distribution
- **Target Audience**: Local retail grocery shopkeepers
- **Core Product Lines**: Pure Masala Powders, Whole Spices (Khada Masala), Master Blends, California Almonds, Jumbo Cashews, Afghan Raisins, Salted Pistachios.

### Strict Business Rules:
1. **Zero Udhaar / Credit Sales**: No credit or outstanding balances.
2. **Payment Methods**: Only **Cash on Delivery (Cash at Delivery)** and **UPI Transfer (QR Code)**.
3. **Fixed Wholesale Pricing**: Transparent fixed price rates per packet variant.
4. **Direct Delivery**: Fulfilled and delivered personally by the business owner.

---

## 2. Visual Design & Theme System

Inspired directly by the **Spice Story** aesthetic:
- **Warm Ivory / Cream Background**: `#FAF5EB`
- **Deep Maroon (Primary)**: `#641C19`
- **Dark Spiced Brown (Secondary)**: `#351B14`
- **Accent Gold**: `#C49A48`
- **Card Background**: `#FFFDF8`
- **Typography**: Playfair Display (Serif Headlines) + Plus Jakarta Sans (UI body)

---

## 3. Key Features

### For Retail Shopkeepers:
- **Shopkeeper Authentication**: Register with Shop Name, Proprietor Name, WhatsApp Mobile, Delivery Address, and Area.
- **Packet Size Selection**: Select from standard wholesale packaging variants:
  - `100g`, `250g`, `500g`, `1kg`
- **Wholesale Cart**: Automatic subtotal, free delivery above ₹1,000 threshold, live quantity adjustments.
- **Quick Checkout**: Verify store address, choose Cash on Delivery or scan dynamic UPI QR code.
- **Order Tracking**: Live lifecycle progression:
  1. *Order Placed*
  2. *Confirmed*
  3. *Packing*
  4. *Out for Delivery*
  5. *Delivered*
  6. *Cancelled*
- **1-Click Reorder**: Reorder weekly supplies directly from order history with a single tap.
- **Printable Wholesale Invoices**: Clean, printable delivery bills with itemized rates and signature fields.

### For Business Owner (Admin Dashboard):
- **Overview Metrics**: Gross revenue, total orders, pending packing tasks, registered shops.
- **Order Management**: Search by Order ID, filter by status, update payment status (Pending/Completed), update fulfillment status.
- **Product & Pricing Management**: Adjust fixed wholesale rates and packet stocks in real-time.
- **Inventory & Low Stock Alerts**: Automatic alert banners for items with 15 or fewer units remaining.
- **Customer Directory**: Complete contact and store address records for every registered retailer.
- **Sales Reports**: Volume and revenue analytics with 0% outstanding balance tracking.

---

## 4. Centralized Image Management

To allow seamless replacement of temporary images with your actual product photography:
- All product and category image paths are strictly centralized in:
  `frontend/src/constants/productImages.js`
- To replace an image, simply add your file to `frontend/public/assets/products/...` and update the registry key. Frontend components **never** hardcode image URLs!

---

## 5. Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Python 3, FastAPI, Uvicorn, Pydantic, SQLite (with Supabase PostgreSQL compatibility)
- **Database**:
  - `database/schema.sql` (PostgreSQL with Row Level Security & UUIDs for Supabase)
  - `database/seed.sql` (Full product catalog & variants)
- **Deployment Ready**:
  - Frontend: Vercel
  - Backend: Render
  - Database: Supabase

---

## 6. How to Run Locally

### Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
Accessible at: `http://localhost:5173`

### Start Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive API docs: `http://localhost:8000/docs`

---

## 7. Accounts and secrets

No demo passwords or default admin credentials are bundled. Create a shopkeeper account through registration. Configure the backend admin password and reset code through environment variables; never commit their values.
