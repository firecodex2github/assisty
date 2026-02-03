from pydantic import BaseModel

class AgentLogin(BaseModel):
    username: str
    password: str