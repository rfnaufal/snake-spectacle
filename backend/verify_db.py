import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

def verify_database_connection():
    print(f"Checking database connection...")
    print(f"DATABASE_URL: {DATABASE_URL}")

    is_sqlite = DATABASE_URL.startswith("sqlite")
    
    try:
        if is_sqlite:
            # For SQLite, check if the file exists (or can be created)
            # and try to connect
            db_path = DATABASE_URL.replace("sqlite:///", "")
            print(f"Database type: SQLite")
            print(f"Target file: {db_path}")
            
            engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        else:
            # For PostgreSQL or others
            print(f"Database type: PostgreSQL/Other")
            engine = create_engine(DATABASE_URL)

        # Try to connect and execute a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Successfully connected to the database!")
            print(f"Test query result: {result.scalar()}")
            
            # Test write access
            try:
                print("Testing write access...")
                connection.execute(text("CREATE TABLE IF NOT EXISTS test_write (id INTEGER PRIMARY KEY)"))
                connection.execute(text("INSERT INTO test_write (id) VALUES (1)"))
                connection.execute(text("DROP TABLE test_write"))
                connection.commit()
                print("Write access confirmed!")
            except Exception as e:
                print(f"Write access FAILED: {str(e)}")
                return False
            
        return True

    except SQLAlchemyError as e:
        print(f"Result: FAILED")
        print(f"Error: {str(e)}")
        return False
    except Exception as e:
        print(f"Result: FAILED")
        print(f"Unexpected Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = verify_database_connection()
    sys.exit(0 if success else 1)
