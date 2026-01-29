from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        gender=user.gender,
        birthdate=user.birthdate,
        user_class=user.user_class
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_session(db: Session, session: schemas.SessionCreate):
    db_session = models.StudySession(**session.dict())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session