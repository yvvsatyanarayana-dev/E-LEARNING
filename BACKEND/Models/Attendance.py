from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, Enum
from sqlalchemy.orm import relationship
from Core.Database import Base
import enum

class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent  = "absent"
    late    = "late"

class DailyAttendance(Base):
    __tablename__ = "daily_attendance"

    id          = Column(Integer, primary_key=True, index=True)
    student_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id   = Column(Integer, ForeignKey("courses.id"), nullable=False)
    faculty_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    date        = Column(Date, default=datetime.utcnow().date())
    status      = Column(Enum(AttendanceStatus), default=AttendanceStatus.present)
    remarks     = Column(String(200), nullable=True)
    created_at  = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    course  = relationship("Course")
    faculty = relationship("User", foreign_keys=[faculty_id])

    def __repr__(self):
        return f"<DailyAttendance student={self.student_id} course={self.course_id} date={self.date} status={self.status}>"
