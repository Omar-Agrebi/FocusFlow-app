import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import PasswordReset, EmailVerification 


class TokenManager:
    """Handle token generation and validation"""
    
    @staticmethod
    def generate_token() -> str:
        """Generate secure random token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_verification_token(db: Session, user_id: int) -> str:
        """Create and save email verification token"""
        
        token = TokenManager.generate_token()
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        verification = EmailVerification(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            is_used=False
        )
        db.add(verification)
        db.commit()
        return token
    
    @staticmethod
    def create_password_reset_token(db: Session, user_id: int) -> str:
        """Create and save password reset token"""
        
        token = TokenManager.generate_token()
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        reset = PasswordReset(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            is_used=False
        )
        db.add(reset)
        db.commit()
        return token