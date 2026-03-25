from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
from datetime import datetime
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
    FacultyReportResponse, FacultyAssignmentUpdate, FacultyQuizUpdate, FacultyMetadataResponse,
    FacultyQuestionBankItem, FacultyQuestionBankCreate, FacultyQuestionBankUpdate
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

@router.get("/courses/{course_id}", response_model=dict)
def get_faculty_course(course_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_course(current_user, db, course_id)


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

@router.delete("/assignments/{assignment_id}")
def delete_faculty_assignment(assignment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.delete_assignment(current_user, db, assignment_id)

@router.get("/quizzes", response_model=List[FacultyQuizDetail])
def get_faculty_quizzes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_quizzes(current_user, db)

@router.post("/quizzes", response_model=FacultyQuizDetail)
def create_faculty_quiz(data: FacultyQuizCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.create_quiz(current_user, db, data)

@router.put("/quizzes/{quiz_id}", response_model=FacultyQuizDetail)
def update_faculty_quiz(quiz_id: int, data: FacultyQuizUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.update_quiz(current_user, db, quiz_id, data)

@router.delete("/quizzes/{quiz_id}")
def delete_faculty_quiz(quiz_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.delete_quiz(current_user, db, quiz_id)

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

@router.get("/reports/export/{report_type}")
def export_faculty_report(report_type: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    output = faculty_service.export_report(current_user, db, report_type)
    
    filename = f"{report_type}_report_{datetime.now().strftime('%Y%m%d')}.csv"
    
    # Ensure the stream starts from the beginning
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/metadata", response_model=FacultyMetadataResponse)
def get_faculty_metadata(db: Session = Depends(get_db)):
    return faculty_service.get_metadata(db)

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

@router.post("/ai/chat", summary="Faculty AI Assistant Chat")
def faculty_ai_chat(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("faculty", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return faculty_service.faculty_ai_chat(db, current_user.id, payload)


# ── QUESTION BANK ROUTES ──────────────────────────────────────────────

@router.get("/questions", response_model=List[FacultyQuestionBankItem])
def get_faculty_questions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.get_question_bank(current_user, db)

@router.post("/questions", response_model=FacultyQuestionBankItem)
def create_faculty_question(data: FacultyQuestionBankCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.create_question(current_user, db, data.model_dump())

@router.put("/questions/{question_id}", response_model=FacultyQuestionBankItem)
def update_faculty_question(question_id: int, data: FacultyQuestionBankUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.update_question(current_user, db, question_id, data.model_dump(exclude_unset=True))

@router.delete("/questions/{question_id}")
def delete_faculty_question(question_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return faculty_service.delete_question(current_user, db, question_id)


# ── MEETING ROUTES ────────────────────────────────────────────────────

@router.get("/meetings/groups")
def get_meeting_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return faculty's courses as meeting groups with student counts."""
    return faculty_service.get_meeting_groups(current_user, db)

@router.post("/meetings/start")
def start_meeting(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Start or create a meeting room for a specific course group."""
    course_id = body.get("course_id")
    if not course_id:
        raise HTTPException(status_code=400, detail="course_id is required")
    return faculty_service.start_meeting(current_user, db, int(course_id))

@router.post("/meetings/end")
def end_meeting(body: dict, current_user: User = Depends(get_current_user)):
    """End a live meeting room."""
    group_key = body.get("group_key")
    if not group_key:
        raise HTTPException(status_code=400, detail="group_key is required")
    return faculty_service.end_meeting(current_user, group_key)

@router.get("/meetings/history")
def get_meeting_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return past meeting history for the faculty."""
    return faculty_service.get_meeting_history(current_user, db)
