from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

from config import settings
from database import get_db
import models, schemas
from crud import create_user
from email_mailer.service import email_service


SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
router = APIRouter()

@router.post("/login", response_model=schemas.LoginResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()

    if not user or not pwd_context.verify(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_verified": user.is_verified,
        "user": schemas.User.model_validate(user)
    }


@router.post("/register", response_model=schemas.LoginResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db, user)

    email_service.send_verification_email(db, db_user)

    access_token = create_access_token(data={"sub": str(db_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_verified": db_user.is_verified,
        "user": schemas.User.model_validate(db_user)
    }

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    verification = db.query(models.EmailVerification).filter(
        models.EmailVerification.token == token,
        models.EmailVerification.is_used == False
    ).first()

    if not verification or verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.id == verification.user_id).first()
    user.is_verified = True
    verification.is_used = True

    db.commit()

    return {"message": "Email verified successfully"}

@router.post("/resend-verification")
def resend_verification(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    email_service.send_verification_email(db, user)

    return {"message": "Verification email sent"}

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        return {"message": "If the email exists, a reset link was sent"}  # security best practice

    email_service.send_password_reset_email(db, user)

    return {"message": "Password reset email sent"}

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.token == token,
        models.PasswordReset.is_used == False
    ).first()

    if not reset or reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.id == reset.user_id).first()
    user.password = pwd_context.hash(new_password)
    reset.is_used = True

    db.commit()

    return {"message": "Password updated successfully"}
