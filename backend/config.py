from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    BREVO_API_KEY: str
    FROM_EMAIL: str
    FROM_NAME: str

    class Config:
        # Go one directory up to find .env
        env_file = str(Path(__file__).parent.parent / ".env")

settings = Settings()