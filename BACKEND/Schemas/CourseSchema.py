from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ─── Course ───────────────────────────────────────

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    semester: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    semester: Optional[str] = None
    is_active: Optional[bool] = None


class CourseResponse(BaseModel):
    id: int
    faculty_id: int
    title: str
    description: Optional[str]
    semester: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Enrollment ───────────────────────────────────

class EnrollRequest(BaseModel):
    course_id: int


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    enrolled_at: datetime
    progress: float

    class Config:
        from_attributes = True
