from fastapi import HTTPException, status, Depends, APIRouter
from sqlalchemy.orm import Session
from Models.Assignment import Assignment
from Models.Course import Course


class AdminService:
    pass