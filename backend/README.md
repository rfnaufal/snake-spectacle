# Snake Spectacle Backend

This is the FastAPI backend for the Snake Spectacle game.

## Prerequisites

- [uv](https://github.com/astral-sh/uv) installed (for local dev).
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (for containerized deployment).

## Quick Start (Docker)
The easiest way to run the full application (Frontend + Backend + PostgreSQL) is via Docker Compose.

```bash
docker-compose up --build
```
- **Application**: [http://localhost:8080](http://localhost:8080) (Frontend + API)
- **API Documentation**: [http://localhost:8080/api/docs](http://localhost:8080/api/docs)

## Local Setup (Development)

Initialize the environment and install dependencies:

```bash
uv sync
```

Or from the project root:
```bash
make install-backend
```

## Project Structure

The backend is organized as follows:

- **`app/main.py`**: Application entry point. Initializes the database and includes routers.
- **`app/routers/`**: API route handlers (Auth, Leaderboard, Live Players).
- **`app/database.py`**: Database connection and session management.
- **`app/models.py`**: SQLAlchemy database models.
- **`app/schemas.py`**: Pydantic data schemas.
- **`app/crud.py`**: Database access logic.

## Database Initialization

The database is initialized **automatically** when you start the server.

### How it works
1. **Schema**: The application checks for tables on startup and creates them if missing (`models.Base.metadata.create_all`).
2. **Seeding**: If the database is empty (no `player1` user), it automatically seeds initial test data.

### How to Initialize / Run
Simply start the server:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

### How to Reset (Re-initialize)
To wipe the database and start fresh:

- **SQLite**: Delete the file and restart the server.
  ```bash
  rm sql_app.db
  uv run uvicorn app.main:app --reload
  ```

- **PostgreSQL**: Drop and recreate the database/tables manually, then restart the server.

## Database Inspection

You can inspect existing tables and data using the `inspect_db.py` utility.

### List All Tables & Users
```bash
uv run inspect_db.py
```

### Specific Commands
- **List Tables**: `uv run inspect_db.py tables`
- **List Users**: `uv run inspect_db.py users`
- **Count Users (SQLite3)**: `sqlite3 sql_app.db "SELECT COUNT(*) FROM users;"`

## Performing CRUD Operations

### 1. Via API Documentation (Recommended)
The easiest way to Create, Read, Update, and Delete data is using the interactive API docs.

1. Start the server: `make run`
2. Open [http://localhost:8000/api/docs](http://localhost:8000/api/docs).
3. Use the **Auth** endpoints to Signup/Login.
4. Use **Leaderboard** endpoints to Post scores (Create) or Get high scores (Read).

### 2. Via Python Shell (Advanced)
For direct database manipulation:

```bash
uv run python
```
```python
from app.crud import db
from app.schemas import LeaderboardEntry
from datetime import date

# Create
db.create_user("new@test.com", "pass", "NewUser")

# Read
user = db.get_user_by_email("new@test.com")
print(user.username)
```

### 3. Quick User Creation (CLI)
You can create a user directly from the terminal without opening a shell:

```bash
uv run python -c "from app.crud import db; db.create_user('rika@example.com', 'password123', 'rika'); print('User created')"
```

### 4. Validation
To verify a user exists and check their details:

1. **List all users**:
   ```bash
   uv run inspect_db.py users
   ```
2. **Check count**:
   ```bash
   uv run inspect_db.py count-users
   ```

## Database Configuration

The backend uses **SQLAlchemy** for persistence.

- **Default**: SQLite (`sql_app.db` created in the backend directory).
- **PostgreSQL**: Create a `.env` file in the `backend/` directory with your connection string:
  ```env
  DATABASE_URL=postgresql://user:password@localhost/dbname
  ```

## Running the Server

Start the development server with auto-reload:

```bash
make run
```

Or manually:
```bash
uv run uvicorn main:app --reload --port 8000
```

- **API Base URL**: `http://localhost:8000`
- **API Documentation**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

## Testing

Run the test suite:

```bash
make test
```

Or manually:
```bash
uv run pytest
```
