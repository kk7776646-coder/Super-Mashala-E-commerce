import os

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SUPER MASHALA & DRY FRUITS")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Business Contacts
    OWNER_PHONE: str = os.getenv("OWNER_PHONE", "9527898176")
    UPI_ID: str = os.getenv("UPI_ID", "9527898176@upi")
    
    # Supabase (optional)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Database Mode
    DATABASE_MODE: str = os.getenv("DATABASE_MODE", "local")
    LOCAL_DB_FILE: str = os.getenv("LOCAL_DB_FILE", "super_mashala.db")

settings = Settings()
