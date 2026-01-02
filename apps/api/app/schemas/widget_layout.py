from pydantic import BaseModel
from typing import Any


class WidgetLayout(BaseModel):
    widgets: list[dict[str, Any]]


class WidgetLayoutResponse(WidgetLayout):
    pass
