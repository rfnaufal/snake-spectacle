from fastapi import APIRouter
from typing import List
from ..schemas import ApiResponse, LivePlayer
from ..crud import db

router = APIRouter(prefix="/api/live-players", tags=["live-players"])

@router.get("", response_model=ApiResponse[List[LivePlayer]])
def get_live_players():
    return ApiResponse(success=True, data=db.get_live_players())

@router.get("/{player_id}", response_model=ApiResponse[LivePlayer])
def get_live_player(player_id: str):
    player = db.get_live_player(player_id)
    if not player:
        return ApiResponse(success=False, error="Player not found")
    return ApiResponse(success=True, data=player)
