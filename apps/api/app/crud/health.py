from datetime import datetime
from sqlalchemy.orm import Session

from app.models.health_summary import HealthSummary
from app.models.user import User


SAMPLE_DATA = {
    "resting_hr": 55,
    "average_sleep_hours": 7,
    "training_load": 63,
    "notes": "Sample data (connect Garmin for live metrics)",
    "last_sync_at": datetime.utcnow(),
}


def get_summary(db: Session, user: User) -> HealthSummary:
    summary = db.query(HealthSummary).filter(HealthSummary.user_id == user.id).first()
    if summary:
        return summary
    summary = HealthSummary(user_id=user.id, **SAMPLE_DATA)
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary
