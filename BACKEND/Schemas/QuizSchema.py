from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any
from enum import Enum


class DifficultyLevel(str, Enum):
    easy   = "easy"
    medium = "medium"
    hard   = "hard"


class QuestionType(str, Enum):
    mcq         = "mcq"
    coding      = "coding"
    descriptive = "descriptive"


# ─── Question ────────────────────────────────────

class QuestionCreate(BaseModel):
    question_text: str
    type: QuestionType = QuestionType.mcq
    options: Optional[List[str]] = None   # ["A. Python", "B. Java", ...]
    correct_answer: Optional[str] = None


class QuestionResponse(BaseModel):
    id: int
    quiz_id: int
    question_text: str
    type: QuestionType
    options: Optional[List[Any]]
    correct_answer: Optional[str]

    class Config:
        from_attributes = True


# ─── Quiz ─────────────────────────────────────────

class QuizCreate(BaseModel):
    course_id: int
    title: str
    difficulty: DifficultyLevel = DifficultyLevel.medium
    is_ai_generated: bool = False
    questions: Optional[List[QuestionCreate]] = []


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None


class QuizResponse(BaseModel):
    id: int
    course_id: int
    faculty_id: int
    title: str
    difficulty: DifficultyLevel
    is_ai_generated: bool
    created_at: datetime
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True


# ─── Quiz Attempt ─────────────────────────────────

class QuizAttemptCreate(BaseModel):
    quiz_id: int
    score: float
    time_taken_seconds: Optional[int] = None


class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    student_id: int
    score: Optional[float]
    attempted_at: datetime
    time_taken_seconds: Optional[int]

    class Config:
        from_attributes = True
