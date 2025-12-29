from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Generic, TypeVar, Literal
from datetime import datetime, date as Date
import uuid

T = TypeVar('T')

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    highScore: int = 0
    createdAt: datetime = Field(default_factory=datetime.now)

class UserInDB(User):
    password: str

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None

class LeaderboardEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    score: int
    mode: Literal['passthrough', 'walls']
    date: Date = Field(default_factory=Date.today)

class SubmitScoreRequest(BaseModel):
    score: int
    mode: Literal['passthrough', 'walls']

class LivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: Literal['passthrough', 'walls']
    snake: List[Position]
    food: Position
    status: Literal['idle', 'playing', 'paused', 'gameover']

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
