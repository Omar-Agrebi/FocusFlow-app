from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(min_length=8)
    gender: Optional[str] = None
    birthdate: Optional[date] = None
    user_class: Optional[str] = None

class SessionCreate(BaseModel):
    user_id: int
    subject: str  
    start_time: datetime
    end_time: datetime
    quality: Optional[int] = None 
    percentage_completion: Optional[int] = None
    notes: Optional[str] = None  

class User(BaseModel):
    id: int
    username: str
    email: str
    gender: Optional[str] = None
    birthdate: Optional[date] = None
    user_class: Optional[str] = None
    
    class Config:
        from_attributes = True  # For SQLAlchemy compatibility

class StudySession(BaseModel):
    id: int
    user_id: int
    subject: str  
    start_time: datetime
    end_time: datetime
    quality: Optional[int] = None
    percentage_completion: Optional[int] = None
    notes: Optional[str] = None 
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    birthdate: Optional[date] = None
    user_class: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User