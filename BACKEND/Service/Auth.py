from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from Models.User import User
from Models.Notification import Notification
from Schemas.UserSchema import RegisterRequest, LoginRequest, UserResponse, TokenResponse, ChangePasswordRequest, UserUpdate
from datetime import datetime, timedelta
from Core.Security import hash_pwd, verify_pwd, create_access_token


class AuthService:
    def register(self, data: RegisterRequest, db: Session) -> UserResponse:
        """Register a new user with hashed password and unique email."""
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        user = User(
            full_name=data.full_name,
            email=data.email,
            password=hash_pwd(data.password),
            role=data.role,
            department=data.department,
            target_group=data.target_group,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    def login(self, data: LoginRequest, db: Session) -> TokenResponse:
        user = db.query(User).filter(User.email == data.email).first()
        if not user or not verify_pwd(data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Contact admin.",
            )
        token = create_access_token({
            "sub": str(user.id),
            "role": user.role,
        })

        user.last_login = datetime.utcnow()
        db.commit()

        return TokenResponse(access_token=token, user=user)

    def get_me(self, current_user: User) -> UserResponse:
        return current_user

    def update_me(self, data: UserUpdate, current_user: User, db: Session) -> UserResponse:
        """Update currently logged-in user's profile info."""
        if data.full_name is not None:
            current_user.full_name = data.full_name
        if data.phone is not None:
            current_user.phone = data.phone
        if data.department is not None:
            current_user.department = data.department
        if data.avatar is not None:
            current_user.avatar = data.avatar
        if data.settings is not None:
            # Merge settings if it's a dict
            if isinstance(current_user.settings, dict) and isinstance(data.settings, dict):
                current_user.settings = {**current_user.settings, **data.settings}
            else:
                current_user.settings = data.settings
        
        db.commit()
        db.refresh(current_user)
        return current_user

    def change_password(self,data: ChangePasswordRequest,current_user: User,
        db: Session,
    ) -> dict:
        if not verify_pwd(data.old_password, current_user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Old password is incorrect",
            )

        if data.old_password == data.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from old password",
            )
        current_user.password = hash_pwd(data.new_password)
        db.commit()

        return {"message": "Password changed successfully"}

    def get_sessions(self, current_user: User, db: Session) -> list:
        """Returns active login sessions based on recent activity."""
        # Since we don't have a separate Sessions table, we derive this from the user's last_login
        # For a truly dynamic experience, we can return the current user's session
        return [
            {
                "id": str(current_user.id),
                "device": "Web Browser",
                "location": "Local Session",
                "time": "Active now" if current_user.last_login else "Never",
                "is_current": True
            }
        ]


auth_service = AuthService()