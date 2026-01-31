from fastapi import APIRouter, HTTPException
from schemas.ai_schema import AIRequest, AIResponse
from services.ai_service import get_ai_reply



router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

@router.post("/chat", response_model=AIResponse)
def chat_ai(req: AIRequest):
    try:
        print("Received AI chat request:", req)
        reply = get_ai_reply(req.message)
        return AIResponse(reply=reply)
    except Exception as e:
        print(f"Error in chat_ai: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
