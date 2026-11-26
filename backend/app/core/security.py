from datetime import datetime, timedelta
from typing import Optional, Any, Union, Dict
import hashlib
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx

from .config import settings

security_bearer = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    salt = "super_mashala_salt_2026"
    test_hash = hashlib.sha256((plain_password + salt).encode('utf-8')).hexdigest()
    return test_hash == hashed_password or plain_password == hashed_password

def get_password_hash(password: str) -> str:
    salt = "super_mashala_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies a Supabase Auth JWT token.
    1. First attempts local HS256 decode using JWT_SECRET_KEY.
    2. Falls back to validating via Supabase Auth API endpoint /auth/v1/user.
    """
    if not token or not isinstance(token, str):
        return None

    clean_token = token.strip()
    if clean_token.lower().startswith("bearer "):
        clean_token = clean_token[7:].strip()

    # 1. Local JWT verification
    if settings.JWT_SECRET_KEY:
        try:
            payload = jwt.decode(
                clean_token,
                settings.JWT_SECRET_KEY,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            user_id = payload.get("sub")
            if user_id:
                meta = payload.get("user_metadata") or {}
                return {
                    "id": user_id,
                    "sub": user_id,
                    "email": payload.get("email", ""),
                    "phone": payload.get("phone", ""),
                    "role": payload.get("role", "authenticated"),
                    "user_metadata": meta,
                    "full_name": meta.get("full_name") or meta.get("name") or "",
                    "shop_name": meta.get("shop_name", ""),
                    "delivery_address": meta.get("delivery_address", ""),
                    "city": meta.get("city", ""),
                    "area_locality": meta.get("area_locality", ""),
                }
        except Exception:
            pass

    # 2. Remote verification against Supabase Auth API
    supabase_url = settings.effective_supabase_url
    api_key = settings.SUPABASE_ANON_KEY or settings.effective_service_role_key
    if supabase_url and api_key:
        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.get(
                    f"{supabase_url}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {clean_token}",
                        "apikey": api_key
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    user_id = data.get("id")
                    meta = data.get("user_metadata") or {}
                    return {
                        "id": user_id,
                        "sub": user_id,
                        "email": data.get("email", ""),
                        "phone": data.get("phone", ""),
                        "role": data.get("role", "authenticated"),
                        "user_metadata": meta,
                        "full_name": meta.get("full_name") or meta.get("name") or "",
                        "shop_name": meta.get("shop_name", ""),
                        "delivery_address": meta.get("delivery_address", ""),
                        "city": meta.get("city", ""),
                        "area_locality": meta.get("area_locality", ""),
                    }
        except Exception:
            pass

    return None

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in before proceeding.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    user = verify_supabase_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[Dict[str, Any]]:
    if not credentials or not credentials.credentials:
        return None
    return verify_supabase_token(credentials.credentials)
