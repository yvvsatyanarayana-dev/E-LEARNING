from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class FacultyStatsResponse(BaseModel):
    total_students: int
    active_courses: int
    avg_attendance: float
    avg_class_score: float

class FacultyCourseSummary(BaseModel):
    id: int
    name: str
    code: str
    semester: str
    student_count: int
    lectures_done: int
    lectures_total: int
    avg_attendance: float
    avg_score: float
    pending_grades: int
    color: str

class FacultyScheduleItem(BaseModel):
    from_time: str
    to_time: str
    name: str
    room: str
    tag: str
    color: str

class FacultyTaskItem(BaseModel):
    id: int
    label: str
    course: str
    due: str
    urgent: bool
    type: str

class FacultyQuizStat(BaseModel):
    name: str
    avg_score: float
    highest_score: float
    lowest_score: float
    submitted_count: int
    total_count: int
    color: str

class FacultyWeakTopic(BaseModel):
    course: str
    topic: str
    student_count: int
    percentage: int
    color: str

class FacultyTopStudent(BaseModel):
    name: str
    roll: str
    cgpa: float
    attendance: int
    course: str
    badge: str
    badge_color: str

class FacultyDashboardResponse(BaseModel):
    stats: FacultyStatsResponse
    courses: List[FacultyCourseSummary]
    schedule: List[FacultyScheduleItem]
    tasks: List[FacultyTaskItem]
    quiz_stats: List[FacultyQuizStat]
    weak_topics: List[FacultyWeakTopic]
    top_students: List[FacultyTopStudent]

    class Config:
        from_attributes = True
