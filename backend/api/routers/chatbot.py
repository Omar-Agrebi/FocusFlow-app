from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from google.genai import Client
from schemas import ChatMessage, ChatResponse
from config import settings
import json
import asyncio

router = APIRouter()

# Configure Gemini API with the new SDK
client = Client(api_key=settings.GEMINI_API_KEY)

# Add context
context = """You are a helpful AI study assistant for StudyFlow, an application that helps students 
    manage their study sessions and improve their focus. You should provide helpful, encouraging, 
    and educational responses related to studying, time management, focus techniques, and academic success. 
    Keep your responses concise and friendly.
"""

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_message = message_data.get("message", "")

            if not user_message:
                continue
            
            full_prompt = f"{context}\n\nUser message: {user_message}"

            # Stream response from Gemini
            try:
                response_stream = client.models.generate_content_stream(
                    model='models/gemini-flash-latest',
                    contents=full_prompt
                )

                full_response = ""
                for chunk in response_stream:
                    if chunk.text:
                        await websocket.send_text(json.dumps({"type": "chunk", "content": chunk.text}))
                        full_response += chunk.text
                
                # Send completion message
                await websocket.send_text(json.dumps({"type": "complete", "full_response": full_response}))

            except Exception as e:
                print(f"Error generating content: {e}")
                await websocket.send_text(json.dumps({"type": "error", "message": "Error generating response."}))

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass

@router.post("/message", response_model=ChatResponse)
async def send_message(chat_message: ChatMessage):
    """
    Send a message to the Gemini chatbot and get a response (Legacy HTTP endpoint)
    """
    try:        
        # Send message with context using the new API
        full_prompt = f"{context}\n\nUser message: {chat_message.message}"
        
        response = client.models.generate_content(
            model='models/gemini-flash-latest',
            contents=full_prompt
        )
        
        return ChatResponse(reply=response.text)
    
    except Exception as e:
        # Log the error for debugging
        print(f"Gemini API error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        # Return a user-friendly error message
        raise HTTPException(
            status_code=500, 
            detail="I'm having trouble connecting right now. Please try again in a moment."
        )