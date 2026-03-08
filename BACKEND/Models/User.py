from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, JSON
from sqlalchemy.orm import relationship
from Core.Database import Base
import enum


class UserRole(str, enum.Enum):
    student = "student"
    faculty = "faculty"
    placement_officer = "placement_officer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    is_active = Column(Boolean, default=True)
    phone = Column(String(20), nullable=True)
    bio = Column(String(500), nullable=True)
    avatar = Column(String(10), nullable=True)
    roll_number = Column(String(20), nullable=True)
    skills = Column(JSON, nullable=True) # ["Python", "React"]
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    # Relationships
    courses_created        = relationship("Course", back_populates="faculty", foreign_keys="Course.faculty_id")
    enrollments            = relationship("Enrollment", back_populates="student")
    watch_history          = relationship("WatchHistory", back_populates="student")
    assignment_submissions = relationship("AssignmentSubmission", back_populates="student")
    quiz_attempts          = relationship("QuizAttempt", back_populates="student")
    projects               = relationship("Project", back_populates="student")
    project_reviews        = relationship("ProjectReview", back_populates="reviewed_by_user")
    skill_scores           = relationship("SkillScore", back_populates="student")
    placement_readiness    = relationship("PlacementReadiness", back_populates="student", uselist=False)
    internships_added      = relationship("Internship", back_populates="added_by_user")
    internship_applications= relationship("InternshipApplication", back_populates="student")
    forum_posts            = relationship("ForumPost", back_populates="posted_by_user")
    study_group_members    = relationship("StudyGroupMember", back_populates="student")
    schedules              = relationship("Schedule", back_populates="student")
    mock_interviews        = relationship("MockInterview", back_populates="student")
    innovation_ideas       = relationship("InnovationIdea", back_populates="author")
    innovation_projects    = relationship("InnovationProject", back_populates="student")

    def __repr__(self):
        return f"<User {self.email} | {self.role}>"
