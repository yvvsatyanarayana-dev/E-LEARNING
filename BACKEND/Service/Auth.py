from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from Models.User import User
from Schemas.UserSchema import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    ChangePasswordRequest,
)
from Core.Security import (
    hash_pwd,
    verify_pwd,
    create_access_token,
)


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

        return TokenResponse(access_token=token, user=user)

    def get_me(self, current_user: User) -> UserResponse:
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


auth_service = AuthService()