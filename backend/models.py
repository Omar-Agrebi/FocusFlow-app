from datetime import datetime, timedelta
from sqlalchemy import Boolean, Column, Integer, Date, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
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

    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    email_verifications = relationship("EmailVerification", back_populates="user", cascade="all, delete")
    password_resets = relationship("PasswordReset", back_populates="user", cascade="all, delete")


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)

    user = relationship("User", back_populates="email_verifications")


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)

    user = relationship("User", back_populates="password_resets")

    
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