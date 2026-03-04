from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from Models.User import User
from Models.Course import Course, Enrollment
from Models.Assignment import Assignment, AssignmentSubmission
from Models.Quiz import Quiz, QuizAttempt
from Models.Placement import SkillScore, PlacementReadiness


class StudentService:

    # ─────────────────────────────────────────
    # Dashboard Overview
    # Returns all data needed for the student dashboard top section
    # ─────────────────────────────────────────
    def get_dashboard(self, current_user: User, db: Session) -> dict:
        # Enrolled courses count
        enrolled = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id
        ).all()

        # Pending assignments (submitted = None)
        pending_assignments = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.student_id == current_user.id,
            AssignmentSubmission.grade == None
        ).count()

        # Placement readiness
        pri = db.query(PlacementReadiness).filter(
            PlacementReadiness.student_id == current_user.id
        ).first()

        # Quiz attempts — calculate average score
        attempts = db.query(QuizAttempt).filter(
            QuizAttempt.student_id == current_user.id
        ).all()
        avg_quiz_score = (
            round(sum(a.score for a in attempts if a.score) / len(attempts), 1)
            if attempts else 0
        )

        return {
            "student": {
                "id": current_user.id,
                "full_name": current_user.full_name,
                "email": current_user.email,
                "role": current_user.role,
            },
            "stats": {
                "courses_enrolled": len(enrolled),
                "pending_assignments": pending_assignments,
                "avg_quiz_score": avg_quiz_score,
                "placement_readiness_index": pri.pri_score if pri else 0,
                "mock_interviews_done": pri.mock_interviews_done if pri else 0,
            }
        }

    # ─────────────────────────────────────────
    # My Courses
    # Returns enrolled courses with progress for the course list panel
    # ─────────────────────────────────────────
    def get_my_courses(self, current_user: User, db: Session) -> list:
        enrollments = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id
        ).all()

        result = []
        for enrollment in enrollments:
            course = db.query(Course).filter(
                Course.id == enrollment.course_id
            ).first()
            if not course:
                continue

            # Faculty name
            faculty = db.query(User).filter(User.id == course.faculty_id).first()

            # Pending assignment for this course
            assignment = db.query(Assignment).filter(
                Assignment.course_id == course.id
            ).first()

            result.append({
                "course_id": course.id,
                "title": course.title,
                "description": course.description,
                "semester": course.semester,
                "faculty_name": faculty.full_name if faculty else "Unknown",
                "progress": enrollment.progress,
                "enrolled_at": enrollment.enrolled_at,
                "pending_due": assignment.due_date if assignment else None,
            })

        return result

    # ─────────────────────────────────────────
    # Quiz Performance
    # Returns quiz attempts with scores for the quiz performance panel
    # ─────────────────────────────────────────
    def get_quiz_performance(self, current_user: User, db: Session) -> list:
        attempts = db.query(QuizAttempt).filter(
            QuizAttempt.student_id == current_user.id
        ).order_by(QuizAttempt.attempted_at.desc()).limit(10).all()

        result = []
        for attempt in attempts:
            quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
            if not quiz:
                continue

            result.append({
                "attempt_id": attempt.id,
                "quiz_id": quiz.id,
                "quiz_title": quiz.title,
                "score": attempt.score,
                "time_taken_seconds": attempt.time_taken_seconds,
                "attempted_at": attempt.attempted_at,
            })

        return result

    # ─────────────────────────────────────────
    # Skill Tracker
    # Returns skill scores for the skill tracker panel
    # ─────────────────────────────────────────
    def get_skill_scores(self, current_user: User, db: Session) -> list:
        skills = db.query(SkillScore).filter(
            SkillScore.student_id == current_user.id
        ).all()

        return [
            {
                "skill_name": s.skill_name,
                "score": s.score,
                "updated_at": s.updated_at,
            }
            for s in skills
        ]

    # ─────────────────────────────────────────
    # Placement Readiness Index
    # Returns PRI score for sidebar + skill summary panel
    # ─────────────────────────────────────────
    def get_placement_readiness(self, current_user: User, db: Session) -> dict:
        pri = db.query(PlacementReadiness).filter(
            PlacementReadiness.student_id == current_user.id
        ).first()

        if not pri:
            return {
                "pri_score": 0,
                "mock_interviews_done": 0,
                "skills_completed": 0,
            }

        return {
            "pri_score": pri.pri_score,
            "mock_interviews_done": pri.mock_interviews_done,
            "skills_completed": pri.skills_completed,
            "updated_at": pri.updated_at,
        }

    # ─────────────────────────────────────────
    # Pending Assignments
    # Returns unsubmitted assignments for the badge count
    # ─────────────────────────────────────────
    def get_pending_assignments(self, current_user: User, db: Session) -> list:
        # Get all enrolled course IDs
        enrolled_course_ids = [
            e.course_id for e in db.query(Enrollment).filter(
                Enrollment.student_id == current_user.id
            ).all()
        ]

        # Get assignments for those courses
        assignments = db.query(Assignment).filter(
            Assignment.course_id.in_(enrolled_course_ids)
        ).all()

        result = []
        for assignment in assignments:
            # Check if already submitted
            submission = db.query(AssignmentSubmission).filter(
                AssignmentSubmission.assignment_id == assignment.id,
                AssignmentSubmission.student_id == current_user.id
            ).first()

            course = db.query(Course).filter(Course.id == assignment.course_id).first()

            result.append({
                "assignment_id": assignment.id,
                "title": assignment.title,
                "description": assignment.description,
                "course_title": course.title if course else "Unknown",
                "due_date": assignment.due_date,
                "submitted": submission is not None,
                "grade": submission.grade if submission else None,
            })

        return result


student_service = StudentService()