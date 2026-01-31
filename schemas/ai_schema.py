from pydantic import BaseModel, Field
from typing import Optional

class AIRequest(BaseModel):
    message: str

class AIResponse(BaseModel):
    reply: str
    

