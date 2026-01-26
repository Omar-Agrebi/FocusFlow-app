from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
router = APIRouter()

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Generate JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def user_to_dict(user: models.User) -> dict:
    """Convert User model to dict for response"""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "gender": user.gender,
        "age": user.age,
        "user_class": user.user_class,
        "study_goal": user.study_goal
    }

@router.post("/login", response_model=schemas.AuthResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login endpoint - returns access token and user data"""
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user:
        print(f"Login failed: User not found with email {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd_context.verify(credentials.password, user.password):
        print(f"Login failed: Invalid password for user {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate JWT token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    # Return proper AuthResponse format
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_to_dict(user)
    }

@router.post("/register", response_model=schemas.AuthResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register endpoint - creates user and returns access token"""
    from crud import create_user
    
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = create_user(db, user)
    
    # Generate JWT token
    access_token = create_access_token(
        data={"sub": new_user.email, "user_id": new_user.id}
    )
    
    # Return proper AuthResponse format
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_to_dict(new_user)
    }