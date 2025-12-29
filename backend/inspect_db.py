import sys
import os
from sqlalchemy import create_engine, inspect, text
from dotenv import load_dotenv

# Ensure we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
engine = create_engine(DATABASE_URL)

def list_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("\nExisting Tables:")
    print("-" * 20)
    for table in tables:
        print(f" - {table}")
    print("-" * 20)

def list_users():
    print("\nUsers (First 10):")
    print("-" * 60)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id, username, email, \"highScore\" FROM users LIMIT 10"))
        print(f"{'Username':<20} | {'Email':<30} | {'High Score'}")
        print("-" * 60)
        for row in result:
            print(f"{row.username:<20} | {row.email:<30} | {row.highScore}")

def count_users():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        print(f"\nTotal Users: {count}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "tables":
            list_tables()
        elif command == "users":
            list_users()
        elif command == "count-users":
            count_users()
        else:
            print(f"Unknown command: {command}")
            print("Usage: uv run inspect_db.py [tables|users|count-users]")
    else:
        list_tables()
        list_users()
