from sqlalchemy.orm import Session

from app.models.widget_layout import WidgetLayout
from app.models.user import User

DEFAULT_LAYOUT = [{"type": "health"}]


def get_for_user(db: Session, user: User) -> WidgetLayout:
    layout = db.query(WidgetLayout).filter(WidgetLayout.user_id == user.id).first()
    if layout:
        return layout
    layout = WidgetLayout(user_id=user.id, widgets=DEFAULT_LAYOUT)
    db.add(layout)
    db.commit()
    db.refresh(layout)
    return layout


def save_for_user(db: Session, user: User, widgets: list[dict]) -> WidgetLayout:
    layout = db.query(WidgetLayout).filter(WidgetLayout.user_id == user.id).first()
    if not layout:
        layout = WidgetLayout(user_id=user.id, widgets=widgets)
        db.add(layout)
    else:
        layout.widgets = widgets
    db.commit()
    db.refresh(layout)
    return layout
