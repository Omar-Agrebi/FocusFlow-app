from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) 
    gender = Column(String)
    age = Column(Integer)
    user_class = Column(String)
    study_goal = Column(Integer)  # Added for frontend compatibility
    
class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    subject = Column(String)  # Added for frontend compatibility
    quality = Column(Integer)
    percentage_completion = Column(Integer)
    notes = Column(Text)  # Added for frontend compatibility