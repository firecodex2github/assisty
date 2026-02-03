from sqlalchemy.orm import Session
from models.tickets import Ticket, Message
from fastapi import WebSocket,WebSocketDisconnect,HTTPException
from auth.jwt_utils import *
import json
from typing import List,Dict
from models.users import User



class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, ticket_no: str):
        await websocket.accept()
        if ticket_no not in self.active_connections:
            self.active_connections[ticket_no] = []
        self.active_connections[ticket_no].append(websocket)

    def disconnect(self, websocket: WebSocket, ticket_no: str):
        if ticket_no in self.active_connections:
            self.active_connections[ticket_no].remove(websocket)

    async def broadcast(self, message: dict, ticket_no: str):
        if ticket_no in self.active_connections:
            for connection in self.active_connections[ticket_no]:
                await connection.send_json(message)

manager = ConnectionManager()


def save_message(db: Session, ticket_no: str, sender: str, content: str):
    # 1. Find ticket by ticket_no
    ticket = db.query(Ticket).filter(Ticket.ticket_no == ticket_no).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # 2. Save message
    new_msg = Message(
        ticket_id=ticket.id,       
        ticket_no=ticket.ticket_no, 
        sender=sender,
        content=content
    )

    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg



async def websocket_chat(websocket: WebSocket, ticket_no: str, sender: str, db: Session):
    token = websocket.query_params.get("token")
    payload = verify_token(token)

    if not payload:
        await websocket.close(code=1008)
        return

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or not role:
        await websocket.close(code=1008)
        return

    print("Connected user_id:", user_id)
    print("Role:", role)

    await manager.connect(websocket, ticket_no)

    try:
        while True:
            received_text = await websocket.receive_text()
            message_text = received_text

            if received_text.startswith("{"):
                try:
                    data = json.loads(received_text)   # conversts json string into python dict
                     # Check if it's a typing indicator
                    if data.get("type") == "typing":
                        await manager.broadcast(
                            {
                                "type": "typing",
                                "sender": sender
                            },
                            ticket_no
                        )
                        continue 

                    message_text = data.get("message", received_text)  #data.get(KEY, DEFAULT)
                except json.JSONDecodeError:
                    pass

            save_message(db, ticket_no, sender, message_text)

            await manager.broadcast(
                {
                    "sender": sender,
                    "message": message_text
                },
                ticket_no
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket, ticket_no)





def get_messages(db: Session, ticket_no: str, user: dict):
    ticket = db.query(Ticket).filter(Ticket.ticket_no == ticket_no).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    #  USER can see ONLY own ticket
    if user["role"] == "user" and ticket.user_id != str(user["user_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    #  AGENT     always allowed
    print("Chat history requested by:", user)
    print("Ticket owner:", ticket.user_id)
    return (
        db.query(Message)
        .filter(Message.ticket_no == ticket_no)
        .order_by(Message.timestamp)
        .all()
    )


async def change_status(ticket_no: str, payload: dict, user: dict, db: Session):
    if user["role"] != "agent":
        raise HTTPException(status_code=403, detail="Only agent can change status")

    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")

    # Find ticket using ticket_no
    ticket = db.query(Ticket).filter(Ticket.ticket_no == ticket_no).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Stop updates if already closed
    if ticket.status.lower() == "closed":
        raise HTTPException(status_code=400, detail="Ticket already closed")

    ticket.status = new_status
    db.commit()
    db.refresh(ticket)

    #  Notify all websocket clients in that ticket 
    await manager.broadcast(
        {
            "sender": "System",
            "message": f"Status Update: {new_status}",
            "new_status": new_status,
            "is_notification": True
        },
        ticket_no  
    )

    return {
        "message": "Status updated successfully",
        "ticket_no": ticket_no,
        "new_status": new_status
    }



def update_ticket_priority(ticket_no, data, db):
    new_priority = data.get("priority")
    ticket = db.query(Ticket).filter(Ticket.ticket_no == ticket_no).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.priority = new_priority
    db.commit()
    return {"message": "Priority updated"}


def get_single_ticket_details(ticket_no: str, user: dict, db: Session):
    ticket = db.query(Ticket).filter(Ticket.ticket_no == ticket_no).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    #Only block USERS, not agents
    if user["role"] == "user" and ticket.user_id != str(user["user_id"]):
        raise HTTPException(status_code=403, detail="Access denied")


    user_email = db.query(User.email).filter(User.id == (ticket.user_id)).scalar()

    return {
        "ticket_no": ticket.ticket_no,
        "user_email":user_email,
        "subject": ticket.subject,
        "status": ticket.status,
        "issue_type": ticket.issue_type,
        "created_at": ticket.created_at,
        "description": ticket.description,
        "attachments": [
            "/" + att.file_path if not att.file_path.startswith("/") else att.file_path
            for att in ticket.attachments
        ]
    }


