
import os
import uuid
from sqlalchemy.orm import Session
from models.tickets import Ticket, TicketAttachment
from typing import List,Optional
from fastapi import UploadFile

UPLOAD_DIR = "static/uploads/attachments"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def create_new_ticket(db: Session, user_id: str, ticket_data: dict, screenshots: Optional[List[UploadFile]] = None, pdfs: Optional[List[UploadFile]] = None):

    if screenshots is None:
        screenshots = []

    if pdfs is None:
        pdfs = []

    
    ticket_no = f"TKT-{uuid.uuid4().hex[:6].upper()}"
    
    new_ticket = Ticket(
        ticket_no=ticket_no,
        user_id=user_id,
        issue_type=ticket_data['category'],
        subject=ticket_data['subject'],
        description=ticket_data['description'],
        callback_number=ticket_data['callback_number']
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    for file in screenshots:
        # sanitize extension
        file_extension = file.filename.split(".")[-1].lower()
        unique_name = f"{uuid.uuid4()}.{file_extension}"
                
        save_path = os.path.join(UPLOAD_DIR, unique_name)
               
        db_path = f"static/uploads/attachments/{unique_name}"
        
        # Write file to disk
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
        
        
        attachment = TicketAttachment(
            ticket_id=new_ticket.id,
            file_path=db_path,
            file_type=file.content_type
        )
        db.add(attachment)

    for file in pdfs:
        file_extension = file.filename.split(".")[-1].lower()
        unique_name = f"{uuid.uuid4()}.{file_extension}"

        save_path = os.path.join(UPLOAD_DIR, unique_name)
        db_path = f"static/uploads/attachments/{unique_name}"

        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)

        attachment = TicketAttachment(
            ticket_id=new_ticket.id,
            file_path=db_path,
            file_type=file.content_type
        )

        db.add(attachment)
    
    db.commit()
    return new_ticket