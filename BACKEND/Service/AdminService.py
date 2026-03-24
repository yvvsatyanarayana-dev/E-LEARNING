from fastapi import HTTPException, status, Depends, APIRouter
from sqlalchemy.orm import Session
from Models.Assignment import Assignment, AssignmentSubmission
from Models.Course import Course, Enrollment
from Models.Notification import Notification
from Models.SystemRule import SystemRule
from sqlalchemy import func, desc, or_, and_
from Models.User import User, UserRole
from Models.Placement import PlacementReadiness, Internship, InternshipApplication
from Models.Quiz import Quiz, QuizAttempt
from Models.PlatformAdmin import PlatformReport, PlatformSetting
from datetime import datetime, timedelta

class AdminService:
    @staticmethod
    def get_dashboard_stats(db: Session):
        total_users = db.query(User).count()
        active_courses = db.query(Course).filter(Course.is_active == True).count()
        placement_ready = db.query(PlacementReadiness).filter(PlacementReadiness.pri_score >= 75).count()
        faculty_count = db.query(User).filter(User.role == "faculty").count()
        
        total_enrollments = db.query(Enrollment).count() or 1
        total_quiz_attempts = db.query(QuizAttempt).count()
        total_submissions = db.query(AssignmentSubmission).count()
        placed_count = db.query(func.count(func.distinct(InternshipApplication.student_id))).scalar() or 0
        
        def pct(n, base): return min(100, round(n / base * 100)) if base else 0

        module_usage = [
            {"name": "Learning Management", "pct": 92, "color": "var(--indigo-l)"},
            {"name": "Quiz Engine",          "pct": pct(total_quiz_attempts, total_enrollments),   "color": "var(--teal)"},
            {"name": "Assignments",          "pct": pct(total_submissions, total_enrollments),     "color": "var(--violet)"},
            {"name": "Placement Module",     "pct": pct(placed_count, total_enrollments),         "color": "var(--amber)"},
        ]
        
        last_month = datetime.now() - timedelta(days=30)
        new_users_month = db.query(User).filter(User.created_at >= last_month).count()
        user_delta = f"+{pct(new_users_month, total_users)}%" if total_users else "+0%"

        return {
            "total_users": total_users,
            "active_courses": active_courses,
            "placement_readiness": f"{pct(placement_ready, total_users)}%",
            "placement_ready_count": placement_ready,
            "alerts": 0,
            "faculty_count": faculty_count,
            "active_users_today": db.query(func.count(User.id)).filter(User.updated_at >= func.current_date()).scalar() or 0,
            "module_usage": module_usage,
            "deltas": {
                "users": user_delta,
                "courses": "+3", 
                "readiness": "73%",
                "alerts": "0"
            },
            "latency": "24ms",
            "uptime": "99.9%"
        }

    @staticmethod
    def get_dashboard_activity(db: Session):
        activities = []
        new_users = db.query(User).order_by(desc(User.created_at)).limit(3).all()
        for u in new_users:
            activities.append({
                "type": "user", "icon": "userPlus", "color": "rgba(91,78,248,.15)",
                "text": f"New user {u.full_name} registered", "time": "Recent", "badge": "New"
            })
        recent_enrollments = db.query(Enrollment).order_by(desc(Enrollment.enrolled_at)).limit(3).all()
        for e in recent_enrollments:
            activities.append({
                "type": "course", "icon": "book", "color": "rgba(39,201,176,.12)",
                "text": f"Student enrolled in {e.course.title}" if e.course else "Course enrollment",
                "time": "Recent", "badge": None
            })
        return activities[:6]

    @staticmethod
    def get_dashboard_departments(db: Session):
        departments = db.query(User.department, func.count(User.id)).filter(User.department != None).group_by(User.department).all()
        colors = ["var(--indigo-l)", "var(--violet)", "var(--amber)", "var(--teal)", "var(--rose)"]
        return [
            {"name": d, "short": d[:5].upper(), "students": c, "courses": 5, "pct": min(100, c * 2), "color": colors[i % len(colors)]}
            for i, (d, c) in enumerate(departments)
        ]

    @staticmethod
    def get_dashboard_usage(db: Session):
        return AdminService.get_weekly_usage(db)

    @staticmethod
    def get_dashboard_placement(db: Session):
        top = db.query(Internship.company_name, func.count(InternshipApplication.id).label('count'))\
            .join(InternshipApplication, Internship.id == InternshipApplication.internship_id)\
            .group_by(Internship.company_name).order_by(desc('count')).limit(5).all()
        colors = ["var(--teal)", "var(--indigo-l)", "var(--violet)", "var(--amber)", "var(--rose)"]
        return [{"company": c, "students": cnt, "pct": min(100, cnt * 10), "color": colors[i % len(colors)]} for i, (c, cnt) in enumerate(top)]

    @staticmethod
    def get_system_status(db: Session):
        return [
            {"name": "Database", "status": "up",   "latency": "14ms", "icon": "db",     "color": "rgba(39,201,176,.1)", "text": "var(--teal)"},
            {"name": "API Service", "status": "up", "latency": "28ms", "icon": "activity", "color": "rgba(39,201,176,.1)", "text": "var(--teal)"},
            {"name": "Storage", "status": "up",    "latency": "S3-OK", "icon": "layers",   "color": "rgba(39,201,176,.1)", "text": "var(--teal)"},
            {"name": "AI Services", "status": "warn", "latency": "Slow", "icon": "zap",   "color": "rgba(244,165,53,.1)", "text": "var(--amber)"},
        ]

    @staticmethod
    def get_resource_monitor(db: Session):
        return [
            { "label": "CPU Usage", "val": "34%", "pct": 34, "color": "var(--indigo-l)" },
            { "label": "RAM",       "val": "61%", "pct": 61, "color": "var(--violet)" },
            { "label": "Disk",      "val": "48%", "pct": 48, "color": "var(--teal)" },
        ]

    @staticmethod
    def get_nav_badges(db: Session, user_id: int):
        u_cnt = db.query(User).count()
        c_cnt = db.query(Course).count()
        p_cnt = db.query(Internship).count()
        n_cnt = db.query(Notification).filter(Notification.is_read == False).count()
        from Models.MailMessage import MailMessage
        m_cnt = db.query(MailMessage).filter(MailMessage.receiver_id == user_id, MailMessage.is_read == False, MailMessage.deleted_by_receiver == False).count()
        def f(n): return f"{n//100/10}k" if n >= 1000 else str(n)
        return {"users": f(u_cnt), "courses": str(c_cnt), "placement": str(p_cnt), "activity": "8", "notifs": str(n_cnt), "mail": str(m_cnt) if m_cnt > 0 else None}

    @staticmethod
    def get_users(db: Session, role: str = None, search: str = None, page: int = 1, limit: int = 10):
        query = db.query(User)
        if role and role.lower() != "all": query = query.filter(User.role == role.lower())
        if search: query = query.filter((User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))
        users = query.offset((page - 1) * limit).limit(limit).all()
        return [{"id": u.id, "name": u.full_name, "email": u.email, "role": u.role, "dept": u.department or "N/A", "status": "active" if u.is_active else "inactive", "joined": u.created_at.strftime("%b %Y") if u.created_at else "N/A", "av": u.full_name[0].upper()} for u in users]

    @staticmethod
    def create_user(db: Session, data: dict):
        if db.query(User).filter(User.email == data.get("email")).first(): raise HTTPException(400, "Email exists")
        new = User(full_name=data.get("name"), email=data.get("email"), password="password123", role=data.get("role", UserRole.student), department=data.get("dept"), is_active=data.get("status") == "active")
        db.add(new); db.commit(); return {"success": True}

    @staticmethod
    def delete_user(db: Session, user_id: int):
        u = db.query(User).filter(User.id == user_id).first()
        if u: db.delete(u); db.commit()
        return {"success": True}

    @staticmethod
    def get_courses(db: Session, dept: str = None, search: str = None):
        query = db.query(Course)
        if dept and dept != "All Depts": query = query.join(User, Course.faculty_id == User.id).filter(User.department == dept)
        if search: query = query.filter(Course.title.ilike(f"%{search}%"))
        courses = query.all()
        colors = ["var(--indigo-l)", "var(--violet)", "var(--amber)", "var(--teal)"]
        return [{"id": c.id, "name": c.title, "dept": c.faculty.department if c.faculty else "General", "instructor": c.faculty.full_name if c.faculty else "Unknown", "enrolled": db.query(Enrollment).filter(Enrollment.course_id == c.id).count(), "completion": 75, "status": "active" if c.is_active else "draft", "color": colors[i % len(colors)]} for i, c in enumerate(courses)]

    @staticmethod
    def create_course(db: Session, data: dict):
        f = db.query(User).filter(User.full_name == data.get("instructor"), User.role == UserRole.faculty).first() or db.query(User).filter(User.role == UserRole.faculty).first()
        new = Course(title=data.get("name"), description="Course", faculty_id=f.id if f else None, is_active=data.get("status") == "active")
        db.add(new); db.commit(); return {"success": True}

    @staticmethod
    def delete_course(db: Session, id: int):
        c = db.query(Course).filter(Course.id == id).first()
        if c: db.delete(c); db.commit()
        return {"success": True}

    @staticmethod
    def get_module_usage(db: Session):
        total = db.query(Enrollment).count() or 1
        return [
            {"name": "Learning Management", "pct": 95, "color": "var(--indigo-l)", "enrolled": total},
            {"name": "Quiz Engine",          "pct": 84, "color": "var(--teal)",    "enrolled": total},
            {"name": "Assignments",          "pct": 72, "color": "var(--violet)",  "enrolled": total},
            {"name": "Placement Module",     "pct": 65, "color": "var(--amber)",   "enrolled": total},
        ]

    @staticmethod
    def get_analytics_stats(db: Session):
        u = db.query(User).count()
        e = db.query(Enrollment).count()
        return [
            {"accent":"sc-indigo", "icon":"users",    "val":f"{u:,}", "lbl":"Total Users", "delta":"+12%", "dir":"up"},
            {"accent":"sc-teal",   "icon":"activity", "val":f"{e:,}", "lbl":"Total Enrollments", "delta":"+8%", "dir":"up"},
        ]

    @staticmethod
    def get_weekly_usage(db: Session):
        days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
        return [{"l": d, "v": 40 + i*5} for i, d in enumerate(days)]

    @staticmethod
    def get_engagement_scores(db: Session):
        depts = db.query(User.department, func.count(User.id)).filter(User.role == "student").group_by(User.department).all()
        colors = ["var(--indigo-l)", "var(--teal)", "var(--amber)", "var(--rose)"]
        return [{"dept": d.upper(), "students": c, "score": 85, "color": colors[i % len(colors)]} for i, (d, c) in enumerate(depts)]

    @staticmethod
    def get_user_stats(db: Session):
        t = db.query(User).count()
        a = db.query(User).filter(User.is_active == True).count()
        return {"total": t, "active": a, "inactive": t - a, "pending": 0}

    @staticmethod
    def get_course_stats(db: Session):
        t = db.query(Course).count()
        a = db.query(Course).filter(Course.is_active == True).count()
        return {"total_courses": t, "active_courses": a, "draft_courses": t - a, "total_enrollments": 124, "avg_completion": 78}

    @staticmethod
    def get_placement_stats(db: Session):
        p = db.query(func.count(func.distinct(InternshipApplication.student_id))).filter(InternshipApplication.status == "selected").scalar() or 0
        return {"placed_count": p, "companies_visited": 12, "avg_pri": 82.4, "highest_pkg": "12 LPA", "drives_count": 4, "dept_breakdown": [], "pri_distribution": [], "total_students": 450}

    @staticmethod
    def get_activity_log(db: Session, category: str = None, search: str = None, page: int = 1, limit: int = 8):
        new = db.query(User).order_by(desc(User.created_at)).limit(10).all()
        events = [{"id": f"u-{u.id}", "category": "user", "icon": "userPlus", "color": "rgba(91,78,248,.15)", "title": f"New user {u.full_name}", "detail": u.email, "time": "2 hrs ago", "badge": "New"} for u in new]
        return {"total": len(events), "events": events, "pages": 1}

    @staticmethod
    def get_departments(db: Session):
        depts = db.query(User.department, func.count(User.id)).filter(User.department != None).group_by(User.department).all()
        colors = ["var(--indigo-l)", "var(--teal)", "var(--amber)", "var(--rose)"]
        return [{"name": d, "short": d[:4].upper(), "students": cnt, "faculty": 2, "courses": 5, "pct": 75, "color": colors[i % len(colors)]} for i, (d, cnt) in enumerate(depts)]

    @staticmethod
    def create_department(db: Session, data: dict): return {"success": True}
    @staticmethod
    def delete_department(db: Session, code: str): return {"success": True}

    @staticmethod
    def get_placement_drives(db: Session, status: str = None, search: str = None):
        drives = db.query(Internship).all()
        colors = ["var(--teal)", "var(--indigo-l)"]
        return [{"id": d.id, "company": d.company_name, "date": "2024-05-15", "positions": d.seats, "status": "scheduled", "pkg": d.stipend, "color": colors[i % len(colors)]} for i, d in enumerate(drives)]

    @staticmethod
    def create_placement_drive(db: Session, data: dict):
        new = Internship(company_name=data.get("company"), role="Recruitment", stipend=data.get("pkg"), seats=int(data.get("positions",0)))
        db.add(new); db.commit(); return {"success": True}

    @staticmethod
    def delete_placement_drive(db: Session, id: int):
        d = db.query(Internship).filter(Internship.id == id).first()
        if d: db.delete(d); db.commit()
        return {"success": True}

    @staticmethod
    def get_admin_notifications(db: Session, type: str = None):
        notifs = db.query(Notification).filter(or_(Notification.user_id == None, Notification.user_id == 1)).order_by(desc(Notification.created_at)).all()
        result = []
        for n in notifs:
            # Format time nicely
            diff = datetime.utcnow() - n.created_at
            if diff.days > 0: time_str = f"{diff.days}d ago"
            elif diff.seconds > 3600: time_str = f"{diff.seconds // 3600}h ago"
            elif diff.seconds > 60: time_str = f"{diff.seconds // 60}m ago"
            else: time_str = "Just now"

            result.append({
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "msg": n.message,
                "time": time_str,
                "is_read": n.is_read
            })
        return {"notifications": result, "unread": sum(1 for n in notifs if not n.is_read), "total": len(result)}

    @staticmethod
    def mark_notif_read(db: Session, id: int):
        n = db.query(Notification).filter(Notification.id == id).first()
        if n: n.is_read = True; db.commit()
        return {"success": True}

    @staticmethod
    def mark_all_read(db: Session):
        db.query(Notification).filter(Notification.is_read == False).update({"is_read": True}); db.commit()
        return {"success": True}

    @staticmethod
    def delete_notif(db: Session, id: int):
        n = db.query(Notification).filter(Notification.id == id).first()
        if n: db.delete(n); db.commit()
        return {"success": True}

    @staticmethod
    def send_broadcast_notif(db: Session, data: dict):
        from Models.MailMessage import MailMessage
        title = data.get("title")
        msg = data.get("message")
        target = data.get("target", "all")
        send_email = data.get("send_email", False)
        
        # 1. Determine targets
        query = db.query(User)
        if target == "students": query = query.filter(User.role == "student")
        elif target == "faculty": query = query.filter(User.role == "faculty")
        elif target in ["cs", "ece", "ds"]: query = query.filter(User.department.ilike(f"%{target}%"))
        
        target_users = query.all()

        # 2. Create System Notification
        # For simplicity, we create one broadcast record (user_id=None) 
        # or targeted ones if we want them to show up for specific users.
        # Here we do a global one if "all", or targeted ones.
        if target == "all":
            new_notif = Notification(type=data.get("type", "system"), title=title, message=msg, user_id=None)
            db.add(new_notif)
        else:
            for u in target_users:
                db.add(Notification(type=data.get("type", "system"), title=title, message=msg, user_id=u.id))

        # 3. Handle Email also
        if send_email:
            for u in target_users:
                mail = MailMessage(
                    sender_id=1, # Admin
                    receiver_id=u.id,
                    subject=f"Notification: {title}",
                    body=msg
                )
                db.add(mail)
        
        db.commit()
        return {"success": True, "count": len(target_users)}

    @staticmethod
    def get_report_stats(db: Session): return {"generated": db.query(PlatformReport).count() or 24, "types": 6, "export_size": "18.4 MB", "scheduled": 3}

    @staticmethod
    def get_report_library(db: Session):
        reps = db.query(PlatformReport).order_by(desc(PlatformReport.created_at)).all()
        colors = ["var(--rose)", "var(--teal)", "var(--amber)"]
        icons = ["users", "book", "briefcase"]
        return [{"name": r.name, "desc": r.description, "size": r.size, "date": "Jan 2024", "type": r.report_type, "icon": icons[i % 3], "color": colors[i % 3]} for i, r in enumerate(reps)]

    @staticmethod
    def get_security_stats(db: Session):
        rules = db.query(SystemRule).filter(SystemRule.on == True).count()
        return {"alerts": 2, "sessions": 12, "rules_active": f"{rules}/4", "uptime": "99.9%"}

    @staticmethod
    def get_security_alerts(db: Session):
        alerts = db.query(Notification).filter(Notification.type == "security").limit(10).all()
        return [{"id": a.id, "title": a.title, "detail": a.message, "time": "10:30 AM", "resolved": a.is_read, "level":"critical", "icon":"shield", "color":"var(--rose)"} for a in alerts]

    @staticmethod
    def get_active_sessions(db: Session):
        users = db.query(User).filter(User.last_login != None).order_by(desc(User.last_login)).limit(10).all()
        return [{"id": str(u.id), "user": u.full_name, "role": u.role, "ip": "127.0.0.1", "location": "Campus", "time": "Active now", "av": u.full_name[0].upper(), "avC": "rgba(91,78,248,.15)", "avT": "var(--indigo-ll)"} for u in users]

    @staticmethod
    def get_security_rules(db: Session):
        return [{"id": r.id, "name": r.name, "desc": r.desc, "on": r.on} for r in db.query(SystemRule).all()]

    @staticmethod
    def toggle_security_rule(db: Session, id: int):
        r = db.query(SystemRule).filter(SystemRule.id == id).first()
        if r: r.on = not r.on; db.commit()
        return {"success": True}

    @staticmethod
    def get_system_config_stats(db: Session): return {"uptime": "99.9%", "cpu": "12%", "memory": "4.2 GB", "backup_size": "2.4 GB", "degraded": 0}

    @staticmethod
    def get_env_vars(db: Session): return [{"key": "DB_TYPE", "value": "PostgreSQL", "sensitive": False}, {"key": "CORS_ORIGIN", "value": "http://localhost:5173", "sensitive": False}]

    @staticmethod
    def generate_report(db: Session, data: dict):
        new = PlatformReport(name=f"{data.get('type')} Report", description="Auto-generated", report_type="PDF", size="1.2 MB")
        db.add(new); db.commit(); return {"success": True, "filename": "report.pdf"}

    @staticmethod
    def get_platform_settings(db: Session):
        sets = db.query(PlatformSetting).all()
        res = {"campus_name": "Smart Campus", "admin_email": "admin@smartcampus.edu", "timezone": "UTC+5:30", "language": "English", "integrations": [{"name": "Google SSO", "status": "connected", "icon": "globe"}, {"name": "Zoom", "status": "connected", "icon": "video"}]}
        for s in sets:
            if s.key == "platform_name": res["campus_name"] = s.value
            if s.key == "admin_email": res["admin_email"] = s.value
        return res

    @staticmethod
    def update_platform_settings(db: Session, data: dict):
        for k, v in data.items():
            if k in ["campus_name", "admin_email", "timezone", "language"]:
                db_key = "platform_name" if k == "campus_name" else k
                s = db.query(PlatformSetting).filter(PlatformSetting.key == db_key).first()
                if s: s.value = str(v)
                else: db.add(PlatformSetting(key=db_key, value=str(v), category="General"))
        db.commit(); return {"success": True}