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


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------- Response Schemas ----------

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
