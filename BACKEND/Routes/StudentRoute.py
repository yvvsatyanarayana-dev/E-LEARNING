from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Dependencies import get_student
from Models.User import User
from Services.StudentService import student_service

router = APIRouter(prefix="/student", tags=["Student Dashboard"])


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """
    Returns all data for the student dashboard top section:
    - Student info
    - Stat cards: courses enrolled, pending assignments, avg quiz score, PRI
    """
    return student_service.get_dashboard(current_user, db)


@router.get("/courses")
def get_my_courses(
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """
    Returns enrolled courses with progress for the course list panel.
    Each course includes: title, faculty, progress %, next due date.
    """
    return student_service.get_my_courses(current_user, db)


@router.get("/quiz-performance")
def get_quiz_performance(
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """
    Returns last 10 quiz attempts with scores.
    Used by the Quiz Performance panel.
    """
    return student_service.get_quiz_performance(current_user, db)


@router.get("/skills")
def get_skill_scores(
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """
    Returns all skill scores for the Skill Tracker panel.
    e.g. DSA: 82, Python: 74, SQL: 68
    """
    return student_service.get_skill_scores(current_user, db)


@router.get("/placement-readiness")
def get_placement_readiness(
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """
    Returns Placement Readiness Index (PRI) for the sidebar
    and skill summary panel.
    """
    return student_service.get_placement_readiness(current_user, db)


@router.get("/assignments")
def get_pending_assignments(
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """
    Returns all assignments across enrolled courses.
    Each item includes: title, course, due date, submitted status, grade.
    Used for the Assignments badge count and list.
    """
    return student_service.get_pending_assignments(current_user, db)