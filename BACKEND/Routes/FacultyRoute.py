from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Security import get_current_user
import os, shutil, uuid

from Models.User import User
from Service.FacultyService import FacultyService
from typing import List
from Schemas.FacultySchema import (
    FacultyDashboardResponse, FacultyCourseSummary, FacultyAssignmentDetail, 
    FacultyQuizDetail, FacultyStudentDetail, FacultyGradeBookEntry, FacultyAnalyticsData,
    FacultyLectureDetail, FacultyProfileResponse, FacultyAttendanceCourse,
    FacultySettingsResponse, FacultySettingsUpdate,
    FacultyLessonCreate, FacultyAssignmentCreate, FacultyQuizCreate, FacultyCourseCreate,
    FacultyReportResponse, FacultyAssignmentUpdate, FacultyQuizUpdate
)

router = APIRouter(prefix="/faculty", tags=["Faculty"])
faculty_service = FacultyService()

@router.get("/settings", response_model=FacultySettingsResponse)
def get_faculty_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_settings(current_user, db)

@router.put("/settings", response_model=FacultySettingsResponse)
def update_faculty_settings(update: FacultySettingsUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.update_settings(current_user, db, update)

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

@router.post("/courses", response_model=FacultyCourseSummary)
def create_faculty_course(data: FacultyCourseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.create_course(current_user, db, data)

@router.get("/lectures", response_model=List[FacultyLectureDetail])
def get_faculty_lectures(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_lectures(current_user, db)

@router.post("/lectures", response_model=FacultyLectureDetail)
def create_faculty_lecture(data: FacultyLessonCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.create_lesson(current_user, db, data)

@router.get("/assignments", response_model=List[FacultyAssignmentDetail])
def get_faculty_assignments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_assignments(current_user, db)

@router.post("/assignments", response_model=FacultyAssignmentDetail)
def create_faculty_assignment(data: FacultyAssignmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.create_assignment(current_user, db, data)

@router.put("/assignments/{assignment_id}", response_model=FacultyAssignmentDetail)
def update_faculty_assignment(assignment_id: int, data: FacultyAssignmentUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.update_assignment(current_user, db, assignment_id, data)

@router.get("/quizzes", response_model=List[FacultyQuizDetail])
def get_faculty_quizzes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_quizzes(current_user, db)

@router.post("/quizzes", response_model=FacultyQuizDetail)
def create_faculty_quiz(data: FacultyQuizCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.create_quiz(current_user, db, data)

@router.put("/quizzes/{quiz_id}", response_model=FacultyQuizDetail)
def update_faculty_quiz(quiz_id: int, data: FacultyQuizUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.update_quiz(current_user, db, quiz_id, data)

@router.get("/students", response_model=List[FacultyStudentDetail])
def get_faculty_all_students(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_all_students(current_user, db)

@router.get("/gradebook", response_model=List[FacultyGradeBookEntry])
def get_faculty_gradebook(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_gradebook(current_user, db)

@router.get("/analytics", response_model=FacultyAnalyticsData)
def get_faculty_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_analytics(current_user, db)

@router.get("/reports", response_model=FacultyReportResponse)
def get_faculty_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_reports(current_user, db)

@router.post("/upload")
def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        ext = file.filename.split('.')[-1] if '.' in file.filename else "bin"
        filename = f"{uuid.uuid4()}.{ext}"
        os.makedirs("uploads", exist_ok=True)
        filepath = os.path.join("uploads", filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return properly formatted URL to be saved in DB
        return {"url": f"http://127.0.0.1:8000/uploads/{filename}", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
