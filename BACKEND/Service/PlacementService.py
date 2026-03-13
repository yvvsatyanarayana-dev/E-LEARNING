"""
Placement Service — SmartCampus
Business logic for placement readiness, drives, internships,
mock interviews, skill scores, and dashboard analytics.
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import func, case, distinct
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
)
from Models.User import User          # adjust import to your project layout
from Schemas.PlacementSchema import (
    SkillScoreCreate,
    InternshipCreate,
    InternshipUpdate,
    InternshipApplicationCreate,
    ApplicationStatusUpdate,
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

    placement_rate = round(placed_count / total_students * 100, 1) if total_students else 0

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

    funnel = [
        {"label": "Total Eligible",         "count": total_students, "pct": 100},
        {"label": "PRI ≥ 70 (Drive Ready)", "count": drive_ready,    "pct": round(drive_ready / total_students * 100, 1) if total_students else 0},
        {"label": "Applied to Companies",   "count": applied_count,  "pct": round(applied_count / total_students * 100, 1) if total_students else 0},
        {"label": "Offer Received",         "count": offers_count,   "pct": round(offers_count / total_students * 100, 1) if total_students else 0},
    ]

    return {
        "total_students":  total_students,
        "placed_students": placed_count,
        "placement_rate":  placement_rate,
        "avg_pri":         round(avg_pri, 1),
        "pri_distribution": dist,
        "branch_stats":    branch_stats,
        "funnel":          funnel,
    }


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
            db.query(InternshipApplication)
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

        if placed_app:
            placement_status = "Placed"
            company = (
                db.query(Internship.company_name)
                .filter(Internship.id == placed_app.internship_id)
                .scalar() or "—"
            )
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
            "pri":      round(pri_score, 1),
            "skills":   skills[:3],
            "interviews": interviews,
            "company":  company,
            "pkg":      "—",          # extend when offer table exists
            "status":   placement_status,
        })

    return result


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
        company_name=data.company_name,
        role=data.role,
        deadline=data.deadline,
        added_by=officer_id,
    )
    db.add(intern)
    db.commit()
    db.refresh(intern)
    return intern


def list_internships(db: Session, skip: int = 0, limit: int = 20,
                     domain: Optional[str] = None) -> List[Internship]:
    q = db.query(Internship)
    if domain:
        q = q.filter(Internship.domain.ilike(f"%{domain}%"))
    return q.order_by(Internship.created_at.desc()).offset(skip).limit(limit).all()


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


def create_mock_interview(db: Session, student_id: int, **kwargs) -> MockInterview:
    mi = MockInterview(student_id=student_id, **kwargs)
    db.add(mi)
    db.commit()
    db.refresh(mi)

    # Bump mock_interviews_done counter & recalc PRI
    done = (
        db.query(func.count(MockInterview.id))
        .filter_by(student_id=student_id)
        .scalar() or 0
    )
    update_readiness(db, student_id, mock_interviews_done=done)
    return mi


def delete_mock_interview(db: Session, student_id: int, interview_id: int) -> bool:
    mi = db.query(MockInterview).filter_by(id=interview_id, student_id=student_id).first()
    if not mi:
        raise ValueError("Interview not found")
    db.delete(mi)
    db.commit()
    # Recalculate
    done = db.query(func.count(MockInterview.id)).filter_by(student_id=student_id).scalar() or 0
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
    update_readiness(db, student_id, resume_score=round(done_ct / total * 100, 2))
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