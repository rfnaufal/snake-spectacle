from typing import List, Optional, Dict
from models import UserInDB, LeaderboardEntry, LivePlayer, Position
import random
from datetime import date

class MockDB:
    def __init__(self):
        self.users: Dict[str, UserInDB] = {}  # email -> User
        self.leaderboard: List[LeaderboardEntry] = []
        self.live_players: List[LivePlayer] = self._generate_mock_live_players()
        
        # Seed initial data
        self._seed_data()

    def _seed_data(self):
        # Seed users
        self.create_user("player1@example.com", "password123", "SnakeMaster")
        user = self.get_user_by_email("player1@example.com")
        if user:
            user.highScore = 1500

        # Seed leaderboard
        self.leaderboard.extend([
            LeaderboardEntry(username="SnakeMaster", score=1500, mode="walls", date=date(2024, 12, 1)),
            LeaderboardEntry(username="VenomStrike", score=1200, mode="passthrough", date=date(2024, 12, 2)),
        ])

    def _generate_mock_live_players(self) -> List[LivePlayer]:
        return [
            LivePlayer(
                id="live1", username="GhostPlayer", score=300, mode="passthrough",
                snake=[Position(x=5, y=5), Position(x=4, y=5)], food=Position(x=10, y=10), status="playing"
            ),
            LivePlayer(
                id="live2", username="ArcadeHero", score=450, mode="walls",
                snake=[Position(x=10, y=10), Position(x=9, y=10)], food=Position(x=15, y=15), status="playing"
            ),
        ]

    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        return self.users.get(email)

    def create_user(self, email: str, password: str, username: str) -> UserInDB:
        user = UserInDB(email=email, password=password, username=username)
        self.users[email] = user
        return user

    def get_leaderboard(self, mode: str = None) -> List[LeaderboardEntry]:
        entries = self.leaderboard
        if mode:
            entries = [e for e in entries if e.mode == mode]
        return sorted(entries, key=lambda x: x.score, reverse=True)

    def add_leaderboard_entry(self, entry: LeaderboardEntry):
        self.leaderboard.append(entry)
        # Update user high score if exists
        # In a real app we'd link by ID, but here by username is fine for mock
        for email, user in self.users.items():
            if user.username == entry.username:
                if entry.score > user.highScore:
                    user.highScore = entry.score

    def get_live_players(self) -> List[LivePlayer]:
        # Scramble positions slightly to simulate movement? 
        # For simple mock, return as is.
        return self.live_players

    def get_live_player(self, player_id: str) -> Optional[LivePlayer]:
        for p in self.live_players:
            if p.id == player_id:
                return p
        return None

db = MockDB()
