from fastapi import APIRouter, Depends
from typing import Optional, List
from ..schemas import ApiResponse, LeaderboardEntry, SubmitScoreRequest, UserInDB
from ..crud import db
from .auth import get_current_user

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("", response_model=ApiResponse[List[LeaderboardEntry]])
def get_leaderboard(mode: Optional[str] = None):
    entries = db.get_leaderboard(mode)
    return ApiResponse(success=True, data=entries)

@router.post("", response_model=ApiResponse[LeaderboardEntry])
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
