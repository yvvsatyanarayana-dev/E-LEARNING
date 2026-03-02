from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum


class ProjectStatus(str, Enum):
    pending  = "pending"
    reviewed = "reviewed"
    approved = "approved"


# ─── Project ──────────────────────────────────────

class ProjectCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    repo_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    repo_url: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    title: str
    description: Optional[str]
    repo_url: Optional[str]
    submitted_at: datetime
    status: ProjectStatus

    class Config:
        from_attributes = True


# ─── Project Review ───────────────────────────────

class ProjectReviewCreate(BaseModel):
    project_id: int
    feedback: Optional[str] = None
    score: Optional[float] = None


class ProjectReviewResponse(BaseModel):
    id: int
    project_id: int
    reviewed_by: int
    feedback: Optional[str]
    score: Optional[float]
    reviewed_at: datetime

    class Config:
        from_attributes = True
