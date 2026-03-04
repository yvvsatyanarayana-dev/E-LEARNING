from sqlalchemy.orm import Session
from fastapi import HTTPException
from Models.User import User
from Models.Course import Course, Enrollment
from Models.Assignment import Assignment, AssignmentSubmission
from Schemas.AssignmentSchema import AssignmentCreate, SubmissionCreate


class AssignmentService:

    # ─────────────────────────────────────────
    # Create Assignment (faculty)
    # ─────────────────────────────────────────
    def create(self, data: AssignmentCreate, current_user: User, db: Session) -> dict:
        course = db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        if course.faculty_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your course")

        assignment = Assignment(
            course_id=data.course_id,
            faculty_id=current_user.id,
            title=data.title,
            description=data.description,
            due_date=data.due_date,
        )
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        return {
            "assignment_id": assignment.id,
            "title": assignment.title,
            "due_date": assignment.due_date,
            "message": "Assignment created"
        }

    # ─────────────────────────────────────────
    # Get Assignments for a Course
    # ─────────────────────────────────────────
    def get_by_course(self, course_id: int, db: Session) -> list:
        assignments = db.query(Assignment).filter(
            Assignment.course_id == course_id
        ).all()
        return [
            {
                "assignment_id": a.id,
                "title": a.title,
                "description": a.description,
                "due_date": a.due_date,
                "created_at": a.created_at,
            }
            for a in assignments
        ]

    # ─────────────────────────────────────────
    # Submit Assignment (student)
    # ─────────────────────────────────────────
    def submit(self, data: SubmissionCreate, current_user: User, db: Session) -> dict:
        assignment = db.query(Assignment).filter(
            Assignment.id == data.assignment_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        # Check already submitted
        existing = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == data.assignment_id,
            AssignmentSubmission.student_id == current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Already submitted")

        submission = AssignmentSubmission(
            assignment_id=data.assignment_id,
            student_id=current_user.id,
            file_url=data.file_url,
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)

        return {
            "submission_id": submission.id,
            "assignment_id": submission.assignment_id,
            "submitted_at": submission.submitted_at,
            "message": "Assignment submitted successfully"
        }


assignment_service = AssignmentService()