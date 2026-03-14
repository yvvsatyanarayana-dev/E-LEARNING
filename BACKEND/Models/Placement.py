from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, JSON, Boolean
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
    communication_score   = Column(Float, default=0.0)
    aptitude_score        = Column(Float, default=0.0)
    resume_score          = Column(Float, default=0.0)
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
    domain       = Column(String(100), nullable=True) # Backend, Frontend, Full Stack, Data Science, etc.
    location     = Column(String(200), nullable=True) # Bengaluru, Remote, etc.
    stipend      = Column(String(100), nullable=True) # "₹2.4L / mo"
    duration     = Column(String(100), nullable=True) # "6 months"
    seats        = Column(Integer, nullable=True)
    skills       = Column(JSON, nullable=True)        # ["Python", "Go"]
    description  = Column(String(1000), nullable=True)
    difficulty   = Column(String(50), nullable=True)   # "Hard", "Medium", "Easy"
    logo         = Column(String(10), nullable=True)    # "G", "M", etc.
    logo_bg      = Column(String(50), nullable=True)   # rgba string
    logo_color   = Column(String(50), nullable=True)   # hex or var
    tag          = Column(String(50), nullable=True)    # "Open", "Closing", "Applied"
    tag_color    = Column(String(50), nullable=True)    # "teal", "amber", etc.
    
    # New Fields for detailed Company/Drive info
    sector         = Column(String(100), nullable=True)
    website        = Column(String(200), nullable=True)
    bond           = Column(String(100), nullable=True)
    contact_name   = Column(String(100), nullable=True)
    contact_email  = Column(String(150), nullable=True)
    contact_phone  = Column(String(20), nullable=True)
    min_cgpa       = Column(Float, default=0.0)
    branches       = Column(JSON, nullable=True) # Reusing JSON or String based on preference, JSON better
    rounds         = Column(JSON, nullable=True) # List of round names
    pkg_lpa        = Column(Float, nullable=True) # Numeric package for analytics

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
    status_label   = Column(String(50), nullable=True) # "Under Review", "OA Scheduled", etc.
    status_color   = Column(String(50), nullable=True) # "amber", "indigo", etc.
    current_step   = Column(Integer, default=1)        # 1-4 (Applied, OA, Interview, Offer)
    logs           = Column(JSON, nullable=True)       # Timeline events
    applied_at     = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    internship = relationship("Internship", back_populates="applications")
    student    = relationship("User", back_populates="internship_applications")

    def __repr__(self):
        return f"<InternshipApplication student={self.student_id} status={self.status}>"


class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id           = Column(Integer, primary_key=True, index=True)
    student_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    company      = Column(String(200), nullable=True)
    type         = Column(String(100), nullable=True) # DSA Round, System Design, etc.
    date         = Column(String(50), nullable=True)  # Display string "Mar 14"
    time         = Column(String(50), nullable=True)  # Display string "10:00 AM"
    score        = Column(Integer, nullable=True)     # 0-100
    duration     = Column(String(50), nullable=True)  # "45 min"
    questions    = Column(Integer, nullable=True)
    solved       = Column(Integer, nullable=True)
    summary      = Column(String(1000), nullable=True)
    tags         = Column(JSON, nullable=True)        # ["Arrays", "Two Pointer"]
    feedback     = Column(JSON, nullable=True)        # { "problemSolving": 88, ... }
    created_at   = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="mock_interviews")

    def __repr__(self):
        return f"<MockInterview student={self.student_id} company={self.company}>"


class PlacementTopic(Base):
    __tablename__ = "placement_topics"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label      = Column(String(100), nullable=False)
    done       = Column(Integer, default=0)
    total      = Column(Integer, default=10)
    color      = Column(String(50), default="var(--teal)")

    student = relationship("User", backref="placement_topics")


class ResumeCheck(Base):
    __tablename__ = "resume_checks"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label      = Column(String(100), nullable=False)
    done       = Column(Boolean, default=False)

    student = relationship("User", backref="resume_checks")


class MockInterviewRoundType(Base):
    __tablename__ = "mock_interview_round_types"

    id       = Column(String(50), primary_key=True, index=True) # e.g., "technical", "system"
    label    = Column(String(100), nullable=False)
    icon     = Column(String(50), nullable=False)
    color    = Column(String(50), nullable=False)
    desc     = Column(String(500), nullable=False)
    duration = Column(String(50), nullable=False)
    rounds   = Column(Integer, nullable=False)


class MockInterviewQuestion(Base):
    __tablename__ = "mock_interview_questions"

    id         = Column(String(50), primary_key=True, index=True) # e.g., "q1", "q2"
    topic      = Column(String(100), nullable=False)
    difficulty = Column(String(50), nullable=False)
    title      = Column(String(200), nullable=False)
    asked      = Column(JSON, nullable=False) # List of company names
    times      = Column(Integer, default=0)


class PlacementTask(Base):
    __tablename__ = "placement_tasks"

    id         = Column(Integer, primary_key=True, index=True)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text       = Column(String(500), nullable=False)
    done       = Column(Boolean, default=False)
    category   = Column(String(50), default="General") # "Follow-up", "Urgent", etc.
    due_date   = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    officer    = relationship("User")


class PlacementEvent(Base):
    __tablename__ = "placement_events"

    id         = Column(Integer, primary_key=True, index=True)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    time       = Column(String(50), nullable=False) # "10:00 AM"
    title      = Column(String(200), nullable=False)
    type       = Column(String(50), default="Meeting") # "Meeting", "Drive", "Interview"
    company    = Column(String(100), nullable=True)
    status     = Column(String(50), default="Upcoming")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    officer    = relationship("User")
