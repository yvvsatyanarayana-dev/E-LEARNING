from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from datetime import datetime, date,timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from Core.Config import settings
from typing import Annotated

pwd_context = CryptContext(schemes=['argon2'],deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

def hash_pwd(password: str)->str:
    return pwd_context.hash(password)
def verify_pwd(plain:str,hash:str)->str:
    return pwd_context.verify(plain,hash)

def create_access_token(data:dict,expire:timedelta | None=None)->str:
    to_encode = data.copy()
    if expire:
        expire = datetime.now(timezone.utc) + expire
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'expt':expire})
    return jwt.encode(to_encode,settings.SECRET_KEY,settings.ALGORITHM)

def get_current_user(token = Annotated[str,Depends(oauth2_scheme)])->dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        return jwt.decode(token,settings.ACCESS_TOKEN_EXPIRE_MINUTES,settings.ALGORITHM)
    except JWTError:
        raise credentials_exception