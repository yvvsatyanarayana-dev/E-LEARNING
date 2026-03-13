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
    MockInterviewsFullResponse, InnovationHubResponse, InternshipsOverviewResponse,
    CourseDetailResponse, AIChatRequest, AIChatResponse
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
def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_courses(current_user, db)


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


# ─── Placement ───────────────────────────────────────────────────────────────

@router.get("/schedule", response_model=ScheduleFullResponse)
def get_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_schedule(current_user, db)


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


# ─── Mock Interviews ─────────────────────────────────────────────────────────

@router.get("/mock-interviews", response_model=MockInterviewsFullResponse)
def get_mock_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_mock_interviews(current_user, db)


# ─── Resume ──────────────────────────────────────────────────────────────────

@router.get("/resume")
def get_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return student_service.get_resume(current_user, db)
