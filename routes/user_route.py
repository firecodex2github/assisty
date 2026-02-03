from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from models.users import User
from db import get_db
from schemas.users_schema import *
from services import user_service as us
from auth.jwt_utils import get_current_user


router = APIRouter(prefix="/user")

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return us.create_user(db, user)


@router.post("/login")
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    return us.authenticate_user(db, data) 


# NEW: Refresh Token Endpoint
@router.post("/refresh")
def refresh_user_token(refresh_token: str = Form(...),db:Session = Depends(get_db)):
    return us.refresh_user(refresh_token,db)


@router.get("/me/email")
def get_user_email(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email}


@router.post("/logout")
def user_logout(
    refresh_token: str, 
    db: Session = Depends(get_db)
):
    return us.user_logout(refresh_token,db)