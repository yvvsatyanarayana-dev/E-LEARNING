from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ─── Lesson ───────────────────────────────────────

class LessonCreate(BaseModel):
    course_id: int
    title: str
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    order: int = 1


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    order: Optional[int] = None


class LessonResponse(BaseModel):
    id: int
    course_id: int
    title: str
    video_url: Optional[str]
    pdf_url: Optional[str]
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Watch History ────────────────────────────────

class WatchHistoryCreate(BaseModel):
    lesson_id: int
    watch_time_seconds: int = 0
    completed: bool = False


class WatchHistoryResponse(BaseModel):
    id: int
    student_id: int
    lesson_id: int
    watch_time_seconds: int
    completed: bool
    watched_at: datetime

    class Config:
        from_attributes = True
