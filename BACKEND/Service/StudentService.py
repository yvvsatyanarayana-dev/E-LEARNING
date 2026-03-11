from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from itertools import islice
from typing import Optional, List, Dict, Any, cast

from Models.User import User
from Models.Course import Course, Enrollment
from Models.Lesson import Lesson, WatchHistory
from Models.Assignment import Assignment, AssignmentSubmission
from Models.Quiz import Quiz, QuizAttempt, Question
from Models.Placement import SkillScore, PlacementReadiness, Internship, InternshipApplication, MockInterview, PlacementTopic, ResumeCheck, MockInterviewRoundType, MockInterviewQuestion
from Models.Community import StudyGroup, StudyGroupMember
from Models.Schedule import Schedule
from Models.Innovation import InnovationIdea, InnovationProject, InnovationHackathon
from Schemas.StudentSchema import (
    DashboardResponse, DashboardStatsResponse,
    EnrolledCourseResponse, LessonResponse, MarkWatchedRequest,
    AssignmentResponse, SubmissionResponse, AssignmentSubmitRequest,
    QuizResponse, QuestionResponse, QuizAttemptRequest, QuizAttemptResponse,
    StudyGroupResponse, SkillScoreResponse, PlacementReadinessResponse,
    InternshipResponse, AnalyticsResponse, QuizHistoryItem,
    NotificationResponse, ProfileUpdateRequest, PerformanceData,
    PerformanceKPI, CourseAttendance, SkillProgression, Achievement,
    PlacementBreakdown, ImprovementSuggestion, EligibilityTier,
    AttendanceData, SkillsData, PlacementData,
    CourseModule, CourseDeadline, CourseSuggestion, CourseDetailResponse,
    InnovationIdeaResponse, InnovationProjectResponse, InnovationHackathonResponse,
    InnovationCollaboratorResponse, InnovationHubResponse,
    MockInterviewRoundType as MockInterviewRoundTypeSchema, MockInterviewQuestionBankItem,
    MockInterviewsFullResponse, MockInterviewInsights, MockInterviewRadarItem, MockInterviewWeakArea,
    AIChatRequest, AIChatResponse
)


def _require_student(user: User):
    if user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")

def _enrollment_courses(student: User, db: Session) -> List[EnrolledCourseResponse]:
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
    result = []
    for en in enrollments:
        course = en.course
        if not course:
            continue
        result.append(EnrolledCourseResponse(
            enrollment_id=en.id,
            course_id=course.id,
            title=course.title,
            description=course.description,
            semester=course.semester,
            faculty_name=course.faculty.full_name if course.faculty else "Unknown",
            progress=en.progress,
            enrolled_at=en.enrolled_at,
            lesson_count=len(course.lessons),
            assignment_count=len(course.assignments),
            quiz_count=len(course.quizzes),
        ))
    return result

def _all_courses_for_student(student: User, db: Session):
    """Return all active courses with enrollment info for this student."""
    enrolled_map = {
        en.course_id: en
        for en in db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
    }
    all_courses = db.query(Course).filter(Course.is_active == True).all()
    result = []
    for course in all_courses:
        en = enrolled_map.get(course.id)
        result.append(EnrolledCourseResponse(
            enrollment_id=en.id if en else 0,
            course_id=course.id,
            title=course.title,
            description=course.description,
            semester=course.semester,
            faculty_name=course.faculty.full_name if course.faculty else "Unknown",
            progress=en.progress if en else 0.0,
            enrolled_at=en.enrolled_at if en else None,
            lesson_count=len(course.lessons),
            assignment_count=len(course.assignments),
            quiz_count=len(course.quizzes),
        ))
    return result


class StudentService:

    # ─── Dashboard ────────────────────────────────────────────────────────────

    def get_dashboard(self, student: User, db: Session) -> DashboardResponse:
        _require_student(student)
        courses = _all_courses_for_student(student, db)

        # Count completed lessons via WatchHistory
        completed_lessons = db.query(WatchHistory).filter(
            WatchHistory.student_id == student.id,
            WatchHistory.completed == True,
        ).count()

        # Pending assignments (due_date in future, no submission)
        enrolled_course_ids = [c.course_id for c in courses]
        all_assignments = db.query(Assignment).filter(
            Assignment.course_id.in_(enrolled_course_ids)
        ).all() if enrolled_course_ids else []

        submitted_ids = {
            s.assignment_id
            for s in db.query(AssignmentSubmission).filter(
                AssignmentSubmission.student_id == student.id
            ).all()
        }
        now = datetime.utcnow()
        pending_assignments = sum(
            1 for a in all_assignments
            if a.id not in submitted_ids and (a.due_date is None or a.due_date >= now)
        )

        # Upcoming quizzes (created in enrolled courses, not yet attempted)
        attempted_quiz_ids = {
            qa.quiz_id
            for qa in db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).all()
        }
        upcoming_quizzes = db.query(Quiz).filter(
            Quiz.course_id.in_(enrolled_course_ids),
            ~Quiz.id.in_(attempted_quiz_ids) if attempted_quiz_ids else True,
        ).count() if enrolled_course_ids else 0

        # Average quiz score
        attempts = db.query(QuizAttempt).filter(
            QuizAttempt.student_id == student.id,
            QuizAttempt.score != None,
        ).all()
        avg_score = (sum(a.score for a in attempts) / len(attempts)) if attempts else None

        # PRI
        pri_obj = db.query(PlacementReadiness).filter(
            PlacementReadiness.student_id == student.id
        ).first()
        pri_score = pri_obj.pri_score if pri_obj else 0.0
        pri_resp = PlacementReadinessResponse(
            pri_score=pri_obj.pri_score,
            mock_interviews_done=pri_obj.mock_interviews_done,
            skills_completed=pri_obj.skills_completed,
            updated_at=pri_obj.updated_at,
        ) if pri_obj else None

        # Skill scores
        skill_scores = [
            SkillScoreResponse(
                id=s.id, skill_name=s.skill_name, score=s.score, updated_at=s.updated_at
            )
            for s in db.query(SkillScore).filter(SkillScore.student_id == student.id).all()
        ]

        # Schedule Today
        schedule_today = [
            {
                "id": str(s.id),
                "day": s.day,
                "startH": s.start_h,
                "startM": s.start_m,
                "durationMin": s.duration_min,
                "subject": s.subject,
                "code": s.code,
                "type": s.type,
                "faculty": s.faculty,
                "room": s.room,
                "batch": s.batch,
                "courseKey": s.course_key
            } for s in db.query(Schedule).filter(
                Schedule.student_id == student.id,
                Schedule.day == datetime.utcnow().weekday()
            ).all()
        ]

        # Recent Quizzes (Top 3 latest attempts)
        recent_quiz_list = []
        for att in attempts[:3]:
            quiz = att.quiz
            recent_quiz_list.append({
                "id": quiz.id,
                "title": quiz.title,
                "score": int(att.score),
                "date": att.attempted_at.strftime("%b %d"),
                "status": "excellent" if att.score >= 90 else "good" if att.score >= 70 else "average"
            })

        return DashboardResponse(
            user_id=student.id,
            full_name=student.full_name,
            avatar=student.avatar,
            stats=DashboardStatsResponse(
                active_courses=len(courses),
                completed_lessons=completed_lessons,
                pending_assignments=pending_assignments,
                upcoming_quizzes=upcoming_quizzes,
                average_quiz_score=avg_score,
                pri_score=pri_score,
            ),
            enrolled_courses=courses,
            skill_scores=skill_scores,
            placement=pri_resp,
            schedule_today=schedule_today,
            recent_quizzes=recent_quiz_list
        )

    # ─── Analytics ────────────────────────────────────────────────────────────

    def get_analytics(self, student: User, db: Session) -> AnalyticsResponse:
        _require_student(student)
        
        # 1. Performance Data - Calculate Real Metrics
        avg_quiz_score = db.query(QuizAttempt.score).filter(QuizAttempt.student_id == student.id, QuizAttempt.score != None).all()
        my_avg = (sum(s[0] for s in avg_quiz_score) / len(avg_quiz_score)) if avg_quiz_score else 0.0
        
        # Batch Standing (Percentile)
        all_student_avg = db.query(User.id).filter(User.role == "student").all()
        student_averages = []
        for s_id in all_student_avg:
            s_avg_list = db.query(QuizAttempt.score).filter(QuizAttempt.student_id == s_id[0], QuizAttempt.score != None).all()
            if s_avg_list:
                student_averages.append(sum(v[0] for v in s_avg_list) / len(s_avg_list))
        
        student_averages.sort()
        better_than = sum(1 for a in student_averages if my_avg > a)
        batch_standing_pct = (better_than / len(student_averages) * 100) if student_averages else 100
        standing_str = f"Top {max(1, 100 - int(batch_standing_pct))}%"
        
        # Class Rank (OS as default example)
        first_enrollment = db.query(Enrollment).filter(Enrollment.student_id == student.id).first()
        rank_str = "---"
        course_title = "OS"
        if first_enrollment:
            course = first_enrollment.course
            course_title = course.title
            peers = db.query(Enrollment.student_id).filter(Enrollment.course_id == course.id).all()
            peer_scores = []
            for p_id in peers:
                p_avg = db.query(QuizAttempt.score).filter(
                    QuizAttempt.student_id == p_id[0], 
                    QuizAttempt.quiz_id.in_(db.query(Quiz.id).filter(Quiz.course_id == course.id))
                ).all()
                if p_avg:
                    peer_scores.append((p_id[0], sum(v[0] for v in p_avg) / len(p_avg)))
            
            peer_scores.sort(key=lambda x: x[1], reverse=True)
            try:
                my_rank = [x[0] for x in peer_scores].index(student.id) + 1
                rank_str = f"{my_rank}{'st' if my_rank==1 else 'nd' if my_rank==2 else 'rd' if my_rank==3 else 'th'}"
            except ValueError: pass

        # Quiz History
        attempts = db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).order_by(QuizAttempt.attempted_at.desc()).limit(10).all()
        real_quiz_history = []
        for att in attempts:
            quiz = att.quiz
            # Class average for this quiz
            all_scores = db.query(QuizAttempt.score).filter(QuizAttempt.quiz_id == quiz.id, QuizAttempt.score != None).all()
            class_avg = (sum(s[0] for s in all_scores) / len(all_scores)) if all_scores else 0
            # Rank
            all_attempts_sorted = sorted(all_scores, key=lambda x: x[0], reverse=True)
            try:
                rank = [s[0] for s in all_attempts_sorted].index(att.score) + 1
            except: rank = 1
            
            real_quiz_history.append(QuizHistoryItem(
                name=f"{quiz.course.title if quiz.course else '??'} – {quiz.title}",
                score=int(att.score),
                classAvg=int(class_avg),
                rank=rank,
                total=len(all_scores),
                date=att.attempted_at.strftime("%b %d")
            ))

        # Dynamic courses for trends & attendance
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
        course_names = []
        attendance_breakdown = []
        
        if enrollments:
            for i, env in enumerate(enrollments):
                c_name = env.course.title[:10] if env.course else f"Course {i+1}"
                course_names.append(c_name)
                # Use progress as the base percentage for attendance
                pct = int(env.progress) if env.progress else 0
                classes = 40
                attended = int(classes * (pct / 100))
                color = f"var(--{'teal' if i%2==0 else 'indigo-l'})"
                attendance_breakdown.append(
                    CourseAttendance(course=c_name, pct=pct, classes=classes, attended=attended, color=color)
                )
        else:
            course_names = ["General"]
            attendance_breakdown = [CourseAttendance(course="General", pct=0, classes=0, attended=0, color="var(--teal)")]
        
        my_trend = {c: [int((my_avg or 0) * (0.8 + 0.03 * i)) for i in range(7)] for c in course_names}
        class_trend_val = sum(student_averages)/len(student_averages) if student_averages else 70
        class_trend = {c: [int(class_trend_val * 0.9 + i*1.2) for i in range(7)] for c in course_names}

        performance = PerformanceData(
            kpis=[
                PerformanceKPI(cls="sc-teal",   val=f"{(my_avg/10):.1f}", lbl="Current CGPA",   delta="+0.1 vs last sem",  up=True),
                PerformanceKPI(cls="sc-indigo", val=rank_str,    lbl=f"Class Rank ({course_title})", delta="Stable", up=None),
                PerformanceKPI(cls="sc-amber",  val=f"{int(my_avg)}%", lbl="Avg Quiz Score",  delta="+2% this month",    up=True),
                PerformanceKPI(cls="sc-violet", val=standing_str, lbl="Batch Standing",  delta="Calculated",            up=True),
            ],
            my_score_trend=my_trend,
            class_score_trend=class_trend,
            quiz_history=real_quiz_history or [
                QuizHistoryItem(name="No Quizzes Yet", score=0, classAvg=0, rank=0, total=0, date="N/A")
            ],
            weeks=["W5", "W6", "W7", "W8", "W9", "W10", "W11"]
        )

        # 2. Attendance Data
        overall_classes = sum(a.classes for a in attendance_breakdown)
        overall_attended = sum(a.attended for a in attendance_breakdown)
        overall_pct = int((overall_attended / overall_classes) * 100) if overall_classes else 0
        
        # Generate realistic heatmap based on attendance probability (progress)
        heatmap = []
        for a in attendance_breakdown:
            row = []
            for j in range(8):
                # probability of attending is a.pct / 100
                import random
                row.append(1 if random.randint(1, 100) <= max(1, a.pct) else 0)
            heatmap.append(row)
            
        attendance = AttendanceData(
            overall_pct=overall_pct,
            total_classes=overall_classes,
            attended_classes=overall_attended,
            breakdown=attendance_breakdown,
            heatmap=heatmap,
            weeks=["W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11"],
            courses=course_names
        )

        # 3. Skills Data
        db_skills = db.query(SkillScore).filter(SkillScore.student_id == student.id).all()
        radar_data = [{"label": s.skill_name[:10], "pct": s.score} for s in db_skills]
        if not radar_data:
            radar_data = [{"label": "General", "pct": 0}]
            
        skill_progression = [
            SkillProgression(label=r["label"], scores=[max(0, r["pct"] - 15 + i*2) for i in range(7)], color=f"var(--{'teal' if i%2!=0 else 'indigo-l'})")
            for i, r in enumerate(islice(radar_data, 5))
        ]
        
        achievements = [
            Achievement(icon="🏆", label=f"Completed {len(db_skills)} skills", sub="Keep going!", color="var(--amber)")
        ] if db_skills else []
        
        skills = SkillsData(
            radar=radar_data,
            progression=skill_progression,
            achievements=achievements
        )

        # 4. Placement Data
        pri_obj = db.query(PlacementReadiness).filter(PlacementReadiness.student_id == student.id).first()
        pri_score = pri_obj.pri_score if pri_obj else 0.0
        cgpa = my_avg / 10 if my_avg else 0.0
        
        placement = PlacementData(
            pri=int(pri_score),
            target=85,
            breakdown=[
                PlacementBreakdown(label="Core Skills", score=int(pri_score), weight=50, color="var(--teal)"),
                PlacementBreakdown(label="Communication", score=int(pri_obj.communication_score if pri_obj else 0), weight=20, color="var(--violet)"),
                PlacementBreakdown(label="Aptitude", score=int(pri_obj.aptitude_score if pri_obj else 0), weight=20, color="var(--amber)"),
                PlacementBreakdown(label="Resume", score=int(pri_obj.resume_score if pri_obj else 0), weight=10, color="var(--rose)"),
            ],
            suggestions=[
                ImprovementSuggestion(area="Mock Interviews", action="Complete more mock interviews", impact="+5 PRI", color="var(--indigo-l)")
            ],
            eligibility=[
                EligibilityTier(tier="Tier 1 (FAANG+)", minPRI=90, minCGPA=9.0, eligible=pri_score >= 90 and cgpa >= 9.0),
                EligibilityTier(tier="Tier 2 (Product)", minPRI=80, minCGPA=8.0, eligible=pri_score >= 80 and cgpa >= 8.0),
                EligibilityTier(tier="Tier 3 (Service)", minPRI=70, minCGPA=7.0, eligible=pri_score >= 70 and cgpa >= 7.0),
                EligibilityTier(tier="Tier 4 (Startup)", minPRI=55, minCGPA=6.0, eligible=pri_score >= 55 and cgpa >= 6.0),
            ]
        )

        return AnalyticsResponse(
            performance=performance,
            attendance=attendance,
            skills=skills,
            placement=placement,
            semester="Semester 5",
            current_week=11
        )


    # ─── Schedule ─────────────────────────────────────────────────────────────


    def get_schedule(self, student: User, db: Session) -> dict:
        _require_student(student)
        schedules = db.query(Schedule).filter(Schedule.student_id == student.id).all()
        
        # Fetch upcoming assignments as reminders
        enrolled_ids = [en.course_id for en in db.query(Enrollment).filter(Enrollment.student_id == student.id).all()]
        submitted_ids = {s.assignment_id for s in db.query(AssignmentSubmission).filter(AssignmentSubmission.student_id == student.id).all()}
        
        upcoming_asgns = db.query(Assignment).filter(
            Assignment.course_id.in_(enrolled_ids),
            Assignment.due_date >= datetime.utcnow()
        ).all() if enrolled_ids else []
        
        def get_course_key(title):
            if not title: return "Event"
            t = title.lower()
            if "operating" in t: return "OS"
            if "database" in t or "dbms" in t: return "DBMS"
            if "machine" in t or "ml" in t: return "ML"
            if "network" in t and "computer" in t: return "CN"
            if "crypto" in t: return "Crypto"
            if "lab" in t: return "Lab"
            return "Event"

        reminders: List[Dict[str, Any]] = []
        for a in upcoming_asgns:
            if a.id not in submitted_ids:
                reminders.append({
                    "id": f"asgn_{a.id}",
                    "title": a.title,
                    "date": a.due_date.strftime("%b %d") if a.due_date else "TBD",
                    "time": a.due_date.strftime("%I:%M %p") if a.due_date else "11:59 PM",
                    "type": "assignment",
                    "courseKey": get_course_key(a.course.title if a.course else ""),
                    "urgent": (a.due_date - datetime.utcnow()).days < 3 if a.due_date else False
                })
        
        # Fetch upcoming quizzes
        attempted_ids = {qa.quiz_id for qa in db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).all()}
        upcoming_quizzes = db.query(Quiz).filter(
            Quiz.course_id.in_(enrolled_ids),
            ~Quiz.id.in_(attempted_ids) if attempted_ids else True
        ).all() if enrolled_ids else []
        
        for q in upcoming_quizzes:
            reminders.append({
                "id": f"quiz_{q.id}",
                "title": q.title,
                "date": q.created_at.strftime("%b %d"), 
                "time": "11:30 AM",
                "type": "quiz",
                "courseKey": get_course_key(q.course.title if q.course else ""),
                "urgent": True
            })
            
        sorted_reminders = sorted(reminders, key=lambda x: x["urgent"], reverse=True)
        return {
            "timetable": [
                {
                    "id": str(s.id),
                    "day": s.day,
                    "startH": s.start_h,
                    "startM": s.start_m,
                    "durationMin": s.duration_min,
                    "subject": s.subject,
                    "code": s.code,
                    "type": s.type,
                    "faculty": s.faculty,
                    "room": s.room,
                    "batch": s.batch,
                    "courseKey": s.course_key
                } for s in schedules
            ],
            "reminders": list(islice(sorted_reminders, 5))
        }

    # ─── Innovation Hub ───────────────────────────────────────────────────────
    
    def get_innovation_hub(self, student: User, db: Session) -> InnovationHubResponse:
        _require_student(student)
        
        # 1. Fetch Ideas
        db_ideas = db.query(InnovationIdea).order_by(InnovationIdea.created_at.desc()).all()
        ideas = [InnovationIdeaResponse(
            id=i.id,
            title=i.title,
            author=i.author.full_name if i.author else "Unknown",
            avatar=i.author.avatar if i.author and i.author.avatar else "??",
            domain=i.domain or "General",
            tags=i.tags or [],
            desc=i.description or "",
            likes=i.likes,
            comments=i.comments,
            bookmarks=i.bookmarks,
            timeAgo=f"{(datetime.utcnow() - i.created_at.replace(tzinfo=None)).days}d ago" if (datetime.utcnow() - i.created_at.replace(tzinfo=None)).days > 0 else "Today",
            stage=i.stage,
            stageColor=i.stage_color or "var(--teal)",
            looking=i.looking_for or [],
            liked=False, 
            bookmarked=False,
            featured=i.is_featured
        ) for i in db_ideas]

        # 2. Fetch Projects
        db_projects = db.query(InnovationProject).filter(InnovationProject.student_id == student.id).all()
        projects = [InnovationProjectResponse(
            id=str(p.id),
            title=p.title,
            domain=p.domain or "General",
            stage=p.stage,
            stageColor=p.stage_color or "var(--indigo-ll)",
            progress=p.progress,
            color=p.color or "var(--indigo-l)",
            colorRgb=p.color_rgb or "91,78,248",
            team=p.team_members or [],
            nextMilestone=p.next_milestone or "N/A",
            dueIn=p.due_in or "Soon",
            stars=p.stars,
            desc=p.description or "",
            tasks=p.tasks or [],
            updates=p.updates or []
        ) for p in db_projects]

        # 3. Fetch Hackathons
        db_hacks = db.query(InnovationHackathon).filter(InnovationHackathon.status == "Open").all()
        hackathons = [InnovationHackathonResponse(
            id=str(h.id),
            name=h.name,
            org=h.organizer or "Unknown",
            prize=h.prize or "N/A",
            deadline=h.deadline.strftime("%b %d, %Y") if h.deadline else "TBD",
            daysLeft=max(0, (h.deadline.replace(tzinfo=None) - datetime.utcnow()).days) if h.deadline else 30,
            mode=h.mode,
            domain=h.domain or "All",
            registered=False, # Would need a mapping table
            teamSize=h.team_size or "2-4",
            color=h.color or "var(--teal)",
            colorRgb=h.color_rgb or "39,201,176",
            desc=h.description or "",
            status=h.status,
            statusColor=h.status_color or "var(--teal)"
        ) for h in db_hacks]

        # 4. Fetch Potential Collaborators (Other students with common skills)
        other_students = db.query(User).filter(User.role == "student", User.id != student.id).limit(10).all()
        collaborators = []
        my_skills = set(student.skills or [])
        for u in other_students:
            u_skills = set(u.skills or [])
            common = my_skills.intersection(u_skills)
            match = 50 + min(50, len(common)*10)
            collaborators.append(InnovationCollaboratorResponse(
                name=u.full_name,
                roll=u.roll_number or u.email.split("@")[0] if u.email else "Unknown",
                skills=u.skills or [],
                available=True,
                avatar=u.avatar or (u.full_name[0] if u.full_name else "?"),
                match=match,
                color="var(--teal)"
            ))

        user_profile = InnovationCollaboratorResponse(
            name=student.full_name,
            roll=student.roll_number or student.email.split("@")[0] if student.email else "Student",
            skills=student.skills or [],
            available=True,
            avatar=student.avatar or (student.full_name[0] if student.full_name else "ME"),
            match=100,
            color="var(--indigo-ll)"
        )

        return InnovationHubResponse(
            user_profile=user_profile,
            ideas=ideas,
            projects=projects,
            hackathons=hackathons,
            collaborators=collaborators
        )

    # ─── Courses ──────────────────────────────────────────────────────────────

    def get_courses(self, student: User, db: Session) -> List[EnrolledCourseResponse]:
        _require_student(student)
        # Return ALL active courses (enrolled + unenrolled) so new students see what's available
        return _all_courses_for_student(student, db)

    def enroll_course(self, course_id: int, student: User, db: Session):
        """Self-enroll a student in a course."""
        _require_student(student)
        course = db.query(Course).filter(Course.id == course_id, Course.is_active == True).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        existing = db.query(Enrollment).filter(
            Enrollment.student_id == student.id,
            Enrollment.course_id == course_id
        ).first()
        if existing:
            return {"message": "Already enrolled", "course_id": course_id}
        enrollment = Enrollment(student_id=student.id, course_id=course_id, progress=0.0)
        db.add(enrollment)
        db.commit()
        return {"message": "Enrolled successfully", "course_id": course_id}

    def get_course_detail(self, course_id: int, student: User, db: Session) -> CourseDetailResponse:
        _require_student(student)
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check enrollment
        enrollment = db.query(Enrollment).filter(Enrollment.student_id == student.id, Enrollment.course_id == course_id).first()
        progress = int(enrollment.progress) if enrollment else 0

        # Build real modules from DB lessons grouped by order
        all_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order).all()
        watched_lesson_ids = {
            wh.lesson_id for wh in
            db.query(WatchHistory).filter(
                WatchHistory.student_id == student.id,
                WatchHistory.completed == True
            ).all()
        }
        # Group lessons into modules of ~4
        modules = []
        chunk_size = 4
        for i in range(0, max(len(all_lessons), 1), chunk_size):
            chunk = all_lessons[i:i+chunk_size]
            completed_in_chunk = sum(1 for l in chunk if l.id in watched_lesson_ids)
            modules.append(CourseModule(
                id=f"m{i//chunk_size+1}",
                title=f"Module {i//chunk_size+1}: {chunk[0].title[:30] if chunk else 'Lessons'}...",
                lessons=len(chunk),
                duration=f"{len(chunk)*0.75:.1f}h",
                completed=(len(chunk) > 0 and completed_in_chunk == len(chunk))
            ))
        if not modules:
            modules = [CourseModule(id="m1", title="No lessons yet", lessons=0, duration="0h", completed=False)]

        # Real deadlines from assignments table
        assignments = db.query(Assignment).filter(
            Assignment.course_id == course_id,
            Assignment.due_date != None
        ).order_by(Assignment.due_date.asc()).limit(5).all()
        submitted_ids = {s.assignment_id for s in db.query(AssignmentSubmission).filter(AssignmentSubmission.student_id == student.id).all()}
        deadlines = [
            CourseDeadline(id=f"d{a.id}", title=a.title, date=a.due_date.strftime("%b %d") if a.due_date else "TBD", type="assignment")
            for a in assignments if a.id not in submitted_ids
        ]
        # Add quiz deadlines
        quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).limit(3).all()
        attempted = {qa.quiz_id for qa in db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).all()}
        for q in quizzes:
            if q.id not in attempted:
                deadlines.append(CourseDeadline(id=f"q{q.id}", title=q.title, date="Upcoming", type="quiz"))

        # Suggestions based on watched progress
        watched_count = len(watched_lesson_ids)
        total_lessons = len(all_lessons)
        suggestions = []
        if total_lessons > 0 and watched_count < total_lessons:
            next_lesson = next((l for l in all_lessons if l.id not in watched_lesson_ids), None)
            if next_lesson:
                suggestions.append(CourseSuggestion(id="s1", title=f"Watch: {next_lesson.title[:40]}", reason="Continue your progress", icon="Play"))
        if watched_count == 0:
            suggestions.append(CourseSuggestion(id="s2", title="Start your first lesson", reason="Begin learning today!", icon="Rocket"))

        return CourseDetailResponse(
            course_id=course.id,
            title=course.title,
            instructor=course.faculty_name,
            progress=progress,
            modules=modules,
            deadlines=deadlines,
            suggestions=suggestions
        )

    # ─── Lessons ──────────────────────────────────────────────────────────────

    def get_lessons(self, student: User, db: Session, course_id: Optional[int] = None) -> List[LessonResponse]:
        _require_student(student)
        # Show lessons from ALL courses (new students can browse even without enrollment)
        query = db.query(Lesson)
        if course_id:
            query = query.filter(Lesson.course_id == course_id)
        lessons = query.order_by(Lesson.course_id, Lesson.order).all()

        # Build watch map
        watched_map = {
            wh.lesson_id: wh
            for wh in db.query(WatchHistory).filter(WatchHistory.student_id == student.id).all()
        }

        result = []
        for lesson in lessons:
            wh = watched_map.get(lesson.id)
            result.append(LessonResponse(
                id=lesson.id,
                course_id=lesson.course_id,
                course_title=lesson.course.title if lesson.course else "Unknown",
                title=lesson.title,
                video_url=lesson.video_url,
                pdf_url=lesson.pdf_url,
                order=lesson.order,
                created_at=lesson.created_at,
                watched=wh is not None,
                watch_time_seconds=wh.watch_time_seconds if wh else 0,
                completed=wh.completed if wh else False,
            ))
        return result

    def mark_lesson_watched(self, lesson_id: int, data: MarkWatchedRequest, student: User, db: Session):
        _require_student(student)
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        wh = db.query(WatchHistory).filter(
            WatchHistory.student_id == student.id,
            WatchHistory.lesson_id == lesson_id,
        ).first()
        if wh:
            wh.watch_time_seconds = data.watch_time_seconds
            wh.completed = data.completed
            wh.watched_at = datetime.utcnow()
        else:
            wh = WatchHistory(
                student_id=student.id,
                lesson_id=lesson_id,
                watch_time_seconds=data.watch_time_seconds,
                completed=data.completed,
            )
            db.add(wh)
        db.commit()
        return {"message": "Lesson watch status updated"}

    # ─── Assignments ──────────────────────────────────────────────────────────

    def get_assignments(self, student: User, db: Session, course_id: Optional[int] = None) -> List[AssignmentResponse]:
        _require_student(student)
        enrolled_ids = [
            en.course_id for en in
            db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
        ]
        query = db.query(Assignment).filter(Assignment.course_id.in_(enrolled_ids))
        if course_id:
            query = query.filter(Assignment.course_id == course_id)
        assignments = query.order_by(Assignment.due_date.asc()).all()

        sub_map = {
            s.assignment_id: s
            for s in db.query(AssignmentSubmission).filter(
                AssignmentSubmission.student_id == student.id
            ).all()
        }

        result = []
        for a in assignments:
            sub = sub_map.get(a.id)
            
            # Helper to parse comma separated or JSON-like strings
            def parse_list(s: str):
                if not s: return []
                if s.startswith("["): 
                    try: import json; return json.loads(s)
                    except: pass
                return [x.strip() for x in s.split(",") if x.strip()]

            # Generate dynamic AI tip
            tip = f"Focus on {a.type or 'Theory'} fundamentals. "
            if a.difficulty == "Hard":
                tip += "This is a challenging topic, spend extra time on the documentation."
            elif a.difficulty == "Medium":
                tip += "Review the lecture notes before starting."
            else:
                tip += "This should be straightforward if you've followed the class."

            result.append(AssignmentResponse(
                id=a.id,
                course_id=a.course_id,
                course_title=a.course.title if a.course else "Unknown",
                faculty_name=a.faculty.full_name if a.faculty else "Unknown",
                title=a.title,
                description=a.description,
                type=a.type or "Theory",
                max_marks=a.max_marks or 100.0,
                weight=a.weight or "10%",
                difficulty=a.difficulty or "Medium",
                estimated_hours=a.estimated_hours or 4,
                tags=parse_list(a.tags),
                attachments=parse_list(a.attachments),
                instructions=parse_list(a.instructions) or ([a.description] if a.description else []),
                rubric=parse_list(a.rubric),
                due_date=a.due_date,
                created_at=a.created_at,
                submission=SubmissionResponse(
                    id=sub.id,
                    file_url=sub.file_url,
                    submitted_at=sub.submitted_at,
                    grade=sub.grade,
                    feedback=sub.feedback,
                ) if sub else None,
                ai_tip=tip
            ))
        return result

    def submit_assignment(self, assignment_id: int, data: AssignmentSubmitRequest, student: User, db: Session):
        _require_student(student)
        assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        existing = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.student_id == student.id,
            AssignmentSubmission.assignment_id == assignment_id,
        ).first()
        if existing:
            existing.file_url = data.file_url
            existing.submitted_at = datetime.utcnow()
        else:
            sub = AssignmentSubmission(
                assignment_id=assignment_id,
                student_id=student.id,
                file_url=data.file_url,
            )
            db.add(sub)
        db.commit()
        return {"message": "Assignment submitted successfully"}

    # ─── Quizzes ──────────────────────────────────────────────────────────────

    def get_quizzes(self, student: User, db: Session, course_id: Optional[int] = None, include_questions: bool = False) -> List[QuizResponse]:
        _require_student(student)
        enrolled_ids = [
            en.course_id for en in
            db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
        ]
        query = db.query(Quiz).filter(Quiz.course_id.in_(enrolled_ids))
        if course_id:
            query = query.filter(Quiz.course_id == course_id)
        quizzes = query.all()

        attempts_map: dict[int, list[QuizAttempt]] = {}
        for qa in db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).all():
            attempts_map.setdefault(qa.quiz_id, []).append(qa)

        result = []
        for quiz in quizzes:
            attempts = attempts_map.get(quiz.id, [])
            scores = [a.score for a in attempts if a.score is not None]
            best_score = max(scores) if scores else None
            questions = None
            if include_questions:
                questions = [
                    QuestionResponse(
                        id=q.id,
                        question_text=q.question_text,
                        type=q.type,
                        options=q.options,
                    ) for q in quiz.questions
                ]
            result.append(QuizResponse(
                id=quiz.id,
                course_id=quiz.course_id,
                course_title=quiz.course.title if quiz.course else "Unknown",
                faculty_name=quiz.faculty.full_name if quiz.faculty else "Unknown",
                title=quiz.title,
                difficulty=quiz.difficulty,
                is_ai_generated=quiz.is_ai_generated,
                created_at=quiz.created_at,
                question_count=len(quiz.questions),
                best_score=best_score,
                attempt_count=len(attempts),
                questions=questions,
            ))
        return result

    def get_quiz_detail(self, quiz_id: int, student: User, db: Session) -> QuizResponse:
        _require_student(student)
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        attempts = db.query(QuizAttempt).filter(
            QuizAttempt.student_id == student.id,
            QuizAttempt.quiz_id == quiz_id,
        ).all()
        scores = [a.score for a in attempts if a.score is not None]
        questions = [
            QuestionResponse(id=q.id, question_text=q.question_text, type=q.type, options=q.options)
            for q in quiz.questions
        ]
        return QuizResponse(
            id=quiz.id,
            course_id=quiz.course_id,
            course_title=quiz.course.title if quiz.course else "Unknown",
            faculty_name=quiz.faculty.full_name if quiz.faculty else "Unknown",
            title=quiz.title,
            difficulty=quiz.difficulty,
            is_ai_generated=quiz.is_ai_generated,
            created_at=quiz.created_at,
            question_count=len(quiz.questions),
            best_score=max(scores) if scores else None,
            attempt_count=len(attempts),
            questions=questions,
        )

    def submit_quiz_attempt(self, quiz_id: int, data: QuizAttemptRequest, student: User, db: Session):
        _require_student(student)
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            student_id=student.id,
            score=data.score,
            time_taken_seconds=data.time_taken_seconds,
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        return QuizAttemptResponse(
            id=attempt.id,
            score=attempt.score,
            attempted_at=attempt.attempted_at,
            time_taken_seconds=attempt.time_taken_seconds,
        )

    # ─── Study Groups ─────────────────────────────────────────────────────────

    def get_study_groups(self, student: User, db: Session) -> List[StudyGroupResponse]:
        _require_student(student)
        # Get groups the student is a member of
        member_group_ids = {
            m.group_id
            for m in db.query(StudyGroupMember).filter(StudyGroupMember.student_id == student.id).all()
        }
        # Return: all public groups + private groups where student is a member
        groups = db.query(StudyGroup).filter(
            (StudyGroup.type == "public") | (StudyGroup.id.in_(member_group_ids))
        ).all()

        return [
            StudyGroupResponse(
                id=g.id,
                name=g.name,
                course_id=g.course_id,
                course_title=g.course.title if g.course else "Unknown",
                subject=g.course.title if g.course else g.name,
                description=g.description or "",
                tags=g.tags or [],
                member_count=len(g.members),
                is_member=g.id in member_group_ids,
                is_public=(g.type == "public"),
                streak=g.streak or 0,
                created_at=g.created_at,
            )
            for g in groups
        ]

    def join_study_group(self, group_id: int, student: User, db: Session):
        _require_student(student)
        group = db.query(StudyGroup).filter(StudyGroup.id == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Study group not found")
        existing = db.query(StudyGroupMember).filter(
            StudyGroupMember.group_id == group_id,
            StudyGroupMember.student_id == student.id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Already a member")
        member = StudyGroupMember(group_id=group_id, student_id=student.id)
        db.add(member)
        db.commit()
        return {"message": "Joined study group"}

    # ─── Placement ────────────────────────────────────────────────────────────

    def get_placement(self, student: User, db: Session):
        _require_student(student)
        pri_obj = db.query(PlacementReadiness).filter(
            PlacementReadiness.student_id == student.id
        ).first()
        
        # Skill Scores
        skill_scores = db.query(SkillScore).filter(SkillScore.student_id == student.id).all()
        skill_scores_resp = [
            SkillScoreResponse(id=s.id, skill_name=s.skill_name, score=s.score, updated_at=s.updated_at)
            for s in skill_scores
        ]
        
        # Placement Readiness
        pri_resp = PlacementReadinessResponse(
            pri_score=pri_obj.pri_score if pri_obj else 0.0,
            mock_interviews_done=pri_obj.mock_interviews_done if pri_obj else 0,
            skills_completed=pri_obj.skills_completed if pri_obj else 0,
            updated_at=pri_obj.updated_at if pri_obj else datetime.utcnow(),
        )
        
        # PRI Breakdown
        coding_score = int(sum(s.score for s in skill_scores[:3]) / len(skill_scores[:3])) if skill_scores else 0
        pri_breakdown = [
            {"label": "Coding Skills", "score": coding_score, "max": 100, "color": "var(--teal)", "icon": "Code"},
            {"label": "Communication", "score": int(pri_obj.communication_score) if pri_obj else 0, "max": 100, "color": "var(--indigo-l)", "icon": "Mic"},
            {"label": "Aptitude", "score": int(pri_obj.aptitude_score) if pri_obj else 0, "max": 100, "color": "var(--violet)", "icon": "Brain"},
            {"label": "Resume Quality", "score": int(pri_obj.resume_score) if pri_obj else 0, "max": 100, "color": "var(--amber)", "icon": "FileText"},
            {"label": "Interview Readiness", "score": int(pri_obj.pri_score * 0.8) if pri_obj else 0, "max": 100, "color": "var(--rose)", "icon": "Mic"}
        ]
        
        # Companies (from Internships table)
        internships = db.query(Internship).limit(5).all()
        companies = [
            {
                "name": i.company_name,
                "role": i.role,
                "ctc": i.stipend,
                "difficulty": i.difficulty,
                "tag": i.tag,
                "tagColor": i.tag_color,
                "logo": i.logo,
                "logoBg": i.logo_bg,
                "logoColor": i.logo_color,
                "deadline": i.deadline.strftime("%b %d") if i.deadline else "TBD",
                "match": int(len(set(student.skills or []).intersection(set(i.skills or []))) / max(1, len(i.skills or [])) * 100) if i.skills else 0
            } for i in internships
        ]
        
        # Mock Sessions (from MockInterview table)
        mock_interviews = db.query(MockInterview).filter(MockInterview.student_id == student.id).order_by(MockInterview.created_at.desc()).limit(5).all()
        mock_sessions = [
            {
                "company": m.company,
                "type": m.type,
                "date": m.date,
                "time": m.time,
                "interviewer": "AI Simulator",
                "score": m.score,
                "status": "done" if m.score is not None else "upcoming"
            } for m in mock_interviews
        ]
        
        # Dynamic Topics and Resume Checklist
        topics_db = db.query(PlacementTopic).filter(PlacementTopic.student_id == student.id).all()
        topics = [
            {"label": t.label, "done": t.done, "total": t.total, "color": t.color}
            for t in topics_db
        ] if topics_db else [
            {"label": "Arrays & Strings", "done": 0, "total": 40, "color": "var(--teal)"},
            {"label": "Trees & Graphs", "done": 0, "total": 35, "color": "var(--indigo-l)"},
            {"label": "Dynamic Programming", "done": 0, "total": 30, "color": "var(--amber)"},
        ]
        
        resume_db = db.query(ResumeCheck).filter(ResumeCheck.student_id == student.id).all()
        resume_checklist = [
            {"label": r.label, "done": r.done}
            for r in resume_db
        ] if resume_db else [
            {"label": "Contact & Summary", "done": False},
            {"label": "Education Details", "done": False},
            {"label": "Technical Skills Section", "done": False},
        ]
        tips = [
            {"icon": "Zap", "color": "var(--amber)", "text": "Practice more Mock Interviews to improve your PRI score."},
        ]

        # Difficulty Breakdown
        difficulty_breakdown = []

        # ATS Score & Issues
        ats_score = int(pri_obj.resume_score) if pri_obj else 0
        ats_issues = []

        # Profile Strength
        profile_strength = [
            { "label": "Skills Listed", "pct": min(100, len(skill_scores)*15), "color": "var(--violet)" },
        ]

        # Last Feedback
        last_feedback = None
        if mock_interviews and mock_interviews[0].score is not None:
            last = mock_interviews[0]
            last_feedback = {
                "session": f"{last.company or 'Company'} · {last.type or 'Round'} · {last.date or 'Recently'}",
                "score": last.score,
                "metrics": [
                    { "label": "Overall", "score": last.score, "color": "var(--teal)" },
                ],
                "strength": "Good problem solving.",
                "improve": "Focus on communication."
            }

        return {
            "placement_readiness": pri_resp,
            "skill_scores": skill_scores_resp,
            "pri_breakdown": pri_breakdown,
            "companies": companies,
            "mock_sessions": mock_sessions,
            "topics": topics,
            "resume_checklist": resume_checklist,
            "difficulty_breakdown": difficulty_breakdown,
            "ats_score": ats_score,
            "ats_issues": ats_issues,
            "profile_strength": profile_strength,
            "last_feedback": last_feedback,
            "tips": tips,
            "applications_count": db.query(InternshipApplication).filter(InternshipApplication.student_id == student.id).count(),
            "shortlisted_count": db.query(InternshipApplication).filter(
                InternshipApplication.student_id == student.id,
                InternshipApplication.current_step >= 2
            ).count()
        }

    # ─── Internships ──────────────────────────────────────────────────────────

    def get_internships(self, student: User, db: Session):
        _require_student(student)
        
        internships = db.query(Internship).all()
        applications = db.query(InternshipApplication).filter(InternshipApplication.student_id == student.id).all()
        app_map = {a.internship_id: a for a in applications}

        result_listings: List[InternshipResponse] = []
        for i in internships:
            app = app_map.get(i.id)
            result_listings.append(InternshipResponse(
                id=i.id,
                company_name=i.company_name,
                role=i.role,
                domain=i.domain,
                location=i.location,
                stipend=i.stipend,
                duration=i.duration,
                seats=i.seats,
                skills=i.skills or [],
                description=i.description,
                difficulty=i.difficulty,
                logo=i.logo,
                logo_bg=i.logo_bg,
                logo_color=i.logo_color,
                tag=i.tag,
                tag_color=i.tag_color,
                deadline=i.deadline,
                created_at=i.created_at,
                application_status=app.status_label if app else None
            ))

        result_applications: List[Dict[str, Any]] = []
        for app in applications:
            result_applications.append({
                "company": app.internship.company_name,
                "role": app.internship.role,
                "logo": app.internship.logo,
                "logoBg": app.internship.logo_bg,
                "logoColor": app.internship.logo_color,
                "appliedOn": app.applied_at.strftime("%b %d"),
                "status": app.status_label or "Under Review",
                "statusColor": app.status_color or "amber",
                "steps": ["Applied", "OA", "Interview", "Offer"],
                "currentStep": app.current_step
            })

        total_apps = len(applications)
        def get_pct(count): return int((count / max(1, total_apps)) * 100)
        
        funnel = [
            {"stage": "Applied",          "count": total_apps,  "color": "var(--indigo-l)", "pct": 100 if total_apps else 0},
            {"stage": "OA / Test",        "count": sum(1 for a in applications if a.current_step >= 2),  "color": "var(--teal)",     "pct": get_pct(sum(1 for a in applications if a.current_step >= 2))},
            {"stage": "Interview",        "count": sum(1 for a in applications if a.current_step >= 3),  "color": "var(--amber)",    "pct": get_pct(sum(1 for a in applications if a.current_step >= 3))},
            {"stage": "Offer Received",   "count": sum(1 for a in applications if a.current_step >= 4),  "color": "var(--violet)",   "pct": get_pct(sum(1 for a in applications if a.current_step >= 4))},
        ]
        
        timeline: List[Dict[str, Any]] = []
        for app in applications:
            timeline.append({
                "date": app.applied_at.strftime("%b %d"),
                "event": f"Applied to {app.internship.company_name} · {app.internship.role}",
                "type": "apply",
                "color": "var(--indigo-l)"
            })
            if app.logs:
                for log in app.logs:
                    timeline.append(log)
        
        timeline.sort(key=lambda x: x.get("date", ""), reverse=True)
        return {
            "listings": result_listings,
            "applications": result_applications,
            "saved": [],
            "funnel": funnel,
            "timeline": list(islice(timeline, 10))
        }

    def apply_internship(self, internship_id: int, student: User, db: Session):
        _require_student(student)
        internship = db.query(Internship).filter(Internship.id == internship_id).first()
        if not internship:
            raise HTTPException(status_code=404, detail="Internship not found")
        existing = db.query(InternshipApplication).filter(
            InternshipApplication.internship_id == internship_id,
            InternshipApplication.student_id == student.id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Already applied")
        app = InternshipApplication(internship_id=internship_id, student_id=student.id)
        db.add(app)
        db.commit()
        return {"message": "Applied successfully"}

    # ─── Profile ──────────────────────────────────────────────────────────────

    def update_profile(self, data: ProfileUpdateRequest, student: User, db: Session):
        _require_student(student)
        if data.full_name:
            student.full_name = data.full_name
        db.commit()
        return {"message": "Profile updated"}

    # ─── Notifications ────────────────────────────────────────────────────────

    def get_notifications(self, student: User, db: Session) -> List[NotificationResponse]:
        _require_student(student)
        now = datetime.utcnow()
        notifications = []

        # Assignment due soon (within 3 days, not submitted)
        enrolled_ids = [
            en.course_id for en in
            db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
        ]
        submitted_ids = {
            s.assignment_id for s in
            db.query(AssignmentSubmission).filter(AssignmentSubmission.student_id == student.id).all()
        }
        upcoming_assignments = db.query(Assignment).filter(
            Assignment.course_id.in_(enrolled_ids),
            Assignment.due_date >= now,
        ).all() if enrolled_ids else []

        for a in upcoming_assignments:
            if a.id not in submitted_ids:
                diff = (a.due_date - now).days if a.due_date else 99
                notifications.append(NotificationResponse(
                    id=f"asgn_{a.id}",
                    type="assignment_due",
                    title=f"Assignment due: {a.title}",
                    message=f"Due on {a.due_date.strftime('%b %d') if a.due_date else 'TBD'} — {a.course.title if a.course else ''}",
                    created_at=now,
                    is_read=False,
                ))

        # Grades posted (submissions with grade)
        graded = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.student_id == student.id,
            AssignmentSubmission.grade != None,
        ).all()
        for sub in graded:
            notifications.append(NotificationResponse(
                id=f"grade_{sub.id}",
                type="grade_posted",
                title=f"Grade posted: {sub.assignment.title if sub.assignment else 'Assignment'}",
                message=f"You scored {sub.grade:.1f}. {sub.feedback or ''}",
                created_at=sub.submitted_at,
                is_read=False,
            ))

        # New quizzes
        attempted_ids = {
            qa.quiz_id for qa in
            db.query(QuizAttempt).filter(QuizAttempt.student_id == student.id).all()
        }
        new_quizzes = db.query(Quiz).filter(
            Quiz.course_id.in_(enrolled_ids),
            ~Quiz.id.in_(attempted_ids) if attempted_ids else True,
        ).all() if enrolled_ids else []

        for q in new_quizzes:
            notifications.append(NotificationResponse(
                id=f"quiz_{q.id}",
                type="quiz_available",
                title=f"Quiz available: {q.title}",
                message=f"New quiz in {q.course.title if q.course else ''} — take it now!",
                created_at=q.created_at,
                is_read=False,
            ))

        # Sort by created_at desc
        notifications.sort(key=lambda n: n.created_at, reverse=True)
        return list(islice(notifications, 20))

    # ─── Resume Builder ───────────────────────────────────────────────────────
    
    def get_resume(self, student: User, db: Session):
        _require_student(student)
        
        projects = []
        db_projects = db.query(InnovationProject).filter(InnovationProject.student_id == student.id).all()
        for i, p in enumerate(db_projects):
            projects.append({ "id": i+1, "name": p.title, "tech": p.domain or "General", "desc": p.description or "" })
            
        return {
            "experiences": [],
            "projects": projects,
            "skills": student.skills or [],
            "certs": [],
            "ats_chips": [],
            "personal": {
                "fullName": student.full_name,
                "email": student.email,
                "phone": student.phone or "",
                "linkedin": "linkedin.com/in/" + student.full_name.lower().replace(" ", ""),
                "github": "github.com/" + student.full_name.lower().replace(" ", ""),
                "location": "Global",
                "summary": student.bio or ""
            }
        }

    # ─── Mock Interviews ──────────────────────────────────────────────────────
    
    def get_mock_interviews(self, student: User, db: Session) -> MockInterviewsFullResponse:
        _require_student(student)
        
        # 1. Fetch History
        history = db.query(MockInterview).filter(MockInterview.student_id == student.id).order_by(MockInterview.created_at.desc()).all()
        
        # 2. Calculate Stats
        total_sessions = len(history)
        avg_score = sum(h.score for h in history if h.score) / total_sessions if total_sessions > 0 else 0
        
        stats = {
            "sessions_done": total_sessions,
            "avg_score": int(avg_score),
            "streak_days": 1 if total_sessions > 0 else 0, # Simplified streak
            "class_rank": student.id % 20 + 1 # Dynamic-ish rank
        }

        # 3. Round Types (Dynamic)
        round_types_db = db.query(MockInterviewRoundType).all()
        roundTypes = [
            MockInterviewRoundTypeSchema(
                id=rt.id, label=rt.label, icon=rt.icon, color=rt.color,
                desc=rt.desc, duration=rt.duration, rounds=rt.rounds
            ) for rt in round_types_db
        ]

        # 4. Question Bank (Dynamic)
        questions_db = db.query(MockInterviewQuestion).all()
        bank = [
            MockInterviewQuestionBankItem(
                id=q.id, topic=q.topic, difficulty=q.difficulty,
                title=q.title, asked=q.asked, times=q.times
            ) for q in questions_db
        ]

        # 5. Calculate Insights (Dynamic)
        radar_items = []
        if history:
            radar_dict = {"Problem Solving": [], "Code Quality": [], "Communication": [], "Time Mgmt": []}
            for h in history:
                feedback = cast(Dict[str, int], h.feedback) if h.feedback else {}
                if feedback:
                    for k, v in feedback.items():
                        if k in radar_dict:
                            radar_dict[k].append(v)
            for k, v in radar_dict.items():
                if v:
                    radar_items.append(MockInterviewRadarItem(label=k, value=int(sum(v)/len(v))))

        # Calculate Weak Areas based on history tags & score
        topic_stats: Dict[str, Dict[str, int]] = {}
        for h in history:
            interview_tags = cast(List[str], h.tags) if h.tags else []
            if interview_tags and h.score is not None:
                for t in interview_tags:
                    if t not in topic_stats:
                        topic_stats[t] = {"sessions": 0, "total_score": 0}
                    
                    topic_stats[t]["sessions"] += 1
                    topic_stats[t]["total_score"] += h.score

        weak_areas = []
        for t, stats_dict in topic_stats.items():
            avg = int(stats_dict["total_score"] / stats_dict["sessions"])
            if avg < 80: # Consider it a weak area if score is below 80
                color = "var(--rose)" if avg < 60 else ("var(--amber)" if avg < 75 else "var(--violet)")
                weak_areas.append(
                    MockInterviewWeakArea(topic=t, sessions=stats_dict["sessions"], avgScore=avg, color=color)
                )

        # Sort by avg score ascending (weakest first)
        weak_areas.sort(key=lambda x: x.avgScore)

        insights = MockInterviewInsights(
            radar=radar_items,
            weak_areas=list(islice(weak_areas, 3)) # Top 3 weakest
        )

        return MockInterviewsFullResponse(
            session_history=history,
            round_types=roundTypes,
            question_bank=bank,
            stats=stats,
            insights=insights
        )


    # ─── AI Chat ──────────────────────────────────────────────────────────────

    def ai_chat(self, data: AIChatRequest, student: User, db: Session) -> AIChatResponse:
        _require_student(student)
        msg = data.message.lower()
        
        # Simple rule-based logic for Lucyna AI mentor
        if "hello" in msg or "hi" in msg:
            reply = f"Hello {student.full_name}! I am Lucyna, your personal academic mentor. How can I help you today?"
        elif "schedule" in msg or "today" in msg:
            reply = "You can check your 'Schedule' tab for your personal timetable and upcoming classes."
        elif "pri" in msg or "placement" in msg:
            reply = f"Your current Placement Readiness Index (PRI) is {student.placement_readiness.pri_score if student.placement_readiness else 0}. Keep practicing mocks to improve!"
        elif "assignment" in msg:
            reply = "You can view your pending tasks in the 'Assignments' section. Stay ahead of your deadlines!"
        else:
            reply = "I'm here to help with your academic journey. Feel free to ask about your courses, placements, or innovation projects."
            
        return AIChatResponse(reply=reply)


student_service = StudentService()
