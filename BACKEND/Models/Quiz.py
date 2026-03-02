from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Text, JSON, Enum
from sqlalchemy.orm import relationship
from Core.Database import Base
import enum


class DifficultyLevel(str, enum.Enum):
    easy   = "easy"
    medium = "medium"
    hard   = "hard"


class QuestionType(str, enum.Enum):
    mcq         = "mcq"
    coding      = "coding"
    descriptive = "descriptive"


class Quiz(Base):
    __tablename__ = "quizzes"

    id              = Column(Integer, primary_key=True, index=True)
    course_id       = Column(Integer, ForeignKey("courses.id"), nullable=False)
    faculty_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    title           = Column(String(200), nullable=False)
    difficulty      = Column(Enum(DifficultyLevel), default=DifficultyLevel.medium)
    is_ai_generated = Column(Boolean, default=False)
    created_at      = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    course    = relationship("Course", back_populates="quizzes")
    faculty   = relationship("User", foreign_keys=[faculty_id])
    questions = relationship("Question", back_populates="quiz")
    attempts  = relationship("QuizAttempt", back_populates="quiz")

    def __repr__(self):
        return f"<Quiz {self.title}>"


class Question(Base):
    __tablename__ = "questions"

    id             = Column(Integer, primary_key=True, index=True)
    quiz_id        = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text  = Column(Text, nullable=False)
    type           = Column(Enum(QuestionType), default=QuestionType.mcq)
    options        = Column(JSON, nullable=True)   # ["A", "B", "C", "D"]
    correct_answer = Column(Text, nullable=True)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")

    def __repr__(self):
        return f"<Question quiz={self.quiz_id}>"


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id                 = Column(Integer, primary_key=True, index=True)
    quiz_id            = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    score              = Column(Float, nullable=True)
    attempted_at       = Column(DateTime(timezone=True), default=datetime.utcnow)
    time_taken_seconds = Column(Integer, nullable=True)

    # Relationships
    quiz    = relationship("Quiz", back_populates="attempts")
    student = relationship("User", back_populates="quiz_attempts")

    def __repr__(self):
        return f"<QuizAttempt student={self.student_id} quiz={self.quiz_id}>"
