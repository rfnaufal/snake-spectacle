from fastapi import FastAPI, Response, Cookie, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from models import (
    User, AuthCredentials, ApiResponse, LeaderboardEntry, 
    SubmitScoreRequest, LivePlayer, UserInDB
)
from db import db

app = FastAPI(title="Snake Spectacle API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(snake_session: Optional[str] = Cookie(None)) -> Optional[UserInDB]:
    if not snake_session:
        return None
    return db.get_user_by_email(snake_session)

@app.post("/api/auth/login", response_model=ApiResponse[User])
def login(creds: AuthCredentials, response: Response):
    user = db.get_user_by_email(creds.email)
    if not user or user.password != creds.password:
        return ApiResponse(success=False, error="Invalid email or password")
    
    response.set_cookie(key="snake_session", value=user.email, httponly=True)
    return ApiResponse(success=True, data=user)

@app.post("/api/auth/signup", response_model=ApiResponse[User], status_code=201)
def signup(creds: AuthCredentials, response: Response):
    if db.get_user_by_email(creds.email):
        return ApiResponse(success=False, error="Email already registered")
    
    if not creds.username:
         return ApiResponse(success=False, error="Username is required")

    user = db.create_user(creds.email, creds.password, creds.username)
    response.set_cookie(key="snake_session", value=user.email, httponly=True)
    return ApiResponse(success=True, data=user)

@app.post("/api/auth/logout", response_model=ApiResponse[None])
def logout(response: Response):
    response.delete_cookie("snake_session")
    return ApiResponse(success=True)

@app.get("/api/auth/me", response_model=ApiResponse[User])
def get_me(user: Optional[UserInDB] = Depends(get_current_user)):
    if not user:
        return ApiResponse(success=False, error="Not authenticated")
    return ApiResponse(success=True, data=user)

@app.get("/api/leaderboard", response_model=ApiResponse[List[LeaderboardEntry]])
def get_leaderboard(mode: Optional[str] = None):
    entries = db.get_leaderboard(mode)
    return ApiResponse(success=True, data=entries)

@app.post("/api/leaderboard", response_model=ApiResponse[LeaderboardEntry])
def submit_score(
    req: SubmitScoreRequest, 
    user: Optional[UserInDB] = Depends(get_current_user)
):
    if not user:
        return ApiResponse(success=False, error="Must be logged in to submit score")
    
    entry = LeaderboardEntry(
        username=user.username,
        score=req.score,
        mode=req.mode
    )
    db.add_leaderboard_entry(entry)
    return ApiResponse(success=True, data=entry)

@app.get("/api/live-players", response_model=ApiResponse[List[LivePlayer]])
def get_live_players():
    return ApiResponse(success=True, data=db.get_live_players())

@app.get("/api/live-players/{player_id}", response_model=ApiResponse[LivePlayer])
def get_live_player(player_id: str):
    player = db.get_live_player(player_id)
    if not player:
        return ApiResponse(success=False, error="Player not found")
    return ApiResponse(success=True, data=player)
