from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from Core.Database import Base
import enum


class ApplicationStatus(str, enum.Enum):
    applied  = "applied"
    selected = "selected"
    rejected = "rejected"


class SkillScore(Base):
    __tablename__ = "skill_scores"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    score      = Column(Float, default=0.0)   # 0 to 100
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="skill_scores")

    def __repr__(self):
        return f"<SkillScore {self.skill_name}={self.score} student={self.student_id}>"


class PlacementReadiness(Base):
    __tablename__ = "placement_readiness"

    id                    = Column(Integer, primary_key=True, index=True)
    student_id            = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    pri_score             = Column(Float, default=0.0)   # Placement Readiness Index 0-100
    mock_interviews_done  = Column(Integer, default=0)
    skills_completed      = Column(Integer, default=0)
    updated_at            = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="placement_readiness")

    def __repr__(self):
        return f"<PlacementReadiness student={self.student_id} pri={self.pri_score}>"


class Internship(Base):
    __tablename__ = "internships"

    id           = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    role         = Column(String(200), nullable=False)
    added_by     = Column(Integer, ForeignKey("users.id"), nullable=False)  # placement officer
    deadline     = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    added_by_user  = relationship("User", back_populates="internships_added")
    applications   = relationship("InternshipApplication", back_populates="internship")

    def __repr__(self):
        return f"<Internship {self.role} @ {self.company_name}>"


class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id             = Column(Integer, primary_key=True, index=True)
    internship_id  = Column(Integer, ForeignKey("internships.id"), nullable=False)
    student_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    status         = Column(Enum(ApplicationStatus), default=ApplicationStatus.applied)
    applied_at     = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    internship = relationship("Internship", back_populates="applications")
    student    = relationship("User", back_populates="internship_applications")

    def __repr__(self):
        return f"<InternshipApplication student={self.student_id} status={self.status}>"
