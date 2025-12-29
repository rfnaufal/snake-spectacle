import pytest
import os
import sys

# Ensure app can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.fixture(scope="session", autouse=True)
def clean_database():
    """
    Remove the SQLite database file before running tests to ensure a clean state.
    """
    db_path = "./sql_app.db"
    # Dispose existing connections
    from app.database import engine
    from app import models
    engine.dispose()

    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")

    # Recreate tables
    from app.database import engine
    from app import models
    models.Base.metadata.create_all(bind=engine)
    print("Recreated database tables.")
    
    yield
