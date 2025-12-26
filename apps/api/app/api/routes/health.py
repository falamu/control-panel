from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.crud import health as crud_health
from app.db.deps import get_db
from app.models.user import User
from app.schemas.health import HealthSummary

router = APIRouter(prefix="/health", tags=["health"])
settings = get_settings()


@router.get("/summary", response_model=HealthSummary)
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    summary = crud_health.get_summary(db, current_user)
    return HealthSummary.model_validate(summary)


@router.get("/ping")
def ping():
    return {"status": "ok", "environment": "local", "api_base_url": settings.api_base_url}
