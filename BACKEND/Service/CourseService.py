from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from Models.User import User, UserRole
from Models.Course import Course, Enrollment
from Schemas.CourseSchema import CourseCreate, CourseUpdate


class CourseService:

    # ─────────────────────────────────────────
    # Get All Active Courses (any logged-in user)
    # ─────────────────────────────────────────
    def get_all(self, db: Session) -> list:
        courses = db.query(Course).filter(Course.is_active == True).all()
        result = []
        for c in courses:
            faculty = db.query(User).filter(User.id == c.faculty_id).first()
            result.append({
                "course_id": c.id,
                "title": c.title,
                "description": c.description,
                "semester": c.semester,
                "faculty_name": faculty.full_name if faculty else "Unknown",
                "is_active": c.is_active,
                "created_at": c.created_at,
            })
        return result

    # ─────────────────────────────────────────
    # Create Course (faculty only)
    # ─────────────────────────────────────────
    def create(self, data: CourseCreate, current_user: User, db: Session) -> dict:
        course = Course(
            faculty_id=current_user.id,
            title=data.title,
            description=data.description,
            semester=data.semester,
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        return {
            "course_id": course.id,
            "title": course.title,
            "description": course.description,
            "semester": course.semester,
            "created_at": course.created_at,
        }

    # ─────────────────────────────────────────
    # Enroll Student in Course
    # ─────────────────────────────────────────
    def enroll(self, course_id: int, current_user: User, db: Session) -> dict:
        # Check course exists
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        # Check already enrolled
        existing = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already enrolled in this course"
            )

        enrollment = Enrollment(
            student_id=current_user.id,
            course_id=course_id,
        )
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)

        return {
            "enrollment_id": enrollment.id,
            "course_id": course_id,
            "course_title": course.title,
            "enrolled_at": enrollment.enrolled_at,
            "progress": enrollment.progress,
            "message": f"Successfully enrolled in {course.title}"
        }

    # ─────────────────────────────────────────
    # Update Course Progress (student)
    # ─────────────────────────────────────────
    def update_progress(
        self, course_id: int, progress: float, current_user: User, db: Session
    ) -> dict:
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id
        ).first()

        if not enrollment:
            raise HTTPException(status_code=404, detail="Enrollment not found")

        enrollment.progress = min(progress, 100.0)
        db.commit()

        return {
            "course_id": course_id,
            "progress": enrollment.progress,
            "message": "Progress updated"
        }


course_service = CourseService()