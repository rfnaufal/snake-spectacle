from fastapi import APIRouter, Response, Depends
from fastapi.security import APIKeyCookie
from typing import Optional
from ..schemas import User, AuthCredentials, ApiResponse, UserInDB
from ..crud import db

router = APIRouter(prefix="/api/auth", tags=["auth"])

cookie_scheme = APIKeyCookie(name="snake_session", auto_error=False)

def get_current_user(snake_session: Optional[str] = Depends(cookie_scheme)) -> Optional[UserInDB]:
    if not snake_session:
        return None
    return db.get_user_by_email(snake_session)

@router.post("/login", response_model=ApiResponse[User])
def login(creds: AuthCredentials, response: Response):
    user = db.get_user_by_email(creds.email)
    if not user or user.password != creds.password:
        return ApiResponse(success=False, error="Invalid email or password")
    
    response.set_cookie(key="snake_session", value=user.email, httponly=True)
    return ApiResponse(success=True, data=user)

@router.post("/signup", response_model=ApiResponse[User], status_code=201)
def signup(creds: AuthCredentials, response: Response):
    if db.get_user_by_email(creds.email):
        response.status_code = 200
        return ApiResponse(success=False, error="Email already registered")
    
    if not creds.username:
         response.status_code = 200
         return ApiResponse(success=False, error="Username is required")

    user = db.create_user(creds.email, creds.password, creds.username)
    response.set_cookie(key="snake_session", value=user.email, httponly=True)
    return ApiResponse(success=True, data=user)

@router.post("/logout", response_model=ApiResponse[None])
def logout(response: Response):
    response.delete_cookie("snake_session")
    return ApiResponse(success=True)

@router.get("/me", response_model=ApiResponse[User])
def get_me(user: Optional[UserInDB] = Depends(get_current_user)):
    if not user:
        return ApiResponse(success=False, error="Not authenticated")
    return ApiResponse(success=True, data=user)
