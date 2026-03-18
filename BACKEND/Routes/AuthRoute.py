from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
import os, shutil, uuid
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Security import get_current_user
from Models.User import User
from Schemas.UserSchema import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
    ChangePasswordRequest,
    UserSessionResponse,
    UserUpdate,
)
from Service.Auth import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user.
    - Roles: student | faculty | placement_officer | admin
    - Password is hashed with bcrypt
    """
    return auth_service.register(data, db)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password.
    - Returns JWT access token + user info
    - Frontend should store token and use in Authorization header
    """
    return auth_service.login(data, db)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get currently logged-in user's profile.
    - Requires Authorization: Bearer <token>
    """
    return auth_service.get_me(current_user)


@router.patch("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update currently logged-in user's profile.
    - Allows updating full_name, phone, department, avatar, and settings.
    """
    return auth_service.update_me(data, current_user, db)


@router.patch("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change password for logged-in user.
    - Requires old password to verify identity
    - New password must be different from old
    """
    return auth_service.change_password(data, current_user, db)


@router.get("/sessions", response_model=list[UserSessionResponse])
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get active login sessions for the current user.
    - Used in Settings page to show security history
    """
    return auth_service.get_sessions(current_user, db)


@router.post("/upload")
def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """
    General purpose file upload endpoint.
    - Saves file to uploads/ directory with a unique UUID name
    - Returns the absolute URL of the uploaded file
    """
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