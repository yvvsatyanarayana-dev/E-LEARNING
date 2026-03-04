from sqlalchemy.orm import Session
from fastapi import HTTPException
from Models.User import User
from Models.Course import Course
from Models.Quiz import Quiz, Question, QuizAttempt
from Schemas.QuizSchema import QuizCreate, QuizAttemptCreate


class QuizService:

    # ─────────────────────────────────────────
    # Get Quizzes for a Course (with questions)
    # ─────────────────────────────────────────
    def get_by_course(self, course_id: int, db: Session) -> list:
        quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).all()
        result = []
        for quiz in quizzes:
            questions = db.query(Question).filter(
                Question.quiz_id == quiz.id
            ).all()
            result.append({
                "quiz_id": quiz.id,
                "title": quiz.title,
                "difficulty": quiz.difficulty,
                "is_ai_generated": quiz.is_ai_generated,
                "created_at": quiz.created_at,
                "questions": [
                    {
                        "question_id": q.id,
                        "question_text": q.question_text,
                        "type": q.type,
                        "options": q.options,
                    }
                    for q in questions
                ],
            })
        return result

    # ─────────────────────────────────────────
    # Create Quiz (faculty)
    # ─────────────────────────────────────────
    def create(self, data: QuizCreate, current_user: User, db: Session) -> dict:
        course = db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        if course.faculty_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your course")

        quiz = Quiz(
            course_id=data.course_id,
            faculty_id=current_user.id,
            title=data.title,
            difficulty=data.difficulty,
            is_ai_generated=data.is_ai_generated,
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        # Save questions if provided
        for q_data in (data.questions or []):
            question = Question(
                quiz_id=quiz.id,
                question_text=q_data.question_text,
                type=q_data.type,
                options=q_data.options,
                correct_answer=q_data.correct_answer,
            )
            db.add(question)
        db.commit()

        return {
            "quiz_id": quiz.id,
            "title": quiz.title,
            "difficulty": quiz.difficulty,
            "message": "Quiz created successfully"
        }

    # ─────────────────────────────────────────
    # Submit Quiz Attempt (student)
    # ─────────────────────────────────────────
    def submit_attempt(
        self, data: QuizAttemptCreate, current_user: User, db: Session
    ) -> dict:
        quiz = db.query(Quiz).filter(Quiz.id == data.quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        attempt = QuizAttempt(
            quiz_id=data.quiz_id,
            student_id=current_user.id,
            score=data.score,
            time_taken_seconds=data.time_taken_seconds,
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

        return {
            "attempt_id": attempt.id,
            "quiz_title": quiz.title,
            "score": attempt.score,
            "attempted_at": attempt.attempted_at,
            "message": "Quiz attempt submitted"
        }


quiz_service = QuizService()