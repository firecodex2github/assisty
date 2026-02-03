from sqlalchemy import Column,Integer,String
from sqlalchemy.orm import relationship
from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255)) 
    role   = Column(String(255),default="user")

    user_refresh_token = relationship("UserRefreshToken", back_populates="user")