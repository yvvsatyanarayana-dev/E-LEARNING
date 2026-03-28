from sqlalchemy.orm import Session
from sqlalchemy import func, select
import json, io, csv
from typing import Optional, List, Dict, Any
from Core.Database import get_db
from Core.MeetingState import ACTIVE_MEETINGS
from datetime import datetime, timezone, timedelta, date
from Models.User import User, UserRole
from Models.Course import Course, Enrollment
from Models.Quiz import Quiz, QuizAttempt, Question
from Models.Assignment import Assignment, AssignmentSubmission
from Schemas.FacultySchema import (
    FacultyDashboardResponse, FacultyStatsResponse, FacultyCourseSummary,
    FacultyScheduleItem, FacultyTaskItem, FacultyQuizStat,
    FacultyWeakTopic, FacultyTopStudent,
    FacultyAssignmentDetail, FacultyQuizDetail,
    FacultyAssignmentSubmission, FacultyQuizQuestion, FacultyQuizResult,
    FacultyStudentDetail, FacultyGradeBookEntry,    FacultyAnalyticsData,
    FacultyScoreDist, FacultyEngagementMetric, FacultyWeakTopicTrend,
    FacultyLectureDetail, FacultyProfileCourse, FacultyProfileResponse,
    FacultyLessonCreate, FacultyAssignmentCreate, FacultyQuizCreate, FacultyCourseCreate,
    FacultyAttendanceStudent, FacultyAttendanceCourse,
    FacultySettingsResponse, FacultySettingsUpdate,
    FacultySettingsNotifications, FacultySettingsAppearance,
    FacultySettingsAccount, FacultySettingsAI,
    FacultyNotificationModel, FacultyRecentActivity,
    FacultyReportStats, FacultyReportCourseMetric, FacultyReportResponse,
    FacultyAssignmentUpdate, FacultyQuizUpdate, FacultyMetadataResponse,
    AttendanceBulkSubmit, AttendanceRecordResponse, AttendanceHistoryGrid
)
from Models.Attendance import DailyAttendance, AttendanceStatus
from Models.Placement import PlacementReadiness, SkillScore
from Models.Lesson import Lesson, WatchHistory
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
        
        # Calculate real avg_attendance from WatchHistory vs total Lessons
        attendances = []
        enrollments_for_stats = db.query(Enrollment).filter(Enrollment.course_id.in_(course_ids)).all()
        for e in enrollments_for_stats:
            course_obj = next((c for c in courses if c.id == e.course_id), None)
            if not course_obj:
                continue
            total_l = len(course_obj.lessons) or 1
            watched = db.query(func.count(WatchHistory.id)).filter(
                WatchHistory.student_id == e.student_id,
                WatchHistory.lesson_id.in_(
                    select(Lesson.id).where(Lesson.course_id == course_obj.id)
                )
            ).scalar() or 0
            attendances.append(float((watched / total_l) * 100))
        avg_attendance = round(float(sum(attendances) / len(attendances)), 1) if attendances else 0.0

        # Calculate real avg_class_score from assignment submissions + quiz attempts
        score_pcts = []
        sub_rows = db.query(AssignmentSubmission)\
            .join(Assignment)\
            .filter(Assignment.course_id.in_(course_ids), AssignmentSubmission.grade != None)\
            .all()
        for s in sub_rows:
            max_m = int(s.assignment.max_marks or 100)
            score_pcts.append((s.grade / max_m) * 100)
        quiz_attempts_rows = db.query(QuizAttempt)\
            .join(Quiz)\
            .filter(Quiz.course_id.in_(course_ids), QuizAttempt.score != None)\
            .all()
        for qa in quiz_attempts_rows:
            q_count = len(qa.quiz.questions) or 1
            score_pcts.append((qa.score / q_count) * 100)
        avg_class_score = round(float(sum(score_pcts) / len(score_pcts)), 1) if score_pcts else 0.0

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
                color=palette[i % len(palette)],
                section="A",
                description=c.description or f"Comprehensive course on {c.title}.",
                last_updated=datetime.now().strftime("%b %d")
            ))

        # 3. Schedule (Dynamic generation for demo/now)
        # In a real app this would query a Timetable model
        current_day = datetime.now().weekday() # 0 is Monday
        schedule = []
        if current_day < 5: # Monday - Friday
            for i, c in enumerate(courses[:2]):
                start_h = 9 + (i * 2)
                schedule.append(FacultyScheduleItem(
                    from_time=f"{start_h:02d}:00",
                    to_time=f"{start_h+1:02d}:30",
                    name=f"{c.title} — Lecture",
                    room=f"Room {300+c.id}",
                    tag="Lecture",
                    color=palette[i % len(palette)]
                ))
        
        # 4. Academic Metadata
        # (Could be in a Config model)
        academic_meta = {
            "year": "2024–25",
            "semester": "5",
            "week": "11",
            "today": datetime.now().strftime("%a, %d %b")
        }
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

        # 6. Weak Topics - Derive from lowest quiz scores/assignments
        weak_topics = []
        low_scores = db.query(QuizAttempt).filter(QuizAttempt.score < 5, QuizAttempt.quiz_id.in_(select(Quiz.id).where(Quiz.course_id.in_(course_ids)))).all()
        if low_scores:
            # Group by quiz
            from collections import Counter
            quiz_counts = Counter(l.quiz_id for l in low_scores)
            for qid, count in quiz_counts.most_common(2):
                quiz_obj = db.query(Quiz).get(qid)
                if quiz_obj:
                    weak_topics.append(FacultyWeakTopic(
                        course=quiz_obj.course.title[:4], 
                        topic=quiz_obj.title, 
                        student_count=count, 
                        percentage=int((count / total_students) * 100) if total_students else 0, 
                        color="var(--rose)" if count > total_students * 0.3 else "var(--amber)"
                    ))
        
        # 7. Top Students - Based on PRI Scores
        top_students = []
        from Models.Placement import PlacementReadiness
        top_pri = db.query(PlacementReadiness).filter(PlacementReadiness.student_id.in_(select(Enrollment.student_id).where(Enrollment.course_id.in_(course_ids))))\
                    .order_by(PlacementReadiness.pri_score.desc()).limit(5).all()
        
        for p in top_pri:
            top_students.append(FacultyTopStudent(
                name=p.student.full_name,
                roll=p.student.roll_number or "N/A",
                cgpa=round(float(8.0 + (float(p.pri_score) / 50.0)), 1), # Better mock derived from PRI
                attendance=92, 
                course="B.Tech CS",
                badge="Elite Performer" if p.pri_score > 85 else "Top Performer",
                badge_color="var(--indigo-ll)" if p.pri_score > 85 else "var(--teal)"
            ))
        
        if not top_students: # Final fallback if no PRI records
            best_students = db.query(User).filter(User.id.in_(select(Enrollment.student_id).where(Enrollment.course_id.in_(course_ids)))).limit(5).all()
            for s in best_students:
                top_students.append(FacultyTopStudent(
                    name=s.full_name, roll=s.roll_number or "N/A", cgpa=8.5, attendance=90, course="CS", badge="Student", badge_color="var(--teal)"
                ))

        # 8. AI Insights (Replacements for hardcoded AI responses in the frontend)
        ai_insights = [
            f"Based on quiz results, <strong style='color:var(--rose)'>{weak_topics[0].student_count} students</strong> scored below 40% on {weak_topics[0].topic}. Want me to generate a remedial quiz set? 🎯" if weak_topics else "All students are performing well in recent quizzes! Keep up the great work. 🌟",
            f"Average attendance in {course_summaries[1].name if len(course_summaries) > 1 else (course_summaries[0].name if course_summaries else 'your courses')} dropped by <strong style='color:var(--amber)'>6%</strong> this week.",
            f"I've analyzed {total_students} student records. Common error: <strong style='color:var(--teal)'>incorrect Round Robin queue simulation</strong>.",
            f"Generating a 20-question Unit IV paper on <strong style='color:var(--indigo-ll)'>Memory Management</strong> with difficulty distribution: 40% easy, 40% medium, 20% hard.",
            f"Your course completion rate is <strong style='color:var(--teal)'>ahead by 2 lectures</strong> compared to the semester plan. Great pacing, {faculty.full_name.split()[0]}! ✨",
        ]

        return FacultyDashboardResponse(
            stats=stats,
            courses=course_summaries,
            schedule=schedule,
            tasks=tasks,
            quiz_stats=quiz_stats,
            weak_topics=weak_topics,
            top_students=top_students,
            ai_insights=ai_insights,
            notifications=self.get_notifications(faculty, db),
            recent_activity=self.get_recent_activity(faculty, db),
            academic_meta=academic_meta
        )

    def create_course(self, faculty: User, db: Session, data: FacultyCourseCreate) -> FacultyCourseSummary:
        new_course = Course(
            faculty_id=faculty.id,
            title=data.title,
            description=data.description,
            semester=data.semester,
            is_active=True
        )
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        
        # Return a summary
        palette = ["var(--indigo-l)", "var(--teal)", "var(--violet)", "var(--amber)"]
        return FacultyCourseSummary(
            id=new_course.id,
            name=new_course.title,
            code=f"CS{500+new_course.id}",
            semester=new_course.semester or "Sem 5",
            student_count=0,
            lectures_done=0,
            lectures_total=0,
            avg_attendance=0.0,
            avg_score=0.0,
            pending_grades=0,
            color=palette[new_course.id % len(palette)],
            section="A",
            description=new_course.description or "",
            last_updated="Just now"
        )

    def get_courses(self, faculty: User, db: Session) -> List[FacultyCourseSummary]:
        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        if not courses:
            courses = db.query(Course).all() # Fallback for demo: show all if none owned
        summaries = []
        palette = ["var(--indigo-l)", "var(--teal)", "var(--violet)", "var(--amber)"]
        for i, c in enumerate(courses):
            student_count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
            pending_grades = db.query(func.count(AssignmentSubmission.id))\
                .join(Assignment)\
                .filter(Assignment.course_id == c.id, AssignmentSubmission.grade == None).scalar() or 0
            
            # Calculate real lecture progress
            lectures_total = db.query(func.count(Lesson.id)).filter(Lesson.course_id == c.id).scalar() or 0
            lectures_done = db.query(func.count(Lesson.id)).filter(Lesson.course_id == c.id, Lesson.video_url != None, Lesson.video_url != "").scalar() or 0

            # Simplified avg scores/attendance for now
            summaries.append(FacultyCourseSummary(
                id=c.id,
                name=c.title,
                code=f"CS{500+c.id}",
                semester=c.semester or "Sem 5",
                student_count=student_count,
                lectures_done=lectures_done,
                lectures_total=lectures_total,
                avg_attendance=80.0 + (c.id % 5),
                avg_score=70.0 + (c.id % 10),
                pending_grades=pending_grades,
                color=palette[i % len(palette)],
                section="A",
                description=c.description or f"Comprehensive course on {c.title}.",
                last_updated=datetime.now().strftime("%b %d")
            ))
        return summaries

    def get_lectures(self, faculty: User, db: Session) -> List[FacultyLectureDetail]:
        if faculty.role != UserRole.faculty:
            raise HTTPException(status_code=403, detail="Only faculty can access lectures")
            
        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        course_ids = [c.id for c in courses]
        
        from Models.Lesson import Lesson
        
        lessons = db.query(Lesson).filter(Lesson.course_id.in_(course_ids)).all()
        
        lectures = []
        for i, l in enumerate(lessons):
            c = next((c for c in courses if c.id == l.course_id), None)
            
            # Use deterministic mock data for properties not currently tracked in the database
            # to fulfill the beautiful UI data requirements
            
            # Map course ID to a "CS50X" style string expected by the frontend
            course_code_str = f"cs50{c.id}" if c else "cs501"
            is_live = bool(l.video_url)
            
            lectures.append(FacultyLectureDetail(
                id=l.id,
                courseId=course_code_str,
                title=l.title,
                week=f"W{min(15, l.order or (i % 15) + 1)}",
                unit=f"Unit {'I' * ((l.order or 1) % 5 + 1)}",
                dur=l.duration or "45m",
                views=(l.id * 17) % 250 + 50 if is_live else 0,
                watchPct=(l.id * 7) % 40 + 60 if is_live else 0,
                rating=4.0 + ((l.id * 3) % 10) / 10.0 if is_live else 0,
                tags=["Lecture", "Concepts"],
                status="live" if is_live else "pending",
                date=l.created_at.strftime("%b %d") if l.created_at and is_live else None,
                desc=l.title + " overview and detailed examples.",
                target_group=l.target_group
            ))
            
        return lectures

    def create_lesson(self, faculty: User, db: Session, data: FacultyLessonCreate) -> FacultyLectureDetail:
        from Models.Lesson import Lesson
        
        # Verify course exists
        course = db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
            
        new_lesson = Lesson(
            course_id=data.course_id,
            title=data.title,
            video_url=data.video_url,
            pdf_url=data.pdf_url,
            duration=data.duration,
            target_group=data.target_group,
            order=len(course.lessons) + 1
        )
        db.add(new_lesson)
        db.commit()
        db.refresh(new_lesson)
        
        course_code_str = f"cs50{course.id}"
        
        return FacultyLectureDetail(
            id=new_lesson.id,
            courseId=course_code_str,
            title=new_lesson.title,
            week=f"W{min(15, new_lesson.order)}",
            unit=f"Unit {'I' * (new_lesson.order % 5 + 1)}",
            dur=new_lesson.duration or "45m",
            views=0,
            watchPct=0,
            rating=0.0,
            tags=["Lecture"],
            status="live" if new_lesson.video_url else "pending",
            date=new_lesson.created_at.strftime("%b %d") if new_lesson.created_at else None,
            desc=new_lesson.title,
            target_group=new_lesson.target_group
        )

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
            if a.due_date and a.due_date < datetime.now(timezone.utc):
                status = "grading" if any(s.grade is None for s in submissions) else "done"

            details.append(FacultyAssignmentDetail(
                id=a.id,
                course_id=a.course_id,
                course_code=f"CS{500+a.course_id}",
                title=a.title,
                type=a.type or "Theory",
                due_label="Today" if status == "grading" else a.due_date.strftime("%b %d") if a.due_date else "—",
                due_date=a.due_date.strftime("%b %d") if a.due_date else "—",
                marks=int(a.max_marks) if a.max_marks is not None else 100,
                submissions_count=len(submissions),
                avg_score=avg,
                highest=high,
                lowest=low,
                status=status,
                week=a.week or "W1",
                unit=a.unit or "Unit I",
                description=a.description or "",
                rubric=json.loads(a.rubric) if a.rubric else [],
                submissions=len(submissions),
                submissions_list=[
                    FacultyAssignmentSubmission(
                        roll=s.student.roll_number or "N/A",
                        name=s.student.full_name,
                        score=s.grade,
                        trend="up",
                        submitted=s.submitted_at.strftime("%b %d") if s.submitted_at else None,
                        file_url=s.file_url,
                        status="graded" if s.grade is not None else "pending"
                    ) for s in submissions
                ]
            ))
        return details

    def create_assignment(self, faculty: User, db: Session, data: FacultyAssignmentCreate) -> FacultyAssignmentDetail:
        course = db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
            
        import json
        new_assignment = Assignment(
            course_id=data.course_id,
            faculty_id=faculty.id,
            title=data.title,
            description=data.description,
            type=data.type,
            max_marks=data.marks,  # Map from data.marks
            weight=data.weight,
            difficulty=data.difficulty,
            estimated_hours=data.estimated_hours,
            rubric=json.dumps(data.rubric) if data.rubric else "[]",
            due_date=data.due_date,
            target_group=data.target_group,
            week=data.week,
            unit=data.unit
        )
        db.add(new_assignment)
        db.commit()
        db.refresh(new_assignment)
        
        return FacultyAssignmentDetail(
            id=new_assignment.id,
            course_id=new_assignment.course_id,
            course_code=f"CS{500+new_assignment.course_id}",
            title=new_assignment.title,
            type=new_assignment.type or "Theory",
            due_label=new_assignment.due_date.strftime("%b %d") if new_assignment.due_date else "—",
            due_date=new_assignment.due_date.strftime("%b %d") if new_assignment.due_date else "—",
            marks=int(new_assignment.max_marks) if new_assignment.max_marks is not None else 100,
            submissions_count=0,
            avg_score=0.0,
            highest=0.0,
            lowest=0.0,
            status="live",
            week=new_assignment.week or "W1",
            unit=new_assignment.unit or "Unit I",
            description=new_assignment.description or "",
            rubric=json.loads(new_assignment.rubric) if new_assignment.rubric else [],
            submissions=0,
            submissions_list=[],
            target_group=new_assignment.target_group
        )

    def update_assignment(self, faculty: User, db: Session, assignment_id: int, data: FacultyAssignmentUpdate) -> FacultyAssignmentDetail:
        assignment = db.query(Assignment).filter(Assignment.id == assignment_id, Assignment.faculty_id == faculty.id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        if data.title is not None: assignment.title = data.title
        if data.description is not None: assignment.description = data.description
        if data.course_id is not None: assignment.course_id = data.course_id
        if data.due_date is not None: assignment.due_date = data.due_date
        if data.target_group is not None: assignment.target_group = data.target_group
        if data.marks is not None: assignment.max_marks = data.marks
        if data.type is not None: assignment.type = data.type
        if data.week is not None: assignment.week = data.week
        if data.unit is not None: assignment.unit = data.unit
        if data.rubric is not None:
            assignment.rubric = json.dumps(data.rubric)
        
        db.commit()
        db.refresh(assignment)
        
        # Return detail (reuse get_assignments logic or similar)
        submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == assignment.id).all()
        return FacultyAssignmentDetail(
            id=assignment.id,
            course_id=assignment.course_id,
            course_code=f"CS{500+assignment.course_id}",
            title=assignment.title,
            type=assignment.type or "Theory",
            due_label=assignment.due_date.strftime("%b %d") if assignment.due_date else "—",
            due_date=assignment.due_date.strftime("%b %d") if assignment.due_date else "—",
            marks=int(assignment.max_marks) if assignment.max_marks is not None else 100,
            submissions=len(submissions),
            submissions_list=[],
            target_group=assignment.target_group
        )

    def get_quizzes(self, faculty: User, db: Session) -> List[FacultyQuizDetail]:
        quizzes = db.query(Quiz).filter(Quiz.faculty_id == faculty.id).all()
        details = []
        for q in quizzes:
            attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == q.id).all()
            scores = [a.score for a in attempts if a.score is not None]
            avg = sum(scores) / len(scores) if scores else None
            high = max(scores) if scores else None
            low = min(scores) if scores else None
            total_marks = len(q.questions)  # 1 mark per question fallback

            details.append(FacultyQuizDetail(
                id=q.id,
                course_id=q.course_id,
                course_code=f"CS{500+q.course_id}",
                title=q.title,
                type="MCQ",
                status="live",
                questions_count=len(q.questions),
                marks=q.marks or len(q.questions),
                duration=q.duration or 30,
                week=q.week or "W1",
                unit=q.unit or "Unit I",
                start_date=q.start_date or (q.created_at.strftime("%b %d %I:%M %p") if q.created_at else "—"),
                end_date=q.end_date or "TBD",
                attempts_count=len(attempts),
                avg_score=avg or 0.0,
                highest=high or 0.0,
                lowest=low or 0.0,
                pass_pct=85.0 if attempts else 0.0,
                description=q.description or q.title,
                shuffle=q.shuffle,
                show_result=q.show_result,
                neg_mark=q.neg_mark,
                questions=[
                    FacultyQuizQuestion(
                        q=que.question_text,
                        options=que.options,
                        ans=que.correct_answer,
                        marks=1
                    ) for que in q.questions
                ],
                attempts=len(attempts),
                results=[
                    FacultyQuizResult(
                        roll=a.student.roll_number or "N/A",
                        name=a.student.full_name,
                        score=a.score or 0.0,
                        total=total_marks,
                        time=f"{a.time_taken_seconds//60}m" if a.time_taken_seconds else "—",
                        status="submitted"
                    ) for a in attempts
                ]
            ))
        return details

    def create_quiz(self, faculty: User, db: Session, data: FacultyQuizCreate) -> FacultyQuizDetail:
        course = db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
            
        new_quiz = Quiz(
            course_id=data.course_id,
            faculty_id=faculty.id,
            title=data.title,
            description=data.description,
            duration=data.duration,
            marks=data.marks,
            week=data.week,
            unit=data.unit,
            start_date=data.start_date,
            end_date=data.end_date,
            shuffle=data.shuffle,
            show_result=data.show_result,
            neg_mark=data.neg_mark,
            difficulty=(data.difficulty or "medium").lower(),
            is_ai_generated=data.is_ai_generated,
            target_group=data.target_group
        )
        db.add(new_quiz)
        db.flush() # Get ID without committing

        # ─── Save Questions ───
        if data.questions:
            for q_data in data.questions:
                new_q = Question(
                    quiz_id=new_quiz.id,
                    question_text=q_data.q,
                    type="mcq", # Defaulting to mcq for now as per schema
                    options=q_data.options,
                    correct_answer=str(q_data.ans)
                )
                db.add(new_q)
        
        db.commit()
        db.refresh(new_quiz)

        return FacultyQuizDetail(
            id=new_quiz.id,
            course_id=new_quiz.course_id,
            course_code=f"CS{500+new_quiz.course_id}",
            title=new_quiz.title,
            type="MCQ",
            status="live",
            questions_count=len(data.questions) if data.questions else 0,
            marks=new_quiz.marks or 0,
            duration=new_quiz.duration or 30,
            week=new_quiz.week or "W1",
            unit=new_quiz.unit or "Unit I",
            start_date=new_quiz.start_date or (new_quiz.created_at.strftime("%b %d %I:%M %p") if new_quiz.created_at else "—"),
            end_date=new_quiz.end_date or "TBD",
            attempts=0,
            avg_score=0.0,
            highest=0.0,
            lowest=0.0,
            pass_pct=0.0,
            description=new_quiz.description or new_quiz.title,
            shuffle=new_quiz.shuffle,
            show_result=new_quiz.show_result,
            neg_mark=new_quiz.neg_mark,
            questions=data.questions if data.questions else [],
            results=[],
            target_group=new_quiz.target_group
        )

    def update_quiz(self, faculty: User, db: Session, quiz_id: int, data: FacultyQuizUpdate) -> FacultyQuizDetail:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.faculty_id == faculty.id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        if data.title is not None: quiz.title = data.title
        if data.description is not None: quiz.description = data.description
        if data.course_id is not None: quiz.course_id = data.course_id
        if data.target_group is not None: quiz.target_group = data.target_group
        if data.duration is not None: quiz.duration = data.duration
        if data.marks is not None: quiz.marks = data.marks
        if data.week is not None: quiz.week = data.week
        if data.unit is not None: quiz.unit = data.unit
        if data.start_date is not None: quiz.start_date = data.start_date
        if data.end_date is not None: quiz.end_date = data.end_date
        if data.shuffle is not None: quiz.shuffle = data.shuffle
        if data.show_result is not None: quiz.show_result = data.show_result
        if data.neg_mark is not None: quiz.neg_mark = data.neg_mark
        
        if data.questions is not None:
            # Delete old questions and add new ones (simpler than syncing for now)
            db.query(Question).filter(Question.quiz_id == quiz.id).delete()
            for q_data in data.questions:
                new_q = Question(
                    quiz_id=quiz.id,
                    question_text=q_data.q,
                    type="mcq",
                    options=q_data.options,
                    correct_answer=str(q_data.ans)
                )
                db.add(new_q)
        
        db.commit()
        db.refresh(quiz)
        
        return FacultyQuizDetail(
            id=quiz.id,
            course_id=quiz.course_id,
            course_code=f"CS{500+quiz.course_id}",
            title=quiz.title,
            type="MCQ",
            status="live",
            questions_count=len(quiz.questions),
            marks=quiz.marks or 0,
            duration=quiz.duration or 30,
            week=quiz.week or "W1",
            unit=quiz.unit or "Unit I",
            start_date=quiz.start_date or (quiz.created_at.strftime("%b %d %I:%M %p") if quiz.created_at else "—"),
            end_date=quiz.end_date or "TBD",
            attempts_count=0,
            avg_score=0.0,
            highest=0.0,
            lowest=0.0,
            pass_pct=0.0,
            description=quiz.description or quiz.title,
            shuffle=quiz.shuffle,
            show_result=quiz.show_result,
            neg_mark=quiz.neg_mark,
            questions=data.questions if data.questions is not None else [FacultyQuizQuestion(q=q.question_text, options=q.options, ans=q.correct_answer) for q in quiz.questions],
            results=[],
            target_group=quiz.target_group
        )

    def get_all_students(self, faculty: User, db: Session) -> List[FacultyStudentDetail]:
        if faculty.role != UserRole.faculty:
            raise HTTPException(status_code=403, detail="Only faculty can access this dashboard")

        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        course_ids = [c.id for c in courses]
        # Use consistent lowercase keys for frontend mapping (e.g., cs1)
        course_map = {c.id: f"cs{c.id}" for c in courses}

        if not course_ids:
            return []

        enrollments = db.query(Enrollment).filter(Enrollment.course_id.in_(course_ids)).all()
        
        students_data = []
        for e in enrollments:
            student = e.student
            # attendance_pct = int(e.progress) if e.progress is not None else 85
            
            # More real attendance calculation
            attended = db.query(func.count(WatchHistory.id)).filter(
                WatchHistory.student_id == student.id,
                WatchHistory.lesson_id.in_(select(Lesson.id).where(Lesson.course_id == e.course_id))
            ).scalar() or 0
            total_l = db.query(func.count(Lesson.id)).filter(Lesson.course_id == e.course_id).scalar() or 1
            attendance_pct = int((attended / total_l) * 100)
            
            # Get real CGPA from PlacementReadiness if available
            pr = db.query(PlacementReadiness).filter(PlacementReadiness.student_id == student.id).first()
            cgpa = pr.pri_score / 10.0 if pr else (7.0 + (attendance_pct / 50.0))
            
            status = "good"
            if attendance_pct < 65:
                status = "at-risk"
            elif attendance_pct < 80:
                status = "average"

            students_data.append(FacultyStudentDetail(
                roll=student.roll_number or f"ROLL-{student.id}",
                name=student.full_name,
                course=course_map.get(e.course_id, "Unknown"),
                sem=student.department if student.department and "Sem" in student.department else "Sem 5", 
                batch="A" if student.id % 2 == 0 else "B", 
                cgpa=round(float(cgpa or 0), 1),
                attendance=attendance_pct,
                score=int(cgpa * 10),
                status=status,
                email=student.email
            ))

        return students_data

    def get_gradebook(self, faculty: User, db: Session) -> List[FacultyGradeBookEntry]:
        if faculty.role != UserRole.faculty:
            raise HTTPException(status_code=403, detail="Only faculty can access this dashboard")

        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        course_ids = [c.id for c in courses]

        if not course_ids:
            return []

        submissions = db.query(AssignmentSubmission)\
            .join(Assignment)\
            .filter(Assignment.course_id.in_(course_ids))\
            .all()

        entries = []
        for sub in submissions:
            student = sub.student
            assignment = sub.assignment
            course = assignment.course
            
            status = "graded" if sub.grade is not None else "pending"
            if sub.submitted_at and assignment.due_date and sub.submitted_at > assignment.due_date:
                if status != "graded":
                    status = "late"

            entries.append(FacultyGradeBookEntry(
                id=sub.id,
                student_name=student.full_name,
                student_roll=student.roll_number or f"ROLL-{student.id}",
                assignment_id=assignment.id,
                assignment_title=assignment.title,
                course_code=f"cs{course.id}", 
                submitted_on=sub.submitted_at.strftime("%b %d, %Y") if sub.submitted_at else "N/A",
                status=status,
                score=sub.grade,
                max_score=assignment.max_marks or 100
            ))

        return entries

    def get_analytics(self, faculty: User, db: Session) -> FacultyAnalyticsData:
        if faculty.role != UserRole.faculty:
            raise HTTPException(status_code=403, detail="Only faculty can access this dashboard")

        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        course_ids = [c.id for c in courses]
        
        # 1. Total Students (Distinct)
        unique_student_ids = db.query(Enrollment.student_id)\
            .filter(Enrollment.course_id.in_(course_ids))\
            .distinct().subquery()
        total_students = db.query(func.count(unique_student_ids.c.student_id)).scalar() or 0
        
        # 2. Average Score & Score Dist
        # Get all assignment submissions and quiz attempts
        submissions = db.query(AssignmentSubmission)\
            .join(Assignment)\
            .filter(Assignment.course_id.in_(course_ids), AssignmentSubmission.grade != None)\
            .all()
            
        quiz_attempts = db.query(QuizAttempt)\
            .join(Quiz)\
            .filter(Quiz.course_id.in_(course_ids), QuizAttempt.score != None)\
            .all()
            
        all_percentages = []
        for s in submissions:
            max_m = int(s.assignment.max_marks or 100)
            all_percentages.append((s.grade / max_m) * 100)
        
        for qa in quiz_attempts:
            # We'll assume quiz total marks is sum of question marks (default 1)
            # or we can just hope score is already a percentage/points. 
            # Looking at how get_quizzes does it: total marks = count of questions * 1
            q_count = len(qa.quiz.questions) or 1
            all_percentages.append((qa.score / q_count) * 100)
            
        avg_score = sum(all_percentages) / len(all_percentages) if all_percentages else 0.0
        
        score_dist_counts = {"0-40":0, "40-60":0, "60-80":0, "80-100":0}
        for p in all_percentages:
            if p <= 40: score_dist_counts["0-40"] += 1
            elif p <= 60: score_dist_counts["40-60"] += 1
            elif p <= 80: score_dist_counts["60-80"] += 1
            else: score_dist_counts["80-100"] += 1
            
        score_dist_resp = [FacultyScoreDist(range=k, count=v) for k, v in score_dist_counts.items()]
        
        # 3. Average Attendance
        # We'll compute this from WatchHistory vs Lessons
        attendances = []
        enrollments = db.query(Enrollment).filter(Enrollment.course_id.in_(course_ids)).all()
        for e in enrollments:
            course = next((c for c in courses if c.id == e.course_id), None)
            if not course: continue
            total_l = len(course.lessons) or 1
            from Models.Lesson import WatchHistory, Lesson
            watched = db.query(func.count(WatchHistory.id)).filter(
                WatchHistory.student_id == e.student_id,
                WatchHistory.lesson_id.in_(db.query(Lesson.id).filter(Lesson.course_id == course.id).subquery())
            ).scalar() or 0
            attendances.append((watched / total_l) * 100)
            
        avg_attendance = sum(attendances) / len(attendances) if attendances else 0.0
        
        # 4. Engagement & Weak Topic Trend (Mocking by Week as we don't have many records)
        # We'll use the last 5 weeks
        from datetime import timedelta
        engagement_resp = []
        weak_topic_resp = []
        
        for i in range(5, 0, -1):
            week_num = 10 - i # e.g. W5 to W9
            week_label = f"W{week_num}"
            
            # For real implementation, we would filter by date. 
            # Since data might be sparse, we'll return some realistic (derived) values if real data is missing.
            from Models.Lesson import WatchHistory
            views = db.query(func.count(WatchHistory.id)).filter(
                WatchHistory.watched_at >= datetime.now(timezone.utc) - timedelta(weeks=i),
                WatchHistory.watched_at < datetime.now(timezone.utc) - timedelta(weeks=i-1)
            ).scalar() or (1000 + week_num * 100) # Fallback to something dynamic but fake if DB is empty
            
            engagement_resp.append(FacultyEngagementMetric(
                week=week_label, 
                views=views, 
                participation=75 + (week_num % 10), 
                completion=60 + (week_num % 15)
            ))
            
            weak_topic_resp.append(FacultyWeakTopicTrend(
                week=week_label,
                score=int(avg_score * 0.8) + (week_num % 5)
            ))
        
        return FacultyAnalyticsData(
            score_dist=score_dist_resp,
            engagement=engagement_resp,
            weak_topic_trend=weak_topic_resp,
            total_students=total_students,
            avg_attendance=round(float(avg_attendance or 0), 1),
            avg_score=round(float(avg_score or 0), 1)
        )


    def get_profile(self, faculty: User, db: Session) -> FacultyProfileResponse:
        if faculty.role != UserRole.faculty:
            raise HTTPException(status_code=403, detail="Only faculty can access this")

        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        palette_colors = [
            ("var(--indigo-l)", "rgba(91,78,248,.1)"),
            ("var(--teal)",     "rgba(39,201,176,.1)"),
            ("var(--violet)",   "rgba(159,122,234,.1)"),
            ("var(--amber)",    "rgba(244,165,53,.1)"),
        ]

        total_students = 0
        course_list = []
        for i, c in enumerate(courses):
            count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
            total_students += count
            color, bg = palette_colors[i % len(palette_colors)]
            course_list.append(FacultyProfileCourse(
                code=f"CS{500+c.id}",
                name=c.title,
                semester=c.semester or "Sem 5",
                student_count=count,
                color=color,
                bg=bg
            ))

        return FacultyProfileResponse(
            id=faculty.id,
            full_name=faculty.full_name,
            email=faculty.email,
            phone=faculty.phone,
            bio=faculty.bio,
            role=faculty.role.value,
            avatar=faculty.avatar,
            department=faculty.department or "Department of Computer Science",
            skills=faculty.skills if isinstance(faculty.skills, list) else [],
            active_courses=len(courses),
            total_students=total_students,
            courses=course_list
        )

    def get_attendance(self, faculty: User, db: Session) -> list:
        if faculty.role != UserRole.faculty:
            raise HTTPException(status_code=403, detail="Only faculty can access this")

        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        palette = [
            ("var(--indigo-l)", "rgba(91,78,248,.1)",   "rgba(91,78,248,.22)"),
            ("var(--teal)",     "rgba(39,201,176,.1)",  "rgba(39,201,176,.22)"),
            ("var(--violet)",   "rgba(159,122,234,.1)", "rgba(159,122,234,.22)"),
            ("var(--amber)",    "rgba(244,165,53,.1)",  "rgba(244,165,53,.22)"),
        ]

        result = []
        for idx, c in enumerate(courses):
            enrollments = db.query(Enrollment).filter(Enrollment.course_id == c.id).all()
            color, bg, border = palette[idx % len(palette)]

            students_data = []
            total_lessons = len(c.lessons) if c.lessons else 1

            for e in enrollments:
                from Models.Lesson import Lesson
                from Models.Lesson import WatchHistory

                watched = db.query(func.count(WatchHistory.id)).filter(
                    WatchHistory.student_id == e.student_id,
                    WatchHistory.lesson_id.in_(
                        db.query(Lesson.id).filter(Lesson.course_id == c.id).subquery()
                    )
                ).scalar() or 0

                students_data.append(FacultyAttendanceStudent(
                    roll=e.student.roll_number or f"ROLL-{e.student_id}",
                    name=e.student.full_name,
                    present=watched,
                    total=total_lessons
                ))

            result.append(FacultyAttendanceCourse(
                id=f"cs{c.id}",
                code=f"CS{500+c.id}",
                name=c.title,
                color=color,
                bg=bg,
                border=border,
                total=len(students_data),
                students=students_data
            ))

        return result

    def get_notifications(self, faculty: User, db: Session) -> List[FacultyNotificationModel]:
        # Dynamically generate notifications based on system state
        notifs = []
        
        # 1. New Submissions
        pending_count = db.query(func.count(AssignmentSubmission.id))\
            .join(Assignment)\
            .filter(Assignment.faculty_id == faculty.id, AssignmentSubmission.grade == None).scalar() or 0
        if pending_count > 0:
            notifs.append(FacultyNotificationModel(
                id=1, type="submission", title=f"{pending_count} new assignment submissions",
                body=f"Recent submissions across your courses are awaiting your review.",
                time="Just now", unread=True, urgent=True, color="var(--rose)", bg="rgba(242,68,92,.12)"
            ))

        # 2. Quiz Attempts
        attempt_count = db.query(func.count(QuizAttempt.id))\
            .join(Quiz)\
            .filter(Quiz.faculty_id == faculty.id).limit(10).scalar() or 0
        if attempt_count > 0:
             notifs.append(FacultyNotificationModel(
                id=2, type="quiz", title="New Quiz Attempts",
                body=f"Recent attempts recorded for your active quizzes.",
                time="15m ago", unread=True, urgent=False, color="var(--indigo-ll)", bg="rgba(91,78,248,.12)"
            ))

        # 3. Attendance Alert (Mocked but conditional)
        notifs.append(FacultyNotificationModel(
            id=3, type="attendance", title="Attendance Sync Complete",
            body="Attendance records for recently concluded lectures have been processed.",
            time="1h ago", unread=False, urgent=False, color="var(--amber)", bg="rgba(244,165,53,.1)"
        ))

        return notifs

    def get_recent_activity(self, faculty: User, db: Session) -> List[FacultyRecentActivity]:
        # Get recently graded assignments or created content
        recent = []
        
        graded = db.query(AssignmentSubmission)\
            .join(Assignment)\
            .filter(Assignment.faculty_id == faculty.id, AssignmentSubmission.grade != None)\
            .order_by(AssignmentSubmission.submitted_at.desc()).limit(3).all()
        
        for g in graded:
            recent.append(FacultyRecentActivity(
                label=f"Graded {g.assignment.title} for {g.student.full_name}",
                time="Recently",
                color="var(--teal)"
            ))
            
        if not recent:
            recent.append(FacultyRecentActivity(label="Accessed Faculty Dashboard", time="Just now", color="var(--indigo-ll)"))
            
        return recent

    def get_reports(self, faculty: User, db: Session) -> FacultyReportResponse:
        if faculty.role != UserRole.faculty:
            raise HTTPException(status_code=403, detail="Only faculty can access reports")

        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        course_ids = [c.id for c in courses]
        
        # 1. Overall Stats
        unique_student_ids = db.query(Enrollment.student_id)\
            .filter(Enrollment.course_id.in_(course_ids))\
            .distinct().subquery()
        total_students = db.query(func.count(unique_student_ids.c.student_id)).scalar() or 0
        
        # Derived stats from analytics logic
        analytics = self.get_analytics(faculty, db)
        
        stats = [
            FacultyReportStats(label="Total Students", value=str(total_students), cls="sc-teal"),
            FacultyReportStats(label="Avg Score", value=f"{int(analytics.avg_score)}%", cls="sc-indigo"),
            FacultyReportStats(label="Avg Attendance", value=f"{int(analytics.avg_attendance)}%", cls="sc-amber"),
            FacultyReportStats(label="Reports Generated", value="0", cls="sc-violet"), # Simple mock for now
            FacultyReportStats(label="Semester Week", value="W11", cls="sc-rose"),
        ]

        # 2. Course Overview
        summaries = []
        palette = ["var(--indigo-l)", "var(--teal)", "var(--violet)", "var(--amber)"]
        for i, c in enumerate(courses):
            # Reuse logic from get_courses but match report model
            watched_data = []
            lessons = c.lessons
            total_l = len(lessons) or 1
            
            # Simple sparkline logic: last 8 view counts or percentages
            # Using mock pattern for sparkline to ensure beautiful UI
            sparkline = [70 + (c.id % 5) + (j % 5) for j in range(8)]
            
            summaries.append(FacultyReportCourseMetric(
                id=f"cs{c.id}",
                code=f"CS{500+c.id}",
                name=c.title,
                color=palette[i % len(palette)],
                avgScore=70.0 + (c.id % 10),
                attendance=80.0 + (c.id % 5),
                lectures_done=len(lessons) // 2,
                lectures_total=total_l,
                sparkline=sparkline
            ))

        # 3. Score Trends (Week Scores)
        # We'll return the last 5 weeks
        week_scores = []
        for i in range(5, 0, -1):
            week_num = 12 - i
            scores_map = {"week": f"W{week_num}"}
            for c in courses:
                scores_map[f"cs{c.id}"] = int(70.0 + (c.id % 10) + (week_num % 5))
            week_scores.append(scores_map)

        return FacultyReportResponse(
            stats=stats,
            courses=summaries,
            week_scores=week_scores
        )

    def get_settings(self, faculty: User, db: Session) -> FacultySettingsResponse:
        settings = faculty.settings or {}
        
        # Default objects if not present in JSON
        notif = settings.get("notifications", {})
        appearance = settings.get("appearance", {})
        ai = settings.get("ai", {})
        
        return FacultySettingsResponse(
            notifications=FacultySettingsNotifications(**notif) if notif else FacultySettingsNotifications(),
            appearance=FacultySettingsAppearance(**appearance) if appearance else FacultySettingsAppearance(),
            account=FacultySettingsAccount(
                displayName=faculty.full_name,
                email=faculty.email,
                phone=faculty.phone,
                department=settings.get("account", {}).get("department", "cse"),
                language=settings.get("account", {}).get("language", "en"),
                timezone=settings.get("account", {}).get("timezone", "asia_kolkata")
            ),
            ai=FacultySettingsAI(**ai) if ai else FacultySettingsAI()
        )

    def update_settings(self, faculty: User, db: Session, update: FacultySettingsUpdate) -> FacultySettingsResponse:
        current_settings = faculty.settings or {}
        
        if update.notifications:
            current_settings["notifications"] = update.notifications.model_dump()
        if update.appearance:
            current_settings["appearance"] = update.appearance.model_dump()
        if update.ai:
            current_settings["ai"] = update.ai.model_dump()
        if update.account:
            # Update basic user info too
            faculty.full_name = update.account.displayName
            faculty.email = update.account.email
            faculty.phone = update.account.phone
            faculty.avatar = update.account.avatar
            
            # Additional account fields go into JSON
            account_json = current_settings.get("account", {})
            account_json["department"] = update.account.department
            account_json["language"] = update.account.language
            account_json["timezone"] = update.account.timezone
            current_settings["account"] = account_json

        faculty.settings = current_settings
        db.commit()
        db.refresh(faculty)
        
        return self.get_settings(faculty, db)
    def delete_assignment(self, faculty: User, db: Session, assignment_id: int) -> Dict[str, str]:
        assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Verify ownership (optional but recommended)
        # course = db.query(Course).filter(Course.id == assignment.course_id, Course.faculty_id == faculty.id).first()
        # if not course:
        #    raise HTTPException(status_code=403, detail="Not authorized to delete this assignment")

        db.delete(assignment)
        db.commit()
        return {"message": "Assignment deleted successfully"}

    def delete_quiz(self, faculty: User, db: Session, quiz_id: int) -> Dict[str, str]:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Verify ownership (optional but recommended)
        # course = db.query(Course).filter(Course.id == quiz.course_id, Course.faculty_id == faculty.id).first()
        # if not course:
        #    raise HTTPException(status_code=403, detail="Not authorized to delete this quiz")

        db.delete(quiz)
        db.commit()
        return {"message": "Quiz deleted successfully"}

    def get_metadata(self, db: Session, faculty: User = None) -> FacultyMetadataResponse:
        departments = ["Computer Science", "Information Technology", "Electronics"]
        groups = ["BCA", "MCA", "B.Tech", "B.Sc", "AI", "All"]

        courses_meta = {}
        if faculty:
            courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
            palette = [
                ("var(--indigo-l)", "rgba(91,78,248,.1)",   "rgba(91,78,248,.22)"),
                ("var(--teal)",     "rgba(39,201,176,.1)",  "rgba(39,201,176,.22)"),
                ("var(--violet)",   "rgba(159,122,234,.1)", "rgba(159,122,234,.22)"),
                ("var(--amber)",    "rgba(244,165,53,.1)",  "rgba(244,165,53,.22)"),
            ]
            for idx, c in enumerate(courses):
                color, bg, border = palette[idx % len(palette)]
                courses_meta[f"cs{c.id}"] = {
                    "code": f"CS{500+c.id}",
                    "name": c.title,
                    "color": color,
                    "bg": bg,
                    "border": border
                }
        else:
            courses_meta = {
                "cs501": {"code": "CS501", "name": "Data Structures", "color": "var(--indigo-l)", "bg": "rgba(91,78,248,.1)", "border": "rgba(91,78,248,.3)"},
                "cs502": {"code": "CS502", "name": "Dist Systems", "color": "var(--teal)", "bg": "rgba(39,201,176,.1)", "border": "rgba(39,201,176,.3)"},
                "cs503": {"code": "CS503", "name": "Networks", "color": "var(--violet)", "bg": "rgba(159,122,234,.1)", "border": "rgba(159,122,234,.3)"}
            }

        status_meta = {
            "top": {"label": "Top", "cls": "sc-teal"},
            "good": {"label": "Good", "cls": "sc-indigo"},
            "avg": {"label": "Average", "cls": "sc-amber"},
            "risk": {"label": "At Risk", "cls": "sc-rose"},
        }
        
        ai_replies = [
            "Based on the last assignment scores, I suggest reinforcing unit 3 on dynamic programming.",
            "Attendance has dropped by 12% this week. Would you like me to draft a reminder email?",
            "3 students failed the recent quiz. You can view their attempts in the Grade Book."
        ]
        
        ai_suggestions = [
            "Generate quiz from Unit II",
            "Identify at-risk students",
            "Summarize weekly attendance"
        ]

        return FacultyMetadataResponse(
            departments=departments, 
            groups=groups,
            courses_meta=courses_meta,
            status_meta=status_meta,
            ai_replies=ai_replies,
            ai_suggestions=ai_suggestions
        )

    # ── QUESTION BANK ──────────────────────────────────────────────
    def get_question_bank(self, faculty: User, db: Session) -> List[dict]:
        import random
        from Models.Quiz import QuestionBank
        questions = db.query(QuestionBank).filter(QuestionBank.faculty_id == faculty.id).all()
        
        if not questions:
            # Seed mock questions
            defaults = [
                 {"course_id": 1, "unit": "Unit I", "type": "MCQ", "difficulty": "Medium", "marks": 2, "question_text": "What is the time complexity of QuickSort in the worst case?", "options": ["O(N log N)", "O(N)", "O(N^2)", "O(1)"], "correct_answer": "O(N^2)"},
                 {"course_id": 1, "unit": "Unit II", "type": "TF", "difficulty": "Easy", "marks": 1, "question_text": "Arrays in Python are dynamic by default.", "options": ["True", "False"], "correct_answer": "False"},
                 {"course_id": 2, "unit": "Unit III", "type": "Desc", "difficulty": "Hard", "marks": 5, "question_text": "Explain the CAP theorem with examples.", "options": [], "correct_answer": "Conceptual description here."},
                 {"course_id": 3, "unit": "Unit I", "type": "FIB", "difficulty": "Medium", "marks": 1, "question_text": "In OSI model, IP protocol belongs to the ______ layer.", "options": [], "correct_answer": "Network"}
            ]
            courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
            if courses:
                for idx, d in enumerate(defaults):
                    c = courses[idx % len(courses)]
                    q = QuestionBank(
                        faculty_id=faculty.id,
                        course_id=c.id,
                        unit=d["unit"],
                        type=d["type"],
                        difficulty=d["difficulty"],
                        marks=d["marks"],
                        question_text=d["question_text"],
                        options=d["options"],
                        correct_answer=d["correct_answer"],
                        used=random.randint(1, 10)
                    )
                    db.add(q)
                db.commit()
                questions = db.query(QuestionBank).filter(QuestionBank.faculty_id == faculty.id).all()

        res = []
        for q in questions:
            res.append({
                "id": q.id,
                "course": f"cs{q.course_id}",
                "unit": q.unit or "Unit I",
                "type": q.type,
                "diff": q.difficulty,
                "marks": q.marks,
                "q": q.question_text,
                "options": q.options or [],
                "ans": q.correct_answer,
                "used": q.used
            })
        return res

    def create_question(self, faculty: User, db: Session, data: dict) -> dict:
        from Models.Quiz import QuestionBank
        course_id = int(data.get("course", "cs0").replace("cs", "")) if "cs" in str(data.get("course", "")) else 1
        q = QuestionBank(
            faculty_id=faculty.id,
            course_id=course_id,
            unit=data.get("unit"),
            type=data.get("type"),
            difficulty=data.get("diff"),
            marks=data.get("marks", 1),
            question_text=data.get("q"),
            options=data.get("options", []),
            correct_answer=data.get("ans")
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        return {
            "id": q.id,
            "course": f"cs{q.course_id}",
            "unit": q.unit,
            "type": q.type,
            "diff": q.difficulty,
            "marks": q.marks,
            "q": q.question_text,
            "options": q.options or [],
            "ans": q.correct_answer,
            "used": q.used
        }

    def update_question(self, faculty: User, db: Session, question_id: int, data: dict) -> dict:
        from Models.Quiz import QuestionBank
        q = db.query(QuestionBank).filter(QuestionBank.id == question_id, QuestionBank.faculty_id == faculty.id).first()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")
        
        if "course" in data:
            q.course_id = int(str(data["course"]).replace("cs", ""))
        if "unit" in data: q.unit = data["unit"]
        if "type" in data: q.type = data["type"]
        if "diff" in data: q.difficulty = data["diff"]
        if "marks" in data: q.marks = data["marks"]
        if "q" in data: q.question_text = data["q"]
        if "options" in data: q.options = data["options"]
        if "ans" in data: q.correct_answer = data["ans"]

        db.commit()
        db.refresh(q)
        return {
            "id": q.id,
            "course": f"cs{q.course_id}",
            "unit": q.unit,
            "type": q.type,
            "diff": q.difficulty,
            "marks": q.marks,
            "q": q.question_text,
            "options": q.options or [],
            "ans": q.correct_answer,
            "used": q.used
        }

    def delete_question(self, faculty: User, db: Session, question_id: int) -> dict:
        from Models.Quiz import QuestionBank
        q = db.query(QuestionBank).filter(QuestionBank.id == question_id, QuestionBank.faculty_id == faculty.id).first()
        if not q:
            raise HTTPException(status_code=404, detail="Question not found")
        db.delete(q)
        db.commit()
        return {"message": "Question deleted successfully"}

    def get_course(self, faculty: User, db: Session, course_id: int) -> Dict[str, Any]:
        course = db.query(Course).filter(Course.id == course_id, Course.faculty_id == faculty.id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        # 1. Assignments
        assignments = db.query(Assignment).filter(Assignment.course_id == course_id).all()
        assignments_data = []
        for a in assignments:
            submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == a.id).all()
            scores = [s.grade for s in submissions if s.grade is not None]
            avg = sum(scores) / len(scores) if scores else None
            
            assignments_data.append({
                "id": a.id,
                "title": a.title,
                "type": a.type or "Theory",
                "submissions_count": len(submissions),
                "due_label": "Today" if any(s.grade is None for s in submissions) else a.due_date.strftime("%b %d") if a.due_date else "—",
                "avg_score": avg,
                "status": "grading" if a.due_date and a.due_date < datetime.now(timezone.utc) and any(s.grade is None for s in submissions) else "done" if a.due_date and a.due_date < datetime.now(timezone.utc) else "live"
            })

        # 2. Quizzes
        quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).all()
        quizzes_data = []
        for q in quizzes:
            attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == q.id).all()
            scores = [a.score for a in attempts if a.score is not None]
            avg = sum(scores) / len(scores) if scores else None
            
            quizzes_data.append({
                "id": q.id,
                "title": q.title,
                "questions_count": len(q.questions) if q.questions else 0,
                "start_date": str(q.start_date).split('T')[0] if getattr(q, 'start_date', None) else "—",
                "attempts_count": len(attempts),
                "avg_score": avg,
                "status": "closed" if getattr(q, 'end_date', None) and str(q.end_date) < datetime.now(timezone.utc).isoformat() else "live"
            })

        # 3. Lectures
        from Models.Lesson import Lesson
        lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
        lectures_data = []
        for i, l in enumerate(lessons):
            lectures_data.append({
                "id": l.id,
                "title": l.title,
                "video_url": l.video_url,
                "date": l.created_at.strftime("%b %d") if l.created_at else "",
                "duration": l.duration or "45m",
                "views": (l.id * 17) % 250 + 50 if l.video_url else 0,
                "week": f"W{min(15, l.order or (i % 15) + 1)}"
            })

        # 4. Students
        total_students = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == course_id).scalar() or 0
        from Models.Placement import PlacementReadiness
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
        students_data = []
        for e in enrollments:
            s = e.student
            # Calculate actual watch attendance for this student
            watched = db.query(func.count(WatchHistory.id)).filter(
                WatchHistory.student_id == s.id,
                WatchHistory.lesson_id.in_([l.id for l in lessons])
            ).scalar() or 0
            student_att = int((watched / max(1, len(lessons))) * 100)
            
            # Submissions score
            student_subs = db.query(AssignmentSubmission).join(Assignment).filter(
                Assignment.course_id == course_id, AssignmentSubmission.student_id == s.id, AssignmentSubmission.grade != None
            ).all()
            sub_pcts = [(sub.grade / max(1, int(sub.assignment.max_marks or 100))) * 100 for sub in student_subs]
            
            # Quiz score
            student_attempts = db.query(QuizAttempt).join(Quiz).filter(
                Quiz.course_id == course_id, QuizAttempt.student_id == s.id, QuizAttempt.score != None
            ).all()
            quiz_pcts = [(qa.score / max(1, len(qa.quiz.questions))) * 100 for qa in student_attempts]
            
            all_pcts = sub_pcts + quiz_pcts
            student_score = int(sum(all_pcts) / max(1, len(all_pcts)))
            
            pri = db.query(PlacementReadiness).filter(PlacementReadiness.student_id == s.id).first()
            pri_score = pri.pri_score if pri else 70

            students_data.append({
                "id": s.id,
                "name": s.full_name,
                "roll": s.roll_number or "N/A",
                "attendance": student_att,
                "score": student_score,
                "grade": "A" if student_score >= 80 else "B" if student_score >= 60 else "C",
                "trend": "up" if pri_score > 75 else "dn" if pri_score < 60 else "flat",
                "status": "top" if student_score >= 85 else "good" if student_score >= 60 else "risk"
            })

        # 5. Weak Topics - from poorly performing quizzes
        weak_topics = []
        low_attempts = db.query(QuizAttempt).join(Quiz).filter(
            Quiz.course_id == course_id, QuizAttempt.score < 5
        ).all()
        if low_attempts:
            from collections import Counter
            counts = Counter([a.quiz_id for a in low_attempts])
            for qid, count in counts.most_common(2):
                qobj = next((q for q in quizzes if q.id == qid), None)
                if qobj:
                    weak_topics.append({
                        "topic": qobj.title,
                        "student_count": count,
                        "percentage": int((count / max(1, total_students)) * 100),
                        "color": "var(--rose)" if count > total_students * 0.3 else "var(--amber)"
                    })

        return {
            "description": course.description or f"Comprehensive course on {course.title}.",
            "last_updated": course.created_at.strftime("%b %d") if course.created_at else "Today",
            "assignments": assignments_data,
            "quizzes": quizzes_data,
            "lecture_list": lectures_data,
            "student_list": students_data,
            "weak_topics": weak_topics
        }
    def export_report(self, faculty: User, db: Session, report_type: str) -> io.StringIO:
        courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
        course_ids = [c.id for c in courses]
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        if report_type == "attendance":
            writer.writerow(["Student Name", "Roll Number", "Course", "Present Lessons", "Total Lessons", "Attendance %"])
            enrollments = db.query(Enrollment).filter(Enrollment.course_id.in_(course_ids)).all()
            for e in enrollments:
                watched = db.query(func.count(WatchHistory.id)).filter(
                    WatchHistory.student_id == e.student_id,
                    WatchHistory.lesson_id.in_(select(Lesson.id).where(Lesson.course_id == e.course_id))
                ).scalar() or 0
                total_l = db.query(func.count(Lesson.id)).filter(Lesson.course_id == e.course_id).scalar() or 1
                attendance_pct = round((watched / total_l) * 100, 1)
                writer.writerow([e.student.full_name, e.student.roll_number or "N/A", e.course.title, watched, total_l, attendance_pct])
        
        elif report_type == "grades":
            writer.writerow(["Student Name", "Roll Number", "Course", "Assignment", "Score", "Max Marks", "Percentage"])
            submissions = db.query(AssignmentSubmission).join(Assignment).filter(Assignment.course_id.in_(course_ids)).all()
            for s in submissions:
                max_m = int(s.assignment.max_marks or 100)
                pct = round((s.grade / max_m) * 100, 1) if s.grade is not None else "N/A"
                writer.writerow([s.student.full_name, s.student.roll_number or "N/A", s.assignment.course.title, s.assignment.title, s.grade if s.grade is not None else "N/A", max_m, pct])
        
        elif report_type == "performance":
            writer.writerow(["Student Name", "Roll Number", "Avg Score %", "Attendance %", "PRI Score", "Badge"])
            enrollments = db.query(Enrollment).filter(Enrollment.course_id.in_(course_ids)).all()
            student_ids = list(set([e.student_id for e in enrollments]))
            for sid in student_ids:
                student = db.query(User).get(sid)
                pr = db.query(PlacementReadiness).filter(PlacementReadiness.student_id == sid).first()
                
                # Simple aggregation for exports
                att_watched = db.query(func.count(WatchHistory.id)).filter(WatchHistory.student_id == sid).scalar() or 0
                att_total = db.query(func.count(Lesson.id)).filter(Lesson.course_id.in_(course_ids)).scalar() or 1
                
                sub_scores = db.query(AssignmentSubmission).filter(AssignmentSubmission.student_id == sid, AssignmentSubmission.grade != None).all()
                avg_s = sum([ (sub.grade / (sub.assignment.max_marks or 100)) * 100 for sub in sub_scores ]) / len(sub_scores) if sub_scores else 0
                
                writer.writerow([
                    student.full_name, 
                    student.roll_number or "N/A", 
                    round(avg_s, 1), 
                    round((att_watched / att_total) * 100, 1),
                    pr.pri_score if pr else "N/A",
                    "Elite" if pr and pr.pri_score > 85 else "Standard"
                ])
                
        elif report_type == "quiz":
            writer.writerow(["Quiz Title", "Course", "Avg Score", "Highest", "Lowest", "Attempts", "Total Students"])
            quizzes = db.query(Quiz).filter(Quiz.course_id.in_(course_ids)).all()
            for q in quizzes:
                attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == q.id).all()
                scores = [a.score for a in attempts if a.score is not None]
                avg = round(sum(scores) / len(scores), 1) if scores else 0
                writer.writerow([q.title, q.course.title, avg, max(scores) if scores else 0, min(scores) if scores else 0, len(attempts), len(course_ids)]) # Approximation

        elif report_type == "course":
            writer.writerow(["Course Code", "Title", "Semester", "Students", "Lectures Done", "Total Lectures", "Avg Score %"])
            for c in courses:
                s_count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
        else:
            writer.writerow(["No data available for this report type"])

        output.seek(0)
        return output

    # ── MEETING METHODS ──────────────────────────────────────────────

    def get_meeting_groups(self, faculty: User, db: Session):
        """Return student groups by target_group (BCA, MCA, etc.) with ALL students."""
        COLORS = ["var(--indigo-l)", "var(--teal)", "var(--amber)", "var(--violet)", "var(--rose)"]
        RGBS   = ["91,78,248",       "39,201,176",  "244,165,53",  "159,122,234", "242,68,92"]

        # Get all students grouped by their target_group
        rows = (
            db.query(User.target_group, func.count(User.id).label("cnt"))
            .filter(User.role == UserRole.student, User.target_group != None, User.target_group != "")
            .group_by(User.target_group)
            .order_by(User.target_group)
            .all()
        )

        # Fallback: if no target_group data, fetch unique departments from courses
        if not rows:
            courses = db.query(Course).filter(Course.faculty_id == faculty.id).all()
            depts = list({c.department or "Computer Science" for c in courses}) or ["BCA", "MCA"]
            rows = [(dept, 0) for dept in depts]

        groups = []
        for i, (grp, cnt) in enumerate(rows):
            idx = i % len(COLORS)
            # Determine a short program code
            code = "".join(w[0] for w in grp.upper().split()) if grp else "GRP"
            
            # Check if this group has an active meeting
            active_meet = ACTIVE_MEETINGS.get(grp)

            groups.append({
                "id": i + 1,
                "group_key": grp,
                "name": grp,
                "code": code,
                "semester": "All Semesters",
                "student_count": cnt,
                "color": COLORS[idx],
                "rgb": RGBS[idx],
                "is_live": active_meet is not None,
                "room_code": active_meet["room_code"] if active_meet else None,
            })
        return groups

    def start_meeting(self, faculty: User, db: Session, course_id: int):
        """Generate a unique room code for a department meeting (course_id used as group index)."""
        import random, string

        groups = self.get_meeting_groups(faculty, db)
        # course_id here is actually the group sequential id (1-based index)
        group = next((g for g in groups if g["id"] == course_id), None)

        if not group:
            # Fallback: use whatever group exists
            group = groups[0] if groups else {
                "name": "All Students", "group_key": "All", "code": "ALL",
                "student_count": 0, "color": "var(--indigo-l)"
            }

        # Generate a Google Meet-style room code
        # Generate a mock meeting link that won't throw a DNS error
        import random, string
        room_code = "-".join(
            "".join(random.choices(string.ascii_lowercase, k=3))
            for _ in range(3)
        )

        join_url = f"http://localhost:5173/studentdashboard/studentMeetings?room={room_code}"
        
        meet_details = {
            "room_code": room_code,
            "course_id": course_id,
            "course_name": group["name"],
            "course_code": group["code"],
            "student_count": group["student_count"],
            "faculty_name": faculty.full_name,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "join_url": join_url,
            "group_key": group["group_key"],
            "type": "faculty",
        }
        
        # Save to active meetings in-memory dict
        ACTIVE_MEETINGS[group["group_key"]] = meet_details

        return meet_details

    def end_meeting(self, faculty: User, group_key: str):
        """End a live meeting and remove it from active tracking."""
        if group_key in ACTIVE_MEETINGS:
            del ACTIVE_MEETINGS[group_key]
        return {"message": "Meeting ended", "group_key": group_key}

    def get_meeting_history(self, faculty: User, db: Session):
        """Return simulated meeting history per student program/department."""
        import random
        groups = self.get_meeting_groups(faculty, db)
        history = []
        for g in groups[:5]:
            for _ in range(random.randint(1, 3)):
                days_ago = random.randint(1, 30)
                duration = random.choice([45, 60, 90, 120])
                past_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
                attendees = max(1, int(g["student_count"] * random.uniform(0.6, 0.95)))
                history.append({
                    "course_name": g["name"],
                    "course_code": g["code"],
                    "date": past_date.strftime("%b %d, %Y"),
                    "duration_min": duration,
                    "attendees": attendees,
                    "total_students": g["student_count"],
                })
        history.sort(key=lambda x: x["date"], reverse=True)
        return history[:10]

    # ─── AI Chat ────────────────────────────────────────────────────────
    
    def faculty_ai_chat(self, db: Session, faculty_id: int, payload: dict) -> dict:
        from Service.GroqService import groq_service
        
        faculty = db.query(User).get(faculty_id)
        if not faculty:
            raise ValueError("Faculty not found")
            
        msg = payload.get("message", "").strip()
        if not msg:
            raise ValueError("Message cannot be empty")
            
        context_str = payload.get("context", "")
        
        system_prompt = f"""You are Lucyna, an elite AI Teaching Assistant.
You are assisting {faculty.full_name}, a faculty member at the university.
Use the following real-time academic data and context to inform your answers:
{context_str}

Provide concise, analytical, and actionable insights based ONLY on the data provided and best practices for teaching and course management.
Do not hallucinate data. If you don't know, state that the data is not available.
Format your responses using beautiful markdown, highlight key metrics in bold.
"""
        
        # If the frontend passes a history array, use it. Otherwise just use a single message.
        history_list = payload.get("messages", [])
        
        if not history_list:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": msg}
            ]
        else:
            # Override the system prompt if frontend sent an Anthropic-style messages array
            messages = [{"role": "system", "content": system_prompt}]
            for m in history_list:
                messages.append({"role": "user" if m.get("role") == "user" else "assistant", "content": m.get("content", m.get("text", ""))})
        
        reply = groq_service.generate_chat_response(messages)
        
        return {"reply": reply}


    # ─── ATTENDANCE MANAGEMENT ──────────────────────────────────────────────
    
    def submit_bulk_attendance(self, faculty: User, db: Session, data: AttendanceBulkSubmit):
        if faculty.role != UserRole.faculty:
             raise HTTPException(status_code=403, detail="Unauthorized")

        # Check if attendance already exists for this date and course
        existing = db.query(DailyAttendance).filter(
            DailyAttendance.course_id == data.course_id,
            DailyAttendance.date == data.date
        ).all()
        
        # Simple approach: delete existing if any and re-add
        if existing:
            for e in existing:
                db.delete(e)
            db.commit()

        for rec in data.records:
            new_att = DailyAttendance(
                student_id=rec.student_id,
                course_id=data.course_id,
                faculty_id=faculty.id,
                date=data.date,
                status=rec.status,
                remarks=rec.remarks
            )
            db.add(new_att)
        
        db.commit()
        return {"message": "Attendance submitted successfully", "count": len(data.records)}

    def get_attendance_history(self, faculty: User, db: Session, course_id: int) -> List[AttendanceHistoryGrid]:
        # Group by date and count presence/absence
        results = db.query(
            DailyAttendance.date,
            func.count(DailyAttendance.id).filter(DailyAttendance.status == "present").label("present_count"),
            func.count(DailyAttendance.id).filter(DailyAttendance.status == "absent").label("absent_count")
        ).filter(DailyAttendance.course_id == course_id)\
         .group_by(DailyAttendance.date)\
         .order_by(DailyAttendance.date.desc()).all()

        return [
            AttendanceHistoryGrid(
                date=r.date,
                present_count=r.present_count,
                absent_count=r.absent_count
            ) for r in results
        ]

    def get_daily_attendance(self, faculty: User, db: Session, course_id: int, target_date: date) -> List[AttendanceRecordResponse]:
        records = db.query(DailyAttendance).filter(
            DailyAttendance.course_id == course_id,
            DailyAttendance.date == target_date
        ).all()
        
        res = []
        for r in records:
            res.append(AttendanceRecordResponse(
                id=r.id,
                student_id=r.student_id,
                student_name=r.student.full_name,
                student_roll=r.student.roll_number or f"ROLL-{r.student_id}",
                status=r.status,
                date=r.date,
                remarks=r.remarks
            ))
        return res

faculty_service = FacultyService()
