from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import IS_FALLBACK
import local_auth

bearer = HTTPBearer(auto_error=False)

def user_id_from_token(token: str) -> str:
    """Resolve a bearer token to a user id: Supabase session tokens normally,
    local JWTs (from /auth/login) when running on the SQLite fallback."""
    if IS_FALLBACK:
        return local_auth.decode_access_token(token)["sub"]
    from supabase_client import supabase
    res = supabase.auth.get_user(token)
    if not res or not res.user:
        raise ValueError("No user for token")
    return res.user.id

def optional_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds:
        return None
    try:
        return user_id_from_token(creds.credentials)
    except Exception:
        return None

def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return user_id_from_token(creds.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
