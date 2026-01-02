from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import widget_layout as crud_layout
from app.db.deps import get_db
from app.schemas.widget_layout import WidgetLayout, WidgetLayoutResponse
from app.models.user import User

router = APIRouter(prefix="/widgets", tags=["widgets"])


def _layout_response(layout) -> WidgetLayoutResponse:
    return WidgetLayoutResponse(widgets=layout.widgets)


@router.get("/layout", response_model=WidgetLayoutResponse)
def get_layout(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    layout = crud_layout.get_for_user(db, current_user)
    return _layout_response(layout)


@router.post("/layout", response_model=WidgetLayoutResponse)
def save_layout(
    payload: WidgetLayout,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    layout = crud_layout.save_for_user(db, current_user, widgets=payload.widgets)
    return _layout_response(layout)
