from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from Models.User import User
from Models.Course import Course, Enrollment
from Models.Assignment import Assignment, AssignmentSubmission
from Models.Quiz import Quiz, QuizAttempt
from Models.Project import Project
from Schemas.AssignmentSchema import SubmissionGrade


class FacultyService:

    # ─────────────────────────────────────────
    # Faculty Dashboard Overview
    # Returns all stats needed for the top stat cards
    # ─────────────────────────────────────────
    def get_dashboard(self, current_user: User, db: Session) -> dict:
        # All courses by this faculty
        courses = db.query(Course).filter(
            Course.faculty_id == current_user.id
        ).all()
        course_ids = [c.id for c in courses]

        # Total students across all courses
        total_students = db.query(Enrollment).filter(
            Enrollment.course_id.in_(course_ids)
        ).count()

        # Pending submissions to grade (grade is None)
        pending_grade = db.query(AssignmentSubmission).join(
            Assignment, AssignmentSubmission.assignment_id == Assignment.id
        ).filter(
            Assignment.course_id.in_(course_ids),
            AssignmentSubmission.grade == None
        ).count()

        # Average quiz score across all courses
        attempts = db.query(QuizAttempt).join(
            Quiz, QuizAttempt.quiz_id == Quiz.id
        ).filter(
            Quiz.course_id.in_(course_ids),
            QuizAttempt.score != None
        ).all()

        avg_score = (
            round(sum(a.score for a in attempts) / len(attempts), 1)
            if attempts else 0
        )

        return {
            "faculty": {
                "id": current_user.id,
                "full_name": current_user.full_name,
                "email": current_user.email,
            },
            "stats": {
                "total_courses": len(courses),
                "total_students": total_students,
                "pending_grade_count": pending_grade,
                "avg_class_score": avg_score,
            }
        }

    # ─────────────────────────────────────────
    # My Courses
    # Returns courses with lecture progress, avg attendance, avg score
    # Used by the "My Courses" panel in the faculty dashboard
    # ─────────────────────────────────────────
    def get_my_courses(self, current_user: User, db: Session) -> list:
        courses = db.query(Course).filter(
            Course.faculty_id == current_user.id
        ).all()

        result = []
        for course in courses:
            # Student count
            student_count = db.query(Enrollment).filter(
                Enrollment.course_id == course.id
            ).count()

            # Avg progress across enrolled students (used as attendance proxy)
            enrollments = db.query(Enrollment).filter(
                Enrollment.course_id == course.id
            ).all()
            avg_progress = (
                round(sum(e.progress for e in enrollments) / len(enrollments), 1)
                if enrollments else 0
            )

            # Avg quiz score for this course
            attempts = db.query(QuizAttempt).join(
                Quiz, QuizAttempt.quiz_id == Quiz.id
            ).filter(
                Quiz.course_id == course.id,
                QuizAttempt.score != None
            ).all()
            avg_score = (
                round(sum(a.score for a in attempts) / len(attempts), 1)
                if attempts else 0
            )

            # Pending submissions to grade
            pending = db.query(AssignmentSubmission).join(
                Assignment, AssignmentSubmission.assignment_id == Assignment.id
            ).filter(
                Assignment.course_id == course.id,
                AssignmentSubmission.grade == None
            ).count()

            result.append({
                "course_id": course.id,
                "title": course.title,
                "description": course.description,
                "semester": course.semester,
                "is_active": course.is_active,
                "student_count": student_count,
                "avg_progress": avg_progress,
                "avg_quiz_score": avg_score,
                "pending_grade_count": pending,
                "created_at": course.created_at,
            })

        return result

    # ─────────────────────────────────────────
    # Quiz Analytics
    # Returns quiz stats per course — avg, highest, lowest score
    # Used by "Quiz Analytics" panel in faculty dashboard
    # ─────────────────────────────────────────
    def get_quiz_analytics(self, current_user: User, db: Session) -> list:
        courses = db.query(Course).filter(
            Course.faculty_id == current_user.id
        ).all()

        result = []
        for course in courses:
            quizzes = db.query(Quiz).filter(Quiz.course_id == course.id).all()

            for quiz in quizzes:
                attempts = db.query(QuizAttempt).filter(
                    QuizAttempt.quiz_id == quiz.id,
                    QuizAttempt.score != None
                ).all()

                if not attempts:
                    continue

                scores = [a.score for a in attempts]
                total_enrolled = db.query(Enrollment).filter(
                    Enrollment.course_id == course.id
                ).count()

                result.append({
                    "quiz_id": quiz.id,
                    "quiz_title": quiz.title,
                    "course_title": course.title,
                    "avg_score": round(sum(scores) / len(scores), 1),
                    "highest_score": max(scores),
                    "lowest_score": min(scores),
                    "submitted_count": len(attempts),
                    "total_students": total_enrolled,
                })

        return result

    # ─────────────────────────────────────────
    # All Students Across Faculty Courses
    # Used by "Student Spotlight" panel
    # ─────────────────────────────────────────
    def get_students(self, current_user: User, db: Session) -> list:
        course_ids = [
            c.id for c in db.query(Course).filter(
                Course.faculty_id == current_user.id
            ).all()
        ]

        # Get unique student IDs enrolled in faculty's courses
        enrollments = db.query(Enrollment).filter(
            Enrollment.course_id.in_(course_ids)
        ).all()

        seen = set()
        result = []
        for enrollment in enrollments:
            if enrollment.student_id in seen:
                continue
            seen.add(enrollment.student_id)

            student = db.query(User).filter(
                User.id == enrollment.student_id
            ).first()
            if not student:
                continue

            # Quiz average for this student
            attempts = db.query(QuizAttempt).filter(
                QuizAttempt.student_id == student.id,
                QuizAttempt.score != None
            ).all()
            avg_score = (
                round(sum(a.score for a in attempts) / len(attempts), 1)
                if attempts else 0
            )

            result.append({
                "student_id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "progress": enrollment.progress,
                "avg_quiz_score": avg_score,
                "enrolled_at": enrollment.enrolled_at,
            })

        return result

    # ─────────────────────────────────────────
    # Pending Submissions
    # Returns ungraded submissions for faculty to grade
    # ─────────────────────────────────────────
    def get_pending_submissions(self, current_user: User, db: Session) -> list:
        course_ids = [
            c.id for c in db.query(Course).filter(
                Course.faculty_id == current_user.id
            ).all()
        ]

        submissions = db.query(AssignmentSubmission).join(
            Assignment, AssignmentSubmission.assignment_id == Assignment.id
        ).filter(
            Assignment.course_id.in_(course_ids),
            AssignmentSubmission.grade == None
        ).all()

        result = []
        for sub in submissions:
            assignment = db.query(Assignment).filter(
                Assignment.id == sub.assignment_id
            ).first()
            student = db.query(User).filter(User.id == sub.student_id).first()
            course = db.query(Course).filter(Course.id == assignment.course_id).first()

            result.append({
                "submission_id": sub.id,
                "assignment_title": assignment.title if assignment else "Unknown",
                "course_title": course.title if course else "Unknown",
                "student_name": student.full_name if student else "Unknown",
                "student_id": sub.student_id,
                "file_url": sub.file_url,
                "submitted_at": sub.submitted_at,
            })

        return result

    # ─────────────────────────────────────────
    # Grade a Submission
    # Faculty grades a student's assignment
    # ─────────────────────────────────────────
    def grade_submission(
        self,
        submission_id: int,
        data: SubmissionGrade,
        current_user: User,
        db: Session,
    ) -> dict:
        submission = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.id == submission_id
        ).first()

        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")

        # Verify this assignment belongs to this faculty's course
        assignment = db.query(Assignment).filter(
            Assignment.id == submission.assignment_id
        ).first()
        course = db.query(Course).filter(Course.id == assignment.course_id).first()

        if course.faculty_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only grade submissions from your own courses"
            )

        submission.grade = data.grade
        submission.feedback = data.feedback
        db.commit()
        db.refresh(submission)

        return {
            "submission_id": submission.id,
            "grade": submission.grade,
            "feedback": submission.feedback,
            "message": "Submission graded successfully"
        }


faculty_service = FacultyService()