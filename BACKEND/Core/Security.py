# Core/Security.py

from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from Core.Config import settings
from Core.Database import get_db
from Models.User import User
from sqlalchemy.orm import Session
from typing import Annotated

pwd_context = CryptContext(schemes=['argon2'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def hash_pwd(password: str) -> str:
    return pwd_context.hash(password)

def verify_pwd(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expire: timedelta | None = None) -> str:
    to_encode = data.copy()
    expires = datetime.now(timezone.utc) + (
        expire if expire else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    # ✅ Convert to int timestamp — JSON serializable
    to_encode.update({"exp": int(expires.timestamp())})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    return user