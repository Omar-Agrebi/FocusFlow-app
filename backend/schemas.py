from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    gender: Optional[str] = None
    age: Optional[int] = None
    user_class: Optional[str] = None

class SessionCreate(BaseModel):
    user_id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    quality: Optional[int] = None 
    percentage_completion: Optional[int] = None

class User(BaseModel):
    id: int
    username: str
    email: str
    gender: Optional[str] = None
    age: Optional[int] = None
    user_class: Optional[str] = None
    
    class Config:
        from_attributes = True  # For SQLAlchemy compatibility

class StudySession(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    quality: Optional[int] = None
    percentage_completion: Optional[int] = None
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    id: int
    username: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    user_class: Optional[str] = None