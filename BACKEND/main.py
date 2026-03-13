import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from Core.Config import settings
from Core.Database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from Core.Config import settings
# MODELS
from Models.User import User, UserRole
from Models.Assignment import Assignment, AssignmentSubmission
from Models.Placement import ApplicationStatus, SkillScore, PlacementReadiness, Internship, InternshipApplication
from Models.Course import Course, Enrollment
from Models.Lesson import Lesson, WatchHistory
from Models.Quiz import Quiz, Question, QuizAttempt, QuestionType, DifficultyLevel
from Models.Project import Project, ProjectReview, ProjectStatus
from Models.Community import Forum, ForumPost, StudyGroup, StudyGroupMember
from Models.Innovation import InnovationIdea, InnovationProject, InnovationHackathon
#ROUTES
from Routes.AuthRoute import router as auth_router
from Routes.StudentRoute import router as student_router
from Routes.FacultyRoute import router as faculty_router
from Routes.PlacementRoute import router as placement_router
app = FastAPI(
    title=settings.APP_NAME,
    description="A comprehensive smart-campus platform API built with FastAPI and SQLAlchemy.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
#database tables creation
Base.metadata.create_all(bind=engine)
# CORS ← fixed, no trailing slashes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(auth_router, prefix=PREFIX)
app.include_router(student_router, prefix=PREFIX)
app.include_router(faculty_router, prefix=PREFIX)
app.include_router(placement_router, prefix=PREFIX)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} is running!"}