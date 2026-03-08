from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from Core.Database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id           = Column(Integer, primary_key=True, index=True)
    student_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    day          = Column(Integer, nullable=False) # 0-6 (Mon-Sun)
    start_h      = Column(Integer, nullable=False)
    start_m      = Column(Integer, nullable=False)
    duration_min = Column(Integer, nullable=False)
    subject      = Column(String(200), nullable=False)
    code         = Column(String(50), nullable=True)
    type         = Column(String(50), nullable=True) # lecture, lab, quiz, etc.
    faculty      = Column(String(100), nullable=True)
    room         = Column(String(100), nullable=True)
    batch        = Column(String(100), nullable=True)
    course_key   = Column(String(50), nullable=True) # OS, DBMS, etc.
    created_at   = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="schedules")

    def __repr__(self):
        return f"<Schedule {self.subject} student={self.student_id}>"
