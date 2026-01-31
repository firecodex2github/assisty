from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from services import ticket_service as ts
from auth.jwt_utils import get_current_user 
from typing import Optional,List

router = APIRouter(prefix="/user", tags=["Tickets"])

@router.post("/createticket")
async def handle_create_ticket(
    category: str = Form(...),
    subject: str = Form(...),
    description: str = Form(...),
    callback_number: str = Form(...),
    screenshots: Optional[List[UploadFile]] = File(None),
    pdfs: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    # This checks the "Authorization: Bearer <token>" header
    current_user: dict = Depends(get_current_user) 
):
    try:
        # current_user is the payload from your JWT
        user_id = current_user.get("user_id") 
        
        ticket = await ts.create_new_ticket(
            db, 
            user_id=str(user_id), 
            ticket_data={
                "category": category, 
                "subject": subject, 
                "description": description, 
                "callback_number": callback_number
            },
            screenshots=screenshots,
            pdfs=pdfs
        )
        return {"ticket_id": ticket.ticket_no, "message": "Success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create ticket: {str(e)}")
    




