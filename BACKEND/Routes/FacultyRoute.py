from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Dependencies import get_faculty, get_faculty_or_admin
from Models.User import User
from Schemas.AssignmentSchema import SubmissionGrade
from Services.FacultyService import faculty_service

router = APIRouter(prefix="/faculty", tags=["Faculty Dashboard"])


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_faculty),
    db: Session = Depends(get_db),
):
    """
    Returns all data for the faculty dashboard top section:
    - Faculty info
    - Stat cards: total students, active courses, pending grade count, avg class score
    """
    return faculty_service.get_dashboard(current_user, db)


@router.get("/courses")
def get_my_courses(
    current_user: User = Depends(get_faculty),
    db: Session = Depends(get_db),
):
    """
    Returns faculty's courses with full stats for the My Courses panel:
    - Student count, avg progress, avg quiz score, pending submissions
    - Lecture progress bar data
    """
    return faculty_service.get_my_courses(current_user, db)


@router.get("/quiz-analytics")
def get_quiz_analytics(
    current_user: User = Depends(get_faculty),
    db: Session = Depends(get_db),
):
    """
    Returns quiz statistics per quiz across all faculty courses.
    Each item: avg score, highest, lowest, submission count.
    Used by the Quiz Analytics panel.
    """
    return faculty_service.get_quiz_analytics(current_user, db)


@router.get("/students")
def get_students(
    current_user: User = Depends(get_faculty),
    db: Session = Depends(get_db),
):
    """
    Returns all students enrolled in faculty's courses.
    Used by the Student Spotlight panel.
    Each item: name, progress, avg quiz score.
    """
    return faculty_service.get_students(current_user, db)


@router.get("/submissions/pending")
def get_pending_submissions(
    current_user: User = Depends(get_faculty),
    db: Session = Depends(get_db),
):
    """
    Returns all ungraded assignment submissions across faculty's courses.
    Used for the Pending Tasks panel and badge count.
    """
    return faculty_service.get_pending_submissions(current_user, db)


@router.patch("/submissions/{submission_id}/grade")
def grade_submission(
    submission_id: int,
    data: SubmissionGrade,
    current_user: User = Depends(get_faculty),
    db: Session = Depends(get_db),
):
    """
    Faculty grades a student's assignment submission.
    Body: { grade: float, feedback: string }
    Only works for submissions from this faculty's own courses.
    """
    return faculty_service.grade_submission(submission_id, data, current_user, db)