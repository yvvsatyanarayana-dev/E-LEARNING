from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ─── Assignment ───────────────────────────────────

class AssignmentCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None


class AssignmentResponse(BaseModel):
    id: int
    course_id: int
    faculty_id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Assignment Submission ────────────────────────

class SubmissionCreate(BaseModel):
    assignment_id: int
    file_url: Optional[str] = None


class SubmissionGrade(BaseModel):
    grade: float
    feedback: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    file_url: Optional[str]
    submitted_at: datetime
    grade: Optional[float]
    feedback: Optional[str]

    class Config:
        from_attributes = True
