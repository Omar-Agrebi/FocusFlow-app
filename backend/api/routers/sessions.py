from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
import models, schemas
from crud import create_session

router = APIRouter()

@router.get("/", response_model=List[schemas.StudySession])
def get_sessions(
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.StudySession)
    if user_id:
        query = query.filter(models.StudySession.user_id == user_id)
    return query.all()

@router.post("/", response_model=schemas.StudySession)
def create_new_session(session: schemas.SessionCreate, db: Session = Depends(get_db)):
    return create_session(db, session)

@router.put("/{session_id}", response_model=schemas.StudySession)
def update_session(session_id: int, session: schemas.SessionCreate, db: Session = Depends(get_db)):
    db_session = db.query(models.StudySession).filter(models.StudySession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    for key, value in session.dict().items():
        setattr(db_session, key, value)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    db_session = db.query(models.StudySession).filter(models.StudySession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(db_session)
    db.commit()
    return {"message": "Session deleted"}