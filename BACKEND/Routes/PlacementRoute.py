"""
Placement Routes — SmartCampus
FastAPI router covering:
  • Dashboard analytics  (officer)
  • Student tracker      (officer)
  • Placement readiness  (student / officer)
  • Skill scores         (student)
  • Internships          (officer CRUD / student list)
  • Applications         (student apply & withdraw / officer manage)
  • Mock interviews      (student)
  • Placement topics & resume checks  (student)
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import Service.PlacementService as svc
from Core.Database import get_db
from Schemas.PlacementSchema import (
    ApplicationStatusUpdate,
    InternshipApplicationCreate,
    InternshipApplicationResponse,
    InternshipCreate,
    InternshipResponse,
    InternshipUpdate,
    PlacementReadinessResponse,
    SkillScoreCreate,
    SkillScoreResponse,
    PlacementTaskCreate,
    PlacementTaskUpdate,
    PlacementTaskResponse,
    PlacementEventCreate,
    PlacementEventUpdate,
    PlacementEventResponse,
)

# ── adjust to your auth utilities ────────────────────────────────────────────
from Core.Dependencies import get_current_user, require_roles   # noqa: E402

router = APIRouter(prefix="/placement", tags=["Placement"])


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────

def _404(detail: str):
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _400(detail: str):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def _403(detail: str = "Insufficient permissions"):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def _safe(fn, *args, not_found_msg="Not found", **kwargs):
    """Wrap service calls; translate ValueError → 400/404."""
    try:
        return fn(*args, **kwargs)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg.lower():
            raise HTTPException(404, detail=msg)
        raise HTTPException(400, detail=msg)


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard & Analytics  (placement officer)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/dashboard/stats", summary="Placement dashboard KPIs")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Returns aggregated KPIs: total students, placed count, placement rate,
    average PRI, PRI distribution buckets, branch-wise breakdown, and funnel.
    Accessible to placement officers and admins.
    """
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_dashboard_stats(db)


@router.get("/dashboard/trends", summary="Monthly placement trends")
def dashboard_trends(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_dashboard_trends(db)


@router.get("/dashboard/students", summary="Student placement tracker list")
def student_tracker(
    branch: Optional[str] = Query(None, description="Filter by department / branch"),
    placement_status: Optional[str] = Query(None, alias="status",
                                            description="Placed | In Process | Applied | Not Ready"),
    search:  Optional[str]  = Query(None, description="Name or roll-number search"),
    skip:    int            = Query(0,  ge=0),
    limit:   int            = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Paginated student tracker with PRI, placement status, company, package.
    Available to placement officers and admins.
    """
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_student_placement_list(
        db, branch=branch, status=placement_status, search=search, skip=skip, limit=limit
    )


@router.post("/students", summary="Register new student (officer)")
def create_student(
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Create a new student user and initialize placement readiness.
    Accessible to placement officers and admins.
    """
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return _safe(svc.create_placement_student, db, payload)


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Remove a student (officer)")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Permanently remove a student from the placement system.
    Accessible to placement officers and admins.
    """
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    removed = svc.delete_placement_student(db, student_id)
    if not removed:
        _404("Student not found")


# ─────────────────────────────────────────────────────────────────────────────
# Placement Readiness  (student reads own; officer reads any)
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/readiness/me",
    response_model=PlacementReadinessResponse,
    summary="My placement readiness",
)
def my_readiness(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return svc.get_readiness(db, current_user.id)


@router.get(
    "/readiness/{student_id}",
    response_model=PlacementReadinessResponse,
    summary="Student readiness (officer view)",
)
def student_readiness(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_readiness(db, student_id)


@router.patch("/readiness/me", response_model=PlacementReadinessResponse,
              summary="Update my readiness scores")
def update_my_readiness(
    communication_score: Optional[float] = None,
    aptitude_score:      Optional[float] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    updates = {}
    if communication_score is not None:
        updates["communication_score"] = communication_score
    if aptitude_score is not None:
        updates["aptitude_score"] = aptitude_score
    return svc.update_readiness(db, current_user.id, **updates)


# ─────────────────────────────────────────────────────────────────────────────
# Skill Scores
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/skills/me", response_model=List[SkillScoreResponse],
            summary="My skill scores")
def my_skills(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return svc.get_skill_scores(db, current_user.id)


@router.get("/skills/{student_id}", response_model=List[SkillScoreResponse],
            summary="Student skill scores (officer)")
def student_skills(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_skill_scores(db, student_id)


@router.post("/skills/me", response_model=SkillScoreResponse,
             status_code=status.HTTP_201_CREATED,
             summary="Add or update a skill score")
def upsert_skill(
    payload: SkillScoreCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return svc.upsert_skill_score(db, current_user.id, payload)


@router.delete("/skills/me/{skill_name}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Remove a skill score")
def delete_skill(
    skill_name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    removed = svc.delete_skill_score(db, current_user.id, skill_name)
    if not removed:
        _404(f"Skill '{skill_name}' not found")


# ─────────────────────────────────────────────────────────────────────────────
# Internships
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/internships", response_model=List[InternshipResponse],
            summary="List internships / drives")
def list_internships(
    domain: Optional[str] = Query(None),
    skip:   int           = Query(0,  ge=0),
    limit:  int           = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return svc.list_internships(db, skip=skip, limit=limit, domain=domain)


@router.get("/internships/{internship_id}", response_model=InternshipResponse,
            summary="Get single internship detail")
def get_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return _safe(svc.get_internship, db, internship_id)


@router.post("/internships", response_model=InternshipResponse,
             status_code=status.HTTP_201_CREATED,
             summary="Create internship / drive (officer)")
def create_internship(
    payload: InternshipCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.create_internship(db, current_user.id, payload)


@router.patch("/internships/{internship_id}", response_model=InternshipResponse,
              summary="Update internship details (officer)")
def update_internship(
    internship_id: int,
    payload: InternshipUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return _safe(svc.update_internship, db, internship_id, payload)


@router.delete("/internships/{internship_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Delete internship / drive (officer)")
def delete_internship(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    _safe(svc.delete_internship, db, internship_id)


# ─────────────────────────────────────────────────────────────────────────────
# Applications
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/applications", response_model=List[InternshipApplicationResponse],
            summary="List all applications (officer)")
def list_apps(
    status: Optional[str] = Query(None),
    skip:   int           = Query(0,  ge=0),
    limit:  int           = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.list_all_applications(db, skip=skip, limit=limit, status=status)

@router.get("/applications/me", response_model=List[InternshipApplicationResponse],
            summary="My applications")
def my_applications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return svc.get_student_applications(db, current_user.id)


@router.get("/applications/student/{student_id}",
            response_model=List[InternshipApplicationResponse],
            summary="Student applications (officer)")
def student_applications(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_student_applications(db, student_id)


@router.get("/applications/internship/{internship_id}",
            response_model=List[InternshipApplicationResponse],
            summary="All applications for a drive (officer)")
def internship_applications(
    internship_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_internship_applications(db, internship_id)


@router.post("/applications", response_model=InternshipApplicationResponse,
             status_code=status.HTTP_201_CREATED,
             summary="Apply to an internship / drive")
def apply(
    payload: InternshipApplicationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "student":
        _403("Only students can apply")
    return _safe(svc.apply_internship, db, current_user.id, payload)


@router.patch("/applications/{application_id}/status",
              response_model=InternshipApplicationResponse,
              summary="Update application status (officer)")
def update_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return _safe(svc.update_application_status, db, application_id, payload)


@router.delete("/applications/{application_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Withdraw my application")
def withdraw(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _safe(svc.withdraw_application, db, current_user.id, application_id)


# ─────────────────────────────────────────────────────────────────────────────
# Mock Interviews
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/mock-interviews/me", summary="My mock interview history")
def my_mock_interviews(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rows = svc.get_mock_interviews(db, current_user.id)
    return [
        {
            "id":        mi.id,
            "company":   mi.company,
            "type":      mi.type,
            "date":      mi.date,
            "time":      mi.time,
            "score":     mi.score,
            "duration":  mi.duration,
            "questions": mi.questions,
            "solved":    mi.solved,
            "summary":   mi.summary,
            "tags":      mi.tags or [],
            "feedback":  mi.feedback or {},
        }
        for mi in rows
    ]


@router.post("/mock-interviews/me", status_code=status.HTTP_201_CREATED,
             summary="Record a mock interview result")
def add_mock_interview(
    company:   str,
    type:      str,
    score:     int,
    questions: int,
    solved:    int,
    duration:  Optional[str] = None,
    summary:   Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "student":
        _403("Only students can record mock interviews")
    mi = svc.create_mock_interview(
        db, current_user.id,
        company=company, type=type, score=score,
        questions=questions, solved=solved,
        duration=duration, summary=summary,
    )
    return {"id": mi.id, "message": "Mock interview recorded and PRI updated"}


@router.delete("/mock-interviews/me/{interview_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Delete a mock interview record")
def delete_mock_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _safe(svc.delete_mock_interview, db, current_user.id, interview_id)


@router.get("/mock-interviews/round-types",
            summary="Available mock interview round types")
def round_types(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    rows = svc.get_mock_interview_round_types(db)
    return [{"id": r.id, "label": r.label, "icon": r.icon, "color": r.color,
             "desc": r.desc, "duration": r.duration, "rounds": r.rounds} for r in rows]


@router.get("/mock-interviews/questions", summary="Question bank")
def question_bank(
    topic:      Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    rows = svc.get_mock_interview_questions(db, topic=topic, difficulty=difficulty)
    return [{"id": q.id, "topic": q.topic, "difficulty": q.difficulty,
             "title": q.title, "asked": q.asked, "times": q.times} for q in rows]


# ─────────────────────────────────────────────────────────────────────────────
# Placement Topics
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/topics/me", summary="My preparation topic progress")
def my_topics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rows = svc.get_placement_topics(db, current_user.id)
    return [{"id": t.id, "label": t.label, "done": t.done,
             "total": t.total, "color": t.color} for t in rows]


@router.patch("/topics/me/{topic_id}", summary="Update topic progress")
def update_topic(
    topic_id: int,
    done:     int = Query(..., ge=0, description="Problems solved"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    pt = _safe(svc.update_placement_topic, db, current_user.id, topic_id, done)
    return {"id": pt.id, "label": pt.label, "done": pt.done, "total": pt.total}


# ─────────────────────────────────────────────────────────────────────────────
# Resume Checks
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/resume-checks/me", summary="My resume checklist")
def my_resume_checks(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rows = svc.get_resume_checks(db, current_user.id)
    return [{"id": r.id, "label": r.label, "done": r.done} for r in rows]


@router.patch("/resume-checks/me/{check_id}/toggle",
              summary="Toggle a resume checklist item")
def toggle_check(
    check_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rc = _safe(svc.toggle_resume_check, db, current_user.id, check_id)
    return {"id": rc.id, "label": rc.label, "done": rc.done,
            "message": "Resume score updated and PRI recalculated"}


# ─────────────────────────────────────────────────────────────────────────────
# Officer Dashboard: Tasks & Events
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/dashboard/tasks", response_model=List[PlacementTaskResponse],
            summary="Officer's placement tasks")
def get_tasks(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_placement_tasks(db, current_user.id)


@router.post("/dashboard/tasks", response_model=PlacementTaskResponse,
             status_code=status.HTTP_201_CREATED,
             summary="Add a placement task")
def create_task(
    payload: PlacementTaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.create_placement_task(db, current_user.id, payload)


@router.patch("/dashboard/tasks/{task_id}", response_model=PlacementTaskResponse,
              summary="Update a placement task")
def update_task(
    task_id: int,
    payload: PlacementTaskUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return _safe(svc.update_placement_task, db, current_user.id, task_id, payload)


@router.delete("/dashboard/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Delete a placement task")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    removed = svc.delete_placement_task(db, current_user.id, task_id)
    if not removed: _404("Task not found")


# ── Events ──

@router.get("/dashboard/events", response_model=List[PlacementEventResponse],
            summary="Officer's placement events")
def get_events(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_placement_events(db, current_user.id)


@router.post("/dashboard/events", response_model=PlacementEventResponse,
             status_code=status.HTTP_201_CREATED,
             summary="Add a placement event")
def create_event(
    payload: PlacementEventCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.create_placement_event(db, current_user.id, payload)


@router.patch("/dashboard/events/{event_id}", response_model=PlacementEventResponse,
              summary="Update a placement event")
def update_event(
    event_id: int,
    payload: PlacementEventUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return _safe(svc.update_placement_event, db, current_user.id, event_id, payload)


@router.delete("/dashboard/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT,
               summary="Delete a placement event")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    removed = svc.delete_placement_event(db, current_user.id, event_id)
    if not removed: _404("Event not found")

# ── MEETING ROUTES ────────────────────────────────────────────────────

@router.get("/meetings/groups")
def get_meeting_groups(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Return student groups available for placement sessions."""
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_meeting_groups(db)

@router.post("/meetings/start")
def start_meeting(
    body: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Start a placement session for a specific group."""
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    group_id = body.get("course_id") # Consistent with faculty-style payload
    if not group_id:
        _400("course_id (group sequential ID) is required")
    return svc.start_meeting(current_user, db, int(group_id))

@router.post("/meetings/end")
def end_meeting(
    body: dict,
    current_user=Depends(get_current_user)
):
    """End an active placement session."""
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    group_key = body.get("group_key")
    if not group_key:
        _400("group_key is required")
    return svc.end_meeting(group_key)

@router.get("/meetings/history")
def get_meeting_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Return past placement session history."""
    if current_user.role not in ("placement_officer", "admin"):
        _403()
    return svc.get_meeting_history(db)