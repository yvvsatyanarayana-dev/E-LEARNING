from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from Models.User import User, UserRole
from Models.Course import Course, Enrollment
from Models.Quiz import Quiz, QuizAttempt
from Models.Assignment import Assignment, AssignmentSubmission
from Schemas.FacultySchema import (
    FacultyDashboardResponse, FacultyStatsResponse, FacultyCourseSummary,
    FacultyScheduleItem, FacultyTaskItem, FacultyQuizStat,
    FacultyWeakTopic, FacultyTopStudent
)
from fastapi import HTTPException

class FacultyService:
    def get_dashboard(self, faculty: User, db: Session) -> FacultyDashboardResponse:
        if faculty.role != UserRole.faculty:
            raise HTTPException(status_code=403, detail="Only faculty can access this dashboard")

        # 1. Get stats
        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        course_ids = [c.id for c in courses]
        
        total_students = db.query(func.count(func.distinct(Enrollment.student_id)))\
            .filter(Enrollment.course_id.in_(course_ids)).scalar() or 0
        
        # Mocking attendance and avg score for now as models don't directly store these yet
        avg_attendance = 82.5 
        avg_class_score = 73.8

        stats = FacultyStatsResponse(
            total_students=total_students,
            active_courses=len(courses),
            avg_attendance=avg_attendance,
            avg_class_score=avg_class_score
        )

        # 2. Courses Summary
        course_summaries = []
        palette = ["var(--indigo-l)", "var(--teal)", "var(--violet)", "var(--amber)"]
        for i, c in enumerate(courses):
            student_count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
            pending_grades = db.query(func.count(AssignmentSubmission.id))\
                .join(Assignment)\
                .filter(Assignment.course_id == c.id, AssignmentSubmission.grade == None).scalar() or 0
            
            course_summaries.append(FacultyCourseSummary(
                id=c.id,
                name=c.title,
                code=f"CS{500+c.id}", # Mock code
                semester=c.semester or "Sem 5",
                student_count=student_count,
                lectures_done=len(c.lessons) // 2, # Mock progress
                lectures_total=len(c.lessons),
                avg_attendance=80.0 + (c.id % 10),
                avg_score=70.0 + (c.id % 15),
                pending_grades=pending_grades,
                color=palette[i % len(palette)]
            ))

        # 3. Schedule (Mocked as we don't have faculty schedule model)
        schedule = [
            FacultyScheduleItem(from_time="09:00", to_time="10:00", name="Operating Systems — Lecture 34", room="Room 301", tag="Lecture", color="var(--teal)"),
            FacultyScheduleItem(from_time="13:00", to_time="14:30", name="DBMS Lab — Batch B", room="Lab 2", tag="Lab", color="var(--indigo-l)")
        ]

        # 4. Tasks
        tasks = []
        ungraded_submissions = db.query(AssignmentSubmission)\
            .join(Assignment)\
            .filter(Assignment.course_id.in_(course_ids), AssignmentSubmission.grade == None).limit(5).all()
        
        for sub in ungraded_submissions:
            tasks.append(FacultyTaskItem(
                id=sub.id,
                label=f"Grade {sub.assignment.title}",
                course=sub.assignment.course.title,
                due="Today",
                urgent=True,
                type="grade"
            ))

        # 5. Quiz Stats
        quiz_stats = []
        quizzes = db.query(Quiz).filter(Quiz.course_id.in_(course_ids)).limit(3).all()
        for q in quizzes:
            attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == q.id).all()
            if attempts:
                scores = [a.score for a in attempts]
                avg = sum(scores) / len(scores)
                high = max(scores)
                low = min(scores)
            else:
                avg, high, low = 0, 0, 0
            
            quiz_stats.append(FacultyQuizStat(
                name=q.title,
                avg_score=avg,
                highest_score=high,
                lowest_score=low,
                submitted_count=len(attempts),
                total_count=total_students, # Approximation
                color=palette[q.id % len(palette)]
            ))

        # 6. Weak Topics (Hardcoded for now as it requires complex analysis)
        weak_topics = [
            FacultyWeakTopic(course="OS", topic="Deadlock Detection", student_count=34, percentage=30, color="var(--rose)"),
            FacultyWeakTopic(course="DBMS", topic="Transaction Isolation", student_count=41, percentage=38, color="var(--amber)")
        ]

        # 7. Top Students
        top_students = []
        # Get top 5 students by overall PRI score or quiz performance
        best_attempts = db.query(User)\
            .join(Enrollment)\
            .filter(Enrollment.course_id.in_(course_ids))\
            .distinct().limit(5).all()
        
        for s in best_attempts:
            top_students.append(FacultyTopStudent(
                name=s.full_name,
                roll=s.roll_number or "N/A",
                cgpa=8.5, # Mock
                attendance=90, # Mock
                course="Multiple",
                badge="Top Performer",
                badge_color="var(--teal)"
            ))

        return FacultyDashboardResponse(
            stats=stats,
            courses=course_summaries,
            schedule=schedule,
            tasks=tasks,
            quiz_stats=quiz_stats,
            weak_topics=weak_topics,
            top_students=top_students
        )
