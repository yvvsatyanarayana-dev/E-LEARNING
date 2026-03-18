from fastapi import APIRouter, Depends
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