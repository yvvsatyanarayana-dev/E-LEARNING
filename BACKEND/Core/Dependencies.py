from fastapi import Depends, HTTPException, status
from Core.Security import get_current_user
from Models.User import User, UserRole


def require_roles(*roles: UserRole):
    """
    Returns a FastAPI dependency that allows access
    only if the current user's role is in the given roles.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles(UserRole.admin))])
        def admin_only(): ...
    """
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user['role'] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
    return checker

get_any_user = get_current_user

get_student = require_roles(UserRole.student)

get_faculty = require_roles(UserRole.faculty)

get_placement_officer = require_roles(UserRole.placement_officer)

get_admin = require_roles(UserRole.admin)

get_faculty_or_admin = require_roles(UserRole.faculty, UserRole.admin)

get_placement_or_admin = require_roles(UserRole.placement_officer, UserRole.admin)

get_student_or_faculty = require_roles(UserRole.student, UserRole.faculty)