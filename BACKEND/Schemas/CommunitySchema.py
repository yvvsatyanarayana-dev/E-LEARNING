from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


# ─── Forum ────────────────────────────────────────

class ForumCreate(BaseModel):
    course_id: int
    title: str


class ForumResponse(BaseModel):
    id: int
    course_id: int
    created_by: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Forum Post ───────────────────────────────────

class ForumPostCreate(BaseModel):
    forum_id: int
    content: str


class ForumPostResponse(BaseModel):
    id: int
    forum_id: int
    posted_by: int
    content: str
    posted_at: datetime

    class Config:
        from_attributes = True


# ─── Study Group ──────────────────────────────────

class StudyGroupCreate(BaseModel):
    name: str
    course_id: int


class StudyGroupResponse(BaseModel):
    id: int
    name: str
    course_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Study Group Member ───────────────────────────

class StudyGroupMemberResponse(BaseModel):
    id: int
    group_id: int
    student_id: int
    joined_at: datetime

    class Config:
        from_attributes = True
