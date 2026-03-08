from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── Profile / User ───────────────────────────────────────────────────────────

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    avatar: Optional[str] = None
    roll_number: Optional[str] = None
    skills: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Course ───────────────────────────────────────────────────────────────────

class CourseBasicResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    semester: Optional[str] = None
    faculty_name: str
    is_active: bool

    class Config:
        from_attributes = True


class EnrolledCourseResponse(BaseModel):
    enrollment_id: int
    course_id: int
    title: str
    description: Optional[str] = None
    semester: Optional[str] = None
    faculty_name: str
    progress: float
    enrolled_at: datetime
    lesson_count: int
    assignment_count: int
    quiz_count: int

    class Config:
        from_attributes = True


class CourseModule(BaseModel):
    id: str
    title: str
    lessons: int
    duration: str
    completed: bool


class CourseDeadline(BaseModel):
    id: str
    title: str
    date: str
    type: str  # "assignment" | "quiz"


class CourseSuggestion(BaseModel):
    id: str
    title: str
    reason: str
    icon: str


class CourseDetailResponse(BaseModel):
    course_id: int
    title: str
    instructor: str
    progress: int
    modules: List[CourseModule]
    deadlines: List[CourseDeadline]
    suggestions: List[CourseSuggestion]


# ─── Lesson ───────────────────────────────────────────────────────────────────

class LessonResponse(BaseModel):
    id: int
    course_id: int
    course_title: str
    title: str
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    order: int
    created_at: datetime
    watched: bool
    watch_time_seconds: int
    completed: bool

    class Config:
        from_attributes = True


class MarkWatchedRequest(BaseModel):
    watch_time_seconds: int = 0
    completed: bool = False


# ─── Assignment ───────────────────────────────────────────────────────────────

class SubmissionResponse(BaseModel):
    id: int
    file_url: Optional[str] = None
    submitted_at: datetime
    grade: Optional[float] = None
    feedback: Optional[str] = None

    class Config:
        from_attributes = True


class AssignmentResponse(BaseModel):
    id: int
    course_id: int
    course_title: str
    faculty_name: str
    title: str
    description: Optional[str] = None
    type: str = "Theory"
    max_marks: float = 100.0
    weight: str = "10%"
    difficulty: str = "Medium"
    estimated_hours: int = 4
    tags: List[str] = []
    attachments: List[str] = []
    instructions: List[str] = []
    rubric: List[dict] = []
    due_date: Optional[datetime] = None
    created_at: datetime
    submission: Optional[SubmissionResponse] = None

    class Config:
        from_attributes = True


class AssignmentSubmitRequest(BaseModel):
    file_url: Optional[str] = None


# ─── Quiz ─────────────────────────────────────────────────────────────────────

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    type: str
    options: Optional[list] = None

    class Config:
        from_attributes = True


class QuizAttemptResponse(BaseModel):
    id: int
    score: Optional[float] = None
    attempted_at: datetime
    time_taken_seconds: Optional[int] = None

    class Config:
        from_attributes = True


class QuizResponse(BaseModel):
    id: int
    course_id: int
    course_title: str
    faculty_name: str
    title: str
    difficulty: str
    is_ai_generated: bool
    created_at: datetime
    question_count: int
    best_score: Optional[float] = None
    attempt_count: int
    questions: Optional[List[QuestionResponse]] = None

    class Config:
        from_attributes = True


class QuizAttemptRequest(BaseModel):
    score: float
    time_taken_seconds: Optional[int] = None


# ─── Study Groups ─────────────────────────────────────────────────────────────

class StudyGroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    color_rgb: Optional[str] = None
    type: str
    tags: List[str] = []
    streak: int
    resources_count: int
    messages_count: int
    last_activity: Optional[str] = None
    course_id: int
    course_title: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Placement ────────────────────────────────────────────────────────────────

class SkillScoreResponse(BaseModel):
    id: int
    skill_name: str
    score: float
    updated_at: datetime

    class Config:
        from_attributes = True


class PlacementReadinessResponse(BaseModel):
    pri_score: float
    mock_interviews_done: int
    skills_completed: int
    updated_at: datetime

    class Config:
        from_attributes = True


class PlacementFullResponse(BaseModel):
    placement_readiness: PlacementReadinessResponse
    skill_scores: List[SkillScoreResponse]
    pri_breakdown: List[dict]
    companies: List[dict]
    mock_sessions: List[dict]
    topics: List[dict]
    resume_checklist: List[dict]
    tips: List[dict]
    difficulty_breakdown: List[dict] = []
    ats_score: int = 0
    ats_issues: List[dict] = []
    profile_strength: List[dict] = []
    last_feedback: Optional[dict] = None
    applications_count: int = 0
    shortlisted_count: int = 0


# ─── Internship ───────────────────────────────────────────────────────────────

class InternshipResponse(BaseModel):
    id: int
    company_name: str
    role: str
    domain: Optional[str] = None
    location: Optional[str] = None
    stipend: Optional[str] = None
    duration: Optional[str] = None
    seats: Optional[int] = None
    skills: List[str] = []
    description: Optional[str] = None
    difficulty: Optional[str] = None
    logo: Optional[str] = None
    logo_bg: Optional[str] = None
    logo_color: Optional[str] = None
    tag: Optional[str] = None
    tag_color: Optional[str] = None
    deadline: Optional[datetime] = None
    created_at: datetime
    application_status: Optional[str] = None

    class Config:
        from_attributes = True


class InternshipApplicationDetailResponse(BaseModel):
    id: int
    company_name: str
    role: str
    status_label: Optional[str] = None
    status_color: Optional[str] = None
    current_step: int = 1
    logs: List[dict] = []
    applied_at: datetime

    class Config:
        from_attributes = True


class InternshipApplicationResponse(BaseModel):
    company: str
    role: str
    logo: Optional[str] = None
    logoBg: Optional[str] = None
    logoColor: Optional[str] = None
    appliedOn: str
    status: str
    statusColor: str
    steps: List[str]
    currentStep: int


class InternshipFunnelItem(BaseModel):
    stage: str
    count: int
    color: str
    pct: int


class InternshipTimelineItem(BaseModel):
    date: str
    event: str
    type: str
    color: str


class InternshipsOverviewResponse(BaseModel):
    listings: List[InternshipResponse]
    applications: List[InternshipApplicationResponse]
    saved: List[dict] = []
    funnel: List[InternshipFunnelItem]
    timeline: List[InternshipTimelineItem]


# ─── Mock Interview ───────────────────────────────────────────────────────────

class MockInterviewResponse(BaseModel):
    id: int
    company: Optional[str] = None
    type: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    score: Optional[int] = None
    duration: Optional[str] = None
    questions: Optional[int] = None
    solved: Optional[int] = None
    summary: Optional[str] = None
    tags: List[str] = []
    feedback: dict = {}

    class Config:
        from_attributes = True


class MockInterviewRoundType(BaseModel):
    id: str
    label: str
    icon: str
    color: str
    desc: str
    duration: str
    rounds: int


class MockInterviewQuestionBankItem(BaseModel):
    id: str
    topic: str
    difficulty: str
    title: str
    asked: List[str]
    times: int


class MockInterviewWeakArea(BaseModel):
    topic: str
    sessions: int
    avgScore: int
    color: str

class MockInterviewRadarItem(BaseModel):
    label: str
    value: int

class MockInterviewInsights(BaseModel):
    radar: List[MockInterviewRadarItem] = []
    weak_areas: List[MockInterviewWeakArea] = []

class MockInterviewsFullResponse(BaseModel):
    session_history: List[MockInterviewResponse]
    round_types: List[MockInterviewRoundType]
    question_bank: List[MockInterviewQuestionBankItem]
    stats: Optional[dict] = None
    insights: Optional[MockInterviewInsights] = None


# ─── Schedule ─────────────────────────────────────────────────────────────────

class ScheduleResponse(BaseModel):
    id: int
    day: int
    startH: int
    startM: int
    durationMin: int
    subject: str
    code: Optional[str] = None
    type: Optional[str] = None
    faculty: Optional[str] = None
    room: Optional[str] = None
    batch: Optional[str] = None
    courseKey: Optional[str] = None

    class Config:
        from_attributes = True


class ScheduleReminderResponse(BaseModel):
    id: str
    title: str
    date: str
    time: str
    type: str
    courseKey: str
    urgent: bool


class ScheduleFullResponse(BaseModel):
    timetable: List[ScheduleResponse]
    reminders: List[ScheduleReminderResponse]


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStatsResponse(BaseModel):
    active_courses: int
    completed_lessons: int
    pending_assignments: int
    upcoming_quizzes: int
    average_quiz_score: Optional[float] = None
    pri_score: float


class DashboardResponse(BaseModel):
    user_id: int
    full_name: str
    avatar: Optional[str] = None
    stats: DashboardStatsResponse
    enrolled_courses: List[EnrolledCourseResponse]
    skill_scores: List[SkillScoreResponse]
    placement: Optional[PlacementReadinessResponse] = None
    schedule_today: List[dict] = []
    recent_quizzes: List[dict] = []

    class Config:
        from_attributes = True

# ─── AI Chat ──────────────────────────────────────────────────────────────────

class AIChatRequest(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    reply: str
    source: str = "Lucyna"

# ─── Analytics ────────────────────────────────────────────────────────────────

class PerformanceKPI(BaseModel):
    cls: str
    val: str
    lbl: str
    delta: str
    up: Optional[bool]

class QuizHistoryItem(BaseModel):
    name: str
    score: int
    classAvg: int
    rank: int
    total: int
    date: str

class CourseAttendance(BaseModel):
    course: str
    pct: int
    classes: int
    attended: int
    color: str

class SkillProgression(BaseModel):
    label: str
    scores: List[int]
    color: str

class Achievement(BaseModel):
    icon: str
    label: str
    sub: str
    color: str

class PlacementBreakdown(BaseModel):
    label: str
    score: int
    weight: int
    color: str

class ImprovementSuggestion(BaseModel):
    area: str
    action: str
    impact: str
    color: str

class EligibilityTier(BaseModel):
    tier: str
    minPRI: int
    minCGPA: float
    eligible: bool

class PerformanceData(BaseModel):
    kpis: List[PerformanceKPI]
    my_score_trend: dict[str, List[int]]
    class_score_trend: dict[str, List[int]]
    quiz_history: List[QuizHistoryItem]
    weeks: List[str]

class AttendanceData(BaseModel):
    overall_pct: int
    total_classes: int
    attended_classes: int
    breakdown: List[CourseAttendance]
    heatmap: List[List[int]]
    weeks: List[str]
    courses: List[str]

class SkillsData(BaseModel):
    radar: List[dict]
    progression: List[SkillProgression]
    achievements: List[Achievement]

class PlacementData(BaseModel):
    pri: int
    target: int
    breakdown: List[PlacementBreakdown]
    suggestions: List[ImprovementSuggestion]
    eligibility: List[EligibilityTier]

class AnalyticsResponse(BaseModel):
    performance: PerformanceData
    attendance: AttendanceData
    skills: SkillsData
    placement: PlacementData
    semester: str = "Semester 5"
    current_week: int = 11


# ─── Innovation Hub ───────────────────────────────────────────────────────────

class InnovationIdeaResponse(BaseModel):
    id: int
    title: str
    author: str
    avatar: str
    domain: str
    tags: List[str]
    desc: str
    likes: int
    comments: int
    bookmarks: int
    timeAgo: str
    stage: str
    stageColor: str
    looking: List[str]
    liked: bool
    bookmarked: bool
    featured: bool


class InnovationProjectResponse(BaseModel):
    id: str
    title: str
    domain: str
    stage: str
    stageColor: str
    progress: int
    color: str
    colorRgb: str
    team: List[str]
    nextMilestone: str
    dueIn: str
    stars: int
    desc: str
    tasks: List[dict]
    updates: List[dict]


class InnovationHackathonResponse(BaseModel):
    id: str
    name: str
    org: str
    prize: str
    deadline: str
    daysLeft: int
    mode: str
    domain: str
    registered: bool
    teamSize: str
    color: str
    colorRgb: str
    desc: str
    status: str
    statusColor: str


class InnovationCollaboratorResponse(BaseModel):
    name: str
    roll: str
    skills: List[str]
    available: bool
    avatar: str
    match: int
    color: str


class InnovationHubResponse(BaseModel):
    ideas: List[InnovationIdeaResponse]
    projects: List[InnovationProjectResponse]
    hackathons: List[InnovationHackathonResponse]
    collaborators: List[InnovationCollaboratorResponse]


# ─── Notifications ────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: str
    type: str  # "assignment_due" | "quiz_available" | "grade_posted"
    title: str
    message: str
    created_at: datetime
    is_read: bool = False
