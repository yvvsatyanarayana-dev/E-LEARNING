from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from Core.Database import get_db
from Core.Security import get_current_user
from Models.User import User
from Service.StudentService import student_service
from Schemas.StudentSchema import (
    MarkWatchedRequest, AssignmentSubmitRequest,
    QuizAttemptRequest, ProfileUpdateRequest,
    DashboardResponse, AnalyticsResponse, EnrolledCourseResponse,
    LessonResponse, AssignmentResponse, QuizResponse,
    QuizAttemptResponse, StudyGroupResponse, NotificationResponse,
    ScheduleFullResponse, PlacementFullResponse, InternshipResponse,
    MockInterviewsFullResponse,
    StudyGroupResourceResponse, # New
    AICourseSuggestionResponse, # New
    AIStudyPlanResponse, # New
    ResumeFullResponse, # New
    GenerateResumeRequest, ImproveResumeRequest, # New
    InnovationHubResponse, InternshipsOverviewResponse,
    CourseDetailResponse, AIChatRequest, AIChatResponse,
    VersantAttemptCreate, VersantAttemptResponse,
    VersantTestPartResponse
)

router = APIRouter(prefix="/student", tags=["Student"])


# ─── Dashboard ───────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_dashboard(current_user, db)


# ─── Analytics ───────────────────────────────────────────────────────────────

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_analytics(current_user, db)


# ─── Courses ─────────────────────────────────────────────────────────────────

@router.get("/courses", response_model=List[EnrolledCourseResponse])
def get_enrolled_courses( # Renamed function
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_enrolled_courses(current_user, db) # Updated service call


@router.get("/courses/ai-suggestions", response_model=List[AICourseSuggestionResponse]) # New endpoint
def get_courses_ai_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_courses_ai_suggestions(current_user, db)


@router.get("/courses/{course_id}", response_model=CourseDetailResponse)
def get_course_detail(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_course_detail(course_id, current_user, db)


@router.post("/courses/{course_id}/enroll")
def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.enroll_course(course_id, current_user, db)


# ─── Lessons ─────────────────────────────────────────────────────────────────

@router.get("/lessons", response_model=List[LessonResponse])
def get_lessons(
    course_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_lessons(current_user, db, course_id)


@router.post("/lessons/{lesson_id}/watch")
def mark_lesson_watched(
    lesson_id: int,
    data: MarkWatchedRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.mark_lesson_watched(lesson_id, data, current_user, db)


# ─── Assignments ─────────────────────────────────────────────────────────────

@router.get("/assignments", response_model=List[AssignmentResponse])
def get_assignments(
    course_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_assignments(current_user, db, course_id)


@router.post("/assignments/{assignment_id}/submit")
def submit_assignment(
    assignment_id: int,
    data: AssignmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.submit_assignment(assignment_id, data, current_user, db)


# ─── Quizzes ─────────────────────────────────────────────────────────────────

@router.get("/quizzes", response_model=List[QuizResponse])
def get_quizzes(
    course_id: Optional[int] = Query(None),
    include_questions: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_quizzes(current_user, db, course_id, include_questions)


@router.get("/quizzes/{quiz_id}", response_model=QuizResponse)
def get_quiz_detail(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_quiz_detail(quiz_id, current_user, db)


@router.post("/quizzes/{quiz_id}/attempt", response_model=QuizAttemptResponse)
def submit_quiz_attempt(
    quiz_id: int,
    data: QuizAttemptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.submit_quiz_attempt(quiz_id, data, current_user, db)


# ─── Study Groups ─────────────────────────────────────────────────────────────

@router.get("/study-groups", response_model=List[StudyGroupResponse])
def get_study_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_study_groups(current_user, db)


@router.post("/study-groups/{group_id}/join")
def join_study_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.join_study_group(group_id, current_user, db)


@router.get("/study-groups/{id}/resources", response_model=List[StudyGroupResourceResponse]) # New endpoint
def get_study_group_resources(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_study_group_resources(id, current_user, db)


# ─── Placement ───────────────────────────────────────────────────────────────

@router.get("/schedule", response_model=ScheduleFullResponse)
def get_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_schedule(current_user, db)


@router.get("/schedule/ai-plan", response_model=AIStudyPlanResponse)
def get_schedule_ai_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_schedule_ai_plan(current_user, db)


# ─── Innovation Hub ─────────────────────────────────────────────────────────

@router.get("/innovation", response_model=InnovationHubResponse)
def get_innovation_hub(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_innovation_hub(current_user, db)


# ─── Placement ───────────────────────────────────────────────────────────────

@router.get("/placement", response_model=PlacementFullResponse)
def get_placement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_placement(current_user, db)


# ─── Internships ─────────────────────────────────────────────────────────────

@router.get("/internships", response_model=InternshipsOverviewResponse)
def get_internships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_internships(current_user, db)

@router.post("/internships/{internship_id}/apply")
def apply_internship(
    internship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.apply_internship(internship_id, current_user, db)

@router.patch("/applications/{application_id}/self-select")
def self_select_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.self_select_application(application_id, current_user, db)


# ─── Drives ──────────────────────────────────────────────────────────────────

@router.get("/drives", response_model=InternshipsOverviewResponse)
def get_drives(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_drives(current_user, db)


@router.post("/drives/{drive_id}/register")
def register_drive(
    drive_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.register_drive(drive_id, current_user, db)


# ─── Profile ─────────────────────────────────────────────────────────────────

@router.patch("/profile")
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.update_profile(data, current_user, db)
@router.post("/ai/chat", response_model=AIChatResponse)
def ai_chat(
    data: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.ai_chat(data, current_user, db)


# ─── Notifications ───────────────────────────────────────────────────────────

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_notifications(current_user, db)


@router.post("/notifications/mark-all-read")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.mark_all_notifications_read(current_user, db)


@router.post("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.mark_notification_read(notif_id, current_user, db)


# ─── Mock Interviews ─────────────────────────────────────────────────────────

@router.get("/mock-interviews", response_model=MockInterviewsFullResponse)
def get_mock_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_mock_interviews(current_user, db)


@router.post("/mock-interview/chat", response_model=AIChatResponse)
def mock_interview_chat(
    data: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.mock_interview_chat(data, current_user, db)


# ─── Versant Assessment ───────────────────────────────────────────────────────

@router.get("/versant/questions", response_model=List[VersantTestPartResponse])
def get_versant_test_questions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from Service.PlacementService import get_versant_questions
    return get_versant_questions(db)


@router.post("/versant/submit", response_model=VersantAttemptResponse)
def submit_versant_attempt(
    data: VersantAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from Service.PlacementService import submit_versant_test
    return submit_versant_test(db, current_user.id, data)


@router.get("/versant/history", response_model=List[VersantAttemptResponse])
def get_versant_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from Service.PlacementService import get_student_versant_history
    return get_student_versant_history(db, current_user.id)

# ─── Resume ──────────────────────────────────────────────────────────────────

@router.get("/resume", response_model=ResumeFullResponse)
def get_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_resume_full(current_user, db)


@router.post("/resume/generate-with-ai")
def generate_resume_with_ai(
    data: GenerateResumeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.generate_resume_with_ai(data.prompt, current_user, db)


@router.post("/resume/improve-with-ai")
def improve_resume_with_ai(
    data: ImproveResumeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.improve_resume_with_ai(data.resumeData, current_user, db)
