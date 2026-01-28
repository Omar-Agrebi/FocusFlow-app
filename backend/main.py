from fastapi import FastAPI
from database import engine, Base
import models
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, sessions, profile, stats


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Prefix all routes with /api
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])