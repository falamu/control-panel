from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class HealthSummary(Base):
    __tablename__ = "health_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resting_hr = Column(Integer, nullable=True)
    average_sleep_hours = Column(Integer, nullable=True)
    training_load = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    last_sync_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="health_summary")
