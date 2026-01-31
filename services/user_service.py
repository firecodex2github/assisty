from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.users import User
from auth.XSS_sanitize import sanitize_text
from passlib.context import CryptContext
from auth.jwt_utils import create_access_token, create_refresh_token, verify_password,verify_refresh_token
from models.refresh_tokens import UserRefreshToken

pass_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="email already exist")

    hashed_password = pass_context.hash(user.password)

    user = User(
        fullname=sanitize_text(user.fullname),
        email=user.email,
        password_hash=hashed_password  
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Registration successfully..."}

def authenticate_user(db, data):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Generate Access Token
    token = create_access_token(
        user_id=user.id,
        role="user"
    )

    # NEW: Generate Refresh Token
    refresh_token = create_refresh_token(
        user_id=user.id,
        role="user"
    )

    new_db_token = UserRefreshToken(
        user_id=user.id,
        token=refresh_token
    )
    db.add(new_db_token)
    db.commit()

    #return both tokens
    return {
        "access_token": token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

def refresh_user(refresh_token, db):
    # 1. Verify JWT  expiration 
    payload = verify_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # 2. Check Database (Ensures user hasn't logged out)
    db_token = db.query(UserRefreshToken).filter(
        UserRefreshToken.token == refresh_token
    ).first()

    if not db_token:
        raise HTTPException(status_code=401, detail="Session revoked. Please login again.")

    # 3. Generate New Pair
    user_id = int(payload.get("sub"))
    new_access = create_access_token(user_id=user_id, role="user")
    new_refresh = create_refresh_token(user_id=user_id, role="user")

    # 4. Update and Save (Corrected line)
    db_token.token = new_refresh
    db.commit()

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer"
    }



def user_logout(refresh_token,db):
    # Find the token in the database and delete it
    db_token = db.query(UserRefreshToken).filter(
        UserRefreshToken.token == refresh_token
    ).first()
    
    if db_token:
        db.delete(db_token)
        db.commit()
        return {"message": "User Successfully logged out from server"}
    
    raise HTTPException(status_code=400, detail="Invalid session or already logged out")