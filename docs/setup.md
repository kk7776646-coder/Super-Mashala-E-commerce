# SUPER MASHALA & DRY FRUITS — LOCAL SETUP GUIDE

This document provides clear, step-by-step instructions to run the **SUPER MASHALA & DRY FRUITS** B2B Wholesale Ordering Platform on your local computer.

---

## 1. System Requirements
- **Node.js**: v18+ or v20+ (LTS)
- **Python**: v3.10+ or v3.11+
- **Browser**: Chrome, Edge, Firefox, or Safari (Modern Responsive Browser)

---

## 2. Directory Structure

```
super-mashala/
├── frontend/             # React + Vite + Tailwind CSS frontend application
│   ├── public/assets/    # Centralized images (logo, hero, products, categories)
│   ├── src/
│   │   ├── components/   # Modular UI components (Navbar, Hero, ProductCards, Modals)
│   │   ├── context/      # AuthContext, CartContext, OrderContext
│   │   ├── data/         # Products and categories seed data
│   │   ├── constants/    # Centralized productImages.js
│   │   └── pages/        # Admin dashboard and customer views
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/          # REST API endpoints (Auth, Orders, Products, Admin)
│   │   ├── core/         # Config and security
│   │   ├── database/     # Database session (SQLite & Supabase PostgreSQL)
│   │   └── main.py       # FastAPI application entrypoint
├── database/
│   ├── schema.sql        # Supabase PostgreSQL DDL with RLS & UUIDs
│   └── seed.sql          # Seed data for products, variants & inventory
└── docs/                 # Documentation
```

---

## 3. Quick Start (Frontend)

1. Open a terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 4. Quick Start (Backend)

1. Open a second terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux / Mac:
   source venv/bin/activate
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Run FastAPI with live reloading:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. Explore the interactive Swagger API documentation at:
   `http://localhost:8000/docs`

---

## 5. Accounts and secrets

No demo passwords or default admin credentials are bundled. Create a shopkeeper account through registration. Set `ADMIN_INITIAL_PASSWORD` and, if password reset is configured, `ADMIN_RESET_OTP` in the backend environment. Keep these values out of source control.

---

## 6. How to Replace Temporary Images

All image paths are centralized in:
`frontend/src/constants/productImages.js`

To replace any temporary photo with your actual high-resolution packet photography:
1. Place your new image file in `frontend/public/assets/products/masala/` or `frontend/public/assets/products/dry-fruits/`.
2. Update the corresponding key in `PRODUCT_IMAGES` inside `productImages.js`.
3. No UI components need to be modified!
