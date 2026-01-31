from models.agent import Agent
from models.refresh_tokens import AgentRefreshToken
from passlib.context import CryptContext
from auth.jwt_utils import verify_password, create_access_token, create_refresh_token
from fastapi import HTTPException
from models.tickets import Ticket


pass_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_agent(db, agent_data):
    # hash password
    hashed_password = pass_context.hash(agent_data.password)

    # check if username exists
    existing_agent = db.query(Agent).filter(Agent.username == agent_data.username).first()
    if existing_agent:
        raise HTTPException(status_code=400, detail="Username already exists")

    agent = Agent(
        username=agent_data.username,
        password=hashed_password        
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)
    return {
        "agent_id": agent.id,
        "username": agent.username,
        "message": "Agent created successfully"
    }



"""
for windows

curl -X POST "http://127.0.0.1:8000/agent/register" -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"admin123\"}"


for mac

curl -X POST "http://127.0.0.1:8000/agent/register" -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin123"}'

"""


def authenticate_agent(db, ag):
    agent = db.query(Agent).filter(
        Agent.username == ag.username        
    ).first()

    if not agent:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(ag.password, agent.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # Generate Access Token
    token = create_access_token(
        user_id=agent.id,
        role="agent"
    )

    # Generate Refresh Token
    refresh_token = create_refresh_token(
        user_id=agent.id,
        role="agent"
    )
    new_db_token = AgentRefreshToken(
        agent_id=agent.id,
        token=refresh_token
    )
    db.add(new_db_token)
    db.commit()

    return {
        "access_token": token,
        "refresh_token": refresh_token,  
        "token_type": "bearer"
    }


def refresh_agent(refresh_token,db):
    
    db_token = db.query(AgentRefreshToken).filter(AgentRefreshToken.token == refresh_token).first()
    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid Refresh Token")

    
    new_access_token = create_access_token(data={"sub": db_token.agent.id})
    new_refresh_token = create_refresh_token(data={"sub": db_token.agent.id})

    
    db_token.token = new_refresh_token
    db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }


def get_all_tickets(db, current_user):
    if current_user["role"] != "agent":
        raise HTTPException(status_code=403, detail="Agents only")

    return db.query(Ticket).all()


def agent_logout(refresh_token,db):
    # Find the agent token and delete it
    db_token = db.query(AgentRefreshToken).filter(
        AgentRefreshToken.token == refresh_token
    ).first()
    
    if db_token:
        db.delete(db_token)
        db.commit()
        return {"message": "Agent successfully logged out"}
    
    raise HTTPException(status_code=400, detail="Invalid session")
