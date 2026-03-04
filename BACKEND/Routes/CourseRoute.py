from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Dependencies import get_student, get_faculty_or_admin, get_any_user
from Models.User import User
from Schemas.CourseSchema import CourseCreate
from Services.CourseService import course_service

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("/")
def get_all_courses(
    current_user: User = Depends(get_any_user),
    db: Session = Depends(get_db),
):
    """Get all active courses. Any logged-in user can view."""
    return course_service.get_all(db)


@router.post("/", status_code=201)
def create_course(
    data: CourseCreate,
    current_user: User = Depends(get_faculty_or_admin),
    db: Session = Depends(get_db),
):
    """Create a new course. Faculty and Admin only."""
    return course_service.create(data, current_user, db)


@router.post("/{course_id}/enroll")
def enroll(
    course_id: int,
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """Enroll the logged-in student in a course."""
    return course_service.enroll(course_id, current_user, db)


@router.patch("/{course_id}/progress")
def update_progress(
    course_id: int,
    progress: float,
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """Update student's progress in a course (0-100)."""
    return course_service.update_progress(course_id, progress, current_user, db)