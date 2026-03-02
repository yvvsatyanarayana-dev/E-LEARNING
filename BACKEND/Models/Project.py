from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from Core.Database import Base
import enum


class ProjectStatus(str, enum.Enum):
    pending  = "pending"
    reviewed = "reviewed"
    approved = "approved"


class Project(Base):
    __tablename__ = "projects"

    id           = Column(Integer, primary_key=True, index=True)
    student_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id    = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title        = Column(String(200), nullable=False)
    description  = Column(Text, nullable=True)
    repo_url     = Column(String(500), nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    status       = Column(Enum(ProjectStatus), default=ProjectStatus.pending)

    # Relationships
    student = relationship("User", back_populates="projects")
    course  = relationship("Course", back_populates="projects")
    reviews = relationship("ProjectReview", back_populates="project")

    def __repr__(self):
        return f"<Project {self.title} | {self.status}>"


class ProjectReview(Base):
    __tablename__ = "project_reviews"

    id              = Column(Integer, primary_key=True, index=True)
    project_id      = Column(Integer, ForeignKey("projects.id"), nullable=False)
    reviewed_by     = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback        = Column(Text, nullable=True)
    score           = Column(Float, nullable=True)
    reviewed_at     = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    project            = relationship("Project", back_populates="reviews")
    reviewed_by_user   = relationship("User", back_populates="project_reviews", foreign_keys=[reviewed_by])

    def __repr__(self):
        return f"<ProjectReview project={self.project_id} score={self.score}>"
