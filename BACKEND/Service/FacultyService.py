from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from datetime import datetime
from Models.User import User, UserRole
from Models.Course import Course, Enrollment
from Models.Quiz import Quiz, QuizAttempt
from Models.Assignment import Assignment, AssignmentSubmission
from Schemas.FacultySchema import (
    FacultyDashboardResponse, FacultyStatsResponse, FacultyCourseSummary,
    FacultyScheduleItem, FacultyTaskItem, FacultyQuizStat,
    FacultyWeakTopic, FacultyTopStudent,
    FacultyAssignmentDetail, FacultyQuizDetail,
    FacultyAssignmentSubmission, FacultyQuizQuestion, FacultyQuizResult
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
        rubric: List[Dict[str, Any]]
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

    def get_courses(self, faculty: User, db: Session) -> List[FacultyCourseSummary]:
        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        summaries = []
        palette = ["var(--indigo-l)", "var(--teal)", "var(--violet)", "var(--amber)"]
        for i, c in enumerate(courses):
            student_count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
            pending_grades = db.query(func.count(AssignmentSubmission.id))\
                .join(Assignment)\
                .filter(Assignment.course_id == c.id, AssignmentSubmission.grade == None).scalar() or 0
            
            # Simplified avg scores/attendance for now
            summaries.append(FacultyCourseSummary(
                id=c.id,
                name=c.title,
                code=f"CS{500+c.id}",
                semester=c.semester or "Sem 5",
                student_count=student_count,
                lectures_done=len(c.lessons) // 2,
                lectures_total=len(c.lessons),
                avg_attendance=80.0 + (c.id % 5),
                avg_score=70.0 + (c.id % 10),
                pending_grades=pending_grades,
                color=palette[i % len(palette)]
            ))
        return summaries

    def get_assignments(self, faculty: User, db: Session) -> List[FacultyAssignmentDetail]:
        assignments = db.query(Assignment).filter(Assignment.faculty_id == faculty.id).all()
        details = []
        for a in assignments:
            submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == a.id).all()
            scores = [s.grade for s in submissions if s.grade is not None]
            avg = sum(scores) / len(scores) if scores else None
            high = max(scores) if scores else None
            low = min(scores) if scores else None
            
            # Map status based on due date
            status = "live"
            if a.due_date and a.due_date < datetime.utcnow():
                status = "grading" if any(s.grade is None for s in submissions) else "done"

            details.append(FacultyAssignmentDetail(
                id=a.id,
                course_id=a.course_id,
                course_code=f"CS{500+a.course_id}",
                title=a.title,
                type=a.type or "Theory",
                due_label="Today" if status == "grading" else a.due_date.strftime("%b %d") if a.due_date else "—",
                due_date=a.due_date.strftime("%b %d") if a.due_date else "—",
                marks=int(a.max_marks),
                submissions_count=len(submissions),
                avg_score=avg,
                highest=high,
                lowest=low,
                status=status,
                week="W9", # Mock week for now
                unit="Unit II", # Mock unit for now
                description=a.description or "",
                rubric=[], # Rubric parsing if needed
                submissions=[
                    FacultyAssignmentSubmission(
                        roll=s.student.roll_number or "N/A",
                        name=s.student.full_name,
                        score=s.grade,
                        trend="up",
                        submitted=s.submitted_at.strftime("%b %d") if s.submitted_at else None,
                        status="graded" if s.grade is not None else "pending"
                    ) for s in submissions
                ]
            ))
        return details

    def get_quizzes(self, faculty: User, db: Session) -> List[FacultyQuizDetail]:
        quizzes = db.query(Quiz).filter(Quiz.faculty_id == faculty.id).all()
        details = []
        for q in quizzes:
            attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == q.id).all()
            scores = [a.score for a in attempts if a.score is not None]
            avg = sum(scores) / len(scores) if scores else None
            high = max(scores) if scores else None
            low = min(scores) if scores else None

            details.append(FacultyQuizDetail(
                id=q.id,
                course_id=q.course_id,
                course_code=f"CS{500+q.course_id}",
                title=q.title,
                type="MCQ", # Mock type
                status="live", # Mock status
                questions_count=len(q.questions),
                marks=sum(que.marks for que in q.questions) if q.questions else 0,
                duration=30, # Mock duration
                week="W9",
                unit="Unit II",
                start_date="Oct 26 10:00 AM",
                end_date="Oct 26 10:30 AM",
                attempts_count=len(attempts),
                avg_score=avg,
                highest=high,
                lowest=low,
                pass_pct=85.0 if attempts else None,
                description=q.title,
                shuffle=True,
                show_result=True,
                neg_mark=False,
                questions=[
                    FacultyQuizQuestion(
                        q=que.question_text,
                        options=que.options,
                        ans=que.correct_answer,
                        marks=que.marks or 1
                    ) for que in q.questions
                ],
                results=[
                    FacultyQuizResult(
                        roll=a.student.roll_number or "N/A",
                        name=a.student.full_name,
                        score=a.score or 0.0,
                        total=sum(que.marks for que in q.questions) if q.questions else 0,
                        time=f"{a.time_taken_seconds//60}m" if a.time_taken_seconds else "—",
                        status="submitted"
                    ) for a in attempts
                ]
            ))
        return details
