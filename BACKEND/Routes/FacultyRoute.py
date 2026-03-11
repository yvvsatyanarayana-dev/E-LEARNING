from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Security import get_current_user
from Models.User import User
from Service.FacultyService import FacultyService
from typing import List
from Schemas.FacultySchema import (
    FacultyDashboardResponse, FacultyCourseSummary, FacultyAssignmentDetail, 
    FacultyQuizDetail, FacultyStudentDetail, FacultyGradeBookEntry, FacultyAnalyticsData,
    FacultyLectureDetail, FacultyProfileResponse, FacultyAttendanceCourse
)

router = APIRouter(prefix="/faculty", tags=["Faculty"])
faculty_service = FacultyService()

@router.get("/dashboard", response_model=FacultyDashboardResponse)
def get_faculty_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_dashboard(current_user, db)

@router.get("/profile", response_model=FacultyProfileResponse)
def get_faculty_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_profile(current_user, db)

@router.get("/attendance", response_model=List[FacultyAttendanceCourse])
def get_faculty_attendance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_attendance(current_user, db)

@router.get("/courses", response_model=List[FacultyCourseSummary])
def get_faculty_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_courses(current_user, db)

@router.get("/lectures", response_model=List[FacultyLectureDetail])
def get_faculty_lectures(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_lectures(current_user, db)

@router.get("/assignments", response_model=List[FacultyAssignmentDetail])
def get_faculty_assignments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_assignments(current_user, db)

@router.get("/quizzes", response_model=List[FacultyQuizDetail])
def get_faculty_quizzes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_quizzes(current_user, db)

@router.get("/students", response_model=List[FacultyStudentDetail])
def get_faculty_all_students(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_all_students(current_user, db)

@router.get("/gradebook", response_model=List[FacultyGradeBookEntry])
def get_faculty_gradebook(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_gradebook(current_user, db)

@router.get("/analytics", response_model=FacultyAnalyticsData)
def get_faculty_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_analytics(current_user, db)
