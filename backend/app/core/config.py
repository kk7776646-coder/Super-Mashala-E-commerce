import os
from typing import List, Union
import json
import re

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "SUPER MASHALA & DRY FRUITS")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_mashala_production_secret_key_2026_secured")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))  # 7 days
    
    # Business Contacts
    OWNER_PHONE: str = os.getenv("OWNER_PHONE", "9527898176")
    UPI_ID: str = os.getenv("UPI_ID", "9527898176@upi")
    
    # Admin Master Password & OTP
    ADMIN_INITIAL_PASSWORD: str = os.getenv("ADMIN_INITIAL_PASSWORD", "").strip()
    ADMIN_RESET_OTP: str = os.getenv("ADMIN_RESET_OTP", "").strip()
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip()
    DATABASE_MODE: str = os.getenv("DATABASE_MODE", "auto").strip()
    LOCAL_DB_FILE: str = os.getenv("LOCAL_DB_FILE", "super_mashala.db").strip()
    
    # Supabase Credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "").strip()
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    @property
    def effective_supabase_url(self) -> str:
        if self.SUPABASE_URL and self.SUPABASE_URL.startswith("http"):
            return self.SUPABASE_URL
        if self.DATABASE_URL and ("supabase.co" in self.DATABASE_URL or self.DATABASE_URL.startswith("http")):
            match = re.search(r"https?://[a-zA-Z0-9-]+\.supabase\.co", self.DATABASE_URL)
            if match:
                return match.group(0)
        return ""

    @property
    def effective_service_role_key(self) -> str:
        # Check SUPABASE_SERVICE_ROLE_KEY, then SECRET_KEY if it contains the service role key pattern
        for k in [self.SUPABASE_SERVICE_ROLE_KEY, self.SECRET_KEY]:
            if k and (k.startswith("sb_secret_") or len(k) > 40):
                return k
        return self.SUPABASE_SERVICE_ROLE_KEY or self.SECRET_KEY
    
    # CORS Origins
    @property
    def cors_origins(self) -> List[str]:
        raw = os.getenv("BACKEND_CORS_ORIGINS") or os.getenv("CORS_ORIGINS", "*")
        if not raw or raw.strip() == "*":
            return ["*"]
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

settings = Settings()
