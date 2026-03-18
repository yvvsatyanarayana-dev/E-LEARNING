from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional


class UserRole(str, Enum):
    student = "student"
    faculty = "faculty"
    placement_officer = "placement_officer"
    admin = "admin"


# ---------- Request Schemas ----------

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.student
    department: Optional[str] = None
    target_group: Optional[str] = "All"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    settings: Optional[dict] = None


# ---------- Response Schemas ----------

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    department: Optional[str] = None
    target_group: Optional[str] = "All"
    avatar: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class UserSessionResponse(BaseModel):
    id: str
    device: str
    location: str
    time: str
    is_current: bool