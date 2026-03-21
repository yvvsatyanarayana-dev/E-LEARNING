from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from Core.Database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # null means broadcast to all
    type = Column(String(50), nullable=False) # assignment_due, quiz_available, grade_posted, system_alert, broadcast
    title = Column(String(200), nullable=False)
    message = Column(String(1000), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Optional metadata (e.g., entity_id like course_id, assignment_id)
    metadata_json = Column(JSON, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<Notification {self.title} | User: {self.user_id}>"
