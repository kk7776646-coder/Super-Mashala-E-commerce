from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .database.session import init_db
from .api.endpoints import router as api_router

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="B2B Wholesale Ordering & Management Platform for Spices & Dry Fruits",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend Vite & production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Initialize Database and seeds
@app.on_event("startup")
def on_startup():
    init_db()

# Include API Router
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "brand": "SUPER MASHALA & DRY FRUITS",
        "description": "B2B Wholesale Spice & Dry Fruits Platform",
        "contact": "9527898176",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
