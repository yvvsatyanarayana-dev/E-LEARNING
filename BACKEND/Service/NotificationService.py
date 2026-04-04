from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from Models.Notification import Notification
from Sockets.MeetingSockets import sio
import logging # For tracking socket status

class NotificationService:
    @staticmethod
    async def create_notification(
        db: Session, 
        user_id: int | None, 
        type: str, 
        title: str, 
        message: str, 
        link: str | None = None,
        metadata_json: dict | None = None
    ):
        """
        Creates a notification in DB and emits via SocketIO.
        - user_id: ID of the targeted user (None for broadcast).
        - type: 'assignment_due', 'quiz_available', 'grade_posted', 'system_alert', etc.
        """
        new_notif = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            link=link,
            metadata_json=metadata_json,
            created_at=datetime.utcnow(),
            is_read=False
        )
        db.add(new_notif)
        db.commit()
        db.refresh(new_notif)

        # Emit real-time socket event
        notif_data = {
            "id": new_notif.id,
            "type": new_notif.type,
            "title": new_notif.title,
            "message": new_notif.message,
            "created_at": new_notif.created_at.isoformat(),
            "is_read": False,
            "metadata": metadata_json
        }

        try:
            if user_id:
                # Emit to private room for specific user
                # We'll need users to join their own room "user_{id}" on connect
                await sio.emit("new_notification", notif_data, room=f"user_{user_id}")
            else:
                # Broadcast to all
                await sio.emit("new_notification", notif_data)
        except Exception as e:
            logging.error(f"Socket emission failed: {e}")

        return new_notif

    @staticmethod
    def get_user_notifications(db: Session, user_id: int, limit: int = 50):
        """Fetches both user-specific and broadcast notifications."""
        from sqlalchemy import or_
        return db.query(Notification).filter(
            or_(Notification.user_id == user_id, Notification.user_id == None)
        ).order_by(desc(Notification.created_at)).limit(limit).all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: int):
        notif = db.query(Notification).filter(Notification.id == notification_id).first()
        if notif:
            notif.is_read = True
            db.commit()
        return notif

    @staticmethod
    def mark_all_read(db: Session, user_id: int):
        from sqlalchemy import or_
        db.query(Notification).filter(
            or_(Notification.user_id == user_id, Notification.user_id == None),
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return True

notification_service = NotificationService()
