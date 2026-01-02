import re
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.schemas.auth import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> TokenData:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    email: Optional[str] = payload.get("sub")
    return TokenData(email=email)


MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_BYTES = 72
SPECIAL_CHAR_PATTERN = re.compile(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/'`~]")


def password_validation_errors(password: str) -> list[str]:
    """Return a list of validation errors for the provided password."""
    errors: list[str] = []
    if len(password) < MIN_PASSWORD_LENGTH:
        errors.append(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long.")
    if len(password.encode("utf-8")) > MAX_PASSWORD_BYTES:
        errors.append(f"Password must be at most {MAX_PASSWORD_BYTES} bytes (~{MAX_PASSWORD_BYTES} ASCII characters) long.")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must include at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        errors.append("Password must include at least one lowercase letter.")
    if not re.search(r"\d", password):
        errors.append("Password must include at least one digit.")
    if not SPECIAL_CHAR_PATTERN.search(password):
        errors.append("Password must include at least one special character.")
    return errors
