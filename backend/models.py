<<<<<<< HEAD
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
=======
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String) 
    gender = Column(String)
<<<<<<< HEAD
    birthdate = Column(Date)
=======
    age = Column(Integer)
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
    user_class = Column(String)
    
class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
<<<<<<< HEAD
    subject = Column(String)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    quality = Column(Integer)
    percentage_completion = Column(Integer)
    notes = Column(String, nullable=True)
=======
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    quality = Column(Integer)
    percentage_completion = Column(Integer)
>>>>>>> ea9dea0e697308b32268fb802aa960748b7cd232
