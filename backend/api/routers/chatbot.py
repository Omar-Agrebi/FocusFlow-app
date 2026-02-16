from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.genai import Client
from config import settings

router = APIRouter()

# Configure Gemini API with the new SDK
client = Client(api_key=settings.GEMINI_API_KEY)

# Request/Response models
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/message", response_model=ChatResponse)
async def send_message(chat_message: ChatMessage):
    """
    Send a message to the Gemini chatbot and get a response
    """
    try:
        # Add context to make responses more study-focused
        context = """You are a helpful AI study assistant for StudyFlow, an application that helps students 
        manage their study sessions and improve their focus. You should provide helpful, encouraging, 
        and educational responses related to studying, time management, focus techniques, and academic success. 
        Keep your responses concise and friendly."""
        
        # Send message with context using the new API
        full_prompt = f"{context}\n\nUser message: {chat_message.message}"
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {"text": full_prompt}
                    ]
                }
            ]
        )

        
        reply = response.candidates[0].content.parts[0].text
        return ChatResponse(reply=reply)
    
    except Exception as e:
        # Log the error for debugging
        print(f"Gemini API error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        # Return a user-friendly error message
        raise HTTPException(
            status_code=500, 
            detail="I'm having trouble connecting right now. Please try again in a moment."
        )
