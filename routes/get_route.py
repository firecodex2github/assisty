from fastapi import APIRouter, Request, Depends,HTTPException
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from db import get_db
from models.tickets import Ticket
from auth.jwt_utils import get_current_user

router = APIRouter()
templates = Jinja2Templates(directory="templates")



@router.get("/")
def home_page(req : Request):   
    return templates.TemplateResponse("home.html",{"request": req})

@router.get("/login")
def user_login(req: Request):   
    return templates.TemplateResponse("user_login.html", {"request": req})


@router.get("/register")
def user_register(req: Request):   
    return templates.TemplateResponse("user_register.html", {"request": req})


@router.get("/createticket")
def createticket_page(req: Request):   
    return templates.TemplateResponse("createticket.html", {"request": req})

@router.get("/view-tickets")        #Type (Page route) : Purpose (Returns HTML)
def my_tickets_page(req: Request):   
    return templates.TemplateResponse("mytickets.html", {"request": req})


@router.get("/api/mytickets")       #Type (API route) : Purpose (Returns JSON data)
def get_tickets_json(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "user":
        raise HTTPException(status_code=403, detail="Users only")
    user_id = str(current_user.get("user_id"))
    tickets = db.query(Ticket).filter(Ticket.user_id == user_id).all()
    return tickets


@router.get("/agentlogin")
def agentlogin(req: Request):   
    return templates.TemplateResponse("adminlogin.html", {"request": req})


@router.get("/admin-dashboard")
def render_admin_page(request: Request):    
    return templates.TemplateResponse("admindashboard.html", {"request": request})
