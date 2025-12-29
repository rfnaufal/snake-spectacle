from sqlalchemy import Column, Integer, String, Date
from .database import Base
import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    highScore = Column(Integer, default=0)
    createdAt = Column(Date, default=datetime.date.today)

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, index=True)
    score = Column(Integer, index=True)
    mode = Column(String)
    date = Column(Date, default=datetime.date.today)
