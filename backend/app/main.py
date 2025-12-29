from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, live_players
from .crud import db
from .schemas import LeaderboardEntry
from . import models, database
from datetime import date

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Determine which DB is being used
    from .database import is_sqlite, SQLALCHEMY_DATABASE_URL
    if is_sqlite:
        print(f"Using SQLite database at {SQLALCHEMY_DATABASE_URL}")
    else:
        print(f"Using PostgreSQL/Remote database at {SQLALCHEMY_DATABASE_URL}")

    # Create database tables
    models.Base.metadata.create_all(bind=database.engine)

    # Seed data if empty
    if not db.get_user_by_email("player1@example.com"):
        print("Seeding initial data...")
        db.create_user("player1@example.com", "password123", "SnakeMaster")
        db.create_user("verify_script@example.com", "secure_password", "MrVerifier")
        
        # Add a leaderboard entry
        db.add_leaderboard_entry(LeaderboardEntry(
            username="SnakeMaster",
            score=1500,
            mode="walls",
            date=date.today()
        ))
    
    yield

app = FastAPI(
    title="Snake Spectacle API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

@app.get("/")
def read_root():
    return {"message": "welcome to backend snake game"}


# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(live_players.router)

# Mount static files
# Dockerfile copies dist to /app/static
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    # Catch-all for SPA
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API calls to pass through if they weren't caught by routers above
        if full_path.startswith("api"):
            return {"error": "API route not found"}
            
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend not found"}
else:
    print(f"WARNING: Static directory {STATIC_DIR} not found. Frontend will not be served.")
