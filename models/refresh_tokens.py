from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from db import Base 

class UserRefreshToken(Base):
    __tablename__ = "user_refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String(500), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="user_refresh_token")


class AgentRefreshToken(Base):
    __tablename__ = "agent_refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"))
    token = Column(String(500), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    agent = relationship("Agent", back_populates="agent_refresh_token")