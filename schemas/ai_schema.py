from pydantic import BaseModel, Field


class AIRequest(BaseModel):
    message: str

class AIResponse(BaseModel):
    reply: str
    

