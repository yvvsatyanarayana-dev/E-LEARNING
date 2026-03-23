from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Core.Database import engine, get_db
from Service.AdminService import AdminService
from Models.User import User, UserRole
from typing import Optional, List
from Core.Security import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    return AdminService.get_dashboard_stats(db)

@router.get("/dashboard/activity")
async def get_dashboard_activity(db: Session = Depends(get_db)):
    return AdminService.get_dashboard_activity(db)

@router.get("/dashboard/departments")
async def get_dashboard_departments(db: Session = Depends(get_db)):
    return AdminService.get_dashboard_departments(db)

@router.get("/dashboard/usage")
async def get_dashboard_usage(db: Session = Depends(get_db)):
    return AdminService.get_dashboard_usage(db)

@router.get("/dashboard/placement")
async def get_dashboard_placement(db: Session = Depends(get_db)):
    return AdminService.get_dashboard_placement(db)

@router.get("/dashboard/system")
async def get_system_status(db: Session = Depends(get_db)):
    return AdminService.get_system_status(db)

@router.get("/users")
async def get_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return AdminService.get_users(db, role, search, page, limit)

@router.post("/users")
async def create_user(user_data: dict, db: Session = Depends(get_db)):
    return AdminService.create_user(db, user_data)

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    return AdminService.delete_user(db, user_id)

@router.get("/courses")
async def get_courses(
    dept: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return AdminService.get_courses(db, dept, search)

@router.post("/courses")
async def create_course(course_data: dict, db: Session = Depends(get_db)):
    return AdminService.create_course(db, course_data)

@router.delete("/courses/{course_id}")
async def delete_course(course_id: int, db: Session = Depends(get_db)):
    return AdminService.delete_course(db, course_id)

@router.get("/activity")
async def get_activity_log(
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 8,
    db: Session = Depends(get_db)
):
    return AdminService.get_activity_log(db, category, search, page, limit)

@router.get("/analytics/modules")
async def get_module_usage(db: Session = Depends(get_db)):
    return AdminService.get_module_usage(db)

@router.get("/analytics/stats")
async def get_analytics_stats(db: Session = Depends(get_db)):
    return AdminService.get_analytics_stats(db)

@router.get("/analytics/weekly-usage")
async def get_weekly_usage(db: Session = Depends(get_db)):
    return AdminService.get_weekly_usage(db)

@router.get("/analytics/engagement")
async def get_engagement_scores(db: Session = Depends(get_db)):
    return AdminService.get_engagement_scores(db)

@router.get("/dashboard/resources")
async def get_resource_monitor(db: Session = Depends(get_db)):
    return AdminService.get_resource_monitor(db)

@router.get("/users/stats")
async def get_user_stats(db: Session = Depends(get_db)):
    return AdminService.get_user_stats(db)

@router.get("/courses/stats")
async def get_course_stats(db: Session = Depends(get_db)):
    return AdminService.get_course_stats(db)

@router.get("/placement/stats")
async def get_placement_stats(db: Session = Depends(get_db)):
    return AdminService.get_placement_stats(db)

# ── Departments ──────────────────────────────────────
@router.get("/departments")
async def get_departments(db: Session = Depends(get_db)):
    return AdminService.get_departments(db)

@router.post("/departments")
async def create_department(dept_data: dict, db: Session = Depends(get_db)):
    return AdminService.create_department(db, dept_data)

@router.delete("/departments/{short_code}")
async def delete_department(short_code: str, db: Session = Depends(get_db)):
    return AdminService.delete_department(db, short_code)

# ── Placement Drives ─────────────────────────────────
@router.get("/placement/drives")
async def get_placement_drives(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return AdminService.get_placement_drives(db, status, search)

@router.post("/placement/drives")
async def create_placement_drive(drive_data: dict, db: Session = Depends(get_db)):
    return AdminService.create_placement_drive(db, drive_data)

@router.delete("/placement/drives/{drive_id}")
async def delete_placement_drive(drive_id: int, db: Session = Depends(get_db)):
    return AdminService.delete_placement_drive(db, drive_id)

# ── Notifications ────────────────────────────────────
@router.get("/notifications")
async def get_admin_notifications(type: Optional[str] = None, db: Session = Depends(get_db)):
    return AdminService.get_admin_notifications(db, type)

@router.post("/notifications/read/{notif_id}")
async def mark_notif_read(notif_id: int, db: Session = Depends(get_db)):
    return AdminService.mark_notif_read(db, notif_id)

@router.post("/notifications/read-all")
async def mark_all_read(db: Session = Depends(get_db)):
    return AdminService.mark_all_read(db)

@router.delete("/notifications/{notif_id}")
async def delete_notif(notif_id: int, db: Session = Depends(get_db)):
    return AdminService.delete_notif(db, notif_id)

@router.post("/notifications/broadcast")
async def send_broadcast_notif(data: dict, db: Session = Depends(get_db)):
    return AdminService.send_broadcast_notif(db, data)

# ── Reports ──────────────────────────────────────────
@router.get("/reports/stats")
async def get_report_stats(db: Session = Depends(get_db)):
    return AdminService.get_report_stats(db)

@router.get("/reports/library")
async def get_report_library(db: Session = Depends(get_db)):
    return AdminService.get_report_library(db)

@router.post("/reports/generate")
async def generate_report(data: dict, db: Session = Depends(get_db)):
    return AdminService.generate_report(db, data)

# ── Security ─────────────────────────────────────────
@router.get("/security/stats")
async def get_security_stats(db: Session = Depends(get_db)):
    return AdminService.get_security_stats(db)

@router.get("/security/alerts")
async def get_security_alerts(db: Session = Depends(get_db)):
    return AdminService.get_security_alerts(db)

@router.get("/security/sessions")
async def get_active_sessions(db: Session = Depends(get_db)):
    return AdminService.get_active_sessions(db)

@router.get("/security/rules")
async def get_security_rules(db: Session = Depends(get_db)):
    return AdminService.get_security_rules(db)

@router.post("/security/rules/{rule_id}/toggle")
async def toggle_security_rule(rule_id: int, db: Session = Depends(get_db)):
    return AdminService.toggle_security_rule(db, rule_id)

# ── System Config ────────────────────────────────────
@router.get("/config/stats")
async def get_system_config_stats(db: Session = Depends(get_db)):
    return AdminService.get_system_config_stats(db)

@router.get("/config/env")
async def get_env_vars(db: Session = Depends(get_db)):
    return AdminService.get_env_vars(db)

@router.get("/config/badges")
async def get_nav_badges(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return AdminService.get_nav_badges(db, current_user.id)

# ── Settings ─────────────────────────────────────────
@router.get("/settings/platform")
async def get_platform_settings(db: Session = Depends(get_db)):
    return AdminService.get_platform_settings(db)

@router.post("/settings/platform")
async def update_platform_settings(data: dict, db: Session = Depends(get_db)):
    return AdminService.update_platform_settings(db, data)
