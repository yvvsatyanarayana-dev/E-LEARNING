from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Core.Database import get_db
from Service.MailService import MailService
from Models.User import User
from typing import List, Optional
from pydantic import BaseModel
from Core.Security import get_current_user

router = APIRouter(prefix="/mail", tags=["Mail"])

class MessageCreate(BaseModel):
    to_email: str
    subject: str
    body: str

@router.get("/inbox")
def get_inbox(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MailService.get_inbox(db, current_user.id)

@router.get("/sent")
def get_sent(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MailService.get_sent_messages(db, current_user.id)

@router.post("/send")
def send_message(data: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MailService.send_message(db, current_user.id, data.to_email, data.subject, data.body)

@router.patch("/{message_id}/read")
def mark_read(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MailService.mark_as_read(db, current_user.id, message_id)

@router.delete("/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MailService.delete_message(db, current_user.id, message_id)

@router.get("/unread/count")
def get_unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"count": MailService.get_unread_count(db, current_user.id)}
