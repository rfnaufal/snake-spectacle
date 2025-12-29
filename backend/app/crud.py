from typing import List, Optional
from .schemas import UserInDB, LeaderboardEntry as PydanticLeaderboardEntry, LivePlayer, Position
from . import models
from .database import SessionLocal
import random
from datetime import date as Date
import datetime

class DBAccessor:
    def __init__(self):
        self.live_players: List[LivePlayer] = []
        self.live_players = self._generate_mock_live_players()

    def _generate_mock_live_players(self) -> List[LivePlayer]:
        players = []
        names = ["LiveWire", "QuickSnake", "AppleEater", "GridRunner", "PixelHunter"]
        for i, name in enumerate(names):
            mode = random.choice(["walls", "passthrough"])
            snake = [Position(x=random.randint(5, 15), y=random.randint(5, 15)) for _ in range(3)]
            players.append(LivePlayer(
                id=f"live{i+1}",
                username=name,
                score=random.randint(50, 800),
                mode=mode,
                snake=snake,
                food=Position(x=random.randint(0, 20), y=random.randint(0, 20)),
                status="playing"
            ))
        return players

    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        db = SessionLocal()
        try:
            sql_user = db.query(models.User).filter(models.User.email == email).first()
            if sql_user:
                return UserInDB(
                    id=sql_user.id,
                    username=sql_user.username,
                    email=sql_user.email,
                    highScore=sql_user.highScore,
                    createdAt=sql_user.createdAt,
                    password=sql_user.password
                )
            return None
        finally:
            db.close()

    def create_user(self, email: str, password: str, username: str) -> UserInDB:
        db = SessionLocal()
        try:
            new_user = models.User(
                email=email,
                password=password,
                username=username,
                createdAt=datetime.date.today()
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return UserInDB(
                id=new_user.id,
                username=new_user.username,
                email=new_user.email,
                highScore=new_user.highScore,
                createdAt=new_user.createdAt,
                password=new_user.password
            )
        finally:
            db.close()

    def get_leaderboard(self, mode: str = None) -> List[PydanticLeaderboardEntry]:
        db = SessionLocal()
        try:
            query = db.query(models.LeaderboardEntry)
            if mode:
                query = query.filter(models.LeaderboardEntry.mode == mode)
            
            sql_entries = query.order_by(models.LeaderboardEntry.score.desc()).all()
            
            return [
                PydanticLeaderboardEntry(
                    id=e.id,
                    username=e.username,
                    score=e.score,
                    mode=e.mode,
                    date=e.date
                ) for e in sql_entries
            ]
        finally:
            db.close()

    def add_leaderboard_entry(self, entry: PydanticLeaderboardEntry):
        db = SessionLocal()
        try:
            sql_entry = models.LeaderboardEntry(
                id=entry.id,
                username=entry.username,
                score=entry.score,
                mode=entry.mode,
                date=entry.date
            )
            db.add(sql_entry)
            
            # Update user high score
            user = db.query(models.User).filter(models.User.username == entry.username).first()
            if user:
                if entry.score > user.highScore:
                    user.highScore = entry.score
                    db.add(user) # Should be tracked already but ensuring
            
            db.commit()
        finally:
            db.close()

    def get_live_players(self) -> List[LivePlayer]:
        return self.live_players

    def get_live_player(self, player_id: str) -> Optional[LivePlayer]:
        for p in self.live_players:
            if p.id == player_id:
                return p
        return None

db = DBAccessor()
