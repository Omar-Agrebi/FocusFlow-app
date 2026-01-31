from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from crud import create_session
from api.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.StudySession])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only return sessions belonging to the current user
    return db.query(models.StudySession).filter(
        models.StudySession.user_id == current_user.id
    ).all()

@router.post("/", response_model=schemas.StudySession)
def create_new_session(
    session: schemas.SessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Assign the session to the current user
    session.user_id = current_user.id
    return create_session(db, session)

@router.put("/{session_id}", response_model=schemas.StudySession)
def update_session(
    session_id: int,
    session: schemas.SessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_session = db.query(models.StudySession).filter(
        models.StudySession.id == session_id,
        models.StudySession.user_id == current_user.id  # ownership enforced
    ).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    for key, value in session.dict().items():
        setattr(db_session, key, value)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_session = db.query(models.StudySession).filter(
        models.StudySession.id == session_id,
        models.StudySession.user_id == current_user.id  # ownership enforced
    ).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(db_session)
    db.commit()
    return {"message": "Session deleted"}
