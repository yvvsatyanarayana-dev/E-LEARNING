from sqlalchemy.orm import Session
from Models.MailMessage import MailMessage
from Models.User import User
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime

class MailService:
    @staticmethod
    def get_inbox(db: Session, user_id: int) -> List[dict]:
        messages = (
            db.query(MailMessage)
            .filter(MailMessage.receiver_id == user_id)
            .filter(MailMessage.deleted_by_receiver == False)
            .filter(MailMessage.is_draft == False)
            .order_by(MailMessage.created_at.desc())
            .all()
        )
        
        result = []
        for msg in messages:
            sender = db.query(User).filter(User.id == msg.sender_id).first()
            result.append({
                "id": msg.id,
                "sender_id": msg.sender_id,
                "sender_name": sender.full_name if sender else "System",
                "sender_email": sender.email if sender else "system@smartcampus.edu",
                "subject": msg.subject,
                "body": msg.body,
                "is_read": msg.is_read,
                "created_at": msg.created_at,
                "attachment_url": msg.attachment_url
            })
        return result

    @staticmethod
    def get_sent_messages(db: Session, user_id: int) -> List[dict]:
        messages = (
            db.query(MailMessage)
            .filter(MailMessage.sender_id == user_id)
            .filter(MailMessage.deleted_by_sender == False)
            .filter(MailMessage.is_draft == False)
            .order_by(MailMessage.created_at.desc())
            .all()
        )
        
        result = []
        for msg in messages:
            receiver = db.query(User).filter(User.id == msg.receiver_id).first()
            result.append({
                "id": msg.id,
                "receiver_id": msg.receiver_id,
                "receiver_name": receiver.full_name if receiver else "Unknown",
                "receiver_email": receiver.email if receiver else "unknown@smartcampus.edu",
                "subject": msg.subject,
                "body": msg.body,
                "created_at": msg.created_at,
                "attachment_url": msg.attachment_url
            })
        return result

    @staticmethod
    def send_message(db: Session, sender_id: int, to_email: str, subject: str, body: str, is_draft: bool = False):
        receiver = db.query(User).filter(User.email == to_email).first()
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email {to_email} not found"
            )
        
        new_msg = MailMessage(
            sender_id=sender_id,
            receiver_id=receiver.id,
            subject=subject,
            body=body,
            is_draft=is_draft
        )
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)
        return new_msg

    @staticmethod
    def mark_as_read(db: Session, user_id: int, message_id: int):
        msg = db.query(MailMessage).filter(MailMessage.id == message_id, MailMessage.receiver_id == user_id).first()
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        
        msg.is_read = True
        db.commit()
        return {"status": "success"}

    @staticmethod
    def delete_message(db: Session, user_id: int, message_id: int):
        msg = db.query(MailMessage).filter(MailMessage.id == message_id).first()
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        
        if msg.sender_id == user_id:
            msg.deleted_by_sender = True
        if msg.receiver_id == user_id:
            msg.deleted_by_receiver = True
            
        # If both deleted or it's a draft and sender deleted it, we could hard delete, 
        # but soft delete is safer.
        db.commit()
        return {"status": "success"}

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        return db.query(MailMessage).filter(
            MailMessage.receiver_id == user_id,
            MailMessage.is_read == False,
            MailMessage.deleted_by_receiver == False,
            MailMessage.is_draft == False
        ).count()
