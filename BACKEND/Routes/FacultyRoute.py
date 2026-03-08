from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Security import get_current_user
from Models.User import User
from Service.FacultyService import FacultyService
from Schemas.FacultySchema import FacultyDashboardResponse

router = APIRouter(prefix="/faculty", tags=["Faculty"])
faculty_service = FacultyService()

@router.get("/dashboard", response_model=FacultyDashboardResponse)
def get_faculty_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return faculty_service.get_dashboard(current_user, db)
