from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Dependencies import get_student, get_faculty, get_any_user
from Models.User import User
from Schemas.AssignmentSchema import AssignmentCreate, SubmissionCreate
from Services.AssignmentService import assignment_service

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.get("/{course_id}")
def get_by_course(
    course_id: int,
    current_user: User = Depends(get_any_user),
    db: Session = Depends(get_db),
):
    """Get all assignments for a course."""
    return assignment_service.get_by_course(course_id, db)


@router.post("/", status_code=201)
def create_assignment(
    data: AssignmentCreate,
    current_user: User = Depends(get_faculty),
    db: Session = Depends(get_db),
):
    """Create assignment. Faculty only."""
    return assignment_service.create(data, current_user, db)


@router.post("/submit")
def submit_assignment(
    data: SubmissionCreate,
    current_user: User = Depends(get_student),
    db: Session = Depends(get_db),
):
    """Student submits an assignment."""
    return assignment_service.submit(data, current_user, db)