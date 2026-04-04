from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
import enum

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
    section: Optional[str] = "A"
    description: Optional[str] = ""
    last_updated: Optional[str] = "Today"

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
    ai_insights: Optional[List[str]] = []
    notifications: Optional[List['FacultyNotificationModel']] = []
    recent_activity: Optional[List['FacultyRecentActivity']] = []
    academic_meta: Optional[Dict[str, str]] = {}

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
    target_group: Optional[str] = "All"

class FacultyAssignmentSubmission(BaseModel):
    roll: str
    name: str
    score: Optional[float]
    trend: str
    submitted: Optional[str]
    file_url: Optional[str] = None
    status: str # "graded" | "pending" | "missing"

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
    submissions: Optional[int] = 0
    submissions_list: List[FacultyAssignmentSubmission]
    target_group: Optional[str] = "All"

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
    attempts: Optional[int] = 0
    results: List[FacultyQuizResult]
    target_group: Optional[str] = "All"

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
    
# ─── Creation Schemas ───

class FacultyLessonCreate(BaseModel):
    title: str
    course_id: int
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    duration: Optional[str] = None
    target_group: Optional[str] = "All"

class FacultyLectureUpdate(BaseModel):
    title: Optional[str] = None
    course_id: Optional[int] = None
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    duration: Optional[str] = None
    target_group: Optional[str] = None
    week: Optional[str] = None
    unit: Optional[str] = None

class FacultyAssignmentCreate(BaseModel):
    title: str
    course_id: int
    description: Optional[str] = None
    type: Optional[str] = "Theory"
    marks: Optional[float] = 100.0  # Frontend sends 'marks'
    weight: Optional[str] = "10%"
    difficulty: Optional[str] = "medium"
    estimated_hours: Optional[int] = 4
    rubric: Optional[List[Dict[str, Any]]] = []
    due_date: Optional[datetime] = None
    target_group: Optional[str] = "All"
    week: Optional[str] = None
    unit: Optional[str] = None
    
class FacultyQuizCreate(BaseModel):
    title: str
    course_id: int
    description: Optional[str] = None
    duration: Optional[int] = 20
    marks: Optional[int] = 10
    week: Optional[str] = "W1"
    unit: Optional[str] = "Unit I"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    shuffle: Optional[bool] = True
    show_result: Optional[bool] = True
    neg_mark: Optional[bool] = False
    difficulty: Optional[str] = "medium"
    is_ai_generated: Optional[bool] = False
    target_group: Optional[str] = "All"
    questions: Optional[List[FacultyQuizQuestion]] = []

class FacultyAssignmentUpdate(BaseModel):
    title: Optional[str] = None
    course_id: Optional[int] = None
    description: Optional[str] = None
    type: Optional[str] = None
    marks: Optional[float] = None
    due_date: Optional[datetime] = None
    target_group: Optional[str] = None
    rubric: Optional[List[Dict[str, Any]]] = None
    week: Optional[str] = None
    unit: Optional[str] = None

class FacultyQuizUpdate(BaseModel):
    title: Optional[str] = None
    course_id: Optional[int] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    marks: Optional[int] = None
    week: Optional[str] = None
    unit: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    shuffle: Optional[bool] = None
    show_result: Optional[bool] = None
    neg_mark: Optional[bool] = None
    target_group: Optional[str] = None
    questions: Optional[List[FacultyQuizQuestion]] = []

class FacultyCourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    semester: Optional[str] = "Sem 5"


# --- Remaining Pages Models ---
class FacultyStudentDetail(BaseModel):
    roll: str
    name: str
    course: str # e.g. CS501
    sem: str
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
    department: Optional[str] = None
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

# ─── Settings ──────────────────────────────────────────────────────
class FacultySettingsNotifications(BaseModel):
    submissionAlerts: bool = True
    attendanceReminders: bool = True
    quizResults: bool = True
    studentMessages: bool = False
    weeklyDigest: bool = True
    systemUpdates: bool = False
    emailNotif: bool = True
    pushNotif: bool = True
    smsNotif: bool = False

class FacultySettingsAppearance(BaseModel):
    theme: str = "dark"
    accentColor: str = "indigo"
    density: str = "comfortable"
    fontSize: str = "medium"
    animations: bool = True
    sidebarCollapsed: bool = False

class FacultySettingsAccount(BaseModel):
    displayName: str
    email: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    department: str = "cse"
    language: str = "en"
    timezone: str = "asia_kolkata"

class FacultySettingsAI(BaseModel):
    aiAssistant: bool = True
    autoSuggest: bool = True
    dataAnalysis: bool = True
    gradeAssist: bool = False
    aiLanguage: str = "en"
    aiPersonality: str = "professional"

class FacultySettingsResponse(BaseModel):
    notifications: FacultySettingsNotifications
    appearance: FacultySettingsAppearance
    account: FacultySettingsAccount
    ai: FacultySettingsAI

class FacultySettingsUpdate(BaseModel):
    notifications: Optional[FacultySettingsNotifications] = None
    appearance: Optional[FacultySettingsAppearance] = None
    account: Optional[FacultySettingsAccount] = None
    ai: Optional[FacultySettingsAI] = None

# ─── Notifications & Activity ────────────────────────────────────

# ─── Notifications & Activity ────────────────────────────────────
class FacultyNotificationModel(BaseModel):
    id: int
    type: str
    title: str
    body: str
    time: str
    unread: bool
    urgent: bool
    color: str
    bg: str

class FacultyRecentActivity(BaseModel):
    label: str
    time: str
    color: str

# ─── Reports ───────────────────────────────────────────────────────
class FacultyReportStats(BaseModel):
    label: str
    value: str
    cls: str

class FacultyReportCourseMetric(BaseModel):
    id: str
    code: str
    name: str
    color: str
    avgScore: float
    attendance: float
    lectures_done: int
    lectures_total: int
    sparkline: List[float]

class FacultyReportResponse(BaseModel):
    stats: List[FacultyReportStats]
    courses: List[FacultyReportCourseMetric]
    week_scores: List[Dict[str, Any]]
class FacultyCourseMeta(BaseModel):
    code: str
    name: str
    color: str
    bg: str
    border: str

class FacultyMetadataResponse(BaseModel):
    departments: List[str]
    groups: List[str]
    courses_meta: Dict[str, FacultyCourseMeta]
    status_meta: Dict[str, Dict[str, str]]
    ai_replies: List[str]
    ai_suggestions: List[str]

# ─── Question Bank ───
class FacultyQuestionBankItem(BaseModel):
    id: int
    course: str
    unit: str
    type: str
    diff: str
    marks: int
    q: str
    options: Optional[List[str]] = None
    ans: Any
    used: int

class FacultyQuestionBankCreate(BaseModel):
    course: str
    unit: str
    type: str
    diff: str
    marks: int
    q: str
    options: Optional[List[str]] = None
    ans: Any

class FacultyQuestionBankUpdate(BaseModel):
    course: Optional[str] = None
    unit: Optional[str] = None
    type: Optional[str] = None
    diff: Optional[str] = None
    marks: Optional[int] = None
    q: Optional[str] = None
    options: Optional[List[str]] = None
    
class AIChatRequest(BaseModel):
    message: str
    messages: Optional[List[dict]] = None


# ─── Attendance ───
class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent  = "absent"
    late    = "late"

class AttendanceRecordSubmit(BaseModel):
    student_id: int
    status: str # "present" | "absent" | "late"
    remarks: Optional[str] = None

class AttendanceBulkSubmit(BaseModel):
    course_id: int
    date: date
    records: List[AttendanceRecordSubmit]

class AttendanceRecordResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_roll: str
    status: str
    date: date
    remarks: Optional[str] = None

class AttendanceHistoryGrid(BaseModel):
    date: date
    present_count: int
    absent_count: int

# ─── GradeBook Save ───
class GradeBookChange(BaseModel):
    roll: str
    column: str
    value: float

class GradeBookSaveRequest(BaseModel):
    course: str
    changes: List[GradeBookChange]
