from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from Core.Database import Base

class InnovationIdea(Base):
    __tablename__ = "innovation_ideas"

    id           = Column(Integer, primary_key=True, index=True)
    author_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    title        = Column(String(200), nullable=False)
    description  = Column(Text, nullable=True)
    domain       = Column(String(100), nullable=True)
    tags         = Column(JSON, nullable=True)        # ["ML", "Agriculture"]
    stage        = Column(String(50), default="Idea") # Idea, Prototype, MVP
    stage_color  = Column(String(50), nullable=True)
    looking_for  = Column(JSON, nullable=True)        # ["ML Engineer"]
    likes        = Column(Integer, default=0)
    comments     = Column(Integer, default=0)
    bookmarks    = Column(Integer, default=0)
    is_featured  = Column(Boolean, default=False)
    created_at   = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    author = relationship("User", back_populates="innovation_ideas")

    def __repr__(self):
        return f"<InnovationIdea {self.title} by {self.author_id}>"


class InnovationProject(Base):
    __tablename__ = "innovation_projects"

    id             = Column(Integer, primary_key=True, index=True)
    student_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    title          = Column(String(200), nullable=False)
    domain         = Column(String(100), nullable=True)
    stage          = Column(String(50), default="Idea")
    stage_color    = Column(String(50), nullable=True)
    progress       = Column(Integer, default=0)
    color          = Column(String(50), nullable=True)
    color_rgb      = Column(String(50), nullable=True)
    team_members   = Column(JSON, nullable=True)        # ["AR", "PM"]
    next_milestone = Column(String(200), nullable=True)
    due_in         = Column(String(50), nullable=True)
    stars          = Column(Integer, default=0)
    description    = Column(Text, nullable=True)
    tasks          = Column(JSON, nullable=True)        # [{"label": "...", "done": true}]
    updates        = Column(JSON, nullable=True)        # [{"text": "...", "when": "..."}]
    created_at     = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="innovation_projects")

    def __repr__(self):
        return f"<InnovationProject {self.title}>"


class InnovationHackathon(Base):
    __tablename__ = "innovation_hackathons"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(200), nullable=False)
    organizer     = Column(String(200), nullable=True)
    prize         = Column(String(100), nullable=True)
    deadline      = Column(DateTime(timezone=True), nullable=True)
    mode          = Column(String(50), default="Online")
    domain        = Column(String(100), nullable=True)
    team_size     = Column(String(50), nullable=True)
    color         = Column(String(50), nullable=True)
    color_rgb     = Column(String(50), nullable=True)
    description   = Column(Text, nullable=True)
    status        = Column(String(50), default="Open")
    status_color  = Column(String(50), nullable=True)
    created_at    = Column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f"<InnovationHackathon {self.name}>"
