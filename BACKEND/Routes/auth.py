from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Core.Database import get_db
from Core.Security import hash_pwd, verify_pwd, create_access_token, get_current_user
from Models.User import User
from Schemas.UserSchema import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from typing import Annotated

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


# ─── Register ────────────────────────────────────────────────────────────────
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Check duplicate email
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    new_user = User(
        full_name=body.full_name,
        email=body.email.lower(),
        password=hash_pwd(body.password),
        role=body.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ─── Login ────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    # 1. Find user by email
    user = db.query(User).filter(User.email == body.email.lower()).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # 2. Check account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact support."
        )

    # 3. Verify password
    if not verify_pwd(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # 4. Create JWT with role in payload
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value,
    })

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


# ─── Get Current User (/me) ───────────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse.model_validate(user)


# ─── Deactivate Account ───────────────────────────────────────────────────────
@router.patch("/deactivate", response_model=UserResponse)
def deactivate_account(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_active = False
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)