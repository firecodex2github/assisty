from sqlalchemy import Column,Integer,String

from db import Base
from sqlalchemy.orm import relationship


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    role   = Column(String(255),default="agent")

    #tickets = relationship("Ticket", back_populates="agent")

    agent_refresh_token=relationship("AgentRefreshToken", back_populates="agent")



