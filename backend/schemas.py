from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    # Accept 'name' from frontend and map to 'username'
    name: str = Field(..., alias='name')
    email: str
    password: str
    gender: Optional[str] = None
    age: Optional[int] = None
    user_class: Optional[str] = Field(None, alias='class')
    study_goal: Optional[int] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    class Config:
        populate_by_name = True  # Allow both 'name' and 'username'

class SessionCreate(BaseModel):
    user_id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    subject: Optional[str] = None  # Added for frontend compatibility
    quality: Optional[int] = None 
    percentage_completion: Optional[int] = None
    notes: Optional[str] = None  # Added for frontend compatibility

class User(BaseModel):
    id: int
    username: str
    email: str
    gender: Optional[str] = None
    age: Optional[int] = None
    user_class: Optional[str] = None
    study_goal: Optional[int] = None  # Added for frontend compatibility
    
    class Config:
        from_attributes = True  # For SQLAlchemy compatibility

class StudySession(BaseModel):
    id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    subject: Optional[str] = None  # Added for frontend compatibility
    quality: Optional[int] = None
    percentage_completion: Optional[int] = None
    notes: Optional[str] = None  # Added for frontend compatibility
    
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
    study_goal: Optional[int] = None  # Added for frontend compatibility

class AuthResponse(BaseModel):
    """Response model for login/register endpoints"""
    access_token: str
    token_type: str = "bearer"
    user: User