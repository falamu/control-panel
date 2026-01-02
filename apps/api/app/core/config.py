from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Control Panel API"
    database_url: str = "sqlite:///./control-panel.db"
    secret_key: str = "super-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    redis_url: Optional[str] = None
    garmin_username: Optional[str] = None
    garmin_password: Optional[str] = None
    api_base_url: str = "http://localhost:8000"

    class Config:
        env_prefix = ""
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
