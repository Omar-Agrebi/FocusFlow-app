from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) 
    gender = Column(String)
    birthdate = Column(Date)
    user_class = Column(String)
    
class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
    subject = Column(String)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    quality = Column(Integer)
    percentage_completion = Column(Integer)
    notes = Column(String, nullable=True)