from fastapi import FastAPI
from Core.Config import settings
from Core.Database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

# Models
from Models.User import User, UserRole
from Models.Assignment import Assignment, AssignmentSubmission
from Models.Placement import ApplicationStatus, SkillScore, PlacementReadiness, Internship, InternshipApplication
from Models.Course import Course, Enrollment
from Models.Lesson import Lesson, WatchHistory
from Models.Quiz import Quiz, Question, QuizAttempt, QuestionType, DifficultyLevel
from Models.Project import Project, ProjectReview, ProjectStatus
from Models.Community import Forum, ForumPost, StudyGroup, StudyGroupMember

# Routes ← ADD THIS
from Routes.auth import router as auth_router

app = FastAPI(
    title=settings.APP_NAME,
    description="A comprehensive smart-campus platform API built with FastAPI and SQLAlchemy.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

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

# Register routers ← THIS IS THE KEY LINE
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} is running!"}