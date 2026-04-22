"""
Placement Service — SmartCampus
Business logic for placement readiness, drives, internships,
mock interviews, skill scores, and dashboard analytics.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from sqlalchemy import func, case, distinct, select
from sqlalchemy.orm import Session
from Service.NotificationService import notification_service
import asyncio

from Models.Placement import (
    PlacementReadiness,
    SkillScore,
    Internship,
    InternshipApplication,
    MockInterview,
    PlacementTopic,
    ResumeCheck,
    MockInterviewRoundType,
    MockInterviewQuestion,
    ApplicationStatus,
    PlacementTask,
    PlacementEvent,
    DriveAttendance,
    VersantAttempt,
    VersantTestPart,
    VersantQuestion,
    PlacementQuiz,
    PlacementQuizQuestion,
    PlacementQuizAttempt,
)
from Core.MeetingState import ACTIVE_MEETINGS
from Models.User import User, UserRole          # adjust import to your project layout
from Schemas.PlacementSchema import (
    SkillScoreCreate,
    InternshipCreate,
    InternshipUpdate,
    InternshipApplicationCreate,
    ApplicationStatusUpdate,
    PlacementTaskCreate,
    PlacementTaskUpdate,
    PlacementEventCreate,
    PlacementEventUpdate,
    MockInterviewCreate,
    MockInterviewFeedback,
    MockInterviewResponse,
)
from Schemas.StudentSchema import VersantAttemptCreate


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _require(obj, label: str):
    if obj is None:
        raise ValueError(f"{label} not found")
    return obj


def _recalc_pri(pr: PlacementReadiness) -> float:
    """
    Placement Readiness Index formula (0 – 100).
    Weights:  Skills 30%  | Aptitude 25%  | Communication 25%
              Resume 10%  | Mock Interviews 10%
    """
    mock_norm = min(pr.mock_interviews_done * 10, 100)   # cap at 10 interviews
    pri = (
        pr.aptitude_score      * 0.25 +
        pr.communication_score * 0.25 +
        (pr.skills_completed   * 10)  * 0.30 +   # assume up to 10 skills
        pr.resume_score        * 0.10 +
        mock_norm              * 0.10
    )
    return round(min(pri, 100), 2)


def _get_month_group(db: Session, column):
    """DB-agnostic month grouping (YYYY-MM)."""
    dialect = db.bind.dialect.name
    if dialect == "postgresql":
        return func.to_char(column, "YYYY-MM")
    # Default to SQLite/strftime
    return func.strftime("%Y-%m", column)


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard Analytics
# ─────────────────────────────────────────────────────────────────────────────

def get_dashboard_stats(db: Session) -> dict:
    """Aggregate stats for the placement officer dashboard."""

    total_students = (
        db.query(func.count(User.id))
        .filter(User.role == "student", User.is_active == True)
        .scalar() or 0
    )

    placed_count = (
        db.query(func.count(distinct(InternshipApplication.student_id)))
        .filter(InternshipApplication.status == ApplicationStatus.selected)
        .scalar() or 0
    )

    placement_rate = round(float(placed_count) / float(total_students or 1) * 100.0, 1) if total_students else 0.0


    avg_pri = (
        db.query(func.avg(PlacementReadiness.pri_score)).scalar() or 0.0
    )

    # PRI distribution buckets
    pri_rows = db.query(PlacementReadiness.pri_score).all()
    scores   = [r[0] for r in pri_rows]
    dist = {"excellent": 0, "good": 0, "fair": 0, "needs_work": 0}
    for s in scores:
        if s >= 85:   dist["excellent"]  += 1
        elif s >= 70: dist["good"]       += 1
        elif s >= 55: dist["fair"]       += 1
        else:         dist["needs_work"] += 1

    # Branch-wise placement (needs department on User)
    branch_data = (
        db.query(User.department, func.count(User.id).label("total"))
        .filter(User.role == "student", User.is_active == True, User.department.isnot(None))
        .group_by(User.department)
        .all()
    )
    placed_by_branch = (
        db.query(User.department, func.count(distinct(User.id)).label("placed"))
        .join(InternshipApplication, InternshipApplication.student_id == User.id)
        .filter(InternshipApplication.status == ApplicationStatus.selected)
        .group_by(User.department)
        .all()
    )
    placed_map = {r.department: r.placed for r in placed_by_branch}
    branch_stats = [
        {
            "branch": r.department,
            "total":  r.total,
            "placed": placed_map.get(r.department, 0),
            "pct":    round(placed_map.get(r.department, 0) / r.total * 100, 1) if r.total else 0,
        }
        for r in branch_data
    ]

    # Funnel
    drive_ready     = len([s for s in scores if s >= 70])
    applied_count   = db.query(func.count(InternshipApplication.id)).scalar() or 0
    offers_count    = placed_count
    total_drives    = db.query(func.count(Internship.id)).filter(Internship.category == "drive").scalar() or 0
    upcoming_drives = db.query(func.count(Internship.id)).filter(Internship.status == "Upcoming", Internship.category == "drive").scalar() or 0
    total_companies = db.query(func.count(distinct(Internship.company_name))).scalar() or 0



    funnel = [
        {"label": "Total Eligible",         "count": total_students, "pct": 100.0},
        {"label": "PRI ≥ 70 (Drive Ready)", "count": drive_ready,    "pct": round(float(drive_ready) / float(total_students or 1) * 100.0, 1) if total_students else 0.0},
        {"label": "Applied to Companies",   "count": applied_count,  "pct": round(float(applied_count) / float(total_students or 1) * 100.0, 1) if total_students else 0.0},
        {"label": "Offer Received",         "count": offers_count,   "pct": round(float(offers_count) / float(total_students or 1) * 100.0, 1) if total_students else 0.0},

    ]

    # Package Statistics
    pkg_stats = (
        db.query(
            func.avg(Internship.pkg_lpa).label("avg_pkg"),
            func.max(Internship.pkg_lpa).label("max_pkg"),
            func.count(InternshipApplication.id).label("total_offers")
        )
        .join(Internship, Internship.id == InternshipApplication.internship_id)
        .filter(InternshipApplication.status == ApplicationStatus.selected)
        .first()
    )
    # Package Distribution
    buckets = [
        {"range": "Above 25 LPA", "min": 25.0, "max": 1000.0, "color": "var(--teal)"},
        {"range": "15 – 25 LPA", "min": 15.0, "max": 25.0, "color": "var(--indigo-ll)"},
        {"range": "10 – 15 LPA", "min": 10.0, "max": 15.0, "color": "var(--violet)"},
        {"range": "7 – 10 LPA", "min": 7.0, "max": 10.0, "color": "var(--amber)"},
        {"range": "Below 7 LPA", "min": 0.0, "max": 7.0, "color": "var(--rose)"},
    ]
    pkg_distribution = []
    total_placed_safe = placed_count or 1
    for b in buckets:
        p_count = (
            db.query(func.count(InternshipApplication.id))
            .join(Internship, Internship.id == InternshipApplication.internship_id)
            .filter(
                InternshipApplication.status == ApplicationStatus.selected,
                Internship.pkg_lpa >= b["min"],
                Internship.pkg_lpa < b["max"]
            ).scalar()
        ) or 0
        pkg_distribution.append({
            "range": b["range"],
            "count": p_count,
            "pct":   round(float(p_count) / float(total_placed_safe) * 100.0, 1),

            "color": b["color"]
        })


    return {
        "total_students":  total_students,
        "placed_students": placed_count,
        "placement_rate":  placement_rate,
        "avg_pri":         round(float(avg_pri or 0.0), 1),
        "avg_package":     round(float(pkg_stats.avg_pkg or 0.0), 1),
        "highest_package": round(float(pkg_stats.max_pkg or 0.0), 1),

        "total_offers":    pkg_stats.total_offers or 0,
        "total_drives":    total_drives,
        "upcoming_drives": upcoming_drives,
        "total_companies": total_companies,

        "pri_distribution": dist,

        "branch_stats":    branch_stats,
        "funnel":          funnel,
        "package_distribution": pkg_distribution
    }




def get_dashboard_trends(db: Session):
    """Monthly placement trends: Placed, Applied, Interviews."""
    month_col = _get_month_group(db, InternshipApplication.applied_at)
    results = db.query(
        month_col.label("month"),
        func.count(InternshipApplication.id).label("applied"),
        func.count(case((InternshipApplication.status == ApplicationStatus.selected, 1))).label("placed")
    ).group_by(month_col).order_by(month_col).all()

    # Interviews trend from MockInterview
    int_month_col = _get_month_group(db, MockInterview.created_at)
    interviews = db.query(
        int_month_col.label("month"),
        func.count(MockInterview.id).label("count")
    ).group_by(int_month_col).all()
    int_map = {r.month: r.count for r in interviews}

    trend = []
    for r in results:
        trend.append({
            "month": r.month,
            "placed": r.placed,
            "applied": r.applied,
            "interviews": int_map.get(r.month, 0)
        })

    # If no data, return a small default to avoid empty charts
    if not trend:
        # Get current month
        m = datetime.utcnow().strftime("%Y-%m")
        trend = [{"month": m, "placed": 0, "applied": 0, "interviews": 0}]

    return trend


def get_student_placement_list(db: Session, branch: Optional[str] = None,
                               status: Optional[str] = None, search: Optional[str] = None,
                               skip: int = 0, limit: int = 50) -> List[dict]:
    """
    Returns a list of students enriched with PRI & placement status for the
    placement officer's student tracker table.
    """
    q = (
        db.query(User, PlacementReadiness)
        .outerjoin(PlacementReadiness, PlacementReadiness.student_id == User.id)
        .filter(User.role == "student", User.is_active == True)
    )
    if branch:
        q = q.filter(User.department == branch)
    if search:
        q = q.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.roll_number.ilike(f"%{search}%"))
        )

    rows = q.offset(skip).limit(limit).all()

    result = []
    for user, pr in rows:
        # Latest placed application (if any)
        placed_app = (
            db.query(InternshipApplication, Internship.company_name, Internship.pkg_lpa)
            .join(Internship, Internship.id == InternshipApplication.internship_id)
            .filter(
                InternshipApplication.student_id == user.id,
                InternshipApplication.status == ApplicationStatus.selected,
            )
            .order_by(InternshipApplication.applied_at.desc())
            .first()
        )

        in_process_app = (
            db.query(InternshipApplication, Internship.company_name)
            .join(Internship, Internship.id == InternshipApplication.internship_id)
            .filter(
                InternshipApplication.student_id == user.id,
                InternshipApplication.status == ApplicationStatus.applied,
            )
            .order_by(InternshipApplication.applied_at.desc())
            .first()
        )

        # Latest Versant Score
        latest_versant = (
            db.query(VersantAttempt.overall_score)
            .filter(VersantAttempt.student_id == user.id)
            .order_by(VersantAttempt.created_at.desc())
            .first()
        )

        # Resolve placement status
        placement_status = "Not Ready"
        company = "—"
        pkg = "—"

        if placed_app:
            placement_status = "Placed"
            company = placed_app[1]
            pkg = f"₹{placed_app[2]}L" if placed_app[2] else "—"
        elif in_process_app:
            placement_status = "In Process"
            company = in_process_app[1]
        elif pr and pr.pri_score >= 55:
            placement_status = "Applied"

        # Filter by status after resolving it
        if status and status != "All" and placement_status != status:
            continue

        initials = "".join(w[0].upper() for w in (user.full_name or "?").split()[:2])
        
        # Skill count and interview count
        skills_list = user.skills if user.skills else []
        interviews_done = (
            db.query(func.count(MockInterview.id))
            .filter(MockInterview.student_id == user.id)
            .scalar() or 0
        )

        result.append({
            "id":          user.id,
            "full_name":   user.full_name,
            "name":        user.full_name,
            "branch":      user.department,
            "roll_number": user.roll_number,
            "pri":         pr.pri_score if pr else 0,
            "skills":      skills_list,
            "interviews":  interviews_done,
            "versant":     latest_versant[0] if latest_versant else None,
            "company":     company,
            "pkg":         pkg,
            "status":      placement_status,
        })

    return result


def create_placement_student(db: Session, data: dict) -> dict:
    """Helper to create a student user and initialize placement readiness."""
    # Check if user exists
    existing = db.query(User).filter(User.email == data["email"]).first()
    if existing:
        raise ValueError("User with this email already exists")

    new_user = User(
        full_name=data["full_name"],
        email=data["email"],
        password=data.get("password", "SmartCampus123!"), # Default password
        role="student",
        phone=data.get("phone"),
        department=data.get("department"),
        roll_number=data.get("roll_number"),
        skills=data.get("skills", []),
        settings=data.get("settings", {}),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Init readiness
    pr = PlacementReadiness(
        student_id=new_user.id,
        pri_score=data.get("pri_score", 0.0)
    )
    db.add(pr)
    db.commit()
    
    return {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "department": new_user.department,
        "roll_number": new_user.roll_number,
        "pri_score": pr.pri_score
    }


def delete_placement_student(db: Session, student_id: int) -> bool:
    """Permanently remove a student and their placement data."""
    user = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not user:
        return False
    
    # cascade deletes should handle readiness, applications if set in model
    # but let's be safe if they aren't
    db.query(PlacementReadiness).filter_by(student_id=student_id).delete()
    db.query(InternshipApplication).filter_by(student_id=student_id).delete()
    db.query(SkillScore).filter_by(student_id=student_id).delete()
    db.query(MockInterview).filter_by(student_id=student_id).delete()
    
    db.delete(user)
    db.commit()
    return True


# ─────────────────────────────────────────────────────────────────────────────
# Placement Readiness
# ─────────────────────────────────────────────────────────────────────────────

def get_or_create_readiness(db: Session, student_id: int) -> PlacementReadiness:
    pr = db.query(PlacementReadiness).filter_by(student_id=student_id).first()
    if not pr:
        pr = PlacementReadiness(student_id=student_id)
        db.add(pr)
        db.commit()
        db.refresh(pr)
    return pr


def get_readiness(db: Session, student_id: int) -> PlacementReadiness:
    return get_or_create_readiness(db, student_id)


def update_readiness(db: Session, student_id: int, **kwargs) -> PlacementReadiness:
    pr = get_or_create_readiness(db, student_id)
    for k, v in kwargs.items():
        if hasattr(pr, k):
            setattr(pr, k, v)
    pr.pri_score = _recalc_pri(pr)
    pr.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pr)
    return pr


# ─────────────────────────────────────────────────────────────────────────────
# Skill Scores
# ─────────────────────────────────────────────────────────────────────────────

def upsert_skill_score(db: Session, student_id: int, data: SkillScoreCreate) -> SkillScore:
    ss = (
        db.query(SkillScore)
        .filter_by(student_id=student_id, skill_name=data.skill_name)
        .first()
    )
    if ss:
        ss.score      = data.score
        ss.updated_at = datetime.utcnow()
    else:
        ss = SkillScore(student_id=student_id, skill_name=data.skill_name, score=data.score)
        db.add(ss)

    db.commit()
    db.refresh(ss)

    # Recompute skills_completed → recalc PRI
    completed = (
        db.query(func.count(SkillScore.id))
        .filter(SkillScore.student_id == student_id, SkillScore.score >= 60)
        .scalar() or 0
    )
    update_readiness(db, student_id, skills_completed=completed)
    return ss


def get_skill_scores(db: Session, student_id: int) -> List[SkillScore]:
    return db.query(SkillScore).filter_by(student_id=student_id).all()


def delete_skill_score(db: Session, student_id: int, skill_name: str) -> bool:
    ss = db.query(SkillScore).filter_by(student_id=student_id, skill_name=skill_name).first()
    if not ss:
        return False
    db.delete(ss)
    db.commit()
    return True


# ─────────────────────────────────────────────────────────────────────────────
# Internships
# ─────────────────────────────────────────────────────────────────────────────

def create_internship(db: Session, officer_id: int, data: InternshipCreate) -> Internship:
    intern = Internship(
        **data.model_dump(),
        added_by=officer_id,
        category="internship"
    )
    db.add(intern)
    db.commit()
    db.refresh(intern)

    # ─── Notify Students ───
    # Broadcast to all students
    asyncio.create_task(notification_service.create_notification(
        db=db,
        user_id=None,
        type="system_alert",
        title=f"New Internship: {intern.company_name}",
        message=f"A new internship opportunity is available at {intern.company_name}. Apply now!",
        link="/studentdashboard/studentInternships"
    ))
    return intern


def list_internships(db: Session, skip: int = 0, limit: int = 20,
                     domain: Optional[str] = None) -> List[Internship]:
    q = db.query(Internship).filter(Internship.category == "internship")
    if domain:
        q = q.filter(Internship.domain.ilike(f"%{domain}%"))
    return q.order_by(Internship.created_at.desc()).offset(skip).limit(limit).all()

# ─────────────────────────────────────────────────────────────────────────────
# Drives & Attendance
# ─────────────────────────────────────────────────────────────────────────────

def create_drive(db: Session, officer_id: int, data: InternshipCreate) -> Internship:
    drive = Internship(
        **data.model_dump(),
        added_by=officer_id,
        category="drive"
    )
    db.add(drive)
    db.commit()
    db.refresh(drive)

    # ─── Notify Students ───
    asyncio.create_task(notification_service.create_notification(
        db=db,
        user_id=None,
        type="system_alert",
        title=f"New Placement Drive: {drive.company_name}",
        message=f"Registrations are open for the {drive.company_name} placement drive.",
        link="/studentdashboard/studentDrives"
    ))
    return drive

def list_drives(db: Session, skip: int = 0, limit: int = 20,
                domain: Optional[str] = None) -> List[Internship]:
    q = db.query(Internship).filter(Internship.category == "drive")
    if domain:
        q = q.filter(Internship.domain.ilike(f"%{domain}%"))
    return q.order_by(Internship.created_at.desc()).offset(skip).limit(limit).all()

def get_drive_attendance(db: Session, drive_id: int) -> List[dict]:
    # Returns list of students who applied/registered and their attendance status
    # We'll use InternshipApplication as the base for registration, and DriveAttendance for tracking
    attendances = db.query(DriveAttendance).filter_by(drive_id=drive_id).all()
    att_map = {a.student_id: a.status for a in attendances}
    
    apps = db.query(InternshipApplication, User).join(User, User.id == InternshipApplication.student_id).filter(InternshipApplication.internship_id == drive_id).all()
    
    res = []
    for app, user in apps:
        res.append({
            "student_id": user.id,
            "full_name": user.full_name,
            "roll_number": user.roll_number,
            "department": user.department,
            "status": att_map.get(user.id, "Registered")
        })
    return res

def mark_drive_attendance(db: Session, drive_id: int, student_id: int, status: str) -> bool:
    att = db.query(DriveAttendance).filter_by(drive_id=drive_id, student_id=student_id).first()
    if att:
        att.status = status
    else:
        att = DriveAttendance(drive_id=drive_id, student_id=student_id, status=status)
        db.add(att)

    # Cascade: if TPO marks student as "Selected", update their InternshipApplication too
    if status == "Selected":
        app = db.query(InternshipApplication).filter_by(
            internship_id=drive_id, student_id=student_id
        ).first()
        if app:
            app.status = ApplicationStatus.selected
            app.current_step = 4  # Full progress

    db.commit()
    return True


def get_internship(db: Session, internship_id: int) -> Internship:
    return _require(db.query(Internship).get(internship_id), "Internship")


def update_internship(db: Session, internship_id: int, data: InternshipUpdate) -> Internship:
    intern = get_internship(db, internship_id)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(intern, k, v)
    db.commit()
    db.refresh(intern)
    return intern


def delete_internship(db: Session, internship_id: int) -> bool:
    intern = _require(db.query(Internship).get(internship_id), "Internship")
    db.delete(intern)
    db.commit()
    return True


# ─────────────────────────────────────────────────────────────────────────────
# Internship Applications
# ─────────────────────────────────────────────────────────────────────────────

def apply_internship(db: Session, student_id: int,
                     data: InternshipApplicationCreate) -> InternshipApplication:
    # Prevent duplicate application
    existing = (
        db.query(InternshipApplication)
        .filter_by(student_id=student_id, internship_id=data.internship_id)
        .first()
    )
    if existing:
        raise ValueError("Already applied to this internship")

    app = InternshipApplication(
        student_id=student_id,
        internship_id=data.internship_id,
        status=ApplicationStatus.applied,
        current_step=1,
        logs=[{"step": "Applied", "timestamp": datetime.utcnow().isoformat()}],
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def get_student_applications(db: Session, student_id: int) -> List[InternshipApplication]:
    return (
        db.query(InternshipApplication)
        .filter_by(student_id=student_id)
        .order_by(InternshipApplication.applied_at.desc())
        .all()
    )


def get_internship_applications(db: Session, internship_id: int) -> List[InternshipApplication]:
    return (
        db.query(InternshipApplication)
        .filter_by(internship_id=internship_id)
        .order_by(InternshipApplication.applied_at.desc())
        .all()
    )


def list_all_applications(db: Session, skip: int = 0, limit: int = 50,
                         status: Optional[str] = None) -> List[InternshipApplication]:
    """List all student applications across all drives (officer view)."""
    q = db.query(InternshipApplication)
    if status:
        q = q.filter(InternshipApplication.status == status)
    return q.order_by(InternshipApplication.applied_at.desc()).offset(skip).limit(limit).all()


def update_application_status(db: Session, application_id: int,
                               data: ApplicationStatusUpdate) -> InternshipApplication:
    app = _require(db.query(InternshipApplication).get(application_id), "Application")
    app.status = data.status

    # Advance the step tracker
    step_map = {
        ApplicationStatus.applied:  1,
        ApplicationStatus.selected: 4,
        ApplicationStatus.rejected: 0,
    }
    app.current_step = step_map.get(data.status, app.current_step)
    logs = app.logs or []
    logs.append({"step": data.status.value, "timestamp": datetime.utcnow().isoformat()})
    app.logs = logs

    db.commit()
    db.refresh(app)
    return app


def withdraw_application(db: Session, student_id: int, application_id: int) -> bool:
    app = db.query(InternshipApplication).filter_by(
        id=application_id, student_id=student_id
    ).first()
    if not app:
        raise ValueError("Application not found or not owned by student")
    db.delete(app)
    db.commit()
    return True


# ─────────────────────────────────────────────────────────────────────────────
# Mock Interviews
# ─────────────────────────────────────────────────────────────────────────────

def get_mock_interviews(db: Session, student_id: int) -> List[MockInterview]:
    return (
        db.query(MockInterview)
        .filter_by(student_id=student_id)
        .order_by(MockInterview.created_at.desc())
        .all()
    )


def get_upcoming_interviews(db: Session, student_id: int) -> List[MockInterview]:
    return (
        db.query(MockInterview)
        .filter_by(student_id=student_id, status="Scheduled")
        .order_by(MockInterview.created_at.asc())
        .all()
    )


def create_mock_interview(db: Session, student_id: int, **kwargs) -> MockInterview:
    """Legacy/Student-initiated (completed immediately)"""
    mi = MockInterview(student_id=student_id, status="Completed", **kwargs)
    db.add(mi)
    db.commit()
    db.refresh(mi)

    # Bump mock_interviews_done counter & recalc PRI
    done = (
        db.query(func.count(MockInterview.id))
        .filter_by(student_id=student_id, status="Completed")
        .scalar() or 0
    )
    update_readiness(db, student_id, mock_interviews_done=done)
    return mi


def schedule_mock_interview(db: Session, officer_id: int, data: MockInterviewCreate) -> MockInterview:
    """TPO schedules an upcoming interview"""
    mi = MockInterview(**data.model_dump(), officer_id=officer_id)
    db.add(mi)
    db.commit()
    db.refresh(mi)
    return mi


def submit_mock_interview_feedback(db: Session, officer_id: int, interview_id: int, 
                                   data: MockInterviewFeedback) -> MockInterview:
    """TPO conducts & scores an interview"""
    mi = db.query(MockInterview).filter_by(id=interview_id).first()
    if not mi:
        raise ValueError("Interview record not found")
        
    for k, v in data.model_dump().items():
        setattr(mi, k, v)
        
    mi.status = "Completed"
    mi.officer_id = officer_id
    db.commit()
    db.refresh(mi)

    # Recalculate PRI (Only count COMPLETED interviews)
    done = (
        db.query(func.count(MockInterview.id))
        .filter_by(student_id=mi.student_id, status="Completed")
        .scalar() or 0
    )
    update_readiness(db, mi.student_id, mock_interviews_done=done)
    return mi


def delete_mock_interview(db: Session, student_id: int, interview_id: int) -> bool:
    mi = db.query(MockInterview).filter_by(id=interview_id, student_id=student_id).first()
    if not mi:
        raise ValueError("Interview not found")
    db.delete(mi)
    db.commit()
    # Recalculate
    done = db.query(func.count(MockInterview.id)).filter_by(student_id=student_id, status="Completed").scalar() or 0
    update_readiness(db, student_id, mock_interviews_done=done)
    return True


def get_mock_interview_round_types(db: Session) -> List[MockInterviewRoundType]:
    return db.query(MockInterviewRoundType).all()


def get_mock_interview_questions(db: Session, topic: Optional[str] = None,
                                  difficulty: Optional[str] = None) -> List[MockInterviewQuestion]:
    q = db.query(MockInterviewQuestion)
    if topic:
        q = q.filter(MockInterviewQuestion.topic.ilike(f"%{topic}%"))
    if difficulty:
        q = q.filter(MockInterviewQuestion.difficulty == difficulty)
    return q.all()


# ─────────────────────────────────────────────────────────────────────────────
# Placement Topics & Resume Checks
# ─────────────────────────────────────────────────────────────────────────────

def get_placement_topics(db: Session, student_id: int) -> List[PlacementTopic]:
    return db.query(PlacementTopic).filter_by(student_id=student_id).all()


def update_placement_topic(db: Session, student_id: int, topic_id: int,
                            done: int) -> PlacementTopic:
    pt = db.query(PlacementTopic).filter_by(id=topic_id, student_id=student_id).first()
    _require(pt, "Placement topic")
    pt.done = done
    db.commit()
    db.refresh(pt)
    return pt


def get_resume_checks(db: Session, student_id: int) -> List[ResumeCheck]:
    return db.query(ResumeCheck).filter_by(student_id=student_id).all()


# ─────────────────────────────────────────────────────────────────────────────
# Versant Assessment
# ─────────────────────────────────────────────────────────────────────────────

def seed_versant_data(db: Session):
    if db.query(VersantTestPart).first():
        return # already seeded
    
    parts = [
        {"id": "partA", "title": "Part A: Reading", "desc": "Read the sentences as they appear on the screen.", "type": "speak"},
        {"id": "partB", "title": "Part B: Repeat", "desc": "Repeat the sentence you hear exactly.", "type": "speak"},
        {"id": "partC", "title": "Part C: Questions", "desc": "Give a short, one-word answer to the question using your voice.", "type": "speak"},
        {"id": "partD", "title": "Part D: Sentence Builds", "desc": "Rearrange the word groups into a correct sentence aloud.", "type": "speak"},
        {"id": "partE", "title": "Part E: Story Retelling", "desc": "Listen to a short story and summarize it in your own words.", "type": "speak"},
        {"id": "partF", "title": "Part F: Open Questions", "desc": "Speak for 45 seconds about the given topic.", "type": "speak"},
        {"id": "partG", "title": "Part G: Dictation", "desc": "Listen carefully and type the sentence exactly as you hear it.", "type": "type"},
        {"id": "partH", "title": "Part H: Passage Reconstruction", "desc": "Read the passage for 30s, then type it from memory.", "type": "type"}
    ]
    
    for p in parts:
        db.add(VersantTestPart(**p))
    db.commit()

    questions = [
        # Part A: Reading
        {"part_id": "partA", "content": "Traffic is heavy in the city during rush hour."},
        {"part_id": "partA", "content": "The new software update will be released tomorrow morning."},
        {"part_id": "partA", "content": "Innovative solutions are required for urban development."},
        {"part_id": "partA", "content": "Global economies are becoming increasingly interconnected."},
        
        # Part B: Repeat
        {"part_id": "partB", "content": "Please leave your contact details at the reception desk."},
        {"part_id": "partB", "content": "The report must be submitted by the end of the day."},
        {"part_id": "partB", "content": "Can you help me find the nearest exit?"},
        
        # Part C: Questions
        {"part_id": "partC", "content": {"q": "Is a cow an animal or a machine?", "a": "animal"}},
        {"part_id": "partC", "content": {"q": "Do you wear a hat on your head or your feet?", "a": "head"}},
        {"part_id": "partC", "content": {"q": "Which is longer: a minute or an hour?", "a": "hour"}},
        
        # Part D: Sentence Builds
        {"part_id": "partD", "content": {"words": ["was", "the meeting", "very productive"], "correct": "the meeting was very productive"}},
        {"part_id": "partD", "content": {"words": ["he", "to the office", "is going"], "correct": "he is going to the office"}},
        {"part_id": "partD", "content": {"words": ["at the station", "the train", "arrived"], "correct": "the train arrived at the station"}},
        
        # Part E: Story Retelling
        {"part_id": "partE", "content": "John wanted to go hiking, but it started raining. He decided to read a book instead. Later, the sun came out and he went for a short walk."},
        {"part_id": "partE", "content": "Sarah bought a new car last week. She drove it to her parents' house. They were very happy for her and celebrated with a nice dinner."},
        
        # Part F: Open Questions
        {"part_id": "partF", "content": "Describe a challenging project you've worked on and how you handled it."},
        {"part_id": "partF", "content": "Do you prefer working in a team or independently? Why?"},
        
        # Part G: Dictation (Typing)
        {"part_id": "partG", "content": "The financial report must be submitted by Friday afternoon."},
        {"part_id": "partG", "content": "Innovation and technology drive the modern economic landscape."},
        
        # Part H: Passage Reconstruction (Typing from memory)
        {"part_id": "partH", "content": "Modern cities face numerous challenges, from traffic congestion to environmental pollution. To build a sustainable future, governments must invest in green energy and efficient public transport systems."}
    ]
    
    for q in questions:
        db.add(VersantQuestion(**q))
    db.commit()

def get_versant_questions(db: Session):
    try:
        seed_versant_data(db)
    except Exception as e:
        print(f"Versant seeding skipped/failed: {e}")
        
    parts = db.query(VersantTestPart).all()
    res = []
    for p in parts:
        qs = db.query(VersantQuestion).filter_by(part_id=p.id).all()
        res.append({
            "id": p.id,
            "title": p.title,
            "desc": p.desc,
            "type": p.type,
            "questions": [q.content for q in qs]
        })
    return res

def submit_versant_test(db: Session, student_id: int, data: VersantAttemptCreate) -> VersantAttempt:
    ans = data.answers if hasattr(data, "answers") else getattr(data, "details", [])
    
    # Save the attempt as pending (scores = 0)
    attempt = VersantAttempt(
        student_id=student_id,
        sentence_mastery=0.0,
        vocabulary=0.0,
        fluency=0.0,
        pronunciation=0.0,
        overall_score=0.0,
        feedback="Pending placement evaluation.",
        details=[a.model_dump() if hasattr(a, "model_dump") else a for a in ans] if type(ans) is list else ans
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt


def get_student_versant_history(db: Session, student_id: int) -> List[VersantAttempt]:
    return (
        db.query(VersantAttempt)
        .filter_by(student_id=student_id)
        .order_by(VersantAttempt.created_at.desc())
        .all()
    )

def get_pending_versant_evaluations(db: Session):
    attempts = db.query(VersantAttempt, User).join(User, VersantAttempt.student_id == User.id).filter(
        VersantAttempt.overall_score == 0.0
    ).all()
    
    res = []
    for att, user in attempts:
        res.append({
            "id": att.id,
            "student_name": user.full_name,
            "student_id": user.roll_number,
            "created_at": att.created_at,
            "status": "pending_evaluation",
            "details": att.details or []
        })
    return res

def grade_versant_attempt(db: Session, attempt_id: int, payload: dict):
    attempt = db.query(VersantAttempt).filter_by(id=attempt_id).first()
    if not attempt:
        raise ValueError("Attempt not found")
        
    attempt.sentence_mastery = float(payload.get("sentence_mastery", 0))
    attempt.vocabulary = float(payload.get("vocabulary", 0))
    attempt.fluency = float(payload.get("fluency", 0))
    attempt.pronunciation = float(payload.get("pronunciation", 0))
    attempt.overall_score = float(payload.get("overall_score", 0))
    attempt.feedback = payload.get("feedback", "Evaluation complete.")
    db.commit()
    db.refresh(attempt)
    
    # Update communication score for placement readiness based on evaluation
    update_readiness(db, attempt.student_id, communication_score=attempt.overall_score)
    return attempt


def get_versant_ai_suggestion(db: Session, attempt_id: int):
    """Call Groq to analyze transcriptions and suggest Versant scores."""
    attempt = db.query(VersantAttempt).filter_by(id=attempt_id).first()
    if not attempt:
        raise ValueError("Attempt not found")
        
    from Service.GroqService import groq_service
    import json
    
    # Context: Part responses
    details = attempt.details or []
    context = ""
    for d in details:
        part = d.get("part", "Unknown")
        resp = d.get("text", d.get("resp", "")) # fallback to resp for legacy tests
        context += f"Part: {part} | Student Transcription: {resp}\n"
        
    prompt = f"""You are an expert English language assessor evaluating a student's Versant test. 
IMPORTANT: If the student transcriptions are completely empty, gibberish, or 'none', you MUST assign a score of 0 or close to 0 across all metrics. If they skipped a significant portion of the test, their score must plummet accordingly. Do not invent scores for empty submissions.

Analyze these transcriptions and suggest scores (0-100) for these metrics:
1. Sentence Mastery: How well they reproduced sentences.
2. Vocabulary: Word usage and accuracy.
3. Fluency: Flow and speed (infer from text coherence).
4. Pronunciation: Phonetic accuracy in transcription.

Responses:
{context}

Return ONLY a JSON object with keys: sentence_mastery, vocabulary, fluency, pronunciation, overall_score, and a short summary_feedback.
Do not markdown backticks."""

    try:
        resp = groq_service.generate_chat_response([{"role": "user", "content": prompt}], max_tokens=1000)
        clean_resp = resp.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_resp)
        return data
    except Exception as e:
        print(f"Versant AI Evaluation Error: {e}")
        return {
            "sentence_mastery": 70, "vocabulary": 70, "fluency": 70, "pronunciation": 70, 
            "overall_score": 70, "summary_feedback": "AI evaluation failed. Please review manually."
        }


def toggle_resume_check(db: Session, student_id: int, check_id: int) -> ResumeCheck:
    rc = db.query(ResumeCheck).filter_by(id=check_id, student_id=student_id).first()
    _require(rc, "Resume check")
    rc.done = not rc.done
    db.commit()
    db.refresh(rc)

    # Update resume_score = % checks completed
    total   = db.query(func.count(ResumeCheck.id)).filter_by(student_id=student_id).scalar() or 1
    done_ct = db.query(func.count(ResumeCheck.id)).filter_by(student_id=student_id, done=True).scalar() or 0
    update_readiness(db, student_id, resume_score=round(float(done_ct) / total * 100.0, 2))
    return rc


# ─────────────────────────────────────────────────────────────────────────────
# Notifications helper (used by routes to fan-out alerts)
# ─────────────────────────────────────────────────────────────────────────────

def build_drive_notification(internship: Internship) -> dict:
    return {
        "icon":  "🏢",
        "title": f"New Drive: {internship.company_name}",
        "msg":   f"{internship.role} drive added. Deadline: {internship.deadline or 'TBD'}.",
        "time":  "Just now",
        "unread": True,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Placement Officer Dashboard: Tasks & Events
# ─────────────────────────────────────────────────────────────────────────────

def get_placement_tasks(db: Session, officer_id: int) -> List[PlacementTask]:
    return db.query(PlacementTask).filter_by(officer_id=officer_id).order_by(PlacementTask.created_at.desc()).all()

def create_placement_task(db: Session, officer_id: int, data: PlacementTaskCreate) -> PlacementTask:
    task = PlacementTask(**data.model_dump(), officer_id=officer_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def update_placement_task(db: Session, officer_id: int, task_id: int, data: PlacementTaskUpdate) -> PlacementTask:
    task = db.query(PlacementTask).filter_by(id=task_id, officer_id=officer_id).first()
    _require(task, "Task")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task

def delete_placement_task(db: Session, officer_id: int, task_id: int) -> bool:
    task = db.query(PlacementTask).filter_by(id=task_id, officer_id=officer_id).first()
    if not task: return False
    db.delete(task)
    db.commit()
    return True

# Events
def get_placement_events(db: Session, officer_id: int) -> List[PlacementEvent]:
    return db.query(PlacementEvent).filter_by(officer_id=officer_id).order_by(PlacementEvent.created_at.asc()).all()

def create_placement_event(db: Session, officer_id: int, data: PlacementEventCreate) -> PlacementEvent:
    ev = PlacementEvent(**data.model_dump(), officer_id=officer_id)
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev

def update_placement_event(db: Session, officer_id: int, event_id: int, data: PlacementEventUpdate) -> PlacementEvent:
    ev = db.query(PlacementEvent).filter_by(id=event_id, officer_id=officer_id).first()
    _require(ev, "Event")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(ev, k, v)
    db.commit()
    db.refresh(ev)
    return ev

def delete_placement_event(db: Session, officer_id: int, event_id: int) -> bool:
    ev = db.query(PlacementEvent).filter_by(id=event_id, officer_id=officer_id).first()
    if not ev: return False
    db.delete(ev)
    db.commit()
    return True

# ─────────────────────────────────────────────────────────────────────────────
# Placement Meetings
# ─────────────────────────────────────────────────────────────────────────────

def get_meeting_groups(db: Session) -> List[dict]:
    """Return available departments/groups for placement sessions."""
    from Models.User import User
    depts = [r[0] for r in db.query(distinct(User.department)).filter(User.department != None).all()]
    if "All" not in depts:
        depts.append("All")
    
    groups = []
    COLORS = ["var(--teal)", "var(--indigo-ll)", "var(--amber)", "var(--rose)", "var(--violet)"]
    RGBS = ["39,201,176", "91,78,248", "255,191,0", "255,64,129", "124,77,255"]
    
    for idx, dept in enumerate(depts):
        if dept == "All":
            count = db.query(func.count(User.id)).filter(User.role == "student", User.is_active == True).scalar()
        else:
            count = db.query(func.count(User.id)).filter(User.role == "student", User.department == dept, User.is_active == True).scalar()
            
        active_meet = ACTIVE_MEETINGS.get(dept)
        is_live = False
        room_code = None
        if active_meet and active_meet.get("type") == "placement":
            is_live = True
            room_code = active_meet.get("room_code")
            
        groups.append({
            "id": idx + 1,
            "group_key": dept,
            "name": f"{dept} Students" if dept != "All" else "All Students",
            "code": dept[:3].upper() if dept != "All" else "ALL",
            "semester": "All Years",
            "student_count": count or 0,
            "color": COLORS[idx % len(COLORS)],
            "rgb": RGBS[idx % len(RGBS)],
            "is_live": is_live,
            "room_code": room_code,
        })
    return groups

def start_meeting(officer: User, db: Session, group_id: int):
    """Start a placement session for a group."""
    import random, string
    groups = get_meeting_groups(db)
    group = next((g for g in groups if g["id"] == group_id), None)
    if not group:
        group = groups[0] if groups else {
            "name": "All Students", "group_key": "All", "code": "ALL",
            "student_count": 0, "color": "var(--indigo-l)"
        }
        
    room_code = "-".join("".join(random.choices(string.ascii_lowercase, k=3)) for _ in range(3))
    # Correct join URL for placement meetings - using the student dashboard page param
    join_url = f"http://localhost:5173/studentdashboard?page=studentplacementmeetings&room={room_code}"
    
    meet_details = {
        "room_code": room_code,
        "group_id": group_id,
        "course_name": group["name"],
        "course_code": group["code"],
        "student_count": group["student_count"],
        "officer_name": officer.full_name,
        "officer_email": officer.email,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "join_url": join_url,
        "group_key": group["group_key"],
        "type": "placement",
        "department": group["group_key"]
    }
    
    ACTIVE_MEETINGS[group["group_key"]] = meet_details
    return meet_details

def end_meeting(group_key: str):
    """End an active placement session."""
    if group_key in ACTIVE_MEETINGS:
        del ACTIVE_MEETINGS[group_key]
    return {"message": "Placement session ended", "group_key": group_key}

def get_meeting_history(db: Session):
    """Return simulated meeting history."""
    import random
    groups = get_meeting_groups(db)
    history = []
    for g in groups[:min(5, len(groups))]:
        for _ in range(random.randint(1, 2)):
            days_ago = random.randint(1, 15)
            duration = random.choice([30, 45, 60, 90])
            past_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
            history.append({
                "course_name": g["name"],
                "course_code": g["code"],
                "date": past_date.strftime("%b %d, %Y"),
                "duration_min": duration,
                "attendees": int(g["student_count"] * random.uniform(0.5, 0.9)),
                "total_students": g["student_count"],
            })
    history.sort(key=lambda x: x["date"], reverse=True)
    return history[:10]

# ─── AI Chat ──────────────────────────────────────────────────────────────

def placement_ai_chat(db: Session, officer_id: int, payload: dict) -> dict:
    from Service.GroqService import groq_service
    from Models.User import User
    
    officer = db.query(User).get(officer_id)
    if not officer:
        raise ValueError("Officer not found")
        
    msg = payload.get("message", "").strip()
    if not msg:
        raise ValueError("Message cannot be empty")
        
    context_str = payload.get("context", "")
    
    system_prompt = f"""You are Lucyna, an elite AI Placement Assistant.
You are assisting {officer.full_name}, a placement officer at the university.
Use the following real-time placement statistics and context to inform your answers:
{context_str}

Provide concise, analytical, and actionable insights based ONLY on the data provided and best practices for university placements.
Do not hallucinate data. If you don't know, state that the data is not available.
Format your responses using beautiful markdown, highlight key metrics in bold.
"""
    
    # If the frontend passes a history array, use it. Otherwise just use a single message.
    history = payload.get("messages", [])
    
    if not history:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": msg}
        ]
    else:
        # Override the system prompt if frontend sent an Anthropic-style messages array
        messages = [{"role": "system", "content": system_prompt}]
        for m in history:
            messages.append({"role": "user" if m.get("role") == "user" else "assistant", "content": m.get("content", m.get("text", ""))})
    
    reply = groq_service.generate_chat_response(messages)
    
    return {"reply": reply}


# ─────────────────────────────────────────────────────────────────────────────
# AI PLACEMENT QUIZ
# ─────────────────────────────────────────────────────────────────────────────

from Models.Placement import PlacementQuiz, PlacementQuizQuestion, PlacementQuizAttempt
import json, re


def generate_ai_placement_quiz(payload: dict) -> dict:
    """
    Call Groq to generate a placement quiz from a TPO prompt.
    Returns the generated questions as a list (NOT saved to DB yet).
    """
    topic    = payload.get("topic", "").strip()
    category = payload.get("category", "General Placement")
    count    = min(int(payload.get("count", 10)), 20)
    diff     = payload.get("difficulty", "Medium")

    if not topic:
        raise ValueError("topic is required")

    from Service.GroqService import groq_service

    system_prompt = f"""You are an elite placement preparation coach.
Generate EXACTLY {count} MCQ questions for the category: {category}.
The questions must be highly professional and suitable for campus placements.

Instructions:
1. Since the category is '{category}', ensure all questions strictly align with this domain.
2. If the category is 'Communication', focus on verbal ability, grammar, and soft skills.
3. If the category is 'Technical', focus on programming, algorithms, and technical concepts.
4. Output ONLY a valid JSON array of objects with no extra text.

Each question object must have:
  "question": string,
  "options": array of 4 strings,
  "answer": string (must exactly match one of the options),
  "explanation": string (1-2 sentences)
"""

    user_prompt = (
        f"Topic: {topic}\n"
        f"Difficulty: {diff}\n"
        f"Number of questions: {count}\n"
        f"Category: {category}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_prompt},
    ]

    raw = groq_service.generate_chat_response(messages, max_tokens=4000)

    # Extract JSON array even if model wraps it in markdown fences
    match = re.search(r'\[.*\]', raw, re.DOTALL)
    if not match:
        raise ValueError("AI did not return a valid JSON array")

    questions = json.loads(match.group())
    return {"topic": topic, "difficulty": diff, "questions": questions}


def publish_ai_placement_quiz(payload: dict, officer_id: int, db: Session) -> dict:
    """
    Save a generated quiz + its questions to the DB.
    """
    title    = payload.get("title", payload.get("topic", "AI Quiz"))
    topic    = payload.get("topic", "")
    diff     = payload.get("difficulty", "Medium")
    duration = int(payload.get("duration", 15))
    group    = payload.get("target_group", "All")
    qs       = payload.get("questions", [])

    if not qs:
        raise ValueError("questions are required")

    quiz = PlacementQuiz(
        officer_id   = officer_id,
        title        = title,
        topic_prompt = topic,
        difficulty   = diff,
        duration     = duration,
        target_group = group,
        is_active    = True,
    )
    db.add(quiz)
    db.flush()   # get quiz.id

    for q in qs:
        db.add(PlacementQuizQuestion(
            quiz_id        = quiz.id,
            question_text  = q.get("question", ""),
            options        = q.get("options", []),
            correct_answer = q.get("answer", ""),
            explanation    = q.get("explanation", ""),
        ))

    db.commit()
    db.refresh(quiz)
    return _serialize_placement_quiz(quiz, officer_view=True)


def get_placement_quizzes_officer(db: Session) -> list:
    """Return all quizzes for the placement officer view (with attempt counts)."""
    quizzes = db.query(PlacementQuiz).order_by(PlacementQuiz.created_at.desc()).all()
    return [_serialize_placement_quiz(q, officer_view=True) for q in quizzes]


def get_placement_quizzes_student(student_id: int, db: Session) -> list:
    """Return active quizzes for students, with attempted flag."""
    quizzes = db.query(PlacementQuiz).filter(PlacementQuiz.is_active == True).order_by(PlacementQuiz.created_at.desc()).all()
    attempted_ids = {
        a.quiz_id for a in
        db.query(PlacementQuizAttempt.quiz_id)
          .filter(PlacementQuizAttempt.student_id == student_id)
          .all()
    }
    result = []
    for q in quizzes:
        data = _serialize_placement_quiz(q, officer_view=False)
        data["attempted"] = q.id in attempted_ids
        if q.id in attempted_ids:
            attempt = db.query(PlacementQuizAttempt).filter(
                PlacementQuizAttempt.quiz_id    == q.id,
                PlacementQuizAttempt.student_id == student_id,
            ).first()
            if attempt:
                data["my_score"]   = attempt.score
                data["attempt_id"] = attempt.id
                data["answers"]    = attempt.answers
            else:
                data["my_score"]   = None
                data["attempt_id"] = None
        result.append(data)
    return result


def submit_placement_quiz(quiz_id: int, student_id: int, payload: dict, db: Session) -> dict:
    """Grade a student's quiz submission and update their aptitude score."""
    quiz = db.query(PlacementQuiz).filter(PlacementQuiz.id == quiz_id).first()
    if not quiz:
        raise ValueError("Quiz not found")

    # Prevent re-attempt
    existing = db.query(PlacementQuizAttempt).filter(
        PlacementQuizAttempt.quiz_id    == quiz_id,
        PlacementQuizAttempt.student_id == student_id,
    ).first()
    if existing:
        raise ValueError("Already attempted this quiz")

    answers     = payload.get("answers", {})   # {str(q_id): selected_option}
    time_taken  = payload.get("time_taken", 0)
    total_q     = len(quiz.questions)
    correct_q   = 0

    for q in quiz.questions:
        selected = answers.get(str(q.id), "")
        if selected == q.correct_answer:
            correct_q += 1

    score_pct = round((correct_q / total_q) * 100, 1) if total_q > 0 else 0.0

    attempt = PlacementQuizAttempt(
        quiz_id    = quiz_id,
        student_id = student_id,
        score      = score_pct,
        total_q    = total_q,
        correct_q  = correct_q,
        answers    = answers,
        time_taken = time_taken,
    )
    db.add(attempt)

    # Update aptitude_score in PlacementReadiness
    pr = db.query(PlacementReadiness).filter(PlacementReadiness.student_id == student_id).first()
    if pr:
        # Weighted moving average: 70% existing + 30% new score
        pr.aptitude_score = round(pr.aptitude_score * 0.7 + score_pct * 0.3, 1)
        pr.pri_score      = _recalc_pri(pr)
        db.add(pr)

    db.commit()
    db.refresh(attempt)

    return {
        "score":      score_pct,
        "correct":    correct_q,
        "total":      total_q,
        "time_taken": time_taken,
        "message":    f"You scored {score_pct}% ({correct_q}/{total_q} correct)",
    }


def get_student_quiz_attempts(db: Session, student_id: int) -> list:
    """Officer: Get all quiz attempts for a specific student."""
    from Models.Placement import PlacementQuizAttempt, PlacementQuiz
    attempts = db.query(PlacementQuizAttempt).join(PlacementQuiz).filter(
        PlacementQuizAttempt.student_id == student_id
    ).order_by(PlacementQuizAttempt.attempted_at.desc()).all()

    return [
        {
            "id":           a.id,
            "quiz_id":      a.quiz_id,
            "quiz_title":   a.quiz.title,
            "score":        a.score,
            "correct_q":    a.correct_q,
            "total_q":      a.total_q,
            "time_taken":   a.time_taken,
            "attempted_at": a.attempted_at.isoformat() if a.attempted_at else None,
        }
        for a in attempts
    ]


def get_quiz_attempts_officer(db: Session, quiz_id: int) -> list:
    """Officer: Get all student attempts for a specific quiz."""
    
    # Fetch the quiz first to use its 'attempts' relationship
    quiz = db.query(PlacementQuiz).filter(PlacementQuiz.id == quiz_id).first()
    if not quiz:
        return []

    result = []
    # Using 'quiz.attempts' relationship which is proven to work in the list view
    for a in quiz.attempts:
        student_name = a.student.full_name if a.student else "Unknown Student"
        student_roll = a.student.roll_number if a.student else "N/A"
        
        result.append({
            "id":           a.id,
            "student_id":   a.student_id,
            "student_name": student_name,
            "student_roll": student_roll,
            "score":        a.score,
            "correct_q":    a.correct_q,
            "total_q":      a.total_q,
            "time_taken":   a.time_taken,
            "attempted_at": a.attempted_at.isoformat() if a.attempted_at else None,
        })
    
    # Sort by attempted_at descending manually as relationship might be unsorted
    result.sort(key=lambda x: x["attempted_at"] or "", reverse=True)
    return result


def get_quiz_attempt_details(db: Session, attempt_id: int) -> dict:
    """Get detailed breakdown of a specific attempt (questions + student answers)."""
    from Models.Placement import PlacementQuizAttempt, PlacementQuizQuestion
    attempt = db.query(PlacementQuizAttempt).filter(PlacementQuizAttempt.id == attempt_id).first()
    if not attempt:
        raise ValueError("Attempt not found")

    quiz = attempt.quiz
    student_answers = attempt.answers or {} # { "q_id": "selected_option" }

    # Group questions with the student's response
    detailed_questions = []
    for q in quiz.questions:
        detailed_questions.append({
            "id":             q.id,
            "question_text":  q.question_text,
            "options":        q.options,
            "correct_answer": q.correct_answer,
            "explanation":    q.explanation,
            "student_answer": student_answers.get(str(q.id)),
        })

    return {
        "id":           attempt.id,
        "quiz_title":   quiz.title,
        "score":        attempt.score,
        "correct_q":    attempt.correct_q,
        "total_q":      attempt.total_q,
        "time_taken":   attempt.time_taken,
        "attempted_at": attempt.attempted_at.isoformat() if attempt.attempted_at else None,
        "questions":    detailed_questions,
    }


def delete_placement_quiz(quiz_id: int, officer_id: int, db: Session) -> dict:
    """Soft-delete (deactivate) a quiz."""
    quiz = db.query(PlacementQuiz).filter(PlacementQuiz.id == quiz_id).first()
    if not quiz:
        raise ValueError("Quiz not found")
    quiz.is_active = False
    db.commit()
    return {"message": "Quiz deactivated"}


def _serialize_placement_quiz(quiz: PlacementQuiz, officer_view: bool = False) -> dict:
    data = {
        "id":           quiz.id,
        "title":        quiz.title,
        "topic_prompt": quiz.topic_prompt,
        "difficulty":   quiz.difficulty,
        "duration":     quiz.duration,
        "target_group": quiz.target_group,
        "is_active":    quiz.is_active,
        "created_at":   quiz.created_at.isoformat() if quiz.created_at else None,
        "question_count": len(quiz.questions),
        "questions": [
            {
                "id":             q.id,
                "question_text":  q.question_text,
                "options":        q.options,
                # Only reveal correct answer in officer view or after submission
                **({"correct_answer": q.correct_answer, "explanation": q.explanation} if officer_view else {}),
            }
            for q in quiz.questions
        ],
    }
    if officer_view:
        data["attempt_count"] = len(quiz.attempts)
        if quiz.attempts:
            data["avg_score"] = round(sum(a.score or 0 for a in quiz.attempts) / len(quiz.attempts), 1)
        else:
            data["avg_score"] = None
    return data