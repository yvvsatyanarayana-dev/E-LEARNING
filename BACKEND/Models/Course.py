from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from Core.Database import Base


class Course(Base):
    __tablename__ = "courses"

    id          = Column(Integer, primary_key=True, index=True)
    faculty_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    title       = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    semester    = Column(String(20), nullable=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    faculty      = relationship("User", back_populates="courses_created", foreign_keys=[faculty_id])
    enrollments  = relationship("Enrollment", back_populates="course")
    lessons      = relationship("Lesson", back_populates="course")
    assignments  = relationship("Assignment", back_populates="course")
    quizzes      = relationship("Quiz", back_populates="course")
    projects     = relationship("Project", back_populates="course")
    forums       = relationship("Forum", back_populates="course")
    study_groups = relationship("StudyGroup", back_populates="course")

    def __repr__(self):
        return f"<Course {self.title}>"


class Enrollment(Base):
    __tablename__ = "enrollments"

    id          = Column(Integer, primary_key=True, index=True)
    student_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id   = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    progress    = Column(Float, default=0.0)  # 0.0 to 100.0

    # Relationships
    student = relationship("User", back_populates="enrollments")
    course  = relationship("Course", back_populates="enrollments")

    def __repr__(self):
        return f"<Enrollment student={self.student_id} course={self.course_id}>"
