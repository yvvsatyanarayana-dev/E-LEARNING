from sqlalchemy.orm import Session
from sqlalchemy import func
import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
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
    FacultyAssignmentUpdate, FacultyQuizUpdate
)
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
                    db.query(Lesson.id).filter(Lesson.course_id == course_obj.id).subquery()
                )
            ).scalar() or 0
            attendances.append((watched / total_l) * 100)
        avg_attendance = round(sum(attendances) / len(attendances), 1) if attendances else 0.0

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
        avg_class_score = round(sum(score_pcts) / len(score_pcts), 1) if score_pcts else 0.0

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
        low_scores = db.query(QuizAttempt).filter(QuizAttempt.score < 5, QuizAttempt.quiz_id.in_(db.query(Quiz.id).filter(Quiz.course_id.in_(course_ids)).subquery())).all()
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
        top_pri = db.query(PlacementReadiness).filter(PlacementReadiness.student_id.in_(db.query(Enrollment.student_id).filter(Enrollment.course_id.in_(course_ids)).subquery()))\
                    .order_by(PlacementReadiness.pri_score.desc()).limit(5).all()
        
        for p in top_pri:
            top_students.append(FacultyTopStudent(
                name=p.student.full_name,
                roll=p.student.roll_number or "N/A",
                cgpa=round(8.0 + (p.pri_score / 50.0), 1), # Better mock derived from PRI
                attendance=92, 
                course="B.Tech CS",
                badge="Elite Performer" if p.pri_score > 85 else "Top Performer",
                badge_color="var(--indigo-ll)" if p.pri_score > 85 else "var(--teal)"
            ))
        
        if not top_students: # Final fallback if no PRI records
            best_students = db.query(User).filter(User.id.in_(db.query(Enrollment.student_id).filter(Enrollment.course_id.in_(course_ids)).subquery())).limit(5).all()
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
            submissions=[],
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
            submissions_count=len(submissions),
            avg_score=None,
            highest=None,
            lowest=None,
            status="live",
            week=f"W{int(assignment.id % 12) + 1}",
            unit=f"Unit {['I','II','III','IV','V'][assignment.id % 5]}",
            description=assignment.description or "",
            rubric=data.rubric if data.rubric else [],
            submissions=[],
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
            attempts_count=0,
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
        # Generate generic code since course model doesn't have `code` field
        course_map = {c.id: f"CS{500+c.id}" for c in courses}

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
                WatchHistory.lesson_id.in_(db.query(Lesson.id).filter(Lesson.course_id == e.course_id).subquery())
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
                cgpa=round(cgpa, 1),
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
                course_code=f"CS{500+course.id}", 
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
            avg_attendance=round(avg_attendance, 1),
            avg_score=round(avg_score, 1)
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
