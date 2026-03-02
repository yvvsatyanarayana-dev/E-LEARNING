from fastapi import FastAPI
from Core.Config import settings
from Core.Database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from Models.User import User, UserRole
from Models.Assignment import Assignment, AssignmentSubmission
from Models.Placement import ApplicationStatus, SkillScore, PlacementReadiness, Internship, InternshipApplication, ApplicationStatus
from Models.Course import Course, Enrollment
from Models.Lesson import Lesson, WatchHistory
from Models.Quiz import Quiz, Question, QuizAttempt, QuestionType, DifficultyLevel
from Models.Project import Project, ProjectReview, ProjectStatus
from Models.Community import Forum, ForumPost, StudyGroup, StudyGroupMember
from Core.Dependencies import get_any_user, get_student, get_faculty, get_placement_officer, get_admin, get_faculty_or_admin, get_placement_or_admin, get_student_or_faculty
from Core.Config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="A comprehensive smart-campus platform API built with FastAPI and SQLAlchemy.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
Base.metadata.create_all(bind=engine)

origins = [
        'https://localhost:5173/',
        'http://localhost:5173/'
]
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*']
)

PREFIX = "/api/v1"

@app.get("/")
async def root():
    return {"message": f"{settings.DATABASE_URL} is connected successfully!"}
