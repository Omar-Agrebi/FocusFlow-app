from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
from datetime import datetime
from api.routers.auth import get_current_user  # JWT dependency

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = datetime.now().date()

    today_sessions = db.query(models.StudySession).filter(
        models.StudySession.user_id == current_user.id,
        func.date(models.StudySession.start_time) == today
    ).all()

    total_minutes = sum(s.duration_minutes for s in today_sessions)
    avg_quality = sum(s.quality for s in today_sessions) / len(today_sessions) if today_sessions else 0
    total_completion = sum(s.percentage_completion for s in today_sessions) / len(today_sessions) if today_sessions else 0

    return {
        "total_time": total_minutes,
        "sessions_count": len(today_sessions),
        "avg_quality": round(avg_quality, 1),
        "total_completion": round(total_completion, 1)
    }

@router.get("/history")
def get_history_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    all_sessions = db.query(models.StudySession).filter(
        models.StudySession.user_id == current_user.id
    ).all()

    total_time = sum(s.duration_minutes for s in all_sessions)
    total_sessions = len(all_sessions)
    avg_session_length = sum(s.duration_minutes for s in all_sessions) / len(all_sessions) if all_sessions else 0

    return {
        "total_study_time": total_time,
        "total_sessions": total_sessions,
        "avg_session_length": round(avg_session_length, 1)
    }
