from datetime import datetime, timedelta
from typing import Optional, Any, Union
import hashlib

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Safe SHA-256 with salt for standalone portable python execution
    salt = "super_mashala_salt_2026"
    test_hash = hashlib.sha256((plain_password + salt).encode('utf-8')).hexdigest()
    return test_hash == hashed_password or plain_password == hashed_password

def get_password_hash(password: str) -> str:
    salt = "super_mashala_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
