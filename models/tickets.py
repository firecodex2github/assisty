from sqlalchemy import Column,Integer,String,DateTime, ForeignKey,Text,func
from datetime import datetime

from sqlalchemy.orm import relationship


from db import Base



class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    ticket_no = Column(String(20))
    user_id = Column(String(50))
    issue_type = Column(String(100))
    subject =  Column(String(200))
    description = Column(String(500))
    callback_number = Column(String(15))
    status = Column(String(50), default="Open")
    priority = Column(String(50), default="Medium")
    created_at = Column(DateTime, server_default=func.now())

    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)

    attachments = relationship("TicketAttachment", back_populates="ticket", cascade="all, delete-orphan")
    agent = relationship("Agent", back_populates="tickets")
    messages = relationship("Message", back_populates="ticket")
    
    



class TicketAttachment(Base):
    __tablename__ = "ticket_attachments"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"))
    file_path = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())

    ticket = relationship("Ticket", back_populates="attachments")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    ticket_no = Column(String(20))
    sender = Column(String(50))  # 'user' or 'agent'
    content = Column(Text)
    timestamp = Column(DateTime, server_default=func.now())

    ticket = relationship("Ticket")
