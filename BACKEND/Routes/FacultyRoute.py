from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Security import get_current_user
from Models.User import User
from Service.FacultyService import FacultyService
from typing import List
from Schemas.FacultySchema import FacultyDashboardResponse, FacultyCourseSummary, FacultyAssignmentDetail, FacultyQuizDetail

router = APIRouter(prefix="/faculty", tags=["Faculty"])
faculty_service = FacultyService()

@router.get("/dashboard", response_model=FacultyDashboardResponse)
def get_faculty_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return FacultyService().get_dashboard(current_user, db)

@router.get("/courses", response_model=List[FacultyCourseSummary])
def get_faculty_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return FacultyService().get_courses(current_user, db)

@router.get("/assignments", response_model=List[FacultyAssignmentDetail])
def get_faculty_assignments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return FacultyService().get_assignments(current_user, db)

@router.get("/quizzes", response_model=List[FacultyQuizDetail])
def get_faculty_quizzes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return FacultyService().get_quizzes(current_user, db)
