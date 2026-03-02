from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from Core.Database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id          = Column(Integer, primary_key=True, index=True)
    course_id   = Column(Integer, ForeignKey("courses.id"), nullable=False)
    faculty_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    title       = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date    = Column(DateTime(timezone=True), nullable=True)
    created_at  = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    course      = relationship("Course", back_populates="assignments")
    faculty     = relationship("User", foreign_keys=[faculty_id])
    submissions = relationship("AssignmentSubmission", back_populates="assignment")

    def __repr__(self):
        return f"<Assignment {self.title}>"


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id            = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url      = Column(String(500), nullable=True)
    submitted_at  = Column(DateTime(timezone=True), default=datetime.utcnow)
    grade         = Column(Float, nullable=True)
    feedback      = Column(Text, nullable=True)

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student    = relationship("User", back_populates="assignment_submissions")

    def __repr__(self):
        return f"<Submission student={self.student_id} assignment={self.assignment_id}>"
