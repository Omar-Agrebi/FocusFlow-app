import os
from typing import Optional
from dotenv import load_dotenv
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from sqlalchemy.orm import Session

from email_mailer.templates import EmailTemplates
from email_mailer.tokens import TokenManager

load_dotenv()


class EmailService:
    """Handle email sending via Brevo API"""
    
    def __init__(self):
        self.api_key = os.getenv('BREVO_API_KEY')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@studyflow.com')
        self.from_name = os.getenv('FROM_NAME', 'StudyFlow')
        self.frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5500')
        
        if not self.api_key:
            raise ValueError("BREVO_API_KEY not found in environment variables!")
        
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = self.api_key
        
        self.api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        to_name: Optional[str] = None
    ) -> bool:
        """Send email via Brevo API"""
        try:
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": to_email, "name": to_name or to_email}],
                sender={"email": self.from_email, "name": self.from_name},
                subject=subject,
                html_content=html_content
            )
            
            self.api_instance.send_transac_email(send_smtp_email)
            print(f"✅ Email sent to {to_email}")
            return True
            
        except ApiException as e:
            print(f"❌ Error sending email to {to_email}: {e}")
            return False
    
    def send_verification_email(self, db: Session, user) -> bool:
        """Send email verification link"""
        token = TokenManager.create_verification_token(db, user.id)
        verify_link = f"{self.frontend_url}/verify-email.html?token={token}"
        
        html_content = EmailTemplates.verification_email(user.username, verify_link)
        
        return self.send_email(
            to_email=user.email,
            subject="Verify your StudyFlow account",
            html_content=html_content,
            to_name=user.username
        )
    
    def send_password_reset_email(self, db: Session, user) -> bool:
        """Send password reset link"""
        token = TokenManager.create_password_reset_token(db, user.id)
        reset_link = f"{self.frontend_url}/reset-password.html?token={token}"
        
        html_content = EmailTemplates.password_reset_email(user.username, reset_link)
        
        return self.send_email(
            to_email=user.email,
            subject="Reset your StudyFlow password",
            html_content=html_content,
            to_name=user.username
        )


# Create global instance
email_service = EmailService()