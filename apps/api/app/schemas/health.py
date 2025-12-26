from datetime import datetime
from pydantic import BaseModel


class HealthSummary(BaseModel):
    resting_hr: int | None = None
    average_sleep_hours: int | None = None
    training_load: int | None = None
    notes: str | None = None
    last_sync_at: datetime | None = None

    class Config:
        from_attributes = True
