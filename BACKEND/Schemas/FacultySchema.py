from pydantic import BaseModel
from typing import Optional, List, Dict, Any
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

# ─── New Detailed Schemas ───

class FacultyLessonSummary(BaseModel):
    id: int
    title: str
    duration: str
    views: int
    week: str
    type: str

class FacultyLectureDetail(BaseModel):
    id: int
    courseId: str
    title: str
    week: str
    unit: str
    dur: str
    views: int
    watchPct: int
    rating: float
    tags: List[str]
    status: str
    date: Optional[str]
    desc: str

class FacultyAssignmentSubmission(BaseModel):
    roll: str
    name: str
    score: Optional[float]
    trend: str
    submitted: Optional[str]
    status: str

class FacultyAssignmentDetail(BaseModel):
    id: int
    course_id: int
    course_code: str
    title: str
    type: str
    due_label: str
    due_date: str
    marks: int
    submissions_count: int
    avg_score: Optional[float]
    highest: Optional[float]
    lowest: Optional[float]
    status: str
    week: str
    unit: str
    description: str
    rubric: List[Dict[str, Any]]
    submissions: List[FacultyAssignmentSubmission]

class FacultyQuizQuestion(BaseModel):
    q: str
    options: Optional[List[str]]
    ans: Any
    marks: Optional[int] = 1

class FacultyQuizResult(BaseModel):
    roll: str
    name: str
    score: float
    total: int
    time: str
    status: str

class FacultyQuizDetail(BaseModel):
    id: int
    course_id: int
    course_code: str
    title: str
    type: str
    status: str
    questions_count: int
    marks: int
    duration: int
    week: str
    unit: str
    start_date: str
    end_date: str
    attempts_count: int
    avg_score: Optional[float]
    highest: Optional[float]
    lowest: Optional[float]
    pass_pct: Optional[float]
    description: str
    shuffle: bool
    show_result: bool
    neg_mark: bool
    questions: List[FacultyQuizQuestion]
    results: List[FacultyQuizResult]

class FacultyStudentListItem(BaseModel):
    roll: str
    name: str
    attendance: int
    score: int
    grade: str
    trend: str
    status: str

class FacultyCourseDetail(BaseModel):
    info: FacultyCourseSummary
    description: str
    last_updated: str
    assignments: List[FacultyAssignmentDetail]
    quizzes: List[FacultyQuizDetail]
    lessons: List[FacultyLessonSummary]
    students: List[FacultyStudentListItem]
    weak_topics: List[FacultyWeakTopic]
    lectures: List[FacultyLectureDetail]


# --- Remaining Pages Models ---
class FacultyStudentDetail(BaseModel):
    roll: str
    name: str
    course: str # e.g. CS501
    sem: int
    batch: str # "A" or "B"
    cgpa: float
    attendance: int
    score: int
    status: str # "good", "average", "at-risk"
    email: str

class FacultyGradeBookEntry(BaseModel):
    id: int # Submission id
    student_name: str
    student_roll: str
    assignment_id: int
    assignment_title: str
    course_code: str
    submitted_on: str
    status: str # "graded", "pending", "late"
    score: Optional[int] = None
    max_score: int

class FacultyScoreDist(BaseModel):
    range: str
    count: int

class FacultyEngagementMetric(BaseModel):
    week: str
    views: int
    participation: int
    completion: int

class FacultyWeakTopicTrend(BaseModel):
    week: str
    score: int

class FacultyAnalyticsData(BaseModel):
    score_dist: List[FacultyScoreDist]
    engagement: List[FacultyEngagementMetric]
    weak_topic_trend: List[FacultyWeakTopicTrend]
    total_students: int
    avg_attendance: float
    avg_score: float

# ─── Profile ───────────────────────────────────────────────────────
class FacultyProfileCourse(BaseModel):
    code: str
    name: str
    semester: str
    student_count: int
    color: str
    bg: str

class FacultyProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    bio: Optional[str]
    role: str
    avatar: Optional[str]
    skills: Optional[List[str]]
    active_courses: int
    total_students: int
    courses: List[FacultyProfileCourse]

# ─── Attendance ────────────────────────────────────────────────────
class FacultyAttendanceStudent(BaseModel):
    roll: str
    name: str
    present: int
    total: int

class FacultyAttendanceCourse(BaseModel):
    id: str           # e.g. "cs501"
    code: str
    name: str
    color: str
    bg: str
    border: str
    total: int
    students: List[FacultyAttendanceStudent]
