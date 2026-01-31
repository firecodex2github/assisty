from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy.orm import Session
from db import get_db
from services import message_service as ms
from auth.jwt_utils import get_current_user

router=APIRouter()

@router.websocket("/ws/chat/{ticket_no}/{sender}") 
def websocket_chat(websocket: WebSocket,ticket_no: str,sender: str,db: Session = Depends(get_db)):
    return ms.websocket_chat(websocket,ticket_no,sender,db)


@router.get("/api/messages/{ticket_no}")
def get_chat_history(
    ticket_no: str,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ms.get_messages(db, ticket_no, user)


@router.post("/api/tickets/{ticket_no}/status")
async def change_status(
    ticket_no: str,
    payload: dict,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await ms.change_status(ticket_no, payload, user, db)


@router.post("/api/tickets/{ticket_no}/priority")
def update_ticket_priority(ticket_no: str, data: dict, db: Session = Depends(get_db)):
    return ms.update_ticket_priority(ticket_no,data,db)


@router.get("/api/ticket-details/{ticket_no}")
def get_single_ticket_details(
    ticket_no: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ms.get_single_ticket_details(ticket_no, user, db)
