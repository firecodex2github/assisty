from fastapi import APIRouter, Depends,Form
from sqlalchemy.orm import Session
from db import get_db
from schemas.agent_schema import AgentLogin
from services import agent_service as agser 


router = APIRouter(prefix="/agent", tags=["Agent"])

@router.post("/register")
def register_agent(agent: AgentLogin, db: Session = Depends(get_db)):
    return agser.create_agent(db, agent)

@router.post("/login")
def login_agent(agent: AgentLogin, db: Session = Depends(get_db)):
    return agser.authenticate_agent(db, agent)

@router.post("/refresh")
def refresh_agent_token(refresh_token: str = Form(...), db: Session = Depends(get_db)):
    return agser.refresh_agent(refresh_token,db)


# agent logout
@router.post("/logout")
def agent_logout(
    refresh_token: str, 
    db: Session = Depends(get_db)
):
    return agser.agent_logout(refresh_token,db)