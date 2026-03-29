"""
Placement Service — SmartCampus
Business logic for placement readiness, drives, internships,
mock interviews, skill scores, and dashboard analytics.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from sqlalchemy import func, case, distinct, select
from sqlalchemy.orm import Session

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
            db.query(InternshipApplication, Internship.pkg_lpa)
            .join(Internship, Internship.id == InternshipApplication.internship_id)
            .filter(
                InternshipApplication.student_id == user.id,
                InternshipApplication.status == ApplicationStatus.selected,
            )
            .order_by(InternshipApplication.applied_at.desc())
            .first()
        )


        in_process_app = (
            db.query(InternshipApplication)
            .filter(
                InternshipApplication.student_id == user.id,
                InternshipApplication.status == ApplicationStatus.applied,
            )
            .first()
        )

        pkg = "—"
        if placed_app:
            placement_status = "Placed"
            company = (
                db.query(Internship.company_name)
                .filter(Internship.id == placed_app[0].internship_id)
                .scalar() or "—"
            )
            pkg = f"₹{placed_app[1]}L" if placed_app[1] else "—"
        elif in_process_app:
            placement_status = "In Process"
            company = (
                db.query(Internship.company_name)
                .filter(Internship.id == in_process_app.internship_id)
                .scalar() or "—"
            )
        else:
            placement_status = "Not Ready" if (pr and pr.pri_score < 55) else "Applied"
            company = "—"


        # Filter by status after resolving it
        if status and status != "All" and placement_status != status:
            continue

        pri_score = pr.pri_score if pr else 0.0
        skills    = user.skills if user.skills else []
        interviews = (
            db.query(func.count(MockInterview.id))
            .filter(MockInterview.student_id == user.id)
            .scalar() or 0
        )
        initials = "".join(w[0].upper() for w in (user.full_name or "?").split()[:2])

        result.append({
            "id":       user.id,
            "name":     user.full_name,
            "init":     initials,
            "branch":   user.department or "—",
            "roll":     user.roll_number or "—",
            "cgpa":     user.settings.get("cgpa", 0.0) if user.settings else 0.0,
            "pri":      round(float(pri_score), 1),
            "skills":   list(skills)[:3],
            "interviews": interviews,
            "company":  company,
            "pkg":      pkg,

            "status":   placement_status,
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