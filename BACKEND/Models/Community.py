from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from Core.Database import Base


class Forum(Base):
    __tablename__ = "forums"

    id         = Column(Integer, primary_key=True, index=True)
    course_id  = Column(Integer, ForeignKey("courses.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    title      = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    course          = relationship("Course", back_populates="forums")
    created_by_user = relationship("User", foreign_keys=[created_by])
    posts           = relationship("ForumPost", back_populates="forum")

    def __repr__(self):
        return f"<Forum {self.title}>"


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id        = Column(Integer, primary_key=True, index=True)
    forum_id  = Column(Integer, ForeignKey("forums.id"), nullable=False)
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    content   = Column(Text, nullable=False)
    posted_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    forum          = relationship("Forum", back_populates="posts")
    posted_by_user = relationship("User", back_populates="forum_posts", foreign_keys=[posted_by])

    def __repr__(self):
        return f"<ForumPost forum={self.forum_id} by={self.posted_by}>"


class StudyGroup(Base):
    __tablename__ = "study_groups"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(200), nullable=False)
    course_id  = Column(Integer, ForeignKey("courses.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    course  = relationship("Course", back_populates="study_groups")
    members = relationship("StudyGroupMember", back_populates="group")

    def __repr__(self):
        return f"<StudyGroup {self.name}>"


class StudyGroupMember(Base):
    __tablename__ = "study_group_members"

    id         = Column(Integer, primary_key=True, index=True)
    group_id   = Column(Integer, ForeignKey("study_groups.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at  = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    group   = relationship("StudyGroup", back_populates="members")
    student = relationship("User", back_populates="study_group_members")

    def __repr__(self):
        return f"<StudyGroupMember student={self.student_id} group={self.group_id}>"
