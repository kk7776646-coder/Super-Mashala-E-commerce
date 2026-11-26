from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import uvicorn

from .core.config import settings
from .database.session import init_db, check_db_health
from .api.endpoints import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database, execute migrations, and seed default records
    init_db()
    yield
    # Shutdown logic if needed

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="B2B Wholesale Ordering & Management Platform for Spices & Dry Fruits",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for frontend clients (Vite, Render, Vercel, Localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "brand": "SUPER MASHALA & DRY FRUITS",
        "description": "B2B Wholesale Spice & Dry Fruits Platform",
        "contact": settings.OWNER_PHONE,
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    db_health = check_db_health()
    return {
        "status": "healthy" if db_health["connected"] else "degraded",
        "database": {
            "status": "connected" if db_health["connected"] else "error",
            "provider": db_health.get("provider", "unknown")
        },
        "service": "super-mashala-backend",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
