from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from Core.Database import get_db
from Core.Security import get_current_user
from Models.User import User
from Service.NotificationService import NotificationService
from Schemas.StudentSchema import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])
notification_service = NotificationService()

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.get_user_notifications(db, current_user.id)

@router.post("/mark-all-read")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification_service.mark_all_read(db, current_user.id)
    return {"message": "All notifications marked as read"}

@router.post("/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification_service.mark_as_read(db, notif_id, current_user.id)
    return {"message": "Notification marked as read"}
