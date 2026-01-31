from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from api.routers.auth import get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.User)
def get_profile(current_user: models.User = Depends(get_current_user)):
    # current_user comes from JWT, safe
    return current_user

@router.put("/me", response_model=schemas.User)
def update_profile(
    profile: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # update only the current user
    for key, value in profile.dict(exclude_unset=True).items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user
