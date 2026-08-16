from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import IS_FALLBACK, get_db
import models
import local_auth

if not IS_FALLBACK:
    from supabase_client import supabase

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    email: str
    password: str
    username: str = None  # Supabase doesn't enforce username by default, can add to metadata

@router.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    if IS_FALLBACK:
        try:
            existing = db.query(models.User).filter(models.User.email == user.email).first()
            if existing:
                raise HTTPException(status_code=400, detail="User already exists")

            db_user = models.User(
                id=local_auth.new_user_id(),
                email=user.email,
                username=user.username,
                hashed_password=local_auth.hash_password(user.password),
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)

            return {
                "message": "Signup successful",
                "user": {"id": db_user.id, "email": db_user.email, "username": db_user.username},
            }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Signup Error (fallback): {e}")
            raise HTTPException(status_code=400, detail=str(e))

    try:
        # Sign up with Supabase
        # We can store extra data in the user_metadata
        options = {}
        if user.username:
            options["data"] = {"username": user.username}

        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": options
        })

        # In newer supabase-py versions, response might be an object or contain user/session
        if hasattr(response, "user") and response.user:
             return {"message": "Signup successful", "user": response.user}
        elif hasattr(response, "session") and response.session: # Auto confirm might be on
             return {"message": "Signup successful", "user": response.user, "session": response.session}
        elif response is None:
             raise HTTPException(status_code=400, detail="Signup failed returned None")

        return response

    except Exception as e:
        print(f"Signup Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    if IS_FALLBACK:
        try:
            db_user = db.query(models.User).filter(models.User.email == user.email).first()
            if not db_user or not local_auth.verify_password(user.password, db_user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid credentials")

            token = local_auth.create_access_token(db_user.id, db_user.email)
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {"id": db_user.id, "email": db_user.email, "username": db_user.username},
            }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Login Error (fallback): {e}")
            raise HTTPException(status_code=400, detail=str(e))

    try:
        response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if hasattr(response, "user") and response.user:
            return {
                "access_token": response.session.access_token,
                "token_type": "bearer",
                "user": response.user
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    except Exception as e:
        print(f"Login Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
