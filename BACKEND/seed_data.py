import sys
import os

# Add the current directory to sys.path so we can import local modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from sqlalchemy.orm import Session
from Core.Database import SessionLocal, engine, Base
from Core.Security import hash_pwd
from Models.User import User, UserRole
from Models.Assignment import Assignment, AssignmentSubmission
from Models.Placement import (
    SkillScore, PlacementReadiness, Internship, InternshipApplication, 
    MockInterview, MockInterviewRoundType, MockInterviewQuestion, PlacementTopic, ResumeCheck
)
from Models.Course import Course, Enrollment
from Models.Lesson import Lesson, WatchHistory
from Models.Quiz import Quiz, Question, QuizAttempt, QuestionType, DifficultyLevel
from Models.Project import Project, ProjectStatus
from Models.Community import Forum, ForumPost, StudyGroup, StudyGroupMember
from Models.Schedule import Schedule
from Models.Innovation import InnovationIdea, InnovationProject, InnovationHackathon
from datetime import datetime, timedelta

def seed_data():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create Users
        print("Creating users...")
        faculty_user = User(
            full_name="Dr. Sarah Johnson",
            email="sarah.johnson@smartcampus.edu",
            password=hash_pwd("faculty123"),
            role=UserRole.faculty,
            phone="9876543210",
            bio="Professor of Computer Science & AI Ethics"
        )
        db.add(faculty_user)

        student_user = User(
            full_name="Arjun Reddy",
            email="arjun.reddy@student.com",
            password=hash_pwd("student123"),
            role=UserRole.student,
            phone="9988776655",
            bio="Passionate Full-stack Developer | AI Enthusiast | Final Year CSE",
            avatar="AR",
            roll_number="21CS1042",
            skills=["Python", "React", "FastAPI", "PostgreSQL", "Docker", "DSA", "System Design"]
        )
        db.add(student_user)
        db.commit()
        db.refresh(faculty_user)
        db.refresh(student_user)

        # 2. Create Courses
        print("Creating courses...")
        courses_data = [
            {"title": "Operating Systems", "code": "CS501", "sem": "Sem 5"},
            {"title": "Database Management Systems", "code": "CS502", "sem": "Sem 5"},
            {"title": "Machine Learning", "code": "CS503", "sem": "Sem 5"},
            {"title": "Computer Networks", "code": "CS504", "sem": "Sem 5"},
            {"title": "Cryptography & Network Security", "code": "CS505", "sem": "Sem 5"}
        ]
        
        objs = []
        for cdict in courses_data:
            c = Course(
                faculty_id=faculty_user.id,
                title=cdict["title"],
                description=f"Core curriculum course for {cdict['title']}.",
                semester=cdict["sem"],
                is_active=True
            )
            db.add(c)
            objs.append(c)
        db.commit()
        for o in objs: db.refresh(o)

        # 3. Enroll & Lessons
        print("Enrolling & Adding Lessons...")
        for c in objs:
            enrollment = Enrollment(student_id=student_user.id, course_id=c.id, progress=75.0 if c.title == "Operating Systems" else 45.0)
            db.add(enrollment)
            
            for i in range(1, 4):
                lesson = Lesson(
                    course_id=c.id,
                    title=f"Lesson {i}: Introduction to {c.title}",
                    video_url="https://example.com/video",
                    duration="45m",
                    order=i
                )
                db.add(lesson)
                db.commit()
                db.refresh(lesson)
                
                if i < 3:
                    wh = WatchHistory(student_id=student_user.id, lesson_id=lesson.id, watch_time_seconds=2700, completed=True)
                    db.add(wh)

        # 4. Schedule
        print("Seeding Schedule...")
        for d in range(5):
            s = Schedule(
                student_id=student_user.id, day=d, start_h=9, start_m=0, duration_min=60,
                subject="Operating Systems", code="CS501", type="lecture", faculty="Dr.Sarah", room="301", course_key="OS"
            )
            db.add(s)
            s2 = Schedule(
                student_id=student_user.id, day=d, start_h=10, start_m=30, duration_min=60,
                subject="DBMS", code="CS502", type="lecture", faculty="Prof.Verma", room="205", course_key="DBMS"
            )
            db.add(s2)

        # 5. Study Groups
        print("Seeding Study Groups...")
        groups = [
            {"name": "OS Warriors", "desc": "Deep dive into kernel internals", "icon": "Cpu", "clr": "var(--indigo-l)", "rgb": "91,78,248", "tags": ["Kernel", "Linux"], "streak": 12},
            {"name": "The Query Crew", "desc": "Mastering SQL optimization", "icon": "Database", "clr": "var(--teal)", "rgb": "39,201,176", "tags": ["SQL", "NoSQL"], "streak": 8}
        ]
        for gdict in groups:
            g = StudyGroup(
                name=gdict["name"], description=gdict["desc"], icon=gdict["icon"],
                color=gdict["clr"], color_rgb=gdict["rgb"], tags=gdict["tags"],
                streak=gdict["streak"], messages_count=145, resources_count=12,
                course_id=objs[0].id
            )
            db.add(g)
            db.commit()
            db.refresh(g)
            db.add(StudyGroupMember(group_id=g.id, student_id=student_user.id))

        # 6. Innovations
        print("Seeding Innovation Hub...")
        idea = InnovationIdea(
            author_id=student_user.id, title="AI Proctored Exam System",
            description="Prevent cheating using eye tracking.", domain="EdTech", tags=["AI", "Python"],
            stage="Prototype", stage_color="var(--teal)", looking_for=["React Dev"], is_featured=True
        )
        db.add(idea)
        
        h = InnovationHackathon(
            name="Smart Campus Hackathon", organizer="Campus Tech", prize="₹50,000",
            deadline=datetime.utcnow()+timedelta(days=15), mode="Online", status="Open", status_color="var(--teal)"
        )
        db.add(h)

        # 7. Quizzes & Placement
        print("Seeding Quizzes & Placement...")
        for c in objs:
            quiz = Quiz(course_id=c.id, faculty_id=faculty_user.id, title=f"{c.title} Unit 1 Quiz")
            db.add(quiz)
            db.commit()
            db.refresh(quiz)
            
            q = Question(quiz_id=quiz.id, question_text="Sample Q?", options=["A", "B"], correct_answer="A")
            db.add(q)
            
            att = QuizAttempt(quiz_id=quiz.id, student_id=student_user.id, score=88.0, time_taken_seconds=300)
            db.add(att)

        readiness = PlacementReadiness(
            student_id=student_user.id, pri_score=82.0, communication_score=78.0,
            aptitude_score=85.0, resume_score=88.0, mock_interviews_done=4, skills_completed=12
        )
        db.add(readiness)

        for sname in ["Python", "DSA", "DBMS"]:
            db.add(SkillScore(student_id=student_user.id, skill_name=sname, score=85.0))

        db.commit()
        print("SUCCESS: Full database seeded with premium 'Arjun Reddy' data!")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        import traceback; traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
