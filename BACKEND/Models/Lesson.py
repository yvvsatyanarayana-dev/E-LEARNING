from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from Core.Database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id          = Column(Integer, primary_key=True, index=True)
    course_id   = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title       = Column(String(200), nullable=False)
    video_url   = Column(String(500), nullable=True)
    pdf_url     = Column(String(500), nullable=True)
    duration    = Column(String(50), nullable=True) # e.g. "45m"
    is_completed = Column(Boolean, default=False)
    order       = Column(Integer, default=1)
    created_at  = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    course        = relationship("Course", back_populates="lessons")
    watch_history = relationship("WatchHistory", back_populates="lesson")

    def __repr__(self):
        return f"<Lesson {self.title}>"


class WatchHistory(Base):
    __tablename__ = "watch_history"

    id                  = Column(Integer, primary_key=True, index=True)
    student_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id           = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    watch_time_seconds  = Column(Integer, default=0)
    completed           = Column(Boolean, default=False)
    watched_at          = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="watch_history")
    lesson  = relationship("Lesson", back_populates="watch_history")

    def __repr__(self):
        return f"<WatchHistory student={self.student_id} lesson={self.lesson_id}>"
