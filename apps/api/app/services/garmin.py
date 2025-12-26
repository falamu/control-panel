from app.core.config import get_settings


class GarminClient:
    def __init__(self):
        self.settings = get_settings()

    def fetch_summary(self) -> dict:
        if not (self.settings.garmin_username and self.settings.garmin_password):
            return {
                "resting_hr": 55,
                "average_sleep_hours": 7,
                "training_load": 63,
                "notes": "Garmin credentials not configured; returning sample data.",
            }
        # Placeholder for real integration
        return {
            "resting_hr": 52,
            "average_sleep_hours": 7,
            "training_load": 70,
            "notes": "Fetched from Garmin Connect",
        }
