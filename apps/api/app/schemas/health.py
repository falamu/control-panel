from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class HealthSummary(BaseModel):
    resting_hr: Optional[int] = None
    average_sleep_hours: Optional[int] = None
    training_load: Optional[int] = None
    notes: Optional[str] = None
    last_sync_at: Optional[datetime] = None

    class Config:
        from_attributes = True
