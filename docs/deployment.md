# SUPER MASHALA & DRY FRUITS — DEPLOYMENT GUIDE

This guide explains how to deploy the platform to production:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase PostgreSQL

---

## 1. Database Setup on Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `database/schema.sql` from this repository, paste its contents into the SQL Editor, and click **Run**.
4. Open `database/seed.sql`, paste its contents, and click **Run** to seed products, variants, categories, and inventory.
5. In **Project Settings -> API**, copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (for backend only)

---

## 2. Backend Deployment on Render

1. Create an account at [https://render.com](https://render.com).
2. Click **New + -> Web Service** and connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `SECRET_KEY`: (A strong random secret string)
   - `ADMIN_INITIAL_PASSWORD`: (Set a strong admin password)
   - `ADMIN_RESET_OTP`: (Optional; set only when password recovery is configured)
   - `OWNER_PHONE`: `9527898176`
   - `UPI_ID`: `9527898176@upi`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`
   - `DATABASE_MODE`: `supabase`
5. Click **Deploy Web Service**.

---

## 3. Frontend Deployment on Vercel

1. Create an account at [https://vercel.com](https://vercel.com).
2. Click **Add New -> Project** and import your repository.
3. In Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
5. Click **Deploy**.

Your production B2B wholesale platform is now live!
