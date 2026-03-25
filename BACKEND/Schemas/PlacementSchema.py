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
    sector: Optional[str] = None
    website: Optional[str] = None
    bond: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    min_cgpa: float = 0.0
    branches: Optional[List[str]] = None
    rounds: Optional[List[str]] = None
    pkg_lpa: Optional[float] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = "Upcoming"



class InternshipUpdate(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    sector: Optional[str] = None
    website: Optional[str] = None
    bond: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    min_cgpa: Optional[float] = None
    branches: Optional[List[str]] = None
    rounds: Optional[List[str]] = None
    pkg_lpa: Optional[float] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None



class InternshipResponse(BaseModel):
    id: int
    company_name: str
    role: str
    sector: Optional[str]
    website: Optional[str]
    bond: Optional[str]
    contact_name: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    min_cgpa: float
    branches: Optional[List[str]]
    rounds: Optional[List[str]]
    pkg_lpa: Optional[float]
    added_by: int
    deadline: Optional[datetime]
    created_at: datetime
    status: Optional[str] = "Upcoming"


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


# ─── Dashboard Tasks ─────────────────────────────

class PlacementTaskCreate(BaseModel):
    text: str
    category: str = "General"
    due_date: Optional[datetime] = None


class PlacementTaskUpdate(BaseModel):
    text: Optional[str] = None
    done: Optional[bool] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None


class PlacementTaskResponse(BaseModel):
    id: int
    officer_id: int
    text: str
    done: bool
    category: str
    due_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard Events ────────────────────────────

class PlacementEventCreate(BaseModel):
    time: str
    title: str
    type: str = "Meeting"
    company: Optional[str] = None
    status: str = "Upcoming"


class PlacementEventUpdate(BaseModel):
    time: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None


class PlacementEventResponse(BaseModel):
    id: int
    officer_id: int
    time: str
    title: str
    type: str
    company: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard Stats ─────────────────────────────

class PlacementDashboardStats(BaseModel):
    total_students: int
    placed_students: int
    placement_rate: int
    avg_pri: float
    pri_distribution: dict
    branch_stats: List[dict]
    funnel: List[dict]
    avg_package: Optional[float] = 0.0
    highest_package: Optional[float] = 0.0
    total_offers: Optional[int] = 0
    total_drives: Optional[int] = 0
    upcoming_drives: Optional[int] = 0
    total_companies: Optional[int] = 0

    package_distribution: Optional[List[dict]] = None




# ─── Dashboard Trends ────────────────────────────

class PlacementTrendPoint(BaseModel):
    month: str
    placed: int
    applied: int
    interviews: int

class AIChatRequest(BaseModel):
    message: str
    messages: Optional[List[dict]] = None

class AIChatResponse(BaseModel):
    reply: str



