from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
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
def signup(user: UserSignup):
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
def login(user: UserLogin):
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
