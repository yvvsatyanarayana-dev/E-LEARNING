from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum


class ApplicationStatus(str, Enum):
    applied  = "applied"
    selected = "selected"
    rejected = "rejected"


# ─── Skill Score ──────────────────────────────────

class SkillScoreCreate(BaseModel):
    skill_name: str
    score: float


class SkillScoreResponse(BaseModel):
    id: int
    student_id: int
    skill_name: str
    score: float
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Placement Readiness ──────────────────────────

class PlacementReadinessResponse(BaseModel):
    id: int
    student_id: int
    pri_score: float
    mock_interviews_done: int
    skills_completed: int
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Internship ───────────────────────────────────

class InternshipCreate(BaseModel):
    company_name: str
    role: str
    deadline: Optional[datetime] = None


class InternshipUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    deadline: Optional[datetime] = None


class InternshipResponse(BaseModel):
    id: int
    company_name: str
    role: str
    added_by: int
    deadline: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Internship Application ───────────────────────

class InternshipApplicationCreate(BaseModel):
    internship_id: int


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class InternshipApplicationResponse(BaseModel):
    id: int
    internship_id: int
    student_id: int
    status: ApplicationStatus
    applied_at: datetime

    class Config:
        from_attributes = True
