from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/", response_model=schemas.User)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/", response_model=schemas.User)
def update_profile(profile: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == profile.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile_data = profile.dict(exclude_unset=True)
    if 'id' in profile_data:
        del profile_data['id']
        
    for key, value in profile_data.items():
        setattr(user, key, value)
    
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return user